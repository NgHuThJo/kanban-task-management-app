import { queryOptions } from "@tanstack/react-query";
import { client } from "#frontend/types";

export const getBoardsQueryOptions = () =>
  queryOptions({
    queryKey: ["boards"],
    queryFn: async ({ signal }) => {
      return await client.getApiBoards(signal);
    },
    retry: false,
    retryDelay: (attempt) => 500 * attempt,
  });
