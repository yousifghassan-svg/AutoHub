import { Injectable } from '@nestjs/common';
import { CommunicationRepository } from '../infrastructure/communication.repository';

@Injectable()
export class PresenceService {
  constructor(private readonly repo: CommunicationRepository) {}

  async setOnline(userId: string) {
    return this.repo.upsertPresence(userId, true);
  }

  async setOffline(userId: string) {
    const presence = await this.repo.upsertPresence(userId, false);
    return presence;
  }

  async getForUsers(userIds: string[]) {
    return this.repo.getPresence(userIds);
  }
}
