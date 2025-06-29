import { createFileRoute } from "@tanstack/react-router";
import { Board } from "#frontend/features/board/components/board";

export const Route = createFileRoute("/board")({
  component: Board,
});
