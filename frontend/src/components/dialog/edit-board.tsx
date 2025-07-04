import { Button } from "#frontend/components/button/button";
import { ChangeBoard } from "#frontend/components/dialog/change-board";
import { DeleteBoard } from "#frontend/components/dialog/delete-board";
import { Cross } from "#frontend/components/icon/icon";
import { useDialog } from "#frontend/hooks/use-dialog";
import styles from "./edit-board.module.css";

type EditOptionDialogProps = {
  closeDialog: () => void;
};

export function EditOptionDialog({ closeDialog }: EditOptionDialogProps) {
  const {
    dialogRef: editRef,
    openDialog: openEditDialog,
    handleDialogBackgroundClick: handleEditDialogClose,
  } = useDialog();
  const {
    dialogRef: deleteRef,
    openDialog: openDeleteDialog,
    handleDialogBackgroundClick: handleDeleteDialogClose,
  } = useDialog();

  const handleEdit = () => {
    openEditDialog();
    // closeDialog();
  };

  const handleDelete = () => {
    openDeleteDialog();
    // closeDialog();
  };

  return (
    <div className={styles.layout}>
      <ChangeBoard closeDialog={handleEditDialogClose} ref={editRef} />
      <DeleteBoard closeDialog={handleDeleteDialogClose} ref={deleteRef} />
      <Button className="icon" type="button" onClick={closeDialog}>
        <Cross />
      </Button>
      <Button type="button" onClick={handleEdit}>
        Edit board
      </Button>
      <Button className="delete" type="button" onClick={handleDelete}>
        Delete board
      </Button>
    </div>
  );
}
