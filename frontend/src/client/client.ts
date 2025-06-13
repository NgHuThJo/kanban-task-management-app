import { ApiClient } from "#frontend/client/generated-client";

export const client = new ApiClient(import.meta.env.VITE_API_URL);
