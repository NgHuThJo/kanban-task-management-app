import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import styles from "./index.module.css";
import { Board } from "#frontend/features/board/components/board";
import { Header } from "#frontend/features/header/components/header";
import { Sidebar } from "#frontend/features/sidebar/components/sidebar";
import { BoardStoreProvider } from "#frontend/store/board";
import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(getApiBoardsOptions());

  const currentBoardId = data?.[0]?.id ?? 0;

  return (
    <BoardStoreProvider id={currentBoardId}>
      <main className={styles.layout}>
        <Header />
        <Sidebar />
        <Suspense fallback={<p className={styles.loading}>Loading...</p>}>
          <Board />
        </Suspense>
      </main>
    </BoardStoreProvider>
  );
}
