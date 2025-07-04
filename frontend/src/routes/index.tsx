import { createFileRoute } from "@tanstack/react-router";
import { Header } from "#frontend/components/header/header";
import { Sidebar } from "#frontend/features/sidebar/components/sidebar";
import { BoardStoreProvider } from "#frontend/store/board";
import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import styles from "./index.module.css";
import { Field } from "#frontend/features/field/components/field";

export const Route = createFileRoute("/")({
  component: Board,
});

function Board() {
  const { data } = useQuery(getApiBoardsOptions());

  const currentBoardId = data?.[0]?.id ?? 0;

  return (
    <BoardStoreProvider id={currentBoardId}>
      <main className={styles.layout}>
        <Header />
        <Sidebar />
        <Field />
      </main>
    </BoardStoreProvider>
  );
}
