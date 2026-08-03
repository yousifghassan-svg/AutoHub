import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ComponentType } from 'react';
import {
  createFreshDraftSession,
  hydrateDraft,
  nextDraftEnvelope,
  sellEditDraftKey,
  serializeDraft,
  SELL_DRAFT_KEY,
  type DraftSession,
} from './draft-store';
import type { SellDomainPlugin, SellStepProps } from './types';
import { DEFAULT_COMMON_STATE } from './types';

const StubPreview: ComponentType<SellStepProps> = () => null;

function stubPlugin(id = 'VEHICLE'): SellDomainPlugin {
  return {
    id,
    categoryCodes: id === 'PLATE' ? ['PLATE'] : ['CAR'],
    workflowId: id === 'PLATE' ? 'plate-listing' : 'vehicle-listing',
    steps: {},
    Preview: StubPreview,
    validators: {},
    createInitialDomainData: () => ({ year: '' }),
    mapDraftToDomain: (raw, legacy) => {
      if (legacy) return { year: legacy.form?.year ?? '', fromLegacy: true };
      if (raw && typeof raw === 'object') {
        return { ...(raw as Record<string, unknown>) };
      }
      return { year: '' };
    },
    serializeDomainData: (domainData) => domainData,
    getQualityRules: () => [],
    canSubmit: () => true,
    submit: async () => ({ listingId: 'L1' }),
  };
}

describe('web draft-store adapter (P5-5)', () => {
  it('round-trips envelope with listingId and opaque domainData', () => {
    const plugin = stubPlugin();
    const session: DraftSession = {
      ...createFreshDraftSession(),
      listingId: 'listing-1',
      syncStatus: 'server_draft',
      meta: { syncedMediaAssetIds: ['img1'] },
    };
    const state = {
      ...DEFAULT_COMMON_STATE,
      title: 'Camry',
      imageAssetIds: ['img1', 'img2'],
      domainData: { year: '2020', brandId: 'b1' },
    };
    const envelope = serializeDraft(plugin, 'media', state, session);
    const hydrated = hydrateDraft(envelope, plugin);
    assert.ok(hydrated);
    assert.equal(hydrated!.session.listingId, 'listing-1');
    assert.equal(hydrated!.state.title, 'Camry');
    assert.equal(hydrated!.state.domainData.year, '2020');
    assert.deepEqual(hydrated!.session.meta.syncedMediaAssetIds, ['img1']);
    assert.equal(hydrated!.stepId, 'media');
  });

  it('migrates legacy v1 without engine knowing vehicle fields', () => {
    const plugin = stubPlugin();
    const hydrated = hydrateDraft(
      {
        version: 1,
        step: 0,
        form: { categoryCode: 'CAR', title: 'Old', year: '2019' },
        imageAssetIds: ['a'],
      },
      plugin,
    );
    assert.ok(hydrated);
    assert.equal(hydrated!.state.title, 'Old');
    assert.equal(hydrated!.state.domainData.year, '2019');
    assert.equal(hydrated!.state.domainData.fromLegacy, true);
  });

  it('bumps revision on successive autosaves', () => {
    const plugin = stubPlugin();
    const session = createFreshDraftSession();
    const state = {
      ...DEFAULT_COMMON_STATE,
      domainData: { year: '2021' },
    };
    const first = nextDraftEnvelope(null, plugin, 'category', state, session);
    const second = nextDraftEnvelope(
      first,
      plugin,
      'media',
      { ...state, title: 'Next' },
      { ...session, revision: first.revision },
    );
    assert.equal(second.revision, first.revision + 1);
    assert.equal(second.stepId, 'media');
    assert.equal(second.common.title, 'Next');
  });

  it('scopes edit draft keys away from create', () => {
    assert.equal(SELL_DRAFT_KEY, 'autohub.sell.draft');
    assert.equal(
      sellEditDraftKey('listing-9'),
      'autohub.sell.edit.draft:listing-9',
    );
    assert.notEqual(sellEditDraftKey('listing-9'), SELL_DRAFT_KEY);
  });
});
