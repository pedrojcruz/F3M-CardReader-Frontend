export interface ConnectorStatusResponse {
  timestampUtc: string
  connector: {
    status: string
  }
  middleware: {
    status: string
    scheme: string
    isHttps: boolean
  }
  sdk: {
    status: string
    loaded: boolean
    installation: unknown
    error: unknown
  }
  reader: {
    status: string
    connectedCount: number
    readers: ConnectorReaderResponse[]
  }
  card: {
    status: string
    insertedCount: number
  }
}

export interface ConnectorReaderResponse {
  name: string
  status: string
  hasCard: boolean
}