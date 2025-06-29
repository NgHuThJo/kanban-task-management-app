import { Button } from "#frontend/components/button/button";
import { Cross } from "#frontend/components/icon/icon";
import styles from "./edit-board.module.css";

type EditOptionDialogProps = {
  closeDialog: () => void;
};

export function EditOptionDialog({ closeDialog }: EditOptionDialogProps) {
  return (
    <div className={styles.layout}>
      <Button className="icon" type="button" onClick={closeDialog}>
        <Cross />
      </Button>
      <Button type="button">Edit board</Button>
      <Button className="delete" type="button">
        Delete board
      </Button>
    </div>
  );
}
