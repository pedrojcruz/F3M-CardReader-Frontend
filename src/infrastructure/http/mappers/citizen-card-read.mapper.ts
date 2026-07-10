import type { CitizenCardData } from '@/domain/cards/citizen-card-data'

type RawCitizenCard = Record<string, unknown>

export class CitizenCardReadMapper {
  static fromResponse(response: unknown): CitizenCardData {
    const card = this.unwrapCard(response)

    return {
      fullName: this.getString(card, 'fullName', 'FullName'),
      givenNames: this.getString(card, 'givenNames', 'GivenNames'),
      surnames: this.getString(card, 'surnames', 'Surnames'),
      parentsNames: this.getString(card, 'parentsNames', 'ParentsNames'),

      gender: this.getString(card, 'gender', 'Gender'),
      nationality: this.getString(card, 'nationality', 'Nationality'),
      height: this.getString(card, 'height', 'Height'),

      birthDate: this.getNullableString(card, 'birthDate', 'BirthDate'),
      expiryDate: this.getNullableString(card, 'expiryDate', 'ExpiryDate'),

      documentNumber: this.getString(card, 'documentNumber', 'DocumentNumber'),
      nifNumber: this.getString(card, 'nifNumber', 'NifNumber'),
      socialSecurityNumber: this.getString(card, 'socialSecurityNumber', 'SocialSecurityNumber'),
      healthNumber: this.getString(card, 'healthNumber', 'HealthNumber'),

      photo: this.getNullableString(card, 'photo', 'Photo'),
    }
  }

  private static unwrapCard(response: unknown): RawCitizenCard {
    if (!this.isObject(response)) {
      return {}
    }

    if (this.isObject(response.card)) {
      return response.card
    }

    if (this.isObject(response.Card)) {
      return response.Card
    }

    if (this.isObject(response.data)) {
      return response.data
    }

    if (this.isObject(response.citizenCard)) {
      return response.citizenCard
    }

    return response
  }

  private static getString(
    source: RawCitizenCard,
    camelCaseKey: string,
    pascalCaseKey: string,
  ): string {
    const value = source[camelCaseKey] ?? source[pascalCaseKey]

    if (value === null || value === undefined) {
      return ''
    }

    return String(value)
  }

  private static getNullableString(
    source: RawCitizenCard,
    camelCaseKey: string,
    pascalCaseKey: string,
  ): string | null {
    const value = source[camelCaseKey] ?? source[pascalCaseKey]

    if (value === null || value === undefined || value === '') {
      return null
    }

    return String(value)
  }

  private static isObject(value: unknown): value is RawCitizenCard {
    return !!value && typeof value === 'object' && !Array.isArray(value)
  }
}