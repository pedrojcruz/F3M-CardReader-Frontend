import type { ConnectorSession } from '@/domain/connector/connector-session'
import type { ConnectorRealtimeEventHandlers } from '@/domain/connector/connector-realtime-events'

export interface ConnectorRealtimeGateway {
  connect(
    session: ConnectorSession,
    handlers: ConnectorRealtimeEventHandlers,
  ): Promise<void>

  disconnect(): Promise<void>

  isConnected(): boolean
}