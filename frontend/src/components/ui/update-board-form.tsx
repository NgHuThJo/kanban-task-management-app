import { useState, type ChangeEvent, type FormEvent } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Cross } from "#frontend/components/ui/icon";
import {
  getApiBoardsOptions,
  putApiBoardsMutation,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { zUpdateBoardRequest } from "#frontend/types/generated/zod.gen";
import { formDataToObject } from "#frontend/utils/object";
import type { CreateBoardRequest } from "#frontend/types/generated";
import { makeZodErrorsUserFriendly } from "#frontend/utils/zod";
import type { Column } from "#frontend/types/custom/custom";
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

export function UpdateBoardForm() {
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

  const handleUpdateBoard = (event: FormEvent<HTMLFormElement>) => {
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
    <Form onSubmit={handleUpdateBoard}>
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
