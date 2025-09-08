import { Todo } from '@/lib/types';
import TodoListPresentation from './TodoListPresentation';
import { getTodos } from '@/lib/todoService';

// Server Component implementation
export default async function TodoListSSR() {
  // Fetch data on server side using the service
  const todos = await getTodos();
  
  return <TodoListPresentation todos={todos} title="Todo List (SSR)" />;
}
