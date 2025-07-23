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

export function CreateTaskDialog({ isMobile }: CreateTaskDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button">{isMobile ? "+" : "+ Create New Task"}</Button>
      </DialogTrigger>
      <DialogContent aria-describedby="Create new task" showCloseButton={false}>
        <DialogTitle>Add New Task</DialogTitle>
        <CreateTaskForm />
        <DialogClose asChild>
          <Button type="button">
            <Cross />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
