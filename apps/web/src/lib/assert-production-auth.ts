import { resolveWebAuthMode } from './auth-mode';

function isNextProductionBuild(): boolean {
  // next build sets NEXT_PHASE; avoid failing next lint/dev which may set NODE_ENV=production.
  return process.env.NEXT_PHASE === 'phase-production-build';
}

function requireEnv(name: string): string {
  const value = (process.env[name] ?? '').trim();
  if (!value) {
    throw new Error(
      `[autohub] Production web build aborted: ${name} is required when NEXT_PUBLIC_AUTH_MODE=firebase.`,
    );
  }
  return value;
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
  requireEnv('NEXT_PUBLIC_FIREBASE_API_KEY');
  requireEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  requireEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  requireEnv('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (process.env.NEXT_PUBLIC_FIREBASE_PHONE_TESTING === 'true') {
    throw new Error(
      '[autohub] Production web build aborted: NEXT_PUBLIC_FIREBASE_PHONE_TESTING must not be enabled.',
    );
  }
}
