import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
  theme: ThemeMode;
  mounted: boolean;

  initialize: () => void;
  setTheme: (theme: ThemeMode) => void;
  reset: () => void;
  toggleTheme: () => void;
}

const applyTheme = (theme: ThemeMode) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const initialState = {
  theme: "system" as ThemeMode,
  mounted: false,
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initialize: () => {
        const theme = get().theme;

        // First load: if nothing persisted yet, use system preference
        if (!localStorage.getItem("theme-storage")) {
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
          ).matches;

          const systemTheme: ThemeMode = prefersDark ? "dark" : "light";

          applyTheme(systemTheme);

          set({
            theme: systemTheme,
            mounted: true,
          });

          return;
        }

        applyTheme(theme);

        set({
          mounted: true,
        });
      },

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";

        applyTheme(next);

        set({
          theme: next,
        });
      },

      reset: () => set(initialState),
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({
        theme: state.theme,
      }),
    },
  ),
);
