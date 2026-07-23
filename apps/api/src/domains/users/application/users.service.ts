import { Injectable } from '@nestjs/common';
import type { User } from '@autohub/database';
import type { FirebasePhoneIdentity } from '../../auth/domain/auth.types';
import { UserRepository } from '../infrastructure/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly users: UserRepository) {}

  findActiveById(id: string): Promise<User | null> {
    return this.users.findById(id).then((user) => {
      if (!user || user.status !== 'ACTIVE') return null;
      return user;
    });
  }

  /**
   * Initializes a local user profile on first successful Firebase phone login.
   * Subsequent logins refresh phone/email/displayName when present.
   */
  async findOrCreateFromFirebase(identity: FirebasePhoneIdentity): Promise<{
    user: User;
    created: boolean;
  }> {
    const existing = await this.users.findByFirebaseUid(identity.firebaseUid);
    if (existing) {
      if (existing.status !== 'ACTIVE') {
        return { user: existing, created: false };
      }

      const user = await this.users.updateIdentity(existing.id, {
        phone: identity.phone,
        email: identity.email,
        displayName: identity.displayName ?? existing.displayName,
      });
      return { user, created: false };
    }

    const user = await this.users.createFromFirebase({
      firebaseUid: identity.firebaseUid,
      phone: identity.phone,
      email: identity.email,
      displayName: identity.displayName,
    });
    return { user, created: true };
  }
}
