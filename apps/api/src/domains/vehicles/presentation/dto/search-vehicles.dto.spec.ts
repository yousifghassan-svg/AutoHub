import { mapListVehiclesDto } from './list-vehicles.dto';
import { mapSearchVehiclesDto, type SearchVehiclesDto } from './search-vehicles.dto';

describe('vehicle search DTO mapping (P4-3 web filter parity)', () => {
  it('maps the full web search filter surface', () => {
    const dto = {
      page: 2,
      pageSize: 12,
      keyword: 'Camry',
      categoryCode: 'CAR',
      makeId: 'make-1',
      modelId: 'model-1',
      bodyTypeId: 'body-1',
      fuelTypeId: 'fuel-1',
      transmissionTypeId: 'trans-1',
      driveTypeId: 'drive-1',
      colorId: 'color-1',
      governorateId: 'gov-1',
      cityId: 'city-1',
      currencyCode: 'IQD',
      minPrice: 1_000_000,
      maxPrice: 30_000_000,
      minYear: 2018,
      maxYear: 2024,
      minMileage: 0,
      maxMileage: 100_000,
      isFeatured: true,
      sortBy: 'relevance',
      sortOrder: 'desc',
    } as SearchVehiclesDto;

    expect(mapSearchVehiclesDto(dto)).toEqual(
      expect.objectContaining({
        page: 2,
        pageSize: 12,
        keyword: 'Camry',
        categoryCode: 'CAR',
        brandId: 'make-1',
        modelId: 'model-1',
        bodyTypeId: 'body-1',
        fuelTypeId: 'fuel-1',
        transmissionTypeId: 'trans-1',
        driveTypeId: 'drive-1',
        colorId: 'color-1',
        governorateId: 'gov-1',
        cityId: 'city-1',
        currencyCode: 'IQD',
        minPrice: 1_000_000,
        maxPrice: 30_000_000,
        minYear: 2018,
        maxYear: 2024,
        minMileage: 0,
        maxMileage: 100_000,
        isFeatured: true,
        sortBy: 'relevance',
        sortOrder: 'desc',
      }),
    );
  });

  it('accepts brandId as makeId alias when makeId is omitted', () => {
    expect(
      mapListVehiclesDto({
        brandId: 'brand-alias',
      } as never),
    ).toEqual(
      expect.objectContaining({
        brandId: 'brand-alias',
      }),
    );
  });

  it('prefers makeId over brandId when both are present', () => {
    expect(
      mapListVehiclesDto({
        makeId: 'make-preferred',
        brandId: 'brand-alias',
      } as never),
    ).toEqual(
      expect.objectContaining({
        brandId: 'make-preferred',
      }),
    );
  });
});
