import { defineStore } from "pinia";
import { APP_CONFIG } from "@/app/app.config";
import type { ConnectorSession } from "@/domain/connector/connector-session";
import { ConnectorApiClient } from "@/infrastructure/http/connector-api-client";
import { ConnectorHttpError } from '@/infrastructure/http/connector-http-client'
import { LocalConnectorSessionStorage } from "@/infrastructure/storage/local-connector-session-storage";

interface ConnectorState {
  appName: string
  port: number
  session: ConnectorSession | null
  isPairing: boolean
  isValidatingSession: boolean
  errorMessage: string | null
}

const connectorGateway = new ConnectorApiClient();
const sessionStorage = new LocalConnectorSessionStorage();
const storedSession = sessionStorage.get();

export const useConnectorStore = defineStore("connector", {
  state: (): ConnectorState => ({
  appName: storedSession?.appName ?? APP_CONFIG.connectorAppName,
  port: storedSession?.port ?? APP_CONFIG.defaultConnectorPort,
  session: storedSession,
  isPairing: false,
  isValidatingSession: false,
  errorMessage: null,
}),

  getters: {
    isPaired: (state): boolean => {
      return !!state.session?.token;
    },

    token: (state): string | null => {
      return state.session?.token ?? null;
    },

    maskedToken: (state): string => {
      const token = state.session?.token;

      if (!token) {
        return "—";
      }

      if (token.length <= 16) {
        return token;
      }

      return `${token.slice(0, 8)}...${token.slice(-8)}`;
    },

    connectorBaseUrl: (state): string => {
      return `https://localhost:${state.port}`;
    },
  },

  actions: {
    setPort(port: number): void {
      this.port = port;
    },

    setAppName(appName: string): void {
      this.appName = appName;
    },

    async validateStoredSession(): Promise<void> {
  const currentSession = this.session

  if (!currentSession) {
    return
  }

  this.isValidatingSession = true
  this.errorMessage = null

  try {
    await connectorGateway.getReaders(
      currentSession.port,
      currentSession.token,
    )
  } catch (error) {
    if (this.isUnauthorizedError(error)) {
      this.unpair()
      this.errorMessage = 'A sessão guardada já não é válida. Emparelha novamente.'
      return
    }

    this.errorMessage = 'Não foi possível validar a sessão guardada. Confirma se o connector desktop está aberto.'
  } finally {
    this.isValidatingSession = false
  }
},

isUnauthorizedError(error: unknown): boolean {
  return error instanceof ConnectorHttpError
    && (error.statusCode === 401 || error.statusCode === 403)
},

    async pair(): Promise<void> {
      this.errorMessage = null;
      this.isPairing = true;

      try {
        if (!this.appName.trim()) {
          this.errorMessage = "O nome da aplicação é obrigatório.";
          return;
        }

        if (
          !Number.isInteger(this.port) ||
          this.port < 1 ||
          this.port > 65535
        ) {
          this.errorMessage = "A porta deve estar entre 1 e 65535.";
          return;
        }

        const response = await connectorGateway.requestPairing(
          this.port,
          this.appName.trim(),
        );

        const session: ConnectorSession = {
          appName: this.appName.trim(),
          port: this.port,
          token: response.token,
          pairedAtUtc: new Date().toISOString(),
        };

        this.session = session;
        sessionStorage.save(session);
      } catch (error) {
        this.errorMessage = this.resolvePairingError(error);
      } finally {
        this.isPairing = false;
      }
    },

    async unpairRemote(): Promise<void> {
      const currentSession = this.session;

      if (!currentSession) {
        this.unpair();
        return;
      }

      try {
        await connectorGateway.revokePairing(
          currentSession.port,
          currentSession.token,
        );
      } finally {
        this.unpair();
      }
    },

    unpair(): void {
      this.session = null;
      this.errorMessage = null;
      sessionStorage.clear();
    },

    resolvePairingError(error: unknown): string {
      if (error instanceof TypeError) {
        return "Não foi possível contactar o connector local. Confirma se a aplicação desktop está aberta e se a porta está correta.";
      }

      if (error instanceof Error) {
        return error.message;
      }

      return "Erro desconhecido ao emparelhar.";
    },
  },
});
