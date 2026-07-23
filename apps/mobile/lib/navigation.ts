import { router } from 'expo-router';

/** Safe back: deep links / cold starts may have an empty stack. */
export function safeBack(fallback: string = '/(tabs)'): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback as never);
}
