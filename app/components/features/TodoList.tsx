'use client';

import { useTodos } from '../../hooks/useTodos';
import TodoListPresentation from '../ui/TodoListPresentation';
import TodoForm from '../forms/TodoForm';
import { CreateTodoRequest } from '@/lib/types';

export default function TodoList() {
  const { todos, loading, error, createTodo } = useTodos();

  const handleCreateTodo = async (data: CreateTodoRequest) => {
    await createTodo(data);
  };

  if (loading && todos.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <TodoForm onSubmit={handleCreateTodo} loading={loading} />
      <TodoListPresentation todos={todos} title="Todo List" />
    </div>
  );
}
