import type { MouseEvent } from "react";
import styles from "./theme-switch.module.css";
import { LightThemeIcon, DarkThemeIcon } from "#frontend/components/ui/icon";
import { useThemeStore } from "#frontend/store/theme";

export function ThemeSwitch() {
  const themeState = useThemeStore((state) => state);

  const handleThemeToggle = (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const toggle = button.querySelector(`.${styles.toggle}`);
    const theme = themeState.currentTheme === "light" ? "dark" : "light";
    themeState.setTheme(theme);

    if (toggle) {
      toggle.classList.toggle(`${styles.dark}`);
    }
  };

  return (
    <div className={styles.layout}>
      <LightThemeIcon />
      <button
        className={styles.switch}
        type="button"
        onClick={handleThemeToggle}
      >
        <div className={styles.toggle}></div>
      </button>
      <DarkThemeIcon />
    </div>
  );
}
