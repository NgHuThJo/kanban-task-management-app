import { createApiClient } from "#frontend/types/openapi-zod-types";

export const client = createApiClient(import.meta.env.VITE_BASE_URL);
