import { Button } from "#frontend/components/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#frontend/components/primitives/dialog";
import { Cross } from "#frontend/components/ui/icon";
import {
  Card,
  CardTitle,
  CardContent,
} from "#frontend/components/primitives/card";
import { Progress } from "#frontend/components/primitives/progress";
import { type GetKanbanTasksResponse } from "#frontend/types/generated";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  Label,
} from "#frontend/components/primitives/form";
import { CreateBoardColumnDialog } from "#frontend/components/ui/create-board-column-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "#frontend/components/primitives/select";
import {
  getApiBoardsOptions,
  getApiKanbantasksOptions,
  postApiSubtasksMutation,
  putApiKanbantasksStatusMutation,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useCurrentBoardId } from "#frontend/store/board";
import { SelectItem } from "#frontend/components/primitives/select";
import { EditKanbanTaskPopover } from "#frontend/components/ui/edit-task-popover";

type KanbantaskDialogProps = {
  task: GetKanbanTasksResponse;
};

export function KanbanTaskDialog({ task }: KanbantaskDialogProps) {
  const queryClient = useQueryClient();
  const { mutate: toggleSubtask } = useMutation({
    ...postApiSubtasksMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getApiKanbantasksOptions({
          query: {
            BoardColumnId: task.boardColumnId,
          },
        }).queryKey,
      });
    },
  });
  const { mutate: changeStatus } = useMutation({
    ...putApiKanbantasksStatusMutation(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: getApiKanbantasksOptions({
          query: {
            BoardColumnId: data.boardColumnId,
          },
        }).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: getApiKanbantasksOptions({
          query: {
            BoardColumnId: task.boardColumnId,
          },
        }).queryKey,
      });
    },
  });
  const currentBoardId = useCurrentBoardId();
  const { data: boardData } = useSuspenseQuery({
    ...getApiBoardsOptions(),
    select: (data) => ({
      boardColumnNames: data
        .filter((board) => board.id === currentBoardId)
        .flatMap((board) =>
          board.boardColumns.map((column) => ({
            name: column.name,
            id: column.id,
          })),
        ),
    }),
  });

  const completedSubtasks =
    task?.subTasks?.filter((subTask) => subTask.isCompleted).length ?? 0;
  const subTaskLength = task.subTasks?.length ?? 0;

  const handleToggleCheckbox = (id: number) => {
    const payload = {
      id,
    };

    toggleSubtask({
      body: payload,
    });
  };

  const handleStatusSelect = (boardColumnId: number) => {
    const payload = {
      id: task.id,
      boardColumnId,
    };

    changeStatus({
      body: payload,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card>
          <CardTitle>{task.title}</CardTitle>
          <CardContent>
            <Progress
              value={
                ((task.subTasks?.filter((subtask) => subtask.isCompleted)
                  .length ?? 0) /
                  (task.subTasks?.length ?? 1)) *
                100
              }
            />
            <p>
              {`${
                task.subTasks?.filter((subtask) => subtask.isCompleted).length
              }
                    of ${task.subTasks?.length}`}
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent
        aria-describedby="Create new board"
        showCloseButton={false}
      >
        <DialogHeader variant="row">
          <DialogTitle>{task.title}</DialogTitle>
          <div>
            <EditKanbanTaskPopover task={task} />
            <DialogClose variant="group" asChild>
              <Button variant="ghost" size="icon">
                <Cross />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <DialogDescription>{task.description}</DialogDescription>
        <Form>
          <Label>{`Subtasks (${completedSubtasks} of ${subTaskLength})`}</Label>
          {task.subTasks?.map((subTask) => (
            <FormField variant="checkbox" name="subtask" key={subTask.id}>
              <FormControl
                type="checkbox"
                value={subTask.description}
                onChange={() => handleToggleCheckbox(subTask.id)}
                checked={subTask.isCompleted}
              />
              <FormLabel>{subTask.description}</FormLabel>
            </FormField>
          ))}
          <FormField name="status">
            <FormLabel>Status</FormLabel>
            <FormControl asChild>
              <Select
                defaultValue={boardData.boardColumnNames
                  ?.filter(({ id }) => id == task.boardColumnId)?.[0]
                  ?.id.toString()}
                onValueChange={(value) => handleStatusSelect(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an item..." />
                </SelectTrigger>
                <SelectContent sideOffset={8}>
                  {boardData.boardColumnNames.map((columnName) => (
                    <SelectItem value={columnName.id.toString()}>
                      {columnName.name}
                    </SelectItem>
                  ))}
                  <CreateBoardColumnDialog triggerButtonText="+ Add New Column" />
                </SelectContent>
              </Select>
            </FormControl>
          </FormField>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
