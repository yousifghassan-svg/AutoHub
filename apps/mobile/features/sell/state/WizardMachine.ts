import { nextStep, prevStep, type WizardStep } from '../domain/steps';
import { createEmptyDraft } from '../domain/draft-factory';
import { validateStep } from '../domain/validation';
import type { WizardDraft, WizardMediaItem } from '../domain/types';

export type WizardEvent =
  | { type: 'HYDRATE'; draft: WizardDraft }
  | { type: 'RESET' }
  | { type: 'PATCH'; patch: Partial<WizardDraft> }
  | { type: 'SET_STEP'; step: WizardStep }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'ADD_MEDIA'; item: WizardMediaItem }
  | { type: 'REMOVE_MEDIA'; localId: string }
  | { type: 'UPDATE_MEDIA'; item: WizardMediaItem };

export type WizardMachineState = {
  draft: WizardDraft;
  error: string | null;
};

export function createInitialWizardState(draft?: WizardDraft): WizardMachineState {
  return { draft: draft ?? createEmptyDraft(), error: null };
}

export function wizardReducer(
  state: WizardMachineState,
  event: WizardEvent,
): WizardMachineState {
  switch (event.type) {
    case 'HYDRATE':
      return { draft: event.draft, error: null };
    case 'RESET':
      return createInitialWizardState();
    case 'PATCH':
      return {
        draft: {
          ...state.draft,
          ...event.patch,
          updatedAt: new Date().toISOString(),
        },
        error: null,
      };
    case 'SET_STEP':
      return {
        draft: { ...state.draft, step: event.step, updatedAt: new Date().toISOString() },
        error: null,
      };
    case 'NEXT': {
      const check = validateStep(state.draft, state.draft.step);
      if (!check.ok) return { ...state, error: check.message };
      const next = nextStep(state.draft.step);
      if (!next) return state;
      return {
        draft: { ...state.draft, step: next, updatedAt: new Date().toISOString() },
        error: null,
      };
    }
    case 'BACK': {
      const prev = prevStep(state.draft.step);
      if (!prev) return state;
      return {
        draft: { ...state.draft, step: prev, updatedAt: new Date().toISOString() },
        error: null,
      };
    }
    case 'ADD_MEDIA':
      return {
        draft: {
          ...state.draft,
          media: [...state.draft.media, event.item],
          updatedAt: new Date().toISOString(),
        },
        error: null,
      };
    case 'REMOVE_MEDIA':
      return {
        draft: {
          ...state.draft,
          media: state.draft.media.filter((m) => m.localId !== event.localId),
          updatedAt: new Date().toISOString(),
        },
        error: null,
      };
    case 'UPDATE_MEDIA':
      return {
        draft: {
          ...state.draft,
          media: state.draft.media.map((m) =>
            m.localId === event.item.localId ? event.item : m,
          ),
          updatedAt: new Date().toISOString(),
        },
        error: null,
      };
    default:
      return state;
  }
}
