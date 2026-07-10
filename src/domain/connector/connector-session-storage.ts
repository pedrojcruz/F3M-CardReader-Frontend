import type { ConnectorSession } from '@/domain/connector/connector-session'

export interface ConnectorSessionStorage {
  get(): ConnectorSession | null
  save(session: ConnectorSession): void
  clear(): void
}