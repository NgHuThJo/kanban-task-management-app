import {
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type FormEvent,
  type MouseEvent,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "#frontend/components/button/button";
import { ErrorMessage } from "#frontend/components/error/error";
import { Cross } from "#frontend/components/icon/icon";
import { Label } from "#frontend/components/label/label";
import { Input } from "#frontend/components/input/input";
import { postApiBoardsMutation } from "#frontend/types/@tanstack/react-query.gen";
import { zCreateBoardRequest } from "#frontend/types/zod.gen";
import { formDataToObject } from "#frontend/utils/object";
import { makeZodErrorsUserFriendly } from "#frontend/utils/zod";
import type { CreateBoardRequest } from "#frontend/types";
import styles from "./create-board.module.css";

type Column = {
  id: string;
  name: string;
};

type DialogProps = ComponentPropsWithRef<"dialog"> & {
  closeDialog: (event: MouseEvent<HTMLDialogElement>) => void;
};

export function CreateBoardDialog({ ref, closeDialog }: DialogProps) {
  const [validationErrors, setValidationErrors] = useState<ReturnType<
    typeof makeZodErrorsUserFriendly<CreateBoardRequest>
  > | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    ...postApiBoardsMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
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

  const handleCreateBoard = (event: FormEvent<HTMLFormElement>) => {
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

    const validatedResult = zCreateBoardRequest.safeParse(payload);

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
    <dialog className={styles.dialog} ref={ref} onClick={closeDialog}>
      <form className={styles.form} method="put" onSubmit={handleCreateBoard}>
        <h1>Add new board</h1>
        <Label htmlFor="board-name">Board Name</Label>
        <Input
          className="dialog"
          type="text"
          name="board-name"
          id="board-name"
          placeholder="e.g Web Design"
        />
        {validationErrors?.name[0] && (
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
        <Button type="button" onClick={handleAddColumn}>
          + Add New Column
        </Button>
        <Button type="submit">Create New Board</Button>
      </form>
    </dialog>
  );
}
