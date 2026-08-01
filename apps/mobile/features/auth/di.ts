import { config } from '@/lib/config';
import { getHttpClient } from '@/lib/api/client';
import {
  createApiAuthRepository,
  createDevAuthRepository,
  type AuthRepository,
} from './data/auth.repository';
import { createFirebasePhoneAuthGateway } from './data/firebase-phone-auth.gateway';
import { createMockPhoneAuthGateway } from './data/mock-phone-auth.gateway';
import { createSecureTokenStorage } from './data/token-storage';

let repository: AuthRepository | null = null;

export function getAuthRepository(): AuthRepository {
  if (repository) return repository;

  const storage = createSecureTokenStorage();
  const http = getHttpClient();

  if (config.authMode === 'firebase') {
    repository = createApiAuthRepository({
      http,
      storage,
      phoneAuth: createFirebasePhoneAuthGateway(),
    });
    return repository;
  }

  repository = createDevAuthRepository({
    http,
    storage,
    phoneAuth: createMockPhoneAuthGateway(),
  });
  return repository;
}

/** Test helper */
export function __setAuthRepositoryForTests(next: AuthRepository | null) {
  repository = next;
}
