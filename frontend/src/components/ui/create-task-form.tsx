import type { Column } from "#frontend/types/custom/custom";
import type { CreateKanbanTaskRequest } from "#frontend/types/generated";
import type { makeZodErrorsUserFriendly } from "#frontend/utils/zod";
import { useState, type ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";
import { useCurrentBoardId } from "#frontend/store/board";
import { Button } from "#frontend/components/primitives/button";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormSubmit,
} from "#frontend/components/primitives/form";
import { Label } from "@radix-ui/react-label";
import { Cross } from "lucide-react";

export function CreateTaskForm() {
  const { data, isPending, isError } = useQuery(getApiBoardsOptions());
  const currentBoardId = useCurrentBoardId();
  const [validationErrors, setValidationErrors] = useState<ReturnType<
    typeof makeZodErrorsUserFriendly<CreateKanbanTaskRequest>
  > | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return <p>Error.</p>;
  }

  const currentBoard = data.filter(({ id }) => id === currentBoardId);
  const boardColumnNames = currentBoard.map((column) => column.name);

  const handleAddColumn = () => {
    setColumns((prev) => [...prev, { id: crypto.randomUUID(), name: "" }]);
  };

  const handleDeleteColumn = (columnId: string, index: number) => {
    setColumns((prev) => prev.filter(({ id }) => id != columnId));
    setValidationErrors((prev) => {
      const copy = prev;

      copy?.subtasks.splice(index, 1);

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

  return (
    <Form>
      <FormField name="board-name">
        <FormLabel>Board Name</FormLabel>
        <FormControl required />
        <FormMessage match="valueMissing">
          Please enter a valid board name
        </FormMessage>
      </FormField>
      <Label>Columns</Label>
      {columns.map(({ id, name }, index) => (
        <div key={id}>
          <FormField variant="group" name="board-column">
            <FormControl
              value={name}
              onChange={(event) => {
                handleChangeColumnName(event, id);
              }}
              required
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => {
                handleDeleteColumn(id, index);
              }}
            >
              <Cross />
            </Button>
            <FormMessage match="valueMissing">
              Please enter a valid board column name
            </FormMessage>
          </FormField>
        </div>
      ))}
      <Button variant="link" size="sm" type="button" onClick={handleAddColumn}>
        +Add New Column
      </Button>
      <FormSubmit asChild>
        <Button variant="default" size="lg" type="submit">
          Create New Board
        </Button>
      </FormSubmit>
    </Form>
  );
}
