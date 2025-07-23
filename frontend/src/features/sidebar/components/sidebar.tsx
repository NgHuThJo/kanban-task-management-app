import { useSuspenseQuery } from "@tanstack/react-query";
import { BoardIcon } from "#frontend/components/ui/icon";
import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";
import { ThemeSwitch } from "#frontend/features/sidebar/components/theme-switch";
import { CreateBoardDialog } from "#frontend/components/ui/create-board-dialog";
import styles from "./sidebar.module.css";

export function Sidebar() {
  const { data } = useSuspenseQuery(getApiBoardsOptions());

  const boardNames = data.map((board) => board.name);

  return (
    <aside className={styles.layout}>
      <div>
        <h2 className={styles.heading}>All Boards ({boardNames.length})</h2>
        <div>
          {boardNames.map((name) => (
            <button className={styles["list-item"]}>
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
