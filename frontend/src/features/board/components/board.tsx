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
import { useEffect, useRef } from "react";
import { zChangeBoardColumnRequest } from "#frontend/types/generated/zod.gen";
import { makeZodErrorsUserFriendly } from "#frontend/utils/zod";

export function Board() {
  const boardRef = useRef<HTMLDivElement>(null);
  const taskRef = useRef<HTMLElement>(null);
  const pointerOffsetRef = useRef<{
    clientX: number;
    clientY: number;
  }>({
    clientX: 0,
    clientY: 0,
  });
  const threshold = 10;
  const isDraggingRef = useRef(false);
  const currentBoardId = useCurrentBoardId();
  const { data: boards } = useSuspenseQuery(getApiBoardsOptions());
  const { mutate: changeBoardColumn } = useMutation({
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

      // prevSiblingRef.current =
      //   nearestTask.previousElementSibling as HTMLDivElement | null;
      const taskRect = nearestTask.getBoundingClientRect();
      pointerOffsetRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
      };
      taskRef.current = nearestTask;
      nearestTask.setPointerCapture(event.pointerId);
      nearestTask.style.zIndex = "9999";
      nearestTask.style.width = `${taskRect.width}px`;
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

          const originPointerPositionX = pointerOffsetRef.current.clientX;
          const originPointerPositionY = pointerOffsetRef.current.clientY;
          const dx = event.clientX - originPointerPositionX;
          const dy = event.clientY - originPointerPositionY;

          currentTask.style.translate = `${dx}px ${dy}px`;
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

      const dropTarget = (event.target as HTMLElement).closest(
        "[data-column-id]",
      ) as HTMLElement | null;

      if (dropTarget) {
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
          return;
        }

        return;
      }

      const originPointerPositionX = pointerOffsetRef.current.clientX;
      const originPointerPositionY = pointerOffsetRef.current.clientY;

      const dx = event.clientX - originPointerPositionX;
      const dy = event.clientY - originPointerPositionY;

      if (Math.hypot(dx, dy) >= threshold) {
        isDraggingRef.current = true;
      }

      taskRef.current.style.translate = "";
      taskRef.current.style.width = "";
      taskRef.current.style.zIndex = "";
      taskRef.current = null;
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
                <KanbanTaskDialog
                  task={task}
                  key={task.id}
                  isDragging={isDraggingRef}
                />
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
