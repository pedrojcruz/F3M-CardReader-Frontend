export interface ConnectorSession {
  appName: string
  port: number
  token: string
  pairedAtUtc: string
}

export interface PairingRequest {
  appName: string
}

export interface PairingResponse {
  token: string
  status: string
}