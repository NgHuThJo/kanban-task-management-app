import { Suspense, useState } from "react";
import { createFileRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import { useDialog } from "#frontend/hooks/use-dialog";
import { CreateBoardDialog } from "#frontend/components/dialog/create-board";
import { Header } from "#frontend/components/header/header";
import { Sidebar } from "#frontend/components/sidebar/sidebar";
import { Button } from "#frontend/components/button/button";
import { getApiBoardsOptions } from "#frontend/types/@tanstack/react-query.gen";

export const Route = createFileRoute("/_layout")({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(getApiBoardsOptions());
  },
  component: RootLayout,
});

function RootLayout() {
  const data = useLoaderData({ from: "/_layout" });
  const [currentBoardId, setCurrentBoardId] = useState<number>(() => {
    return data[0]?.id ?? 0;
  });
  const { dialogRef, openDialog, closeDialog } = useDialog();

  const handleAddBoard = () => {
    openDialog();
  };

  const currentBoard = !currentBoardId
    ? undefined
    : data.findLast((value) => value.id == currentBoardId);

  return currentBoard == undefined ? (
    <main>
      <CreateBoardDialog ref={dialogRef} closeDialog={closeDialog} />
      <p>There are no boards available. Create a new board to get started.</p>
      <Button type="button" onClick={handleAddBoard}>
        + Add New Board
      </Button>
    </main>
  ) : (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <Header currentBoardName={currentBoard.name} />
      </Suspense>
      <Sidebar />
      <Outlet />
    </main>
  );
}
