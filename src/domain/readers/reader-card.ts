import type { CitizenCardData } from '@/domain/cards/citizen-card-data'
import type { CitizenCardAddress } from '@/domain/cards/citizen-card-address'

export type ReaderConnectionStatus = 'connected' | 'disconnected'

export type CardPresenceStatus = 'inserted' | 'not-inserted'

export interface ReaderCard {
  name: string
  readerStatus: ReaderConnectionStatus
  cardStatus: CardPresenceStatus
  hasCard: boolean

  isReading: boolean
  isReadingAddress: boolean

  citizenCard: CitizenCardData | null
  citizenCardAddress: CitizenCardAddress | null

  lastReadAtUtc: string | null
  lastAddressReadAtUtc: string | null

  errorMessage: string | null
  addressErrorMessage: string | null
}