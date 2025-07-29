import {
  getApiBoardsOptions,
  getApiKanbantasksOptions,
} from "#frontend/types/generated/@tanstack/react-query.gen";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCurrentBoardId } from "#frontend/store/board";
import type { GetKanbanTasksResponse } from "#frontend/types/generated";
import { Button } from "#frontend/components/primitives/button";
import { ScrollArea } from "#frontend/components/primitives/scroll-area";
import styles from "./board.module.css";

export function Board() {
  const currentBoardId = useCurrentBoardId();
  const { data: boards } = useSuspenseQuery(getApiBoardsOptions());
  const { data: kanbanTasks } = useSuspenseQuery(
    getApiKanbantasksOptions({
      query: {
        BoardColumnId: currentBoardId,
      },
    }),
  );

  const currentBoard = boards
    .filter((board) => currentBoardId === board.id)
    .at(-1);

  const columnTaskDict = currentBoard?.boardColumns?.reduce(
    (prev, curr) => {
      return {
        ...prev,
        [curr.name]: kanbanTasks.filter((task) => task.boardColumnId),
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
          <div className={styles.card}>
            <h2>{column.name}</h2>
            <ul>
              {columnTaskDict?.[column.name]?.map((task) => (
                <li>
                  <h3>{task.title}</h3>
                  <div></div>
                  <p>
                    {
                      task.subTasks?.filter((subtask) => subtask.isCompleted)
                        .length
                    }
                    of {task.subTasks?.length}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Button variant="ghost" size="lg">
          +New Column
        </Button>
      </div>
    </ScrollArea>
  ) : null;
}
