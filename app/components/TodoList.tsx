'use client';

import { useTodos } from '../hooks/useTodos';

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

  if (todos.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">No todos found</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Todo List</h2>
      <div className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`p-4 rounded-lg border ${
              todo.is_done
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className={`font-medium ${
                    todo.is_done ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p
                    className={`mt-1 text-sm ${
                      todo.is_done ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {todo.description}
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-400">
                  Created: {new Date(todo.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="ml-4">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    todo.is_done
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {todo.is_done ? 'Done' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
