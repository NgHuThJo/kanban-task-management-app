import { useDialog } from "#frontend/hooks/use-dialog";
import { Button } from "#frontend/components/button/button";
import { CreateBoardDialog } from "#frontend/components/dialog/create-board";
import styles from "./landing-page.module.css";

export function LandingPage() {
  const { dialogRef, openDialog, handleDialogBackgroundClick } = useDialog();

  return (
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
  );
}
