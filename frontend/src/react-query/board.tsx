import { queryOptions } from "@tanstack/react-query";

export const getBoardsQueryOptions = () =>
  queryOptions({
    queryKey: ["boards"],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/boards`, {
        signal,
      });
      return res.json();
    },
    retry: false,
    retryDelay: (attempt) => 500 * attempt,
  });
