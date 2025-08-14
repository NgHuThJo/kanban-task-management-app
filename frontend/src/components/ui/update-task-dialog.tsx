import { Button } from "#frontend/components/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "#frontend/components/primitives/dialog";

import { Cross } from "#frontend/components/ui/icon";
import { UpdateKanbanTaskForm } from "#frontend/components/ui/update-task-form";
import type { GetKanbanTasksResponse } from "#frontend/types/generated";

type EditKanbantaskDialogProps = {
  task: GetKanbanTasksResponse;
};

export function UpdateKanbantaskDialog({ task }: EditKanbantaskDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">Edit Task</Button>
      </DialogTrigger>
      <DialogContent aria-describedby="Update task" showCloseButton={false}>
        <DialogTitle>Edit Task</DialogTitle>
        <UpdateKanbanTaskForm task={task} />
        <DialogClose asChild>
          <Button type="button">
            <Cross />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
