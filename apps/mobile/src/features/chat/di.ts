import { getHttpClient } from '@/lib/api/client';
import { createChatRepository, type ChatRepository } from './data/chat.repository';

let repo: ChatRepository | null = null;

export function getChatRepository(): ChatRepository {
  if (!repo) repo = createChatRepository(getHttpClient());
  return repo;
}
