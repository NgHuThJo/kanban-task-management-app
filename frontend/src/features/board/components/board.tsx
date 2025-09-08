import {
  getApiBoardsOptions,
  getApiKanbantasksOptions,
  putApiKanbantasksColumnMutation,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import {
  useMutation,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useCurrentBoardId } from "#frontend/store/board";
import { type GetKanbanTasksResponse } from "#frontend/types/generated";
import { ScrollArea } from "#frontend/components/primitives/scroll-area";
import styles from "./board.module.css";
import { CreateBoardColumnDialog } from "#frontend/components/ui/create-board-column-dialog";
import { KanbanTaskDialog } from "#frontend/components/ui/task-dialog";
import { Button } from "#frontend/components/primitives/button";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { zChangeBoardColumnRequest } from "#frontend/types/generated/zod.gen";
import { makeZodErrorsUserFriendly } from "#frontend/utils/zod";

export function Board() {
  const [draggedTask, setDraggedTask] = useState<{
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [taskPosition, setTaskPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const taskRef = useRef<HTMLElement>(null);
  const isDraggingRef = useRef(false);
  const currentBoardId = useCurrentBoardId();
  const { data: boards } = useSuspenseQuery(getApiBoardsOptions());
  const { mutate } = useMutation({
    ...putApiKanbantasksColumnMutation,
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
    let frameId: number | null = null;

    if (!boardElement) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      isDraggingRef.current = false;
      const target = event.target as HTMLElement;
      const nearestTask = target.closest(
        "[data-task-id]",
      ) as HTMLElement | null;

      if (!nearestTask) {
        return;
      }

      taskRef.current = nearestTask;
      nearestTask.setPointerCapture(event.pointerId);

      const taskRect = nearestTask.getBoundingClientRect();
      setDraggedTask({
        id: Number(nearestTask.dataset.taskId),
        x: event.clientX - taskRect.x,
        y: event.clientY - taskRect.y,
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

      const elementAtPointerPosition = document.elementFromPoint(
        event.clientX,
        event.clientY,
      );

      console.log(elementAtPointerPosition);

      const currentColumnId = (
        (event.target as HTMLElement).closest(
          "[data-column-id]",
        ) as HTMLElement | null
      )?.dataset.columnId;
      const dropTarget = (elementAtPointerPosition as HTMLElement).closest(
        "[data-column-id]",
      ) as HTMLElement | null;

      console.log(dropTarget);

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
          mutate(validationResult.data);
        }

        return;
      }

      setDraggedTask(null);
      setTaskPosition(null);

      // const originPointerPositionX = pointerOffsetRef.current.clientX;
      // const originPointerPositionY = pointerOffsetRef.current.clientY;

      // const dx = event.clientX - originPointerPositionX;
      // const dy = event.clientY - originPointerPositionY;

      // if (Math.hypot(dx, dy) >= threshold) {
      //   isDraggingRef.current = true;
      // }

      // taskRef.current.style.translate = "";
      // taskRef.current.style.width = "";
      // taskRef.current.style.zIndex = "";
      // taskRef.current = null;
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
  }, []);

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
    {} as {
      [key: string]: GetKanbanTasksResponse[];
    },
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
                <>
                  <KanbanTaskDialog
                    task={task}
                    key={task.id}
                    isDragging={isDraggingRef}
                  />
                  {draggedTask &&
                    taskPosition &&
                    draggedTask.id === task.id &&
                    createPortal(
                      <div className={styles.overlay}>
                        <div
                          style={{
                            transform: `translate(${taskPosition.x - draggedTask.x}px, ${taskPosition.y - draggedTask.y}px)`,
                            width: `${draggedTask.width}px`,
                            height: `${draggedTask.height}px`,
                          }}
                        >
                          <KanbanTaskDialog
                            task={task}
                            key={task.id}
                            isDragging={isDraggingRef}
                          />
                        </div>
                      </div>,
                      document.body,
                    )}
                </>
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
