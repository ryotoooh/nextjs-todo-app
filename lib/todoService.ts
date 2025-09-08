import { Todo, CreateTodoRequest, UpdateTodoRequest } from './types';
import { TodoRepository } from './repositories/TodoRepository';
import { ArrayTodoRepository } from './repositories/ArrayTodoRepository';
import { ApiTodoRepository } from './repositories/ApiTodoRepository';

// Storage types for configuration
export type StorageType = 'array' | 'api' | 'database';

// Configuration interface
export interface TodoServiceConfig {
  storage: StorageType;
  apiConfig?: {
    baseUrl: string;
    timeout?: number;
  };
  databaseConfig?: {
    // Future database configuration
    connectionString?: string;
    tableName?: string;
  };
}

// Service class using dependency injection
export class TodoService {
  private repository: TodoRepository;

  constructor(config: TodoServiceConfig) {
    this.repository = this.createRepository(config);
  }

  private createRepository(config: TodoServiceConfig): TodoRepository {
    switch (config.storage) {
      case 'array':
        return new ArrayTodoRepository();
      
      case 'api':
        if (!config.apiConfig) {
          throw new Error('API configuration is required when using API storage');
        }
        return new ApiTodoRepository(config.apiConfig);
      
      case 'database':
        // Future implementation
        throw new Error('Database storage not implemented yet');
      
      default:
        throw new Error(`Unknown storage type: ${config.storage}`);
    }
  }

  // Get all todos
  async getAllTodos(): Promise<Todo[]> {
    return this.repository.getAll();
  }

  // Get todo by ID
  async getTodoById(id: string): Promise<Todo> {
    const todo = await this.repository.getById(id);
    if (!todo) {
      throw new Error('Todo not found');
    }
    return todo;
  }

  // Create a new todo
  async createTodo(todoData: CreateTodoRequest): Promise<Todo> {
    return this.repository.create(todoData);
  }

  // Update a todo
  async updateTodo(id: string, updates: UpdateTodoRequest): Promise<Todo> {
    const updatedTodo = await this.repository.update(id, updates);
    if (!updatedTodo) {
      throw new Error('Todo not found');
    }
    return updatedTodo;
  }

  // Delete a todo
  async deleteTodo(id: string): Promise<void> {
    const success = await this.repository.delete(id);
    if (!success) {
      throw new Error('Todo not found');
    }
  }
}

// Factory function for easy service creation
export function createTodoService(config: TodoServiceConfig): TodoService {
  return new TodoService(config);
}

// Default service instances for different storage types
export const arrayTodoService = new TodoService({ storage: 'array' });
export const apiTodoService = new TodoService({
  storage: 'api',
  apiConfig: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
});

// Convenience functions for backward compatibility
export const getTodos = () => arrayTodoService.getAllTodos();
export const getTodoById = (id: string) => arrayTodoService.getTodoById(id);
export const createTodo = (todoData: CreateTodoRequest) => arrayTodoService.createTodo(todoData);
export const updateTodo = (id: string, updates: UpdateTodoRequest) => arrayTodoService.updateTodo(id, updates);
export const deleteTodo = (id: string) => arrayTodoService.deleteTodo(id);
