import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaAssetStatus, MediaType, MediaVisibility } from '@autohub/database';
import { R2StorageService } from '../../../infrastructure/storage/r2-storage.service';
import type { FirebasePhoneIdentity, UpdateProfileInput } from '../../auth/domain/auth.types';
import {
  UserRepository,
  type UserWithProfile,
} from '../infrastructure/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly users: UserRepository,
    private readonly r2: R2StorageService,
  ) {}

  findActiveById(id: string): Promise<UserWithProfile | null> {
    return this.users.findById(id).then((user) => {
      if (!user || user.status !== 'ACTIVE') return null;
      return user;
    });
  }

  /** Loads active user and ensures notification preference defaults exist. */
  async findActiveByIdWithDefaults(id: string): Promise<UserWithProfile | null> {
    const user = await this.findActiveById(id);
    if (!user) return null;
    if (user.notificationPreference) return user;
    return this.users.ensureNotificationPreferences(id);
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

    for (const key of ['firstName', 'lastName'] as const) {
      if (Object.prototype.hasOwnProperty.call(patch, key)) {
        const value = patch[key];
        if (value === null) continue;
        if (value !== undefined) {
          const trimmed = value.trim();
          if (trimmed.length < 1 || trimmed.length > 80) {
            throw new BadRequestException(`${key} must be between 1 and 80 characters`);
          }
          patch[key] = trimmed;
        }
      }
    }

    if (patch.cityId !== undefined) {
      const city = await this.users.findCityById(patch.cityId);
      if (!city) {
        throw new BadRequestException('Invalid cityId');
      }
    }

    if (patch.bio !== undefined && patch.bio !== null && patch.bio.length > 2000) {
      throw new BadRequestException('bio must be at most 2000 characters');
    }

    let dateOfBirth: Date | null | undefined;
    if (Object.prototype.hasOwnProperty.call(patch, 'dateOfBirth')) {
      if (patch.dateOfBirth === null) {
        dateOfBirth = null;
      } else if (patch.dateOfBirth !== undefined) {
        dateOfBirth = parseDateOfBirth(patch.dateOfBirth);
      }
    }

    let avatarUrl: string | null | undefined;
    let avatarMediaId: string | null | undefined;

    if (Object.prototype.hasOwnProperty.call(patch, 'avatarMediaId')) {
      if (patch.avatarMediaId === null) {
        avatarMediaId = null;
        // Clear denormalized URL unless a new avatarUrl is also provided
        if (!Object.prototype.hasOwnProperty.call(patch, 'avatarUrl')) {
          avatarUrl = null;
        }
      } else if (patch.avatarMediaId !== undefined) {
        const media = await this.users.findOwnedReadyMedia(userId, patch.avatarMediaId);
        if (!media) {
          throw new BadRequestException(
            'avatarMediaId must reference a READY media asset you own',
          );
        }
        if (media.mediaType !== MediaType.IMAGE) {
          throw new BadRequestException('Avatar media must be an IMAGE');
        }
        avatarMediaId = media.id;
        avatarUrl = (await this.resolveAvatarUrl(media)) ?? patch.avatarUrl ?? null;
        // Local/dev without R2: still link the MediaAsset; URL may be filled later.
        if (!avatarUrl && !this.r2.isConfigured()) {
          avatarUrl = undefined;
        } else if (!avatarUrl) {
          throw new BadRequestException(
            'Unable to resolve avatar URL from media asset',
          );
        }
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(patch, 'avatarUrl') &&
      avatarMediaId === undefined
    ) {
      avatarUrl = patch.avatarUrl ?? null;
      if (patch.avatarUrl === null) {
        avatarMediaId = null;
      }
    } else if (
      Object.prototype.hasOwnProperty.call(patch, 'avatarUrl') &&
      patch.avatarUrl &&
      avatarMediaId === undefined
    ) {
      avatarUrl = patch.avatarUrl;
    }

    const data: Parameters<UserRepository['updateProfile']>[1] = {};
    if (patch.displayName !== undefined) data.displayName = patch.displayName;
    if (Object.prototype.hasOwnProperty.call(patch, 'firstName')) {
      data.firstName = patch.firstName ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'lastName')) {
      data.lastName = patch.lastName ?? null;
    }
    if (patch.cityId !== undefined) data.cityId = patch.cityId;
    if (Object.prototype.hasOwnProperty.call(patch, 'preferredLanguage')) {
      data.preferredLanguage = patch.preferredLanguage ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'email')) {
      data.email = patch.email ?? null;
    }
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (avatarMediaId !== undefined) data.avatarMediaId = avatarMediaId;
    if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth;

    const sellerTouch =
      patch.sellerType !== undefined ||
      Object.prototype.hasOwnProperty.call(patch, 'bio') ||
      Object.prototype.hasOwnProperty.call(patch, 'sellerDisplayName');

    if (sellerTouch) {
      data.sellerProfile = {
        ...(patch.sellerType !== undefined ? { type: patch.sellerType } : {}),
        ...(Object.prototype.hasOwnProperty.call(patch, 'bio')
          ? { bio: patch.bio ?? null }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(patch, 'sellerDisplayName')
          ? {
              displayName:
                patch.sellerDisplayName === null
                  ? undefined
                  : patch.sellerDisplayName?.trim(),
            }
          : {}),
      };
      if (
        patch.sellerDisplayName === null &&
        data.sellerProfile &&
        'displayName' in data.sellerProfile
      ) {
        delete data.sellerProfile.displayName;
      }
    }

    if (patch.notificationPreferences) {
      data.notificationPreferences = patch.notificationPreferences;
    }

    if (Object.keys(data).length === 0) {
      const existing = await this.findActiveById(userId);
      if (!existing) throw new NotFoundException('User not found');
      return existing;
    }

    return this.users.updateProfile(userId, data);
  }

  private async resolveAvatarUrl(media: {
    originalKey: string;
    visibility: MediaVisibility;
    status: MediaAssetStatus | string;
  }): Promise<string | null> {
    if (!this.r2.isConfigured()) {
      return null;
    }
    if (media.visibility === MediaVisibility.PUBLIC) {
      return this.r2.getPublicUrl(media.originalKey);
    }
    return this.r2.createPresignedDownloadUrl({ key: media.originalKey });
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
