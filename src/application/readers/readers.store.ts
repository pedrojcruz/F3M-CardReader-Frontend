import { defineStore } from "pinia";
import type { ConnectorSession } from "@/domain/connector/connector-session";
import type { ReaderCard } from "@/domain/readers/reader-card";
import { ConnectorApiClient } from "@/infrastructure/http/connector-api-client";

interface ReadersState {
  readers: ReaderCard[];
  isLoading: boolean;
  errorMessage: string | null;
  lastLoadedAtUtc: string | null;
}

const connectorGateway = new ConnectorApiClient();

export const useReadersStore = defineStore("readers", {
  state: (): ReadersState => ({
    readers: [],
    isLoading: false,
    errorMessage: null,
    lastLoadedAtUtc: null,
  }),

  getters: {
    hasReaders: (state): boolean => {
      return state.readers.length > 0;
    },

    readerCount: (state): number => {
      return state.readers.length;
    },
  },

  actions: {
    async synchronizeReaders(session: ConnectorSession): Promise<void> {
      this.isLoading = true;
      this.errorMessage = null;

      try {
        const remoteReaders = await connectorGateway.getReaders(
          session.port,
          session.token,
        );

        const remoteReaderNames = new Set(
          remoteReaders.map((reader) => reader.name),
        );

        this.readers = this.readers.filter((reader) =>
          remoteReaderNames.has(reader.name),
        );

        for (const remoteReader of remoteReaders) {
          const existingReader = this.findReader(remoteReader.name);

          if (!existingReader) {
            this.readers.push(remoteReader);
            continue;
          }

          existingReader.readerStatus = remoteReader.readerStatus;
          existingReader.cardStatus = remoteReader.cardStatus;
          existingReader.hasCard = remoteReader.hasCard;

          if (!remoteReader.hasCard) {
            existingReader.isReading = false;
            existingReader.isReadingAddress = false;
            existingReader.errorMessage = null;
            existingReader.addressErrorMessage = null;
          }
        }

        this.lastLoadedAtUtc = new Date().toISOString();
      } catch (error) {
        this.errorMessage = this.resolveLoadError(error);
      } finally {
        this.isLoading = false;
      }
    },

    clearReaderData(readerName: string): void {
  const reader = this.findReader(readerName)

  if (!reader) {
    return
  }

  reader.citizenCard = null
  reader.citizenCardAddress = null

  reader.lastReadAtUtc = null
  reader.lastAddressReadAtUtc = null

  reader.errorMessage = null
  reader.addressErrorMessage = null

  reader.isReading = false
  reader.isReadingAddress = false
},

    async readInsertedCards(session: ConnectorSession): Promise<void> {
      const readersWithInsertedCard = this.readers.filter(
        (reader) => reader.hasCard,
      );

      await Promise.all(
        readersWithInsertedCard.map((reader) =>
          this.readCitizenCardWithoutPin(session, reader.name),
        ),
      );
    },
    async loadInitialReaders(session: ConnectorSession): Promise<void> {
      await this.synchronizeReaders(session);
    },

    markReaderConnected(readerName: string): void {
      const existingReader = this.findReader(readerName);

      if (existingReader) {
        existingReader.readerStatus = "connected";
        existingReader.errorMessage = null;
        return;
      }

      this.readers.push({
        name: readerName,
        readerStatus: "connected",
        cardStatus: "not-inserted",
        hasCard: false,

        isReading: false,
        isReadingAddress: false,

        citizenCard: null,
        citizenCardAddress: null,

        lastReadAtUtc: null,
        lastAddressReadAtUtc: null,

        errorMessage: null,
        addressErrorMessage: null,
      });
    },

    markReaderDisconnected(readerName: string): void {
      this.readers = this.readers.filter(
        (reader) => reader.name !== readerName,
      );
    },

    markCardInserted(readerName: string): void {
  this.ensureReaderExists(readerName)

  const reader = this.findReader(readerName)

  if (!reader) {
    return
  }

  reader.hasCard = true
  reader.cardStatus = 'inserted'
  reader.errorMessage = null
  reader.addressErrorMessage = null
  reader.citizenCardAddress = null
  reader.lastAddressReadAtUtc = null
},

    markCardRemoved(readerName: string): void {
      const reader = this.findReader(readerName);

      if (!reader) {
        return;
      }

      reader.hasCard = false;
      reader.cardStatus = "not-inserted";
      reader.isReading = false;
      reader.isReadingAddress = false;
      reader.errorMessage = null;
      reader.addressErrorMessage = null;
    },

    async readCitizenCardWithoutPin(
      session: ConnectorSession,
      readerName: string,
    ): Promise<void> {
      this.ensureReaderExists(readerName);

      const reader = this.findReader(readerName);

      if (!reader) {
        return;
      }

      if (!reader.hasCard) {
        return;
      }

      if (reader.isReading) {
        return;
      }

      reader.isReading = true;
      reader.errorMessage = null;

      try {
        const citizenCard = await connectorGateway.readCitizenCardWithoutPin(
          session.port,
          session.token,
          readerName,
        );

        reader.citizenCard = citizenCard;
        reader.lastReadAtUtc = new Date().toISOString();
      } catch (error) {
        reader.errorMessage = this.resolveReadError(error);
      } finally {
        reader.isReading = false;
      }
    },

    async readCitizenCardAddress(
      session: ConnectorSession,
      readerName: string,
      pin: string,
    ): Promise<void> {
      this.ensureReaderExists(readerName);

      const reader = this.findReader(readerName);

      if (!reader) {
        return;
      }

      if (!reader.hasCard) {
        reader.addressErrorMessage =
          "Insere o cartão antes de ler os dados com PIN.";
        return;
      }

      if (!/^\d{4}$/.test(pin)) {
        reader.addressErrorMessage = "O PIN deve conter 4 dígitos.";
        return;
      }

      if (reader.isReadingAddress) {
        return;
      }

      reader.isReadingAddress = true;
      reader.addressErrorMessage = null;

      try {
        const citizenCardAddress =
          await connectorGateway.readCitizenCardAddress(
            session.port,
            session.token,
            readerName,
            pin,
          );

        reader.citizenCardAddress = citizenCardAddress;
        reader.lastAddressReadAtUtc = new Date().toISOString();
      } catch (error) {
        reader.addressErrorMessage = this.resolveReadError(error);

      } finally {
        reader.isReadingAddress = false;
      }
    },

    setReaderError(readerName: string, errorMessage: string): void {
      this.ensureReaderExists(readerName);

      const reader = this.findReader(readerName);

      if (!reader) {
        return;
      }

      reader.errorMessage = errorMessage;
      reader.isReading = false;
    },

    clearReaders(): void {
      this.readers = [];
      this.errorMessage = null;
      this.lastLoadedAtUtc = null;
      this.isLoading = false;
    },

    clearSensitiveData(): void {
      for (const reader of this.readers) {
        reader.citizenCard = null;
        reader.citizenCardAddress = null;
        reader.lastReadAtUtc = null;
        reader.lastAddressReadAtUtc = null;
        reader.errorMessage = null;
        reader.addressErrorMessage = null;
        reader.isReading = false;
        reader.isReadingAddress = false;
      }
    },

    ensureReaderExists(readerName: string): void {
      const exists = this.readers.some((reader) => reader.name === readerName);

      if (exists) {
        return;
      }

      this.markReaderConnected(readerName);
    },

    findReader(readerName: string): ReaderCard | undefined {
      return this.readers.find((reader) => reader.name === readerName);
    },

    resolveLoadError(error: unknown): string {
      if (error instanceof TypeError) {
        return "Não foi possível obter os leitores. Confirma se o connector desktop continua aberto.";
      }

      if (error instanceof Error) {
        return error.message;
      }

      return "Erro desconhecido ao carregar leitores.";
    },

    resolveReadError(error: unknown): string {
      if (error instanceof TypeError) {
        return "Não foi possível ler o cartão. Confirma se o cartão continua inserido e se o connector está aberto.";
      }

      if (error instanceof Error) {
        return error.message;
      }

      return "Erro desconhecido ao ler cartão.";
    },
  },
});
