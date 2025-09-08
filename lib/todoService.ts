import { Todo, CreateTodoRequest, UpdateTodoRequest } from './types';
import { 
  getAllTodos as storageGetAllTodos, 
  getTodoById as storageGetTodoById, 
  createTodo as storageCreateTodo, 
  updateTodo as storageUpdateTodo, 
  deleteTodo as storageDeleteTodo 
} from './storage';

// Configuration for the service
interface TodoServiceConfig {
  useApi?: boolean; // Flag to determine whether to use API or direct storage
  baseUrl?: string;
  timeout?: number;
}

// Default configuration
const defaultConfig: TodoServiceConfig = {
  useApi: false, // Default to using direct storage for SSR efficiency
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  timeout: 10000, // 10 seconds
};

// Service class for handling TODO operations
export class TodoService {
  private config: TodoServiceConfig;

  constructor(config: TodoServiceConfig = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Get all todos
  async getAllTodos(): Promise<Todo[]> {
    if (!this.config.useApi) {
      // Use direct storage access for SSR efficiency
      return storageGetAllTodos();
    }

    // Fallback to API call if needed
    try {
      const response = await fetch(`${this.config.baseUrl}/api/todos`, {
        cache: 'no-store', // Always fetch latest data
        signal: AbortSignal.timeout(this.config.timeout!),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw new Error('Failed to fetch todos');
    }
  }

  // Get todo by ID
  async getTodoById(id: string): Promise<Todo> {
    if (!this.config.useApi) {
      // Use direct storage access for SSR efficiency
      const todo = storageGetTodoById(id);
      if (!todo) {
        throw new Error('Todo not found');
      }
      return todo;
    }

    // Fallback to API call if needed
    try {
      const response = await fetch(`${this.config.baseUrl}/api/todos/${id}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(this.config.timeout!),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Todo not found');
        }
        throw new Error(`Failed to fetch todo: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching todo ${id}:`, error);
      throw error;
    }
  }

  // Create a new todo
  async createTodo(todoData: CreateTodoRequest): Promise<Todo> {
    if (!this.config.useApi) {
      // Use direct storage access for SSR efficiency
      return storageCreateTodo(todoData.title, todoData.description, todoData.is_done);
    }

    // Fallback to API call if needed
    try {
      const response = await fetch(`${this.config.baseUrl}/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
        signal: AbortSignal.timeout(this.config.timeout!),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create todo: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating todo:', error);
      throw new Error('Failed to create todo');
    }
  }

  // Update a todo
  async updateTodo(id: string, updates: UpdateTodoRequest): Promise<Todo> {
    if (!this.config.useApi) {
      // Use direct storage access for SSR efficiency
      const updatedTodo = storageUpdateTodo(id, updates);
      if (!updatedTodo) {
        throw new Error('Todo not found');
      }
      return updatedTodo;
    }

    // Fallback to API call if needed
    try {
      const response = await fetch(`${this.config.baseUrl}/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(this.config.timeout!),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Todo not found');
        }
        throw new Error(`Failed to update todo: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating todo ${id}:`, error);
      throw error;
    }
  }

  // Delete a todo
  async deleteTodo(id: string): Promise<void> {
    if (!this.config.useApi) {
      // Use direct storage access for SSR efficiency
      const success = storageDeleteTodo(id);
      if (!success) {
        throw new Error('Todo not found');
      }
      return;
    }

    // Fallback to API call if needed
    try {
      const response = await fetch(`${this.config.baseUrl}/api/todos/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(this.config.timeout!),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Todo not found');
        }
        throw new Error(`Failed to delete todo: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting todo ${id}:`, error);
      throw error;
    }
  }
}

// Default service instance (uses direct storage by default)
export const todoService = new TodoService();

// Convenience functions for backward compatibility
export const getTodos = () => todoService.getAllTodos();
export const getTodoById = (id: string) => todoService.getTodoById(id);
export const createTodo = (todoData: CreateTodoRequest) => todoService.createTodo(todoData);
export const updateTodo = (id: string, updates: UpdateTodoRequest) => todoService.updateTodo(id, updates);
export const deleteTodo = (id: string) => todoService.deleteTodo(id);
