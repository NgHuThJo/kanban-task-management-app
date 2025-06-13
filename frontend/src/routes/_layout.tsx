import { Suspense } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "#frontend/components/header/header";
import { Sidebar } from "#frontend/components/sidebar/sidebar";
import { getBoardsQueryOptions } from "#frontend/react-query/board";

export const Route = createFileRoute("/_layout")({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(getBoardsQueryOptions());
  },
  component: RootLayout,
});

function RootLayout() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <Sidebar />
      <Outlet />
    </div>
  );
}
