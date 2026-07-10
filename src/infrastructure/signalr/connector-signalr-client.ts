import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import type { ConnectorSession } from "@/domain/connector/connector-session";
import type {
  CardPayload,
  ConnectorPayload,
  ConnectorRealtimeEventHandlers,
  ReadPayload,
  ReaderPayload,
} from "@/domain/connector/connector-realtime-events";
import type { ConnectorRealtimeGateway } from "@/application/connector/connector-realtime-gateway";

const HUB_PATH = "/hubs/citizen-card";

const HUB_EVENTS = {
  connector: "connector",
  reader: "reader",
  card: "card",
  read: "read",
} as const;

export class ConnectorSignalRClient implements ConnectorRealtimeGateway {
  private connection: HubConnection | null = null;

  async connect(
    session: ConnectorSession,
    handlers: ConnectorRealtimeEventHandlers,
  ): Promise<void> {
    await this.disconnect();

    this.connection = new HubConnectionBuilder()
      .withUrl(this.buildHubUrl(session.port), {
        accessTokenFactory: () => session.token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.registerHandlers(this.connection, handlers);

    await this.connection.start();
  }

  async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    const currentConnection = this.connection;
    this.connection = null;

    if (currentConnection.state !== HubConnectionState.Disconnected) {
      await currentConnection.stop();
    }
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  private buildHubUrl(port: number): string {
    return `https://localhost:${port}${HUB_PATH}`;
  }

  private registerHandlers(
    connection: HubConnection,
    handlers: ConnectorRealtimeEventHandlers,
  ): void {
    connection.on(HUB_EVENTS.connector, (payload: ConnectorPayload) => {
      void handlers.onConnector(payload);
    });

    connection.on(HUB_EVENTS.reader, (payload: ReaderPayload) => {
      void handlers.onReader(payload);
    });

    connection.on(HUB_EVENTS.card, (payload: CardPayload) => {
      void handlers.onCard(payload);
    });

    connection.on(HUB_EVENTS.read, (payload: ReadPayload) => {
      void handlers.onRead(payload);
    });

    connection.onreconnecting((error) => {
      void handlers.onReconnecting(error?.message ?? null);
    });

    connection.onreconnected(() => {
      void handlers.onReconnected();
    });

    connection.onclose((error) => {
      void handlers.onClosed(error?.message ?? null);
    });
  }
}
