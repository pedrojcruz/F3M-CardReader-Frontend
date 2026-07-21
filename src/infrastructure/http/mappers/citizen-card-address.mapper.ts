import type { CitizenCardAddress } from "@/domain/cards/citizen-card-address";

type RawAddress = Record<string, unknown>;

export class CitizenCardAddressMapper {
  static fromResponse(response: unknown): CitizenCardAddress {
    const address = this.unwrapAddress(response);

    return {
      street: this.getString(address, "street", "Street"),
      doorNumber: this.getString(address, "doorNumber", "DoorNumber"),
      floor: this.getString(address, "floor", "Floor"),
      side: this.getString(address, "side", "Side"),
      postalCode: this.getString(address, "postalCode", "PostalCode"),
      city: this.getString(address, "city", "City"),
      district: this.getString(address, "district", "District"),
      municipality: this.getString(address, "municipality", "Municipality"),
      parish: this.getString(address, "parish", "Parish"),
      country: this.getString(address, "country", "Country"),
    };
  }

  private static unwrapAddress(response: unknown): RawAddress {
    if (!this.isObject(response)) {
      return {};
    }

    if (this.isObject(response.address)) {
      return response.address;
    }

    if (this.isObject(response.Address)) {
      return response.Address;
    }

    if (this.isObject(response.data)) {
      return response.data;
    }

    return response;
  }

  private static getString(
    source: RawAddress,
    camelCaseKey: string,
    pascalCaseKey: string,
  ): string {
    const value = source[camelCaseKey] ?? source[pascalCaseKey];

    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  }

  private static isObject(value: unknown): value is RawAddress {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }
}
