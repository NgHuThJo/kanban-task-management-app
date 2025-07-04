import { createContext, useState, use, type PropsWithChildren } from "react";
import { create, useStore, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

type ThemeStore = {
  currentTheme: Theme;
  setTheme: (newTheme: Theme) => void;
};

const ThemeContext = createContext<StoreApi<ThemeStore> | null>(null);

export const useThemeStore = <T,>(selector: (state: ThemeStore) => T) => {
  const store = use(ThemeContext);

  if (!store) {
    throw new Error("Missing ThemeProvider");
  }

  return useStore(store, selector);
};

export const useTheme = () => useThemeStore((state) => state.currentTheme);

export function ThemeStoreProvider({ children }: PropsWithChildren) {
  const [store] = useState(() =>
    create<ThemeStore>()(
      persist(
        (set) => ({
          currentTheme: window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light",
          setTheme: (newTheme: Theme) =>
            set(() => ({
              currentTheme: newTheme,
            })),
        }),
        {
          name: "theme",
        },
      ),
    ),
  );

  return <ThemeContext value={store}>{children}</ThemeContext>;
}
