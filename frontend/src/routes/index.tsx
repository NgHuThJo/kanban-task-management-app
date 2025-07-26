import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "#frontend/features/sidebar/components/sidebar";
import { BoardStoreProvider } from "#frontend/store/board";
import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import styles from "./index.module.css";
import { Header } from "#frontend/features/header/components/header";
import { Board } from "#frontend/features/board/components/board";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data } = useQuery(getApiBoardsOptions());

  const currentBoardId = data?.[0]?.id ?? 0;

  return (
    <BoardStoreProvider id={currentBoardId}>
      <main className={styles.layout}>
        <Header />
        <Sidebar />
        <Board />
      </main>
    </BoardStoreProvider>
  );
}
