import { config } from '@/lib/config';
import { getHttpClient } from '@/lib/api/client';
import {
  createApiAuthRepository,
  createMockAuthRepository,
  type AuthRepository,
} from './data/auth.repository';
import { createFirebasePhoneAuthGateway } from './data/firebase-phone-auth.gateway';
import { createMockPhoneAuthGateway } from './data/mock-phone-auth.gateway';
import { createSecureTokenStorage } from './data/token-storage';

let repository: AuthRepository | null = null;

export function getAuthRepository(): AuthRepository {
  if (repository) return repository;

  const storage = createSecureTokenStorage();
  const phoneAuth =
    config.authMode === 'api' ? createFirebasePhoneAuthGateway() : createMockPhoneAuthGateway();

  if (config.authMode === 'mock') {
    repository = createMockAuthRepository({ storage, phoneAuth });
    return repository;
  }

  repository = createApiAuthRepository({
    http: getHttpClient(),
    storage,
    phoneAuth,
  });
  return repository;
}

/** Test helper */
export function __setAuthRepositoryForTests(next: AuthRepository | null) {
  repository = next;
}
