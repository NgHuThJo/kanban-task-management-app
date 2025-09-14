import { useState, type ReactNode } from "react";
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

type CreateBoardDialogProps = {
  trigger: ReactNode;
};

export function CreateBoardDialog({
  trigger = <Button>+Create New Board</Button>,
}: CreateBoardDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const changeDialogOpenState = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const dialogStateObject = {
    isOpen,
    changeDialogOpenState,
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent aria-describedby={undefined} showCloseButton={false}>
        <DialogTitle>Add New Board</DialogTitle>
        <CreateBoardForm dialogState={dialogStateObject} />
        <DialogClose asChild>
          <Button type="button">
            <Cross />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
