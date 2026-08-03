/**
 * Listing-generic location helpers for the sell host.
 * City is the discovery key today; lat/lng are draft-ready for future maps.
 */

export type ListingLocationInput = {
  governorateId: string;
  cityId: string;
  /** Draft-only until API geo lands — not sent on create in 0.5. */
  locationLat?: string;
  locationLng?: string;
};

export type CatalogCity = {
  id: string;
  governorateId: string;
};

export function cityBelongsToGovernorate(
  city: CatalogCity | undefined,
  governorateId: string,
): boolean {
  if (!city || !governorateId) return false;
  return city.governorateId === governorateId;
}

export function isCompleteListingLocation(
  input: ListingLocationInput,
  city: CatalogCity | undefined,
): boolean {
  return Boolean(
    input.governorateId &&
      input.cityId &&
      cityBelongsToGovernorate(city, input.governorateId),
  );
}

export function parseOptionalCoordinate(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

/** True when both coordinates are finite (future map pin). */
export function hasListingMapPin(input: ListingLocationInput): boolean {
  const lat = parseOptionalCoordinate(input.locationLat);
  const lng = parseOptionalCoordinate(input.locationLng);
  return lat != null && lng != null;
}
