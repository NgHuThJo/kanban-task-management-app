import { getApiBoardsOptions } from "#frontend/types/generated/@tanstack/react-query.gen";
import { useSuspenseQuery } from "@tanstack/react-query";

export function Board() {
  const { data } = useSuspenseQuery(getApiBoardsOptions());

  const boardNames = data.map((board) => board.name);
  return <div></div>;
}
