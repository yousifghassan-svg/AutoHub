import { resolveAdminAuthMode } from './auth-mode';

function isNextProductionBuild(): boolean {
  // next build sets NEXT_PHASE; avoid failing next lint/dev which may set NODE_ENV=production.
  return process.env.NEXT_PHASE === 'phase-production-build';
}

/** Build-time safety check for `next build` only (not lint/dev). */
export function assertAdminProductionAuthBuild(): void {
  if (!isNextProductionBuild()) return;
  const mode = resolveAdminAuthMode(process.env.NEXT_PUBLIC_AUTH_MODE);
  if (mode === 'staff') {
    throw new Error(
      '[autohub] Production admin build aborted: NEXT_PUBLIC_AUTH_MODE=staff is forbidden.',
    );
  }
}
