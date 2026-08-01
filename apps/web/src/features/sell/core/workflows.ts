import type { SellStepId, SellWorkflowDefinition } from './types';

/**
 * Reusable workflow definitions.
 * Categories / domains reference these by id — never duplicate step lists.
 */
export const WORKFLOW_VEHICLE_LISTING: SellWorkflowDefinition = {
  id: 'vehicle-listing',
  steps: [
    { id: 'category', label: 'Category' },
    { id: 'vehicleDetails', label: 'Vehicle Details' },
    { id: 'media', label: 'Media' },
    { id: 'saleInformation', label: 'Sale Information' },
    { id: 'publish', label: 'Publish' },
  ],
};

export const WORKFLOW_PLATE_LISTING: SellWorkflowDefinition = {
  id: 'plate-listing',
  steps: [
    { id: 'category', label: 'Category' },
    { id: 'plateDetails', label: 'Plate Details' },
    { id: 'saleInformation', label: 'Sale Information' },
    { id: 'publish', label: 'Publish' },
  ],
};

const WORKFLOWS: Record<string, SellWorkflowDefinition> = {
  [WORKFLOW_VEHICLE_LISTING.id]: WORKFLOW_VEHICLE_LISTING,
  [WORKFLOW_PLATE_LISTING.id]: WORKFLOW_PLATE_LISTING,
};

export function getWorkflow(workflowId: string): SellWorkflowDefinition {
  const workflow = WORKFLOWS[workflowId];
  if (!workflow) {
    throw new Error(`Unknown sell workflow: ${workflowId}`);
  }
  return workflow;
}

export function registerWorkflow(definition: SellWorkflowDefinition): void {
  WORKFLOWS[definition.id] = definition;
}

/** Legacy fixed step index → step id, before per-domain workflows. */
const LEGACY_STEP_IDS: SellStepId[] = [
  'category',
  'details',
  'media',
  'price',
  'preview',
  'publish',
];

/**
 * Map a legacy numeric step onto a workflow's step ids.
 * `details`/`price`/`preview` aliases resolve to the nearest modern step.
 */
export function mapLegacyStepToWorkflowStepId(
  legacyStep: number,
  workflow: SellWorkflowDefinition,
): SellStepId {
  const raw = LEGACY_STEP_IDS[Math.min(Math.max(legacyStep, 0), LEGACY_STEP_IDS.length - 1)] ?? 'category';

  const aliases: Record<string, SellStepId[]> = {
    category: ['category'],
    details: ['vehicleDetails', 'plateDetails', 'details'],
    media: ['media'],
    price: ['saleInformation', 'price'],
    preview: ['publish', 'preview'],
    publish: ['publish'],
  };

  const candidates = aliases[raw] ?? [raw];
  for (const id of candidates) {
    if (workflow.steps.some((s) => s.id === id)) return id;
  }

  // Media may be absent (e.g. plates) — advance to sale information / publish.
  if (raw === 'media') {
    const sale = workflow.steps.find((s) => s.id === 'saleInformation');
    if (sale) return sale.id;
  }

  return workflow.steps[0]?.id ?? 'category';
}

export function clampStepId(
  stepId: SellStepId,
  workflow: SellWorkflowDefinition,
): SellStepId {
  if (workflow.steps.some((s) => s.id === stepId)) return stepId;
  return workflow.steps[0]?.id ?? 'category';
}
