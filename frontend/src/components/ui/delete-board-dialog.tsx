import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import styles from "./delete-board-dialog.module.css";
import { Button } from "#frontend/components/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "#frontend/components/primitives/dialog";
import { Cross } from "#frontend/components/ui/icon";
import { useBoardStore, useCurrentBoardId } from "#frontend/store/board";
import {
  deleteApiBoardsMutation,
  getApiBoardsOptions,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { zDeleteBoardRequest } from "#frontend/types/generated/zod.gen";

export function DeleteBoardDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const currentBoardId = useCurrentBoardId();
  const setCurrentBoardId = useBoardStore((state) => state.setCurrentBoardId);
  const { mutate } = useMutation({
    ...deleteApiBoardsMutation(),
    onMutate: async (payload) => {
      const deletedBoardId = payload.body.id;

      await queryClient.cancelQueries({
        queryKey: getApiBoardsOptions().queryKey,
      });

      const previousBoardData = queryClient.getQueryData(
        getApiBoardsOptions().queryKey,
      );

      queryClient.setQueryData(getApiBoardsOptions().queryKey, (oldData) =>
        oldData?.filter((board) => board.id !== deletedBoardId),
      );

      return { previousBoardData };
    },
    onSuccess: async () => {
      const boards = await queryClient.fetchQuery({
        ...getApiBoardsOptions(),
        staleTime: 0,
      });
      setCurrentBoardId(boards?.at(0)?.id ?? 0);
      setOpen(false);
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData(
        getApiBoardsOptions().queryKey,
        context?.previousBoardData,
      );
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" intent="destructive" type="button">
          Delete board
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} showCloseButton={false}>
        <DialogTitle variant="destructive">Remove current board</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete the current board? This action will
          remove all columns and tasks and cannot be reversed.
        </DialogDescription>
        <div className={styles["button-group"]}>
          <Button onClick={handleDelete} intent="destructive">
            Delete
          </Button>
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
