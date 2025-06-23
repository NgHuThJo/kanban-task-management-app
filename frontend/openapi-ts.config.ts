import { defineConfig, defaultPlugins } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:5096/openapi/v1.json",
  output: {
    format: "prettier",
    lint: "eslint",
    path: "./src/types",
  },
  plugins: [
    ...defaultPlugins,
    "@hey-api/client-fetch",
    "@tanstack/react-query",
    "zod",
  ],
});
