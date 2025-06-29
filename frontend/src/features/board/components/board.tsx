import { Outlet } from "@tanstack/react-router";
import { Header } from "#frontend/components/header/header";
import { Sidebar } from "#frontend/components/sidebar/sidebar";
import styles from "./board.module.css";

export function Board() {
  return (
    <main className={styles.layout}>
      <Header />
      <Sidebar />
      <Outlet />
    </main>
  );
}
