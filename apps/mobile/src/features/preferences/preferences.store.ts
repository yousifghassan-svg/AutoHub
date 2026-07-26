import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppLocale, ColorScheme } from '@autohub/mobile-ui';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type PreferencesState = {
  locale: AppLocale;
  scheme: ColorScheme | 'system';
  onboardingCompleted: boolean;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setLocale: (locale: AppLocale) => void;
  setScheme: (scheme: ColorScheme | 'system') => void;
  completeOnboarding: () => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: 'ar',
      scheme: 'system',
      onboardingCompleted: false,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setLocale: (locale) => set({ locale }),
      setScheme: (scheme) => set({ scheme }),
      completeOnboarding: () => set({ onboardingCompleted: true }),
    }),
    {
      name: 'autohub.preferences.v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
