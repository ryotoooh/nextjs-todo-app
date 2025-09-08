import { Todo, CreateTodoRequest, UpdateTodoRequest } from './types';
import { TodoRepository } from './repositories/TodoRepository';
import { ArrayTodoRepository } from './repositories/ArrayTodoRepository';

// Storage types for configuration
export type StorageType = 'array' | 'sqlite';

// Configuration interface
export interface TodoServiceConfig {
  storage: StorageType;
  databaseUrl?: string;
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
      
      case 'sqlite':
        // SQLite is only available on server-side
        if (typeof window !== 'undefined') {
          // On client-side, SQLite is not available - should use API routes directly
          throw new Error('SQLite is not available on client-side. Use API routes instead.');
        }
        // On server-side, use SQLite
        const { SqliteTodoRepository } = require('./repositories/SqliteTodoRepository');
        return new SqliteTodoRepository({ dbPath: config.databaseUrl });
      
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

// Helper function to get storage type from environment
function getStorageType(): StorageType {
  // On client-side, we can't access server environment variables
  // Use NEXT_PUBLIC_ prefix for client-side access
  const storage = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_DATABASE_STORAGE || 'array')
    : (process.env.DATABASE_STORAGE || 'array');
  
  // Debug logging for build-time issues
  if (typeof window === 'undefined') {
    console.log(`[Server] DATABASE_STORAGE: ${process.env.DATABASE_STORAGE || 'undefined'}, using: ${storage}`);
  }
  
  switch (storage.toLowerCase()) {
    case 'array':
      return 'array';
    case 'sqlite':
    case 'local':
      return 'sqlite';
    default:
      console.warn(`Unknown DATABASE_STORAGE value: ${storage}. Using 'array' as default.`);
      return 'array';
  }
}

// Helper function to get database URL from environment
function getDatabaseUrl(): string | undefined {
  return typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_DATABASE_URL
    : process.env.DATABASE_URL;
}

// Default service instances for different storage types
export const arrayTodoService = new TodoService({ storage: 'array' });

// SQLite service factory - lazy initialization to avoid build-time errors
function createSqliteTodoService(): TodoService {
  return new TodoService({
    storage: 'sqlite',
    databaseUrl: getDatabaseUrl() || './data/todos.db',
  });
}

// Default service factory - uses environment configuration
export function createDefaultTodoService(): TodoService {
  const storage = getStorageType();
  
  // On client-side, use environment-based storage
  if (typeof window !== 'undefined') {
    switch (storage) {
      case 'array':
        return arrayTodoService;
      case 'sqlite':
        // On client-side, SQLite is not available - should use API routes directly
        throw new Error('SQLite is not available on client-side. Use API routes instead.');
      default:
        return arrayTodoService;
    }
  }
  
  // On server-side, use environment-based storage
  switch (storage) {
    case 'array':
      return arrayTodoService;
    case 'sqlite':
      return createSqliteTodoService();
    default:
      return arrayTodoService;
  }
}

// Convenience functions for backward compatibility
export const getTodos = () => arrayTodoService.getAllTodos();
export const getTodoById = (id: string) => arrayTodoService.getTodoById(id);
export const createTodo = (todoData: CreateTodoRequest) => arrayTodoService.createTodo(todoData);
export const updateTodo = (id: string, updates: UpdateTodoRequest) => arrayTodoService.updateTodo(id, updates);
export const deleteTodo = (id: string) => arrayTodoService.deleteTodo(id);
