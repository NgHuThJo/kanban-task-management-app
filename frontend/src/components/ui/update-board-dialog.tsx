import { Button } from "#frontend/components/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "#frontend/components/primitives/dialog";
import { Cross } from "#frontend/components/ui/icon";
import { UpdateBoardForm } from "#frontend/components/ui/update-board-form";

export function UpdateBoardDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">Edit board</Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} showCloseButton={false}>
        <DialogTitle>Edit Board</DialogTitle>
        <UpdateBoardForm />
        <DialogClose asChild>
          <Button type="button">
            <Cross />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
