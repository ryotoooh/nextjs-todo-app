import { useState, useEffect } from 'react';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/lib/types';
import { TodoService, TodoServiceConfig } from '@/lib/todoService';

interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createTodo: (data: CreateTodoRequest) => Promise<void>;
  updateTodo: (id: string, data: UpdateTodoRequest) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

interface UseTodosOptions {
  serviceConfig?: TodoServiceConfig;
}

export function useTodos(options: UseTodosOptions = {}): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create service instance with provided config or default to array storage
  const service = new TodoService(options.serviceConfig || { storage: 'array' });

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await service.getAllTodos();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (data: CreateTodoRequest) => {
    try {
      setError(null);
      const newTodo = await service.createTodo(data);
      setTodos(prev => [...prev, newTodo]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
      throw err;
    }
  };

  const updateTodo = async (id: string, data: UpdateTodoRequest) => {
    try {
      setError(null);
      const updatedTodo = await service.updateTodo(id, data);
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      throw err;
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setError(null);
      await service.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      throw err;
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return {
    todos,
    loading,
    error,
    refetch: fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  };
}
