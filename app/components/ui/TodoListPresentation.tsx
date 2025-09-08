import { Todo } from '@/lib/types';

interface TodoListUIProps {
  todos: Todo[];
  title?: string;
}

export default function TodoListUI({ todos, title = "Tasks" }: TodoListUIProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-500 text-sm">No tasks yet</div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`group border-b border-gray-100 py-4 px-1 transition-colors hover:bg-gray-50 ${
            todo.is_done ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center ${
                todo.is_done ? 'bg-black border-black' : 'bg-white'
              }`}>
                {todo.is_done && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium text-black ${
                todo.is_done ? 'line-through' : ''
              }`}>
                {todo.title}
              </h3>
              {todo.description && (
                <p className={`mt-1 text-xs text-gray-600 ${
                  todo.is_done ? 'line-through' : ''
                }`}>
                  {todo.description}
                </p>
              )}
              <div className="mt-2 text-xs text-gray-400">
                {new Date(todo.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
