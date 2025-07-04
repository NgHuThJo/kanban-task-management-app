import { useSuspenseQuery } from "@tanstack/react-query";
import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";
import { EmptyBoardIcon } from "#frontend/components/icon/icon";
import styles from "./field.module.css";
import { CreateBoardDialog } from "#frontend/components/dialog/create-board";
import { useDialog } from "#frontend/hooks/use-dialog";

export function Field() {
  const { data } = useSuspenseQuery(getApiBoardsOptions());
  const { dialogRef, openDialog, handleDialogBackgroundClick } = useDialog();

  if (data.length) {
    return <div className={styles.layout}></div>;
  }

  return (
    <>
      <CreateBoardDialog
        ref={dialogRef}
        closeDialog={handleDialogBackgroundClick}
      />
      <div className={styles.layout}>
        <EmptyBoardIcon className={styles.icon} />
        <button type="button" onClick={openDialog}>
          + Create New Board
        </button>
      </div>
    </>
  );
}
