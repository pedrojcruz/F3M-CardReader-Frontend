import type { CitizenCardAddress } from '@/domain/cards/citizen-card-address'
import type { CitizenCardData } from '@/domain/cards/citizen-card-data'
import type { ConnectorGateway } from '@/domain/connector/connector-gateway'
import type {
  PairingRequest,
  PairingResponse,
} from '@/domain/connector/connector-session'
import type { ReaderCard } from '@/domain/readers/reader-card'
import type { ConnectorStatusResponse } from '@/infrastructure/http/dtos/connector-status-response'
import { ConnectorHttpClient } from '@/infrastructure/http/connector-http-client'
import { CitizenCardAddressMapper } from '@/infrastructure/http/mappers/citizen-card-address.mapper'
import { CitizenCardReadMapper } from '@/infrastructure/http/mappers/citizen-card-read.mapper'
import { ReaderStatusMapper } from '@/infrastructure/http/mappers/reader-status.mapper'

interface ReadCitizenCardAddressRequest {
  pin: string
}

export class ConnectorApiClient implements ConnectorGateway {
  private readonly httpClient = new ConnectorHttpClient()

  async requestPairing(port: number, appName: string): Promise<PairingResponse> {
    const request: PairingRequest = {
      appName,
    }

    return await this.httpClient.post<PairingRequest, PairingResponse>(
      port,
      '/pairing/request',
      request,
    )
  }

  async revokePairing(port: number, token: string): Promise<void> {
    await this.httpClient.delete(
      port,
      '/pairing/current',
      token,
    )
  }

  async getReaders(port: number, token: string): Promise<ReaderCard[]> {
    const response = await this.httpClient.get<ConnectorStatusResponse>(
      port,
      '/status',
      token,
    )

    return ReaderStatusMapper.fromConnectorStatus(response)
  }

  async readCitizenCardWithoutPin(
    port: number,
    token: string,
    readerName: string,
  ): Promise<CitizenCardData> {
    const encodedReaderName = encodeURIComponent(readerName)

    const response = await this.httpClient.get<unknown>(
      port,
      `/readers/${encodedReaderName}/cc/read`,
      token,
    )

    return CitizenCardReadMapper.fromResponse(response)
  }

  async readCitizenCardAddress(
    port: number,
    token: string,
    readerName: string,
    pin: string,
  ): Promise<CitizenCardAddress> {
    const encodedReaderName = encodeURIComponent(readerName)

    const request: ReadCitizenCardAddressRequest = {
      pin,
    }

    const response = await this.httpClient.post<ReadCitizenCardAddressRequest, unknown>(
      port,
      `/readers/${encodedReaderName}/cc/address`,
      request,
      token,
    )

    return CitizenCardAddressMapper.fromResponse(response)
  }
}