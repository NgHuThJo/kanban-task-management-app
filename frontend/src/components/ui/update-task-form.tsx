import type { UpdateColumn } from "#frontend/types/custom/custom";
import type {
  CreateKanbanTaskRequest,
  GetKanbanTasksResponse,
} from "#frontend/types/generated";
import { makeZodErrorsUserFriendly } from "#frontend/utils/zod";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  getApiBoardsOptions,
  getApiKanbantasksOptions,
  putApiKanbantasksMutation,
} from "#frontend/types/generated/@tanstack/react-query.gen";
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
import { CreateBoardColumnDialog } from "#frontend/components/ui/create-board-column-dialog";
import { formDataToObject } from "#frontend/utils/object";
import { zUpdateKanbanTaskRequest } from "#frontend/types/generated/zod.gen";

type UpdateKanbantaskFormProps = {
  task: GetKanbanTasksResponse;
};

export function UpdateKanbanTaskForm({ task }: UpdateKanbantaskFormProps) {
  const queryClient = useQueryClient();
  const { isPending, mutate } = useMutation({
    ...putApiKanbantasksMutation(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: getApiKanbantasksOptions({
          query: {
            BoardColumnId: data.boardColumnId,
          },
        }).queryKey,
      });
    },
  });
  const { data } = useSuspenseQuery(getApiBoardsOptions());
  const currentBoardId = useCurrentBoardId();
  const [validationErrors, setValidationErrors] = useState<ReturnType<
    typeof makeZodErrorsUserFriendly<CreateKanbanTaskRequest>
  > | null>(null);
  const [columns, setColumns] = useState<UpdateColumn[]>(() => {
    const data =
      task.subTasks?.map(({ id, description }) => ({
        id: crypto.randomUUID(),
        realId: id,
        name: description,
      })) ?? [];

    return data;
  });

  if (isPending) {
    return <p>Loading...</p>;
  }

  const currentBoard = data.filter(({ id }) => id === currentBoardId);
  const currentBoardColumn = currentBoard?.[0]?.boardColumns.find(
    (column) => column.id === task.boardColumnId,
  );
  const boardColumnNames = currentBoard.at(-1)?.boardColumns ?? [];

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

    const subtasks = columns.map(({ realId, name }) => ({
      id: realId,
      description: name,
    }));

    const status = convertedFormData["status"];

    const payload = {
      title,
      description,
      id: task.id,
      boardColumnId: Number(status),
      subtasks,
    };

    const validatedResult = zUpdateKanbanTaskRequest.safeParse(payload);

    if (!validatedResult.success) {
      const formattedErrors = makeZodErrorsUserFriendly(validatedResult.error);
      console.log("Form errors", formattedErrors);
    } else {
      mutate({
        body: validatedResult.data,
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormField name="task-name">
        <FormLabel>Title</FormLabel>
        <FormControl
          required
          placeholder="e.g. Take coffee break"
          defaultValue={task.title}
        />
        <FormMessage match="valueMissing">
          Please enter a valid task title
        </FormMessage>
      </FormField>
      <FormField name="description" defaultValue={task.description}>
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
              value={`${name}`}
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
          <Select
            onValueChange={handleChangeSelectValue}
            defaultValue={currentBoardColumn?.id.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an item..." />
            </SelectTrigger>
            <SelectContent sideOffset={8}>
              {boardColumnNames.map(({ id, name }) => (
                <SelectItem value={id.toString()}>{name}</SelectItem>
              ))}
              <CreateBoardColumnDialog
                trigger={
                  <Button variant="select" size="select">
                    "+ Add New Column"
                  </Button>
                }
              />
            </SelectContent>
          </Select>
        </FormControl>
      </FormField>
      <FormSubmit asChild>
        <Button variant="default" size="sm" type="submit">
          Edit Task
        </Button>
      </FormSubmit>
    </Form>
  );
}
