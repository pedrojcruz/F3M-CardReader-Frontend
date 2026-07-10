import type { CitizenCardAddress } from '@/domain/cards/citizen-card-address'
import type { CitizenCardData } from '@/domain/cards/citizen-card-data'
import type { PairingResponse } from '@/domain/connector/connector-session'
import type { ReaderCard } from '@/domain/readers/reader-card'

export interface ConnectorGateway {
  requestPairing(port: number, appName: string): Promise<PairingResponse>

  revokePairing(port: number, token: string): Promise<void>

  getReaders(port: number, token: string): Promise<ReaderCard[]>

  readCitizenCardWithoutPin(
    port: number,
    token: string,
    readerName: string,
  ): Promise<CitizenCardData>

  readCitizenCardAddress(
    port: number,
    token: string,
    readerName: string,
    pin: string,
  ): Promise<CitizenCardAddress>
}