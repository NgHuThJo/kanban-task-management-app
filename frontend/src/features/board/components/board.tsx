import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./board.module.css";
import { Button } from "#frontend/components/primitives/button";
import { ScrollArea } from "#frontend/components/primitives/scroll-area";
import { CreateBoardColumnDialog } from "#frontend/components/ui/create-board-column-dialog";
import { KanbanTaskDialog } from "#frontend/components/ui/task-dialog";
import { useCurrentBoardId } from "#frontend/store/board";
import { type GetKanbanTasksResponse } from "#frontend/types/generated";
import {
  getApiBoardsOptions,
  getApiKanbantasksOptions,
  putApiKanbantasksColumnMutation,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { zChangeBoardColumnRequest } from "#frontend/types/generated/zod.gen";
import { makeZodErrorsUserFriendly } from "#frontend/utils/zod";

export function Board() {
  const queryClient = useQueryClient();
  const [draggedTask, setDraggedTask] = useState<{
    id: number;
    offsetX: number;
    offsetY: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
  } | null>(null);
  const [taskPosition, setTaskPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const taskRef = useRef<HTMLElement>(null);
  const currentBoardId = useCurrentBoardId();
  const { data: boards } = useSuspenseQuery(getApiBoardsOptions());
  const { mutate } = useMutation({
    ...putApiKanbantasksColumnMutation(),
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getApiKanbantasksOptions({
            query: {
              BoardColumnId: data.sourceBoardColumnId,
            },
          }).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: getApiKanbantasksOptions({
            query: {
              BoardColumnId: data.destinationBoardColumnId,
            },
          }).queryKey,
        }),
      ]);
    },
  });

  const currentBoard = boards
    .filter((board) => currentBoardId === board.id)
    .at(-1);
  const boardColumns = currentBoard?.boardColumns ?? [];

  const kanbanTasks = useSuspenseQueries({
    queries: boardColumns.map((column) =>
      getApiKanbantasksOptions({
        query: {
          BoardColumnId: column.id,
        },
      }),
    ),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
      };
    },
  });

  useEffect(() => {
    const boardElement = boardRef.current;
    const threshold = 20;
    let frameId: number | null = null;

    if (!boardElement) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      setIsDragging(false);
      const target = event.target as HTMLElement;
      const nearestTask = target.closest(
        "[data-task-id]",
      ) as HTMLElement | null;

      if (!nearestTask) {
        return;
      }

      taskRef.current = nearestTask;
      nearestTask.setPointerCapture(event.pointerId);

      if (typeof styles.hidden !== "string") {
        console.error("Hidden class does not exist");
      } else {
        nearestTask.classList.add(styles.hidden);
      }

      const taskRect = nearestTask.getBoundingClientRect();
      setDraggedTask({
        id: Number(nearestTask.dataset.taskId),
        offsetX: event.clientX - taskRect.x,
        offsetY: event.clientY - taskRect.y,
        originX: event.clientX,
        originY: event.clientY,
        width: taskRect.width,
        height: taskRect.height,
      });
      setTaskPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      const currentTask = taskRef.current;

      if (!currentTask) {
        return;
      }

      if (frameId === null) {
        frameId = requestAnimationFrame(() => {
          const currentTask = taskRef.current;

          if (!currentTask) {
            return;
          }

          setTaskPosition({
            x: event.clientX,
            y: event.clientY,
          });

          frameId = null;
        });
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }

      if (!taskRef.current) {
        return;
      }

      const x = draggedTask?.originX ?? 0;
      const y = draggedTask?.originY ?? 0;
      const dx = event.clientX - x;
      const dy = event.clientY - y;

      if (Math.hypot(dx, dy) >= threshold) {
        setIsDragging(true);
      }

      const elementAtPointerPosition = document.elementFromPoint(
        event.clientX,
        event.clientY,
      );

      const currentColumnId = (
        (event.target as HTMLElement).closest(
          "[data-column-id]",
        ) as HTMLElement | null
      )?.dataset.columnId;
      const dropTarget = (elementAtPointerPosition as HTMLElement).closest(
        "[data-column-id]",
      ) as HTMLElement | null;

      if (dropTarget && currentColumnId !== dropTarget.dataset.columnId) {
        const boardColumnId =
          typeof Number(dropTarget.dataset.columnId) === "number"
            ? Number(dropTarget.dataset.columnId)
            : (function () {
                throw new Error(
                  `${dropTarget.dataset.columnId} is not a number`,
                );
              })();

        const payload = {
          id: Number(taskRef.current.dataset.taskId),
          boardColumnId,
        };

        const validationResult = zChangeBoardColumnRequest.safeParse(payload);

        if (!validationResult.success) {
          const formattedErrors = makeZodErrorsUserFriendly(
            validationResult.error,
          );
          console.error("Payload errors", formattedErrors);
        } else {
          mutate({
            body: validationResult.data,
          });
        }
      }

      if (typeof styles.hidden !== "string") {
        console.error("Hidden class does not exist");
      } else {
        taskRef.current.classList.remove(styles.hidden);
      }
      setDraggedTask(null);
      setTaskPosition(null);
    };

    // disable native browser drag and drop
    const onDragStart = (event: DragEvent) => {
      event.preventDefault();
    };

    document.addEventListener("dragstart", onDragStart);
    boardElement.addEventListener("pointerdown", handlePointerDown);
    boardElement.addEventListener("pointermove", handlePointerMove);
    boardElement.addEventListener("pointerup", handlePointerUp);

    return () => {
      boardElement.removeEventListener("pointerdown", handlePointerDown);
      boardElement.removeEventListener("pointermove", handlePointerMove);
      boardElement.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, [draggedTask, mutate]);

  if (!currentBoardId) {
    return (
      <div className={styles["no-board"]}>
        <p>No board. Please create a new board.</p>
      </div>
    );
  }

  const columnTaskDict = boardColumns.reduce(
    (prev, curr) => {
      return {
        ...prev,
        [curr.name]: kanbanTasks.data
          .filter((taskList) =>
            taskList.every((task) => task.boardColumnId == curr.id),
          )
          .flatMap((task) => {
            task.forEach((task) => {
              task.subTasks?.sort((a, b) => a.id - b.id);
            });

            return task;
          }),
      };
    },
    {} as Record<string, GetKanbanTasksResponse[]>,
  );

  return currentBoard ? (
    <ScrollArea ref={boardRef}>
      <div className={styles.layout}>
        {currentBoard.boardColumns?.map((column) => (
          <div className={styles.container} key={column.id}>
            <h2>{`${column.name} (${columnTaskDict[column.name]?.length ?? 0})`}</h2>
            <div
              className={styles.column}
              data-column-id={column.id}
              key={column.id}
            >
              {columnTaskDict?.[column.name]?.map((task) => (
                <Fragment key={task.id}>
                  <KanbanTaskDialog
                    task={task}
                    key={task.id}
                    isDragging={isDragging}
                  />
                  {draggedTask &&
                    taskPosition &&
                    draggedTask.id === task.id &&
                    createPortal(
                      <div className={styles.overlay}>
                        <div
                          style={{
                            transform: `translate(${taskPosition.x - draggedTask.offsetX}px, ${taskPosition.y - draggedTask.offsetY}px)`,
                            width: `${draggedTask.width}px`,
                            height: `${draggedTask.height}px`,
                          }}
                        >
                          <KanbanTaskDialog
                            task={task}
                            key={task.id}
                            isDragging={isDragging}
                          />
                        </div>
                      </div>,
                      document.body,
                    )}
                </Fragment>
              ))}
            </div>
          </div>
        ))}
        <CreateBoardColumnDialog
          trigger={<Button size="board">+ Add New Column</Button>}
        />
      </div>
    </ScrollArea>
  ) : null;
}
