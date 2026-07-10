import type { ReaderCard } from '@/domain/readers/reader-card'
import type {
  ConnectorReaderResponse,
  ConnectorStatusResponse,
} from '@/infrastructure/http/dtos/connector-status-response'

export class ReaderStatusMapper {
  static fromConnectorStatus(response: ConnectorStatusResponse): ReaderCard[] {
    return response.reader.readers.map(reader => this.fromReaderResponse(reader))
  }

  private static fromReaderResponse(reader: ConnectorReaderResponse): ReaderCard {
    return {
      name: reader.name,
      readerStatus: 'connected',
      cardStatus: reader.hasCard ? 'inserted' : 'not-inserted',
      hasCard: reader.hasCard,

      isReading: false,
      isReadingAddress: false,

      citizenCard: null,
      citizenCardAddress: null,

      lastReadAtUtc: null,
      lastAddressReadAtUtc: null,

      errorMessage: null,
      addressErrorMessage: null,
    }
  }
}