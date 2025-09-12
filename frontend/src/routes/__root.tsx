import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useTheme } from "#frontend/store/theme";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: Root,
  },
);

function Root() {
  const theme = useTheme();

  useEffect(() => {
    const root = document.querySelector("html");

    if (theme === "light") {
      root?.classList.remove("dark");
    } else {
      root?.classList.remove("light");
    }

    root?.classList.add(theme);
  }, [theme]);

  return (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}
