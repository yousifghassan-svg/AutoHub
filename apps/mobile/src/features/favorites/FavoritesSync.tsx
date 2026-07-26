import { useEffect, useRef } from 'react';
import { isOnline } from '@/lib/network';
import { useFavoritesStore } from './favorites.store';

/** Flushes offline favorite queue when connectivity returns. */
export function FavoritesSync() {
  const flushPending = useFavoritesStore((s) => s.flushPending);
  const wasOffline = useRef(false);

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      const online = await isOnline();
      if (!mounted) return;
      if (!online) {
        wasOffline.current = true;
        return;
      }
      if (wasOffline.current) {
        flushPending();
        wasOffline.current = false;
      }
    };
    void tick();
    const id = setInterval(() => void tick(), 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [flushPending]);

  return null;
}
