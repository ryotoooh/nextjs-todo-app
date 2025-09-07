export interface Todo {
  id: string;
  title: string;
  description?: string;
  is_done: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  is_done?: boolean;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  is_done?: boolean;
}
