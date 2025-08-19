import { Button } from "#frontend/components/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "#frontend/components/primitives/dialog";
import { type GetKanbanTasksResponse } from "#frontend/types/generated";
import { zDeleteKanbanTaskRequest } from "#frontend/types/generated/zod.gen";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import styles from "./delete-task-dialog.module.css";
import {
  deleteApiKanbantasksMutation,
  getApiKanbantasksOptions,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { useState } from "react";

type DeleteKanbantaskDialogProps = {
  task: GetKanbanTasksResponse;
};

export function DeleteKanbantaskDialog({ task }: DeleteKanbantaskDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    ...deleteApiKanbantasksMutation(),
    onMutate: async (payload) => {
      const deletedTaskId = payload.body.id;

      await queryClient.cancelQueries({
        queryKey: getApiKanbantasksOptions({
          query: {
            BoardColumnId: task.boardColumnId,
          },
        }).queryKey,
      });

      const previousBoardColumnData = queryClient.getQueryData(
        getApiKanbantasksOptions({
          query: {
            BoardColumnId: task.boardColumnId,
          },
        }).queryKey,
      );

      queryClient.setQueryData(
        getApiKanbantasksOptions({
          query: {
            BoardColumnId: task.boardColumnId,
          },
        }).queryKey,
        (oldData) => oldData?.filter((task) => task.id !== deletedTaskId),
      );

      return { previousBoardColumnData };
    },
    onSuccess: () => {
      setOpen(false);
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData(
        getApiKanbantasksOptions({
          query: {
            BoardColumnId: task.boardColumnId,
          },
        }).queryKey,
        context?.previousBoardColumnData,
      );
    },
  });

  const handleDelete = () => {
    const payload = {
      id: task.id,
    };

    const { data, success } = zDeleteKanbanTaskRequest.safeParse(payload);

    if (!success) {
      console.error("Invalid id");

      return;
    }

    mutate({
      body: data,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" intent="destructive">
          Delete Task
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="Update task" showCloseButton={false}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogDescription>
          {`Are you sure you want to delete the ${task.title} task and its subtasks? This action cannot be reversed.`}
        </DialogDescription>
        <div className={styles["button-group"]}>
          <Button onClick={handleDelete} intent="destructive">
            Delete
          </Button>
          <DialogClose variant="cancel" asChild>
            <Button variant="cancel">Cancel</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
