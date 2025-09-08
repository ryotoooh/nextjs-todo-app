import { Todo } from '@/lib/types';

interface TodoListPresentationProps {
  todos: Todo[];
  title?: string;
  onToggleDone?: (id: string, is_done: boolean) => void;
  onDelete?: (id: string) => void;
  // Server actions for SSR mode
  toggleAction?: (todoId: string, isDone: boolean) => Promise<void>;
  deleteAction?: (todoId: string) => Promise<void>;
}

export default function TodoListPresentation({ 
  todos, 
  title = "Tasks", 
  onToggleDone,
  onDelete,
  toggleAction,
  deleteAction 
}: TodoListPresentationProps) {
  const handleCheckboxClick = (todo: Todo) => {
    if (onToggleDone) {
      onToggleDone(todo.id, !todo.is_done);
    }
  };

  const handleDeleteClick = (todoId: string) => {
    if (onDelete) {
      onDelete(todoId);
    }
  };

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
          className={`group border-b border-gray-100 py-4 px-1 transition-all duration-200 hover:bg-gray-50 ${
            todo.is_done ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {toggleAction ? (
                // Server action form for SSR
                <form action={toggleAction.bind(null, todo.id, todo.is_done)}>
                  <button
                    type="submit"
                    className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center transition-colors hover:border-gray-400 ${
                      todo.is_done ? 'bg-black border-black' : 'bg-white'
                    }`}
                    aria-label={todo.is_done ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {todo.is_done && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </form>
              ) : (
                // Client-side button for CSR
                <button
                  onClick={() => handleCheckboxClick(todo)}
                  className={`w-4 h-4 border border-gray-300 rounded-sm flex items-center justify-center transition-colors hover:border-gray-400 ${
                    todo.is_done ? 'bg-black border-black' : 'bg-white'
                  }`}
                  aria-label={todo.is_done ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {todo.is_done && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )}
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

            {/* Delete Button */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {deleteAction ? (
                // Server action form for SSR
                <form action={deleteAction.bind(null, todo.id)}>
                  <button
                    type="submit"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-200"
                    aria-label="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </form>
              ) : (
                // Client-side button for CSR
                <button
                  onClick={() => handleDeleteClick(todo.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-200"
                  aria-label="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
