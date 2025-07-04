import type { MouseEvent } from "react";
import { useThemeStore } from "#frontend/store/theme";
import { LightThemeIcon, DarkThemeIcon } from "#frontend/components/icon/icon";
import styles from "./theme-switch.module.css";

export function ThemeSwitch() {
  const themeState = useThemeStore((state) => state);

  const handleThemeToggle = (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const toggle = button.querySelector(`.${styles.toggle}`);
    console.log(styles.toggle);
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
