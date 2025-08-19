import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  useQueryClient,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Cross } from "#frontend/components/ui/icon";
import {
  getApiBoardsOptions,
  putApiBoardsMutation,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { zUpdateBoardRequest } from "#frontend/types/generated/zod.gen";
import { formDataToObject } from "#frontend/utils/object";
import type { CreateBoardRequest } from "#frontend/types/generated";
import { makeZodErrorsUserFriendly } from "#frontend/utils/zod";
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
import { useCurrentBoardId } from "#frontend/store/board";

export function UpdateBoardForm() {
  const currentBoardId = useCurrentBoardId();
  const [validationErrors, setValidationErrors] = useState<ReturnType<
    typeof makeZodErrorsUserFriendly<CreateBoardRequest>
  > | null>(null);
  const { data: boardData } = useSuspenseQuery(getApiBoardsOptions());

  const currentBoard = boardData.filter(
    (board) => board.id == currentBoardId,
  )?.[0];

  const [columns, setColumns] = useState(() => {
    const currentBoardColumns =
      currentBoard?.boardColumns?.map(({ id, name }) => ({
        id: crypto.randomUUID(),
        realId: id,
        name,
      })) ?? [];

    return currentBoardColumns;
  });
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
    setColumns((prev) => [
      ...prev,
      { id: crypto.randomUUID(), realId: 0, name: "" },
    ]);
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

    const payload = {
      id: currentBoardId,
      name: boardName,
      boardColumns: columns.map(({ realId, name }) => ({
        id: realId,
        name,
      })),
    };

    const validatedResult = zUpdateBoardRequest.safeParse(payload);

    if (!validatedResult.success) {
      const formattedErrors = makeZodErrorsUserFriendly(validatedResult.error);
      setValidationErrors(formattedErrors);

      return;
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
        <FormControl defaultValue={currentBoard?.name} required />
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
          Update Board
        </Button>
      </FormSubmit>
    </Form>
  );
}
