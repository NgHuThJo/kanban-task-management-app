import { useSuspenseQuery } from "@tanstack/react-query";
import { BoardIcon, Logo } from "#frontend/components/icon/icon";
import { getApiBoardsOptions } from "#frontend/types/@tanstack/react-query.gen";

export function Sidebar() {
  const { data } = useSuspenseQuery(getApiBoardsOptions());

  const boardNames = data.map((board) => board.name);

  return (
    <aside>
      <Logo />
      <div>
        <h2>All Boards ({boardNames.length})</h2>
        <ul>
          {boardNames.map((name) => (
            <li>
              <BoardIcon />
              <p>{name}</p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
