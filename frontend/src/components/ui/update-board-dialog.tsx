import { Button } from "#frontend/components/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "#frontend/components/primitives/dialog";
import { UpdateBoardForm } from "#frontend/components/ui/update-board-form";

import { Cross } from "#frontend/components/ui/icon";

export function UpdateBoardDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">Edit board</Button>
      </DialogTrigger>
      <DialogContent aria-describedby="Update board" showCloseButton={false}>
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
