import { useSuspenseQuery } from "@tanstack/react-query";
import { BoardIcon, VerticalEllipsis } from "#frontend/components/ui/icon";
import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";
import { ThemeSwitch } from "#frontend/features/sidebar/components/theme-switch";
import { CreateBoardDialog } from "#frontend/components/ui/create-board-dialog";
import styles from "./sidebar.module.css";
import { useBoardStore, useCurrentBoardId } from "#frontend/store/board";
import { Button } from "#frontend/components/primitives/button";

export function Sidebar() {
  const { data: boards } = useSuspenseQuery(getApiBoardsOptions());
  const setBoardId = useBoardStore((state) => state.setCurrentBoardId);
  const currentBoardId = useCurrentBoardId();

  function handleChangeBoard(id: number) {
    setBoardId(id);
  }

  return (
    <aside className={styles.layout}>
      <div>
        <h2 className={styles.heading}>All Boards ({boards.length})</h2>
        <div>
          {boards.map(({ id, name }) => (
            <Button
              variant="sidebar"
              size="sidebar"
              key={id}
              intent={id === currentBoardId ? "active" : undefined}
              onClick={() => {
                handleChangeBoard(id);
              }}
            >
              <VerticalEllipsis style={{ width: "1rem", height: "1rem" }} />
              {name}
            </Button>
          ))}
          <CreateBoardDialog
            trigger={
              <Button variant="sidebar" size="sidebar" intent="create">
                <BoardIcon style={{ width: "1rem" }} />
                +Create New Board
              </Button>
            }
          />
        </div>
      </div>
      <div className={styles.theme}>
        <ThemeSwitch />
      </div>
    </aside>
  );
}
