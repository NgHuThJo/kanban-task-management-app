import {
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type FormEvent,
  type MouseEvent,
} from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "#frontend/components/button/button";
import { Dialog } from "#frontend/components/dialog/dialog";
import { ErrorMessage } from "#frontend/components/error/error";
import { Cross } from "#frontend/components/icon/icon";
import { Input } from "#frontend/components/input/input";
import { Label } from "#frontend/components/label/label";
import {
  getApiBoardsOptions,
  putApiBoardsMutation,
} from "#frontend/types/@tanstack/react-query.gen";
import { zUpdateBoardRequest } from "#frontend/types/zod.gen";
import { formDataToObject } from "#frontend/utils/object";
import type { CreateBoardRequest } from "#frontend/types";
import { makeZodErrorsUserFriendly } from "#frontend/utils/zod";
import type { Column } from "#frontend/types/custom/custom";
import styles from "./change-board.module.css";

type ChangeBoardProps = ComponentPropsWithRef<"dialog"> & {
  closeDialog: (event: MouseEvent<HTMLDialogElement>) => void;
};

export function ChangeBoard({ closeDialog, ref }: ChangeBoardProps) {
  const [validationErrors, setValidationErrors] = useState<ReturnType<
    typeof makeZodErrorsUserFriendly<CreateBoardRequest>
  > | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    ...putApiBoardsMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getApiBoardsOptions().queryKey,
      });
    },
  });

  if (isPending) {
    return <p>Sending request...</p>;
  }

  const handleAddColumn = () => {
    setColumns((prev) => [...prev, { id: crypto.randomUUID(), name: "" }]);
  };

  const handleDeleteColumn = (columnId: string, index: number) => {
    setColumns((prev) => prev.filter(({ id }) => id != columnId));
    setValidationErrors((prev) => {
      const copy = prev;

      copy?.boardColumns.splice(index, 1);

      return copy;
    });
  };

  const handleChangeColumnName = (
    event: ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    const newName = event.currentTarget.value;

    setColumns((prev) =>
      prev.map((value) =>
        value.id == id ? { ...value, name: newName } : value,
      ),
    );
  };

  const handleEditBoard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const convertedFormData = formDataToObject(formData);
    const boardName = convertedFormData["board-name"];
    const boardColumns = convertedFormData["board-column"];

    const payload = {
      name: boardName,
      boardColumns: Array.isArray(boardColumns)
        ? boardColumns.map((value) => ({
            name: value,
          }))
        : boardColumns !== undefined
          ? Array({ name: boardColumns })
          : [],
    };

    const validatedResult = zUpdateBoardRequest.safeParse(payload);

    if (!validatedResult.success) {
      const formattedErrors = makeZodErrorsUserFriendly(validatedResult.error);

      setValidationErrors(formattedErrors);
    } else {
      mutate({
        body: validatedResult.data,
      });
    }
  };

  return (
    <Dialog className="post-dialog" ref={ref} onClick={closeDialog}>
      <form
        action=""
        method="put"
        className={styles.form}
        onSubmit={handleEditBoard}
      >
        <h1>Edit board</h1>
        <Label htmlFor="board-name">Board Name</Label>
        <Input
          className="dialog"
          type="text"
          name="board-name"
          id="board-name"
          placeholder="e.g Web Design"
        />
        {validationErrors?.name?.[0] && (
          <ErrorMessage error={validationErrors.name[0]} />
        )}
        <fieldset>
          <legend>Board Columns</legend>
          {columns.map(({ id, name }, index) => (
            <div key={id}>
              <Input
                className="dialog"
                type="text"
                name="board-column"
                value={name}
                onChange={(event) => {
                  handleChangeColumnName(event, id);
                }}
              />
              <Button
                className="icon"
                type="button"
                onClick={() => {
                  handleDeleteColumn(id, index);
                }}
              >
                <Cross />
              </Button>
              {validationErrors?.boardColumns?.[index] && (
                <ErrorMessage error={validationErrors.boardColumns[index]} />
              )}
            </div>
          ))}
        </fieldset>
        <Button className="add-task" type="button" onClick={handleAddColumn}>
          + Add New Column
        </Button>
        <Button className="add-task" type="submit">
          Save Changes
        </Button>
      </form>
    </Dialog>
  );
}
