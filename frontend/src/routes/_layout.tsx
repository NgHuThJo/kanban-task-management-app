import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "#frontend/components/header/header";
import { Sidebar } from "#frontend/components/sidebar/sidebar";

export const Route = createFileRoute("/_layout")({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div>
      <Header />
      <Sidebar />
      <Outlet />
    </div>
  );
}
