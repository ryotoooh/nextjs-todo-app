import { Todo } from './types';

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
export function generateId(): string {
  return (nextId++).toString();
}

// Get all TODOs
export function getAllTodos(): Todo[] {
  return [...todos];
}

// Get TODO by ID
export function getTodoById(id: string): Todo | undefined {
  return todos.find(todo => todo.id === id);
}

// Create new TODO
export function createTodo(title: string, description?: string, is_done?: boolean): Todo {
  const now = new Date();
  const newTodo: Todo = {
    id: generateId(),
    title,
    description,
    is_done: is_done ?? false,
    createdAt: now,
    updatedAt: now,
  };
  
  todos.push(newTodo);
  return newTodo;
}

// Update TODO
export function updateTodo(id: string, updates: Partial<Todo>): Todo | null {
  const index = todos.findIndex(todo => todo.id === id);
  if (index === -1) {
    return null;
  }
  
  todos[index] = {
    ...todos[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  return todos[index];
}

// Delete TODO
export function deleteTodo(id: string): boolean {
  const index = todos.findIndex(todo => todo.id === id);
  if (index === -1) {
    return false;
  }
  
  todos.splice(index, 1);
  return true;
}
