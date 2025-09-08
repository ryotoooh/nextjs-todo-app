import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types';
import { TodoRepository } from './TodoRepository';

export interface ApiTodoRepositoryConfig {
  baseUrl: string;
  timeout?: number;
}

export class ApiTodoRepository implements TodoRepository {
  private config: ApiTodoRepositoryConfig;

  constructor(config: ApiTodoRepositoryConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  async getAll(): Promise<Todo[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/todos`, {
        cache: 'no-store',
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

  async getById(id: string): Promise<Todo | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/todos/${id}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(this.config.timeout!),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch todo: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching todo ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateTodoRequest): Promise<Todo> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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

  async update(id: string, data: UpdateTodoRequest): Promise<Todo | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(this.config.timeout!),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to update todo: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating todo ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/todos/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(this.config.timeout!),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error(`Failed to delete todo: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting todo ${id}:`, error);
      throw error;
    }
  }
}
