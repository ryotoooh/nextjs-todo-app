import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types';

// Abstract repository interface
export interface TodoRepository {
  getAll(): Promise<Todo[]>;
  getById(id: string): Promise<Todo | null>;
  create(data: CreateTodoRequest): Promise<Todo>;
  update(id: string, data: UpdateTodoRequest): Promise<Todo | null>;
  delete(id: string): Promise<boolean>;
}
