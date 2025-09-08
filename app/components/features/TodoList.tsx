'use client';

import { useTodos } from '../../hooks/useTodos';
import TodoListPresentation from '../ui/TodoListPresentation';
import TodoForm from '../forms/TodoForm';
import { CreateTodoRequest } from '@/lib/types';

export default function TodoList() {
  const { todos, loading, error, createTodo, updateTodo } = useTodos();

  const handleCreateTodo = async (data: CreateTodoRequest) => {
    await createTodo(data);
  };

  const handleToggleDone = async (id: string, is_done: boolean) => {
    try {
      await updateTodo(id, { is_done });
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  if (loading && todos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-600 text-sm">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <TodoForm onSubmit={handleCreateTodo} loading={loading} />
      <TodoListPresentation 
        todos={todos} 
        title="Tasks" 
        onToggleDone={handleToggleDone}
      />
    </div>
  );
}
