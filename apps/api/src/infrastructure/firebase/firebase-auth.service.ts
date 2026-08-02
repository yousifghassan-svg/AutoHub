import {
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { AppConfigService } from '../config/app-config.service';
import { AppLoggerService } from '../logger/app-logger.service';
import type { FirebasePhoneIdentity } from '../../domains/auth/domain/auth.types';

type DecodedIdTokenLike = {
  uid: string;
  phone_number?: string;
  email?: string;
  name?: string;
  firebase?: { sign_in_provider?: string };
};

/**
 * Firebase Authentication integration for phone sign-in verification.
 * Uses firebase-admin v14 modular APIs (`firebase-admin/app` + `firebase-admin/auth`).
 */
@Injectable()
export class FirebaseAuthService implements OnModuleInit {
  private ready = false;

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(FirebaseAuthService.name);
  }

  onModuleInit(): void {
    const { projectId, clientEmail, privateKey } = this.appConfig.app.firebase;

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase Admin credentials incomplete — auth integration idle until configured',
      );
      return;
    }

    try {
      if (getApps().length === 0) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
      this.ready = true;
      this.logger.log('Firebase Admin SDK initialized');
    } catch (error) {
      this.ready = false;
      this.logger.error(
        'Failed to initialize Firebase Admin SDK',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  isConfigured(): boolean {
    return this.ready;
  }

  getAuth(): Auth | null {
    if (!this.ready) return null;
    return getAuth();
  }

  /**
   * Verifies a Firebase ID token from phone authentication.
   * Requires `phone_number` claim on the token.
   */
  async verifyPhoneIdToken(idToken: string): Promise<FirebasePhoneIdentity> {
    const auth = this.getAuth();
    if (!auth) {
      throw new ServiceUnavailableException(
        'Firebase Authentication is not configured on this server',
      );
    }

    let decoded: DecodedIdTokenLike;
    try {
      decoded = await auth.verifyIdToken(idToken, true);
    } catch {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }

    if (!decoded.phone_number) {
      throw new UnauthorizedException(
        'Firebase token must include a phone_number claim (phone authentication required)',
      );
    }

    return {
      firebaseUid: decoded.uid,
      phone: decoded.phone_number,
      email: decoded.email ?? null,
      displayName: decoded.name ?? null,
    };
  }
}
