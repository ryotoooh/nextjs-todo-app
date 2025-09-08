'use client';

import { useTodos } from '../hooks/useTodos';
import TodoListPresentation from './TodoListPresentation';

export default function TodoList() {
  const { todos, loading, error } = useTodos();

  if (loading) {
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

  return <TodoListPresentation todos={todos} title="Todo List" />;
}
