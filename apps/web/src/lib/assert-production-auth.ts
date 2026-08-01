import { resolveWebAuthMode } from './auth-mode';

function isNextProductionBuild(): boolean {
  // next build sets NEXT_PHASE; avoid failing next lint/dev which may set NODE_ENV=production.
  return process.env.NEXT_PHASE === 'phase-production-build';
}

/**
 * Build-time safety check for `next build` only (not lint/dev).
 */
export function assertWebProductionAuthBuild(): void {
  if (!isNextProductionBuild()) return;
  const mode = resolveWebAuthMode(process.env.NEXT_PUBLIC_AUTH_MODE);
  if (mode !== 'firebase') {
    throw new Error(
      '[autohub] Production web build aborted: NEXT_PUBLIC_AUTH_MODE must be "firebase".',
    );
  }
}
