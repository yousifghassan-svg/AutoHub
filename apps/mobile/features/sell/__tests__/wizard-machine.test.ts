import { createEmptyDraft } from '../domain/draft-factory';
import { createInitialWizardState, wizardReducer } from '../state/WizardMachine';

describe('wizardReducer state machine', () => {
  it('blocks NEXT without category', () => {
    const state = createInitialWizardState();
    const next = wizardReducer(state, { type: 'NEXT' });
    expect(next.draft.step).toBe('category');
    expect(next.error).toMatch(/category/i);
  });

  it('advances through valid steps', () => {
    let state = createInitialWizardState(
      createEmptyDraft({
        categoryId: 'cat-car',
        categoryCode: 'CAR',
        categoryLabel: 'سيارات',
      }),
    );
    state = wizardReducer(state, { type: 'NEXT' });
    expect(state.draft.step).toBe('vehicleType');

    state = wizardReducer(state, {
      type: 'PATCH',
      patch: {
        vehicleTypeCode: 'USED',
        vehicleTypeLabel: 'مستعمل',
        conditionTypeId: 'cond-used',
      },
    });
    state = wizardReducer(state, { type: 'NEXT' });
    expect(state.draft.step).toBe('vehicleDetails');
  });

  it('goes BACK', () => {
    const state = createInitialWizardState(
      createEmptyDraft({ step: 'vehicleType', categoryId: 'c1' }),
    );
    const prev = wizardReducer(state, { type: 'BACK' });
    expect(prev.draft.step).toBe('category');
  });

  it('adds and removes media', () => {
    let state = createInitialWizardState();
    state = wizardReducer(state, {
      type: 'ADD_MEDIA',
      item: {
        localId: 'm1',
        kind: 'IMAGE',
        uri: 'file://x.jpg',
        mimeType: 'image/jpeg',
        byteSize: 10,
        filename: 'x.jpg',
        uploadStatus: 'pending',
      },
    });
    expect(state.draft.media).toHaveLength(1);
    state = wizardReducer(state, { type: 'REMOVE_MEDIA', localId: 'm1' });
    expect(state.draft.media).toHaveLength(0);
  });
});
