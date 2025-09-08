import { Todo } from '@/lib/types';
import TodoListPresentation from './TodoListPresentation';
import { createDefaultTodoService } from '@/lib/todoService';

// Server Component implementation
export default async function TodoListSSR() {
  // Fetch data on server side using environment-based service
  const service = createDefaultTodoService();
  const todos = await service.getAllTodos();
  
  return <TodoListPresentation todos={todos} title="Todo List (SSR)" />;
}
