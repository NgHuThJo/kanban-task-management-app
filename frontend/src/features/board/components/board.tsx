import {
  getApiBoardsOptions,
  getApiKanbantasksOptions,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { useCurrentBoardId } from "#frontend/store/board";
import type { GetKanbanTasksResponse } from "#frontend/types/generated";
import { ScrollArea } from "#frontend/components/primitives/scroll-area";
import styles from "./board.module.css";

import { CreateBoardColumnDialog } from "#frontend/components/ui/create-board-column-dialog";
import { KanbanTaskDialog } from "#frontend/components/ui/task-dialog";
import { Button } from "#frontend/components/primitives/button";

export function Board() {
  const currentBoardId = useCurrentBoardId();
  const { data: boards } = useSuspenseQuery(getApiBoardsOptions());

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

  if (!currentBoardId) {
    return <p>No board.</p>;
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
    <ScrollArea>
      <div className={styles.layout}>
        {currentBoard.boardColumns?.map((column) => (
          <div className={styles.container}>
            <h2>{`${column.name} (${columnTaskDict[column.name]?.length ?? 0})`}</h2>
            <div className={styles.column} key={column.id}>
              {columnTaskDict?.[column.name]?.map((task) => (
                <KanbanTaskDialog task={task} />
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
