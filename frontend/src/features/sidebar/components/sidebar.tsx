import { useSuspenseQuery } from "@tanstack/react-query";
import { BoardIcon } from "#frontend/components/icon/icon";
import { getApiBoardsOptions } from "#frontend/types/@tanstack/react-query.gen";
import styles from "./sidebar.module.css";
import { ThemeSwitch } from "#frontend/features/sidebar/components/theme-switch";

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
          <button className={styles["create-item"]}>
            <BoardIcon />+ Create new board
          </button>
        </div>
      </div>
      <ThemeSwitch />
    </aside>
  );
}
