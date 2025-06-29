import { useQuery } from "@tanstack/react-query";
import { getApiBoardsOptions } from "#frontend/types/@tanstack/react-query.gen";
import { useDialog } from "#frontend/hooks/use-dialog";
import { Button } from "#frontend/components/button/button";
import { CreateBoardDialog } from "#frontend/components/dialog/create-board";
import styles from "./landing-page.module.css";
import { Navigate } from "@tanstack/react-router";

export function LandingPage() {
  const { dialogRef, openDialog, handleDialogBackgroundClick } = useDialog();
  const { data } = useQuery(getApiBoardsOptions());

  const isDataArrayEmpty = data?.length ?? 0;

  return !isDataArrayEmpty ? (
    <main className={styles.layout}>
      <CreateBoardDialog
        ref={dialogRef}
        closeDialog={handleDialogBackgroundClick}
      />
      <p className={styles["main-text"]}>There are no boards available.</p>
      <Button type="button" className="add-task" onClick={openDialog}>
        + Add New Board
      </Button>
    </main>
  ) : (
    <Navigate to="/board" />
  );
}
