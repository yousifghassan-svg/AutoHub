import { createEmptyDraft } from '../domain/draft-factory';
import { canSubmit, validateStep } from '../domain/validation';

describe('wizard validation', () => {
  it('validates description length', () => {
    const draft = createEmptyDraft({ title: 'ab', description: 'short' });
    const result = validateStep(draft, 'description');
    expect(result.ok).toBe(false);
  });

  it('allows plate vehicle details skip', () => {
    const draft = createEmptyDraft({ categoryCode: 'PLATE' });
    expect(validateStep(draft, 'vehicleDetails').ok).toBe(true);
  });

  it('requires media', () => {
    const draft = createEmptyDraft();
    expect(validateStep(draft, 'media').ok).toBe(false);
  });

  it('canSubmit requires full gate', () => {
    const draft = createEmptyDraft({
      categoryId: 'c',
      vehicleTypeCode: 'USED',
      vehicleDetails: {
        year: '2019',
        mileageKm: '1',
        brandId: null,
        brandLabel: '',
        modelId: null,
        modelLabel: '',
        engineSizeCc: '',
        doors: '',
      },
      media: [
        {
          localId: 'm',
          kind: 'IMAGE',
          uri: 'file://a',
          mimeType: 'image/jpeg',
          byteSize: 1,
          filename: 'a.jpg',
          uploadStatus: 'pending',
        },
      ],
      cityId: 'city',
      primaryPrice: '1000',
      title: 'Valid title here',
      description: 'Long enough description for the listing.',
    });
    expect(canSubmit(draft).ok).toBe(true);
  });
});
