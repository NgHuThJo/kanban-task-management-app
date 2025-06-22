import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type CreateBoardRequest = {
  name: string;
  boardColumns?: Array<CreateBoardColumnRequest> | undefined;
};
type CreateBoardColumnRequest = {
  name: string;
};
type CreateKanbanTaskRequest = {
  title: string;
  description: string;
  boardColumnId?: number | undefined;
  subtasks?: Array<CreateSubtaskRequest> | undefined;
};
type CreateSubtaskRequest = {
  description: string;
};
type GetBoardsResponse = {
  id: number;
  name: string;
  boardColumns?: Array<GetBoardColumnsResponse> | undefined;
};
type GetBoardColumnsResponse = {
  id: number;
  name: string;
};
type UpdateBoardRequest = {
  id?: number | undefined;
  name: string;
  boardColumns?: Array<UpdateBoardColumnRequest> | undefined;
};
type UpdateBoardColumnRequest = {
  id?: number | undefined;
  name: string;
};
type UpdateKanbanTaskRequest = {
  id?: number | undefined;
  title: string;
  description: string;
  subtasks?: Array<UpdateSubtaskRequest> | undefined;
};
type UpdateSubtaskRequest = {
  id?: number | undefined;
  description: string;
};

export type {
  CreateBoardRequest,
  CreateBoardColumnRequest,
  CreateKanbanTaskRequest,
  CreateSubtaskRequest,
  GetBoardsResponse,
  GetBoardColumnsResponse,
  UpdateBoardRequest,
  UpdateBoardColumnRequest,
  UpdateKanbanTaskRequest,
  UpdateSubtaskRequest,
};

const CreateBoardColumnRequest: z.ZodType<CreateBoardColumnRequest> = z
  .object({ name: z.string() })
  .strict()
  .passthrough();
const CreateBoardRequest: z.ZodType<CreateBoardRequest> = z
  .object({
    name: z.string(),
    boardColumns: z.array(CreateBoardColumnRequest).optional(),
  })
  .strict()
  .passthrough();
const GetBoardColumnsResponse: z.ZodType<GetBoardColumnsResponse> = z
  .object({ id: z.number().int(), name: z.string() })
  .strict()
  .passthrough();
const GetBoardsResponse: z.ZodType<GetBoardsResponse> = z
  .object({
    id: z.number().int(),
    name: z.string(),
    boardColumns: z.array(GetBoardColumnsResponse).optional(),
  })
  .strict()
  .passthrough();
const UpdateBoardColumnRequest: z.ZodType<UpdateBoardColumnRequest> = z
  .object({ id: z.number().int().optional(), name: z.string() })
  .strict()
  .passthrough();
const UpdateBoardRequest: z.ZodType<UpdateBoardRequest> = z
  .object({
    id: z.number().int().optional(),
    name: z.string(),
    boardColumns: z.array(UpdateBoardColumnRequest).optional(),
  })
  .strict()
  .passthrough();
const DeleteBoardRequest = z
  .object({ id: z.number().int() })
  .strict()
  .passthrough();
const CreateSubtaskRequest: z.ZodType<CreateSubtaskRequest> = z
  .object({ description: z.string() })
  .strict()
  .passthrough();
const CreateKanbanTaskRequest: z.ZodType<CreateKanbanTaskRequest> = z
  .object({
    title: z.string(),
    description: z.string(),
    boardColumnId: z.number().int().optional(),
    subtasks: z.array(CreateSubtaskRequest).optional(),
  })
  .strict()
  .passthrough();
const GetKanbanTasksRequest = z
  .object({ boardColumnId: z.number().int() })
  .strict()
  .passthrough();
const GetKanbanTasksResponse = z
  .object({ id: z.number().int(), title: z.string(), description: z.string() })
  .strict()
  .passthrough();
const UpdateSubtaskRequest: z.ZodType<UpdateSubtaskRequest> = z
  .object({ id: z.number().int().optional(), description: z.string() })
  .strict()
  .passthrough();
const UpdateKanbanTaskRequest: z.ZodType<UpdateKanbanTaskRequest> = z
  .object({
    id: z.number().int().optional(),
    title: z.string(),
    description: z.string(),
    subtasks: z.array(UpdateSubtaskRequest).optional(),
  })
  .strict()
  .passthrough();
const DeleteKanbanTaskRequest = z
  .object({ id: z.number().int() })
  .strict()
  .passthrough();
const HttpValidationProblemDetails = z
  .object({
    type: z.string().nullable(),
    title: z.string().nullable(),
    status: z.number().int().nullable(),
    detail: z.string().nullable(),
    instance: z.string().nullable(),
    errors: z.record(z.array(z.string())),
  })
  .strict()
  .passthrough();

export const schemas = {
  CreateBoardColumnRequest,
  CreateBoardRequest,
  GetBoardColumnsResponse,
  GetBoardsResponse,
  UpdateBoardColumnRequest,
  UpdateBoardRequest,
  DeleteBoardRequest,
  CreateSubtaskRequest,
  CreateKanbanTaskRequest,
  GetKanbanTasksRequest,
  GetKanbanTasksResponse,
  UpdateSubtaskRequest,
  UpdateKanbanTaskRequest,
  DeleteKanbanTaskRequest,
  HttpValidationProblemDetails,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/boards",
    alias: "postApiboards",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateBoardRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/boards",
    alias: "getApiboards",
    requestFormat: "json",
    response: z.array(GetBoardsResponse),
  },
  {
    method: "put",
    path: "/api/boards",
    alias: "putApiboards",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateBoardRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/boards",
    alias: "deleteApiboards",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ id: z.number().int() }).strict().passthrough(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/api/kanbantasks",
    alias: "postApikanbantasks",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateKanbanTaskRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/kanbantasks",
    alias: "getApikanbantasks",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ boardColumnId: z.number().int() })
          .strict()
          .passthrough(),
      },
    ],
    response: z.array(GetKanbanTasksResponse),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/api/kanbantasks",
    alias: "putApikanbantasks",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateKanbanTaskRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/api/kanbantasks",
    alias: "deleteApikanbantasks",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ id: z.number().int() }).strict().passthrough(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z.void(),
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
