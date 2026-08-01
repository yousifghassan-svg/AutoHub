import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FirebasePhoneIdentity, UpdateProfileInput } from '../../auth/domain/auth.types';
import {
  UserRepository,
  type UserWithProfile,
} from '../infrastructure/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly users: UserRepository) {}

  findActiveById(id: string): Promise<UserWithProfile | null> {
    return this.users.findById(id).then((user) => {
      if (!user || user.status !== 'ACTIVE') return null;
      return user;
    });
  }

  findActiveByPhone(phone: string): Promise<UserWithProfile | null> {
    return this.users.findByPhone(phone).then((user) => {
      if (!user || user.status !== 'ACTIVE') return null;
      return user;
    });
  }

  /**
   * Initializes a local user profile on first successful Firebase phone login.
   * Subsequent logins refresh phone/email/displayName when present.
   */
  async findOrCreateFromFirebase(identity: FirebasePhoneIdentity): Promise<{
    user: UserWithProfile;
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

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<UserWithProfile> {
    const patch: UpdateProfileInput = { ...input };

    if (patch.displayName !== undefined) {
      const trimmed = patch.displayName.trim();
      if (trimmed.length < 2 || trimmed.length > 80) {
        throw new BadRequestException('displayName must be between 2 and 80 characters');
      }
      patch.displayName = trimmed;
    }

    if (patch.cityId !== undefined) {
      const city = await this.users.findCityById(patch.cityId);
      if (!city) {
        throw new BadRequestException('Invalid cityId');
      }
    }

    let dateOfBirth: Date | null | undefined;
    if (Object.prototype.hasOwnProperty.call(patch, 'dateOfBirth')) {
      if (patch.dateOfBirth === null) {
        dateOfBirth = null;
      } else if (patch.dateOfBirth !== undefined) {
        dateOfBirth = parseDateOfBirth(patch.dateOfBirth);
      }
    }

    const data: Parameters<UserRepository['updateProfile']>[1] = {};
    if (patch.displayName !== undefined) data.displayName = patch.displayName;
    if (patch.cityId !== undefined) data.cityId = patch.cityId;
    if (Object.prototype.hasOwnProperty.call(patch, 'preferredLanguage')) {
      data.preferredLanguage = patch.preferredLanguage ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'email')) {
      data.email = patch.email ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'avatarUrl')) {
      data.avatarUrl = patch.avatarUrl ?? null;
    }
    if (dateOfBirth !== undefined) {
      data.dateOfBirth = dateOfBirth;
    }

    if (Object.keys(data).length === 0) {
      const existing = await this.findActiveById(userId);
      if (!existing) throw new NotFoundException('User not found');
      return existing;
    }

    return this.users.updateProfile(userId, data);
  }
}

function parseDateOfBirth(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException('dateOfBirth must be YYYY-MM-DD');
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('dateOfBirth is invalid');
  }

  const now = new Date();
  const ageMs = now.getTime() - date.getTime();
  const years = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  if (years < 13 || years > 120) {
    throw new BadRequestException('dateOfBirth is out of allowed range');
  }
  return date;
}
