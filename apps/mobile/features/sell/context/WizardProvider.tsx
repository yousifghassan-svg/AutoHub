import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSellRepository } from '../di';
import { createEmptyDraft } from '../domain/draft-factory';
import { canSubmit } from '../domain/validation';
import type { WizardDraft } from '../domain/types';
import {
  createInitialWizardState,
  wizardReducer,
  type WizardEvent,
} from '../state/WizardMachine';

type WizardContextValue = {
  draft: WizardDraft;
  error: string | null;
  dispatch: (event: WizardEvent) => void;
  autosaving: boolean;
  submitting: boolean;
  submitError: string | null;
  saveNow: () => Promise<void>;
  submit: () => Promise<WizardDraft>;
  loadDraft: (localId: string) => Promise<void>;
  startNew: () => void;
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({
  children,
  initialLocalId,
}: {
  children: React.ReactNode;
  initialLocalId?: string;
}) {
  const repo = useMemo(() => getSellRepository(), []);
  const qc = useQueryClient();
  const [state, dispatch] = useReducer(wizardReducer, undefined, () =>
    createInitialWizardState(),
  );
  const [autosaving, setAutosaving] = React.useState(false);
  const draftRef = useRef(state.draft);
  draftRef.current = state.draft;

  useEffect(() => {
    if (!initialLocalId) return;
    void repo.getDraft(initialLocalId).then((d) => {
      if (d) dispatch({ type: 'HYDRATE', draft: d });
    });
  }, [initialLocalId, repo]);

  // Debounced offline autosave
  useEffect(() => {
    const handle = setTimeout(() => {
      setAutosaving(true);
      void repo
        .saveDraftLocal(draftRef.current)
        .finally(() => setAutosaving(false));
    }, 500);
    return () => clearTimeout(handle);
  }, [state.draft, repo]);

  const saveNow = useCallback(async () => {
    setAutosaving(true);
    try {
      const saved = await repo.saveDraftLocal(draftRef.current);
      dispatch({ type: 'HYDRATE', draft: saved });
    } finally {
      setAutosaving(false);
    }
  }, [repo]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const gate = canSubmit(draftRef.current);
      if (!gate.ok) throw new Error(gate.message);
      return repo.submitForReview(draftRef.current);
    },
    onSuccess: (draft) => {
      dispatch({ type: 'HYDRATE', draft });
      void qc.invalidateQueries({ queryKey: ['sell', 'drafts'] });
    },
  });

  const loadDraft = useCallback(
    async (localId: string) => {
      const d = await repo.getDraft(localId);
      if (d) dispatch({ type: 'HYDRATE', draft: d });
    },
    [repo],
  );

  const startNew = useCallback(() => {
    dispatch({ type: 'HYDRATE', draft: createEmptyDraft() });
  }, []);

  const value = useMemo<WizardContextValue>(
    () => ({
      draft: state.draft,
      error: state.error ?? (submitMutation.error instanceof Error ? submitMutation.error.message : null),
      dispatch,
      autosaving,
      submitting: submitMutation.isPending,
      submitError:
        submitMutation.error instanceof Error ? submitMutation.error.message : null,
      saveNow,
      submit: () => submitMutation.mutateAsync(),
      loadDraft,
      startNew,
    }),
    [state, autosaving, submitMutation, saveNow, loadDraft, startNew],
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within WizardProvider');
  return ctx;
}

export function useDraftList() {
  const repo = getSellRepository();
  return useQuery({
    queryKey: ['sell', 'drafts'],
    queryFn: () => repo.listDrafts(),
  });
}
