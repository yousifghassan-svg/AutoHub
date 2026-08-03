/** Shared homepage motion tokens (AX-1 Motion System). */
export const HOME_EASE = [0.16, 1, 0.3, 1] as const;

export const homeEnter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: HOME_EASE },
} as const;
