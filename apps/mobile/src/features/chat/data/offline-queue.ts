import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SendMessageInput } from './chat.repository';

const KEY = 'autohub.chat.offline-queue.v1';

export type QueuedMessage = SendMessageInput & {
  conversationId: string;
  queuedAt: string;
};

export async function loadQueue(): Promise<QueuedMessage[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedMessage[];
  } catch {
    return [];
  }
}

export async function enqueue(item: QueuedMessage): Promise<void> {
  const items = await loadQueue();
  const without = items.filter(
    (x) => !(x.conversationId === item.conversationId && x.clientId && x.clientId === item.clientId),
  );
  await AsyncStorage.setItem(KEY, JSON.stringify([...without, item].slice(-100)));
}

export async function removeFromQueue(clientId: string): Promise<void> {
  const items = (await loadQueue()).filter((x) => x.clientId !== clientId);
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
