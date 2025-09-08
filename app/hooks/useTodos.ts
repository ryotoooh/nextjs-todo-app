import { useState, useEffect } from 'react';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/lib/types';

interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createTodo: (data: CreateTodoRequest) => Promise<void>;
  updateTodo: (id: string, data: UpdateTodoRequest) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/todos', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to fetch todos: ${response.status}`);
      
      const data = await response.json();
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
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error(`Failed to create todo: ${response.status}`);
      
      const newTodo = await response.json();
      setTodos(prev => [...prev, newTodo]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
      throw err;
    }
  };

  const updateTodo = async (id: string, data: UpdateTodoRequest) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error(`Failed to update todo: ${response.status}`);
      
      const updatedTodo = await response.json();
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      throw err;
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      
      if (!response.ok) throw new Error(`Failed to delete todo: ${response.status}`);
      
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
