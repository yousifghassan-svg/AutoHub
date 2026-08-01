import { validateEnv } from './env.validation';

const base = {
  DATABASE_URL: 'postgresql://autohub:autohub@localhost:5433/autohub',
};

describe('validateEnv', () => {
  it('allows development defaults without Firebase', () => {
    const env = validateEnv({
      ...base,
      NODE_ENV: 'development',
    });
    expect(env.NODE_ENV).toBe('development');
    expect(env.JWT_ACCESS_SECRET).toBeTruthy();
  });

  it('rejects production with development JWT placeholder', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'dev-only-access-secret-change-me',
        FIREBASE_PROJECT_ID: 'proj',
        FIREBASE_CLIENT_EMAIL: 'a@b.c',
        FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----',
      }),
    ).toThrow(/JWT_ACCESS_SECRET/);
  });

  it('rejects production with short JWT secret', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'short-but-16chars',
        FIREBASE_PROJECT_ID: 'proj',
        FIREBASE_CLIENT_EMAIL: 'a@b.c',
        FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----',
      }),
    ).toThrow(/JWT_ACCESS_SECRET/);
  });

  it('rejects production without Firebase Admin credentials', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        JWT_ACCESS_SECRET: 'a-very-long-production-jwt-secret-value',
      }),
    ).toThrow(/FIREBASE_/);
  });

  it('accepts production with strong JWT and Firebase Admin credentials', () => {
    const env = validateEnv({
      ...base,
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: 'a-very-long-production-jwt-secret-value',
      FIREBASE_PROJECT_ID: 'autohub-prod',
      FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk@autohub-prod.iam.gserviceaccount.com',
      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----',
      AUTH_ALLOW_STAFF_LOGIN: 'true',
      AUTH_ALLOW_DEV_LOGIN: 'true',
    });
    expect(env.NODE_ENV).toBe('production');
    expect(env.AUTH_ALLOW_STAFF_LOGIN).toBe(true);
  });
});
