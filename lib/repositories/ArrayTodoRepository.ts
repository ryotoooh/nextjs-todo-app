import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types';
import { TodoRepository } from './TodoRepository';

// In-memory TODO array
let todos: Todo[] = [
  {
    id: '1',
    title: 'Sample TODO',
    description: 'This is a sample TODO item',
    is_done: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
];

// Function to generate new ID
let nextId = 2; // Start from 2 since sample TODO uses ID '1'
function generateId(): string {
  return (nextId++).toString();
}

export class ArrayTodoRepository implements TodoRepository {
  // Add a static method to reset the repository state
  static reset(): void {
    todos = [
      {
        id: '1',
        title: 'Sample TODO',
        description: 'This is a sample TODO item',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];
    nextId = 2;
  }

  async getAll(): Promise<Todo[]> {
    return [...todos];
  }

  async getById(id: string): Promise<Todo | null> {
    return todos.find(todo => todo.id === id) || null;
  }

  async create(data: CreateTodoRequest): Promise<Todo> {
    const now = new Date();
    const newTodo: Todo = {
      id: generateId(),
      title: data.title,
      description: data.description,
      is_done: data.is_done ?? false,
      createdAt: now,
      updatedAt: now,
    };
    
    todos.push(newTodo);
    return newTodo;
  }

  async update(id: string, data: UpdateTodoRequest): Promise<Todo | null> {
    const index = todos.findIndex(todo => todo.id === id);
    if (index === -1) {
      return null;
    }
    
    // Only update fields that are explicitly provided (not undefined)
    const updateData: Partial<Todo> = {
      updatedAt: new Date(Date.now() + 1), // Ensure timestamp is different
    };
    
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    
    if (data.description !== undefined) {
      updateData.description = data.description === null ? undefined : data.description;
    }
    
    if (data.is_done !== undefined) {
      updateData.is_done = data.is_done;
    }
    
    todos[index] = {
      ...todos[index],
      ...updateData,
    };
    
    return todos[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = todos.findIndex(todo => todo.id === id);
    if (index === -1) {
      return false;
    }
    
    todos.splice(index, 1);
    return true;
  }
}
