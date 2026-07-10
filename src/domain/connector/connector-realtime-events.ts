export type ConnectorRealtimeConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

export interface ConnectorPayload {
  status: string
}

export interface ReaderPayload {
  status: string
  readerName?: string | null
  connectedCount?: number | null
}

export interface CardPayload {
  status: string
  readerName?: string | null
}

export interface ReadPayload {
  status: string
  readerName?: string | null
  errorCode?: string | null
}

export interface ConnectorRealtimeEventHandlers {
  onConnector(payload: ConnectorPayload): void | Promise<void>
  onReader(payload: ReaderPayload): void | Promise<void>
  onCard(payload: CardPayload): void | Promise<void>
  onRead(payload: ReadPayload): void | Promise<void>
  onReconnecting(errorMessage: string | null): void | Promise<void>
  onReconnected(): void | Promise<void>
  onClosed(errorMessage: string | null): void | Promise<void>
}