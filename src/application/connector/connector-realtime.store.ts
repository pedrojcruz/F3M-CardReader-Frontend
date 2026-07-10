import { defineStore } from "pinia";
import type { ConnectorSession } from "@/domain/connector/connector-session";

import type {
  CardPayload,
  ConnectorPayload,
  ConnectorRealtimeConnectionState,
  ReadPayload,
  ReaderPayload,
} from "@/domain/connector/connector-realtime-events";
import { useConnectorStore } from "@/domain/connector/connector.store";
import { useReadersStore } from "@/application/readers/readers.store";
import { ConnectorSignalRClient } from "@/infrastructure/signalr/connector-signalr-client";

interface ConnectorRealtimeState {
  connectionState: ConnectorRealtimeConnectionState;
  connectorStatus: string | null;
  errorMessage: string | null;
}

const realtimeGateway = new ConnectorSignalRClient();

export const useConnectorRealtimeStore = defineStore("connectorRealtime", {
  state: (): ConnectorRealtimeState => ({
    connectionState: "disconnected",
    connectorStatus: null,
    errorMessage: null,
  }),

  getters: {
    isConnected: (state): boolean => {
      return state.connectionState === "connected";
    },

    statusLabel: (state): string => {
      switch (state.connectionState) {
        case "connected":
          return "Tempo real ligado";

        case "connecting":
          return "A ligar tempo real";

        case "reconnecting":
          return "A religar tempo real";

        case "error":
          return "Erro no tempo real";

        case "disconnected":
        default:
          return "Tempo real desligado";
      }
    },
  },

  actions: {
    async connect(session: ConnectorSession): Promise<void> {
      if (
        this.connectionState === "connected" ||
        this.connectionState === "connecting"
      ) {
        return;
      }

      this.connectionState = "connecting";
      this.errorMessage = null;

      try {
        await realtimeGateway.connect(session, {
          onConnector: (payload) => this.handleConnectorEvent(payload),
          onReader: (payload) => this.handleReaderEvent(payload),
          onCard: (payload) => this.handleCardEvent(payload),
          onRead: (payload) => this.handleReadEvent(payload),
          onReconnecting: (errorMessage) =>
            this.handleReconnecting(errorMessage),
          onReconnected: () => this.handleReconnected(),
          onClosed: (errorMessage) => this.handleClosed(errorMessage),
        });

        this.connectionState = "connected";
      } catch (error) {
        this.connectionState = "error";
        this.errorMessage = this.resolveRealtimeError(error);
      }
    },

    async disconnect(): Promise<void> {
      await realtimeGateway.disconnect();

      this.connectionState = "disconnected";
      this.connectorStatus = null;
      this.errorMessage = null;
    },

    handleConnectorEvent(payload: ConnectorPayload): void {
      this.connectorStatus = payload.status;
    },

    handleReaderEvent(payload: ReaderPayload): void {
      const readerName = payload.readerName?.trim();

      if (!readerName) {
        return;
      }

      const readersStore = useReadersStore();

      switch (payload.status) {
        case "Connected":
          readersStore.markReaderConnected(readerName);
          break;

        case "Disconnected":
          readersStore.markReaderDisconnected(readerName);
          break;
      }
    },

    async handleCardEvent(payload: CardPayload): Promise<void> {
      const readerName = payload.readerName?.trim();

      if (!readerName) {
        return;
      }

      const connectorStore = useConnectorStore();
      const readersStore = useReadersStore();

      switch (payload.status) {
        case "Inserted":
          readersStore.markCardInserted(readerName);

          if (connectorStore.session) {
            await readersStore.readCitizenCardWithoutPin(
              connectorStore.session,
              readerName,
            );
          }

          break;

        case "NotInserted":
          readersStore.markCardRemoved(readerName);
          break;
      }
    },

    handleReadEvent(payload: ReadPayload): void {
      const readerName = payload.readerName?.trim();

      if (!readerName) {
        return;
      }

      if (payload.status === "Error") {
        const readersStore = useReadersStore();

        readersStore.setReaderError(
          readerName,
          payload.errorCode ?? "Erro ao ler cartão.",
        );
      }
    },

    handleReconnecting(errorMessage: string | null): void {
      this.connectionState = "reconnecting";
      this.errorMessage = errorMessage;
    },

    async handleReconnected(): Promise<void> {
      this.connectionState = "connected";
      this.errorMessage = null;

      const connectorStore = useConnectorStore();
      const readersStore = useReadersStore();

      if (!connectorStore.session) {
        return;
      }

      await readersStore.synchronizeReaders(connectorStore.session);
      await readersStore.readInsertedCards(connectorStore.session);
    },

    handleClosed(errorMessage: string | null): void {
      this.connectionState = errorMessage ? "error" : "disconnected";
      this.errorMessage = errorMessage;
    },

    resolveRealtimeError(error: unknown): string {
      if (error instanceof TypeError) {
        return "Não foi possível ligar ao tempo real. Confirma se o connector desktop está aberto.";
      }

      if (error instanceof Error) {
        return error.message;
      }

      return "Erro desconhecido ao ligar ao tempo real.";
    },
  },
});
