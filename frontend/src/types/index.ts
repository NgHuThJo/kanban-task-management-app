import { createApiClient } from "#frontend/types/openapi-zod-client";

export const client = createApiClient(import.meta.env.VITE_BASE_URL);
