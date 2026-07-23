type AuthFailureListener = () => void;

const listeners = new Set<AuthFailureListener>();

/** Notify AuthProvider when HTTP layer clears tokens after refresh failure. */
export function emitAuthFailure(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      /* ignore listener errors */
    }
  }
}

export function onAuthFailure(listener: AuthFailureListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
