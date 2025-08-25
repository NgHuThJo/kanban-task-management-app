import { Button } from "#frontend/components/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "#frontend/components/primitives/dialog";

import { CreateBoardForm } from "#frontend/components/ui/create-board-form";
import { Cross } from "#frontend/components/ui/icon";
import type { ReactNode } from "react";

type CreateBoardDialogProps = {
  trigger: ReactNode;
};

export function CreateBoardDialog({
  trigger = <Button>+Create New Board</Button>,
}: CreateBoardDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        aria-describedby="Create new board"
        showCloseButton={false}
      >
        <DialogTitle>Add New Board</DialogTitle>
        <CreateBoardForm />
        <DialogClose asChild>
          <Button type="button">
            <Cross />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
