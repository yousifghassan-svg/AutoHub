import type { SellSubmitArgs, SellSubmitResult } from '@/features/sell/core/types';
import { withNegotiableDescription } from '@/features/sell/lib/listing-description';
import {
  plateFormToApiDetails,
  type PlateFormState,
} from '../components/PlateEditor';
import { asPlateDomainData } from './domain-data';

function plateTitle(plate: PlateFormState): string {
  return `${plate.governorate} plate ${plate.code} ${plate.letter} ${plate.number}`;
}

export function buildCreatePlateBody(state: SellSubmitArgs['state']) {
  const { plate } = asPlateDomainData(state.domainData);
  const details = plateFormToApiDetails(plate);
  return {
    categoryId: state.categoryId,
    cityId: state.cityId,
    title: state.title.trim() || plateTitle(plate),
    description: withNegotiableDescription(
      state.description,
      state.negotiable,
    ),
    primaryPrice: Number(state.primaryPrice),
    currencyCode: state.currencyCode || 'IQD',
    language: 'ar',
    formatCode: details.formatCode,
    regionCode: details.regionCode,
    series: details.series,
    number: details.number,
    plateType: details.plateType,
  };
}

export type PlateSubmitDeps = {
  createPlate: (body: Record<string, unknown>) => Promise<{ id: string }>;
  changeStatus: (input: {
    id: string;
    status: 'PENDING' | 'DRAFT';
  }) => Promise<unknown>;
};

export async function submitPlateListing(
  deps: PlateSubmitDeps,
  args: SellSubmitArgs,
): Promise<SellSubmitResult> {
  const created = await deps.createPlate(buildCreatePlateBody(args.state));
  if (
    args.state.imageAssetIds.length ||
    args.state.videoAssetIds.length
  ) {
    await args.attachMedia(created.id);
  }
  if (args.submitForReview) {
    await deps.changeStatus({ id: created.id, status: 'PENDING' });
  }
  return { listingId: created.id };
}
