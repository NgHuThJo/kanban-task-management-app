import { useSuspenseQuery } from "@tanstack/react-query";
import { BoardIcon } from "#frontend/components/ui/icon";
import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";
import { ThemeSwitch } from "#frontend/features/sidebar/components/theme-switch";
import { CreateBoardDialog } from "#frontend/components/ui/create-board-dialog";
import styles from "./sidebar.module.css";
import { useBoardStore } from "#frontend/store/board";

export function Sidebar() {
  const { data: boards } = useSuspenseQuery(getApiBoardsOptions());
  const setBoardId = useBoardStore((state) => state.setCurrentBoardId);

  const handleChangeBoard = (id: number) => {
    setBoardId(id);
  };

  return (
    <aside className={styles.layout}>
      <div>
        <h2 className={styles.heading}>All Boards ({boards.length})</h2>
        <div>
          {boards.map(({ id, name }) => (
            <button
              className={styles["list-item"]}
              key={id}
              onClick={() => {
                handleChangeBoard(id);
              }}
            >
              <BoardIcon />
              {name}
            </button>
          ))}
          <CreateBoardDialog />
        </div>
      </div>
      <ThemeSwitch />
    </aside>
  );
}
