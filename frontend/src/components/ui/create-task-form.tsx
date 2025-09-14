import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Cross } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
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
import { Textarea } from "#frontend/components/primitives/textarea";
import { CreateBoardColumnDialog } from "#frontend/components/ui/create-board-column-dialog";
import { useCurrentBoardId } from "#frontend/store/board";
import type { Column } from "#frontend/types/custom/custom";
import type { CreateKanbanTaskRequest } from "#frontend/types/generated";
import {
  getApiBoardsOptions,
  getApiKanbantasksOptions,
  postApiKanbantasksMutation,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { zCreateKanbanTaskRequest } from "#frontend/types/generated/zod.gen";
import { formDataToObject } from "#frontend/utils/object";
import { makeZodErrorsUserFriendly } from "#frontend/utils/zod";

type CreateTaskFormProps = {
  dialogState: {
    changeDialogOpenState: (isOpen: boolean) => void;
  };
};

export function CreateTaskForm({
  dialogState: { changeDialogOpenState },
}: CreateTaskFormProps) {
  const queryClient = useQueryClient();
  const { isPending, mutate } = useMutation({
    ...postApiKanbantasksMutation(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: getApiKanbantasksOptions({
          query: {
            BoardColumnId: data.boardColumnId,
          },
        }).queryKey,
      });
      changeDialogOpenState(false);
    },
    onError: (error) => {
      setErrors((prev) => ({
        ...prev,
        server: error.detail,
      }));
    },
  });
  const { data } = useSuspenseQuery(getApiBoardsOptions());
  const currentBoardId = useCurrentBoardId();
  const [errors, setErrors] = useState<{
    client: ReturnType<
      typeof makeZodErrorsUserFriendly<CreateKanbanTaskRequest>
    > | null;
    server: string | null | undefined;
  }>({
    client: null,
    server: null,
  });
  const [columns, setColumns] = useState<Column[]>([]);

  if (isPending) {
    return <p>Loading...</p>;
  }

  const currentBoard = data.filter(({ id }) => id === currentBoardId);
  const boardColumnNames =
    currentBoard.at(-1)?.boardColumns?.map((column) => column.name) ?? [];

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

  const handleChangeSelectValue = (value: string) => {
    if (value === "add-new-column") {
      return;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const convertedFormData = formDataToObject(formData);
    const title = convertedFormData["task-name"];
    const description = convertedFormData["description"];
    const subtasks = convertedFormData["subtask-column"];
    const status = convertedFormData["status"];

    const payload = {
      title,
      description,
      boardColumnId: currentBoard
        .at(-1)
        ?.boardColumns?.find((value) => value.name === status)?.id,
      subtasks: Array.isArray(subtasks)
        ? subtasks.map((value) => ({
            description: value,
          }))
        : subtasks !== undefined
          ? Array({ description: subtasks })
          : undefined,
    };

    const validatedResult = zCreateKanbanTaskRequest.safeParse(payload);

    if (!validatedResult.success) {
      const formattedErrors = makeZodErrorsUserFriendly(validatedResult.error);

      setErrors((prev) => ({
        ...prev,
        client: formattedErrors,
      }));
    } else {
      mutate({
        body: validatedResult.data,
      });
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      onClearServerErrors={() => {
        setErrors(() => ({
          client: null,
          server: null,
        }));
      }}
    >
      <FormField name="task-name">
        <FormLabel>Title</FormLabel>
        <FormControl required placeholder="e.g. Take coffee break" />
        <FormMessage match="valueMissing">
          Please enter a valid task title
        </FormMessage>
        {errors.client && <FormMessage>{errors.client.title}</FormMessage>}
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
        {errors.client && (
          <FormMessage>{errors.client.description}</FormMessage>
        )}
      </FormField>
      <Label>Subtasks</Label>
      {columns.map(({ id, name }) => (
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
                handleDeleteColumn(id);
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
      <FormField
        name="status"
        serverInvalid={typeof errors.server === "string"}
      >
        <FormLabel>Status</FormLabel>
        <FormControl asChild>
          <Select
            onValueChange={handleChangeSelectValue}
            defaultValue={boardColumnNames?.[0] ?? ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an item..." />
            </SelectTrigger>
            <SelectContent sideOffset={8}>
              {boardColumnNames.map((columnName) => (
                <SelectItem value={columnName} key={columnName}>
                  {columnName}
                </SelectItem>
              ))}
              <CreateBoardColumnDialog
                trigger={
                  <Button variant="select" size="select">
                    + Add New Column
                  </Button>
                }
              />
            </SelectContent>
          </Select>
        </FormControl>
        {errors.server && <FormMessage>{errors.server}</FormMessage>}
      </FormField>
      <FormSubmit asChild>
        <Button variant="default" size="sm" type="submit">
          Create New Task
        </Button>
      </FormSubmit>
    </Form>
  );
}
