import { useState } from "react";
import { Button } from "#frontend/components/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "#frontend/components/primitives/dialog";
import { CreateTaskForm } from "#frontend/components/ui/create-task-form";

import { Cross } from "#frontend/components/ui/icon";

type CreateTaskDialogProps = {
  isMobile: boolean;
};

export function CreateKanbanTaskDialog({ isMobile }: CreateTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const changeDialogOpenState = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const dialogStateObject = {
    isOpen,
    changeDialogOpenState,
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          style={{
            marginLeft: "auto",
          }}
        >
          {isMobile ? "+" : "+ Create New Task"}
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} showCloseButton={false}>
        <DialogTitle>Add New Task</DialogTitle>
        <CreateTaskForm dialogState={dialogStateObject} />
        <DialogClose asChild>
          <Button type="button">
            <Cross />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
