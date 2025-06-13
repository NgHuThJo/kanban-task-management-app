export interface IProblemDetails {
    type?: string | undefined;
    title?: string | undefined;
    status?: number | undefined;
    detail?: string | undefined;
    instance?: string | undefined;

    [key: string]: any;
}

export interface IHttpValidationProblemDetails extends IProblemDetails {
    errors?: { [key: string]: string[]; };

    [key: string]: any;
}

export interface ICreateBoardRequest {
    name?: string;
    boardColumns?: ICreateBoardColumnRequest[];
}

export interface ICreateBoardColumnRequest {
    name?: string;
}

export interface IGetBoardsResponse {
    id?: number;
    name?: string;
    boardColumns?: IGetBoardColumnsResponse[];
}

export interface IGetBoardColumnsResponse {
    id?: number;
    name?: string;
}

export interface IUpdateBoardRequest {
    id?: number;
    name?: string;
    boardColumns?: IUpdateBoardColumnRequest[];
}

export interface IUpdateBoardColumnRequest {
    id?: number;
    name?: string;
}

export interface IDeleteBoardRequest {
    id?: number;
}

export interface ICreateKanbanTaskRequest {
    title?: string;
    description?: string;
    boardColumnId?: number;
    subtasks?: ICreateSubtaskRequest[];
}

export interface ICreateSubtaskRequest {
    description?: string;
}

export interface IGetKanbanTasksResponse {
    id?: number;
    title?: string;
    description?: string;
}

export interface IGetKanbanTasksRequest {
    boardColumnId?: number;
}

export interface IUpdateKanbanTaskRequest {
    id?: number;
    title?: string;
    description?: string;
    subtasks?: IUpdateSubtaskRequest[];
}

export interface IUpdateSubtaskRequest {
    id?: number;
    description?: string;
}

export interface IDeleteKanbanTaskRequest {
    id?: number;
}