import {
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
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

type FirebaseAuthLike = {
  verifyIdToken: (token: string, checkRevoked?: boolean) => Promise<DecodedIdTokenLike>;
};

type FirebaseAdminLike = {
  apps: unknown[];
  initializeApp: (options: { credential: unknown }) => void;
  credential: {
    cert: (serviceAccount: {
      projectId: string;
      clientEmail: string;
      privateKey: string;
    }) => unknown;
  };
  auth: () => FirebaseAuthLike;
};

/**
 * Firebase Authentication integration for phone sign-in verification.
 *
 * Uses the firebase-admin namespaced entry (require) so Jest can load the module
 * without ESM-only transitive deps from `firebase-admin/auth`.
 */
@Injectable()
export class FirebaseAuthService implements OnModuleInit {
  private admin: FirebaseAdminLike | null = null;
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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const firebaseAdmin = require('firebase-admin') as FirebaseAdminLike;
      this.admin = firebaseAdmin;
      if (!firebaseAdmin.apps.length) {
        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert({
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
      this.admin = null;
      this.logger.error(
        'Failed to initialize Firebase Admin SDK',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  isConfigured(): boolean {
    return this.ready;
  }

  getAuth(): FirebaseAuthLike | null {
    if (!this.ready || !this.admin) return null;
    return this.admin.auth();
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
