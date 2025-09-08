import { Todo } from '@/lib/types';
import TodoListPresentation from '../ui/TodoListPresentation';
import TodoFormShared from '../forms/TodoFormShared';
import { createDefaultTodoService } from '@/lib/todoService';
import { createTodoAction, toggleTodoAction, deleteTodoAction } from '../adapters/TodoActions';

// Server Component implementation
export default async function TodoListSSR() {
  // Fetch data on server side using environment-based service
  const service = createDefaultTodoService();
  const todos = await service.getAllTodos();
  
  return (
    <div>
      <TodoFormShared serverAction={createTodoAction} />
      <TodoListPresentation 
        todos={todos} 
        title="Todo List (SSR)" 
        toggleAction={toggleTodoAction}
        deleteAction={deleteTodoAction}
      />
    </div>
  );
}
