import {
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type FormEvent,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "#frontend/components/button/button";
import { ErrorMessage } from "#frontend/components/error/error";
import { Cross } from "#frontend/components/icon/icon";
import { Label } from "#frontend/components/label/label";
import { Input } from "#frontend/components/input/input";
import { client } from "#frontend/types";
import { formDataToObject } from "#frontend/utils/object";

type Column = {
  id: string;
  name: string;
};

type DialogProps = ComponentPropsWithRef<"dialog"> & {
  closeDialog: () => void;
};

export function CreateBoardDialog({ ref, closeDialog }: DialogProps) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [columns, setColumns] = useState<Column[]>([]);
  const queryClient = useQueryClient();
  const { isPending, isSuccess, error, mutate } = useMutation({
    mutationFn: async (formData: FormData) => {
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

      // client.postApiBoards(validatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  const handleAddColumn = () => {
    setColumns((prev) => [...prev, { id: crypto.randomUUID(), name: "" }]);
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumns((prev) => prev.filter(({ id }) => id != columnId));
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

    mutate(formData);
  };

  return (
    <dialog ref={ref}>
      <form method="put" onSubmit={handleCreateBoard}>
        <h1>Add new board</h1>
        <Label htmlFor="board-name">Board Name</Label>
        <Input
          type="text"
          name="board-name"
          id="board-name"
          placeholder="e.g Web Design"
        />
        <fieldset>
          <legend>Board Columns</legend>
          {columns.map(({ id, name }) => (
            <li key={id}>
              <Input
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
                  handleDeleteColumn(id);
                }}
              >
                <Cross />
              </Button>
            </li>
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
