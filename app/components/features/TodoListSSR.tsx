import { Todo } from '@/lib/types';
import TodoListPresentationSSR from '../ui/TodoListPresentationSSR';
import TodoFormSSR from '../forms/TodoFormSSR';
import { createDefaultTodoService } from '@/lib/todoService';

// Server Component implementation
export default async function TodoListSSR() {
  // Fetch data on server side using environment-based service
  const service = createDefaultTodoService();
  const todos = await service.getAllTodos();
  
  return (
    <div>
      <TodoFormSSR />
      <TodoListPresentationSSR todos={todos} title="Todo List (SSR)" />
    </div>
  );
}
