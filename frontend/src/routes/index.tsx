import {
  createFileRoute,
  Outlet,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";
import { Suspense } from "react";
// import { useBoardStore } from "#frontend/store/board";
import { Header } from "#frontend/components/header/header";
import { Sidebar } from "#frontend/components/sidebar/sidebar";
import { getApiBoardsOptions } from "#frontend/types/@tanstack/react-query.gen";

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(getApiBoardsOptions());
  },
  component: Main,
});

function Main() {
  const data = useLoaderData({ from: "/" });
  const navigate = useNavigate();
  // const { currentBoardId, setBoardId } = useBoardStore((state) => state);

  // useEffect(() => {
  //   setBoardId(data?.at(-1)?.id ?? 0);
  // }, [data, setBoardId]);

  // const currentBoard = !currentBoardId
  //   ? undefined
  //   : data.findLast((value) => value.id == currentBoardId);

  if (!true) {
    navigate({ to: "/landing" });
  } else {
    return (
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Header currentBoardName={"name"} />
        </Suspense>
        <Sidebar />
        <Outlet />
      </main>
    );
  }
}
