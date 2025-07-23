import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentBoardId } from "#frontend/store/board";
import {
  deleteApiBoardsMutation,
  getApiBoardsOptions,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { zDeleteBoardRequest } from "#frontend/types/generated/zod.gen";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "#frontend/components/primitives/dialog";
import { Button } from "#frontend/components/primitives/button";
import { Cross } from "#frontend/components/ui/icon";
import styles from "./delete-board-dialog.module.css";

export function DeleteBoardDialog() {
  const queryClient = useQueryClient();
  const currentBoardId = useCurrentBoardId();
  const { mutate } = useMutation({
    ...deleteApiBoardsMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getApiBoardsOptions().queryKey,
      });
    },
  });

  const handleDelete = () => {
    const payload = {
      id: currentBoardId,
    };

    const { data, success } = zDeleteBoardRequest.safeParse(payload);

    if (!success) {
      console.error("Invalid id");

      return;
    }

    mutate({
      body: data,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" intent="destructive" type="button">
          Delete board
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="Create new task" showCloseButton={false}>
        <DialogTitle variant="destructive">Remove current board</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete the current board? This action will
          remove all columns and tasks and cannot be reversed.
        </DialogDescription>
        <div className={styles["button-group"]}>
          <Button intent="destructive">Delete</Button>
          <DialogClose variant="cancel" asChild>
            <Button variant="cancel">Cancel</Button>
          </DialogClose>
        </div>
        <DialogClose asChild>
          <Button>
            <Cross />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
