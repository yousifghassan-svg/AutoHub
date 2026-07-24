import type { AdminListing } from '@/lib/api/types';
import { listingTitle } from '@/lib/api/types';
import { emptyVehicleForm, type VehicleFormValues } from '../domain/types';

export function mapListingToForm(listing: AdminListing): VehicleFormValues {
  const base = emptyVehicleForm();
  const car = listing.carDetails;
  const plate = listing.plateDetails;
  const cityGovId = listing.city?.governorateId ?? listing.city?.governorate?.id ?? '';

  return {
    ...base,
    title: listingTitle(listing),
    description:
      listing.description ?? listing.translations?.[0]?.description ?? '',
    categoryId: listing.categoryId ?? listing.category?.id ?? '',
    status: listing.status,
    brandId: car?.brandId ?? '',
    modelId: car?.modelId ?? '',
    trim: car?.trim ?? '',
    year: car?.year != null ? String(car.year) : base.year,
    mileageKm: car?.mileageKm != null ? String(car.mileageKm) : '',
    primaryPrice: listing.primaryPrice != null ? String(listing.primaryPrice) : '',
    primaryCurrencyId: listing.primaryCurrencyId ?? listing.primaryCurrency?.code ?? 'IQD',
    vin: car?.vin ?? '',
    engineTypeId: car?.engineTypeId ?? '',
    engineSizeCc: car?.engineSizeCc != null ? String(car.engineSizeCc) : '',
    transmissionTypeId: car?.transmissionTypeId ?? '',
    fuelTypeId: car?.fuelTypeId ?? '',
    driveTypeId: car?.driveTypeId ?? '',
    bodyTypeId: car?.bodyTypeId ?? '',
    colorId: car?.colorId ?? '',
    interiorColor: car?.interiorColor ?? '',
    doors: car?.doors != null ? String(car.doors) : '4',
    seats: car?.seats != null ? String(car.seats) : '5',
    conditionTypeId: listing.conditionTypeId ?? '',
    governorateId: cityGovId,
    cityId: listing.cityId ?? listing.city?.id ?? '',
    locationText: listing.locationText ?? '',
    latitude: listing.latitude != null ? String(listing.latitude) : '',
    longitude: listing.longitude != null ? String(listing.longitude) : '',
    sellerId: listing.sellerId ?? listing.seller?.id ?? '',
    dealerId: '',
    isFeatured: listing.isFeatured,
    isVerified: listing.isVerified,
    plateEnabled: Boolean(plate?.plateDisplay || plate?.number),
    plateFormatCode: plate?.formatCode ?? 'IQ_BAGHDAD',
    plateRegionCode: plate?.regionCode ?? '11',
    plateSeries: plate?.series ?? 'A',
    plateNumber: plate?.number ?? '12345',
    plateType: plate?.plateType ?? 'Private',
    plateDisplay: plate?.plateDisplay ?? '',
  };
}

export function formToPayload(values: VehicleFormValues) {
  const year = Number(values.year);
  const carDetails = {
    brandId: values.brandId || undefined,
    modelId: values.modelId || undefined,
    year: Number.isFinite(year) ? year : undefined,
    mileageKm: values.mileageKm ? Number(values.mileageKm) : undefined,
    fuelTypeId: values.fuelTypeId || undefined,
    transmissionTypeId: values.transmissionTypeId || undefined,
    driveTypeId: values.driveTypeId || undefined,
    bodyTypeId: values.bodyTypeId || undefined,
    colorId: values.colorId || undefined,
    engineTypeId: values.engineTypeId || undefined,
    engineSizeCc: values.engineSizeCc ? Number(values.engineSizeCc) : undefined,
    doors: values.doors ? Number(values.doors) : undefined,
    seats: values.seats ? Number(values.seats) : undefined,
    vin: values.vin || undefined,
    trim: values.trim || undefined,
    interiorColor: values.interiorColor || undefined,
  };

  const plateDisplay =
    values.plateDisplay.trim() ||
    `${values.plateRegionCode} ${values.plateSeries} ${values.plateNumber}`.trim();

  const plateDetails = values.plateEnabled
    ? {
        formatCode: values.plateFormatCode,
        plateDisplay,
        plateNormalized: plateDisplay.replace(/\s+/g, '').toUpperCase(),
        series: values.plateSeries,
        number: values.plateNumber,
        regionCode: values.plateRegionCode,
        plateType: values.plateType,
      }
    : undefined;

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    categoryId: values.categoryId || undefined,
    cityId: values.cityId || undefined,
    sellerId: values.sellerId || undefined,
    conditionTypeId: values.conditionTypeId || undefined,
    primaryPrice: values.primaryPrice ? Number(values.primaryPrice) : undefined,
    primaryCurrencyId: values.primaryCurrencyId || undefined,
    status: values.status,
    isFeatured: values.isFeatured,
    isVerified: values.isVerified,
    locationText: values.locationText || undefined,
    latitude: values.latitude ? Number(values.latitude) : undefined,
    longitude: values.longitude ? Number(values.longitude) : undefined,
    carDetails,
    plateDetails,
  };
}
