import type { ConnectorSession } from '@/domain/connector/connector-session'
import type { ConnectorSessionStorage } from '@/domain/connector/connector-session-storage'
const CONNECTOR_SESSION_STORAGE_KEY = 'f3m.connector.session'

export class LocalConnectorSessionStorage implements ConnectorSessionStorage {
  get(): ConnectorSession | null {
    const rawValue = localStorage.getItem(CONNECTOR_SESSION_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    try {
      return JSON.parse(rawValue) as ConnectorSession
    } catch {
      this.clear()
      return null
    }
  }

  save(session: ConnectorSession): void {
    localStorage.setItem(
      CONNECTOR_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    )
  }

  clear(): void {
    localStorage.removeItem(CONNECTOR_SESSION_STORAGE_KEY)
  }
}