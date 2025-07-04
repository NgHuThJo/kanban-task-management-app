import type { ComponentPropsWithRef, MouseEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentBoardId } from "#frontend/store/board";
import { Dialog } from "#frontend/components/dialog/dialog";
import {
  deleteApiBoardsMutation,
  getApiBoardsOptions,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { zDeleteBoardRequest } from "#frontend/types/generated/zod.gen";
import styles from "./delete-board.module.css";

type DeleteBoardProps = ComponentPropsWithRef<"dialog"> & {
  closeDialog: (
    event: MouseEvent<HTMLDialogElement & HTMLButtonElement>,
  ) => void;
};

export function DeleteBoard({ closeDialog, ref }: DeleteBoardProps) {
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
    <Dialog className={`delete-dialog`} ref={ref} onClick={closeDialog}>
      <h1 className={styles.heading}>Delete this board?</h1>
      <p className={styles.text}>
        Are you sure you want to delete the "Platform Launch" board? This action
        will remove all columns and tasks and cannot be reversed.
      </p>
      <div className={styles.buttons}>
        <button
          className={styles["delete-button"]}
          type="button"
          onClick={handleDelete}
        >
          Delete
        </button>
        <button
          className={styles["cancel-button"]}
          type="button"
          onClick={closeDialog}
        >
          Cancel
        </button>
      </div>
    </Dialog>
  );
}
