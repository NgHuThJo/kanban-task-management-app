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
  Label,
} from "#frontend/components/primitives/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "#frontend/components/primitives/select";
import { Cross } from "lucide-react";
import { Textarea } from "#frontend/components/primitives/textarea";

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
  const boardColumnNames =
    currentBoard.at(-1)?.boardColumns?.map((column) => column.name) ?? [];

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
      <FormField name="task-name">
        <FormLabel>Title</FormLabel>
        <FormControl required placeholder="e.g. Take coffee break" />
        <FormMessage match="valueMissing">
          Please enter a valid task title
        </FormMessage>
      </FormField>
      <FormField name="description">
        <FormLabel>Description</FormLabel>
        <FormControl asChild>
          <Textarea
            required
            placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
          />
        </FormControl>
        <FormMessage match="valueMissing">
          Please enter a description
        </FormMessage>
      </FormField>
      <Label>Subtasks</Label>
      {columns.map(({ id, name }, index) => (
        <div key={id}>
          <FormField variant="group" name="subtask-column">
            <FormControl
              value={name}
              placeholder="e.g. Make coffee"
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
      <FormField name="status">
        <FormLabel>Status</FormLabel>
        <FormControl asChild>
          <Select defaultValue={boardColumnNames?.[0] ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an item..." />
            </SelectTrigger>
            <SelectContent sideOffset={8}>
              {boardColumnNames.map((columnName) => (
                <SelectItem value={columnName}>{columnName}</SelectItem>
              ))}
              <SelectItem value="add-new-column">Add New Column</SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
      </FormField>
      <FormSubmit asChild>
        <Button variant="default" size="sm" type="submit">
          Create New Task
        </Button>
      </FormSubmit>
    </Form>
  );
}
