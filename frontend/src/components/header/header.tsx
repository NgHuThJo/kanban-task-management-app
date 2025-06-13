import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "#frontend/components/button/button";
import { getBoardsQueryOptions } from "#frontend/react-query/board";

export function Header() {
  const { data } = useSuspenseQuery(getBoardsQueryOptions());

  console.log(data);

  return (
    <header>
      <h1>{data.name}</h1>
      <Button className="add-task">+ Add New Task</Button>
    </header>
  );
}
