import { revalidatePath } from 'next/cache';
import { CreateTodoRequest } from '@/lib/types';
import { createDefaultTodoService } from '@/lib/todoService';

// Server Actions for SSR mode
export async function createTodoAction(formData: FormData) {
  'use server';
  
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  
  if (!title || title.trim() === '') {
    throw new Error('Title is required');
  }
  
  const todoData: CreateTodoRequest = {
    title: title.trim(),
    description: description?.trim() || undefined,
  };
  
  const service = createDefaultTodoService();
  await service.createTodo(todoData);
  
  // Revalidate the SSR page to show the new todo
  revalidatePath('/ssr');
}

export async function toggleTodoAction(todoId: string, isDone: boolean) {
  'use server';
  
  const service = createDefaultTodoService();
  await service.updateTodo(todoId, { is_done: !isDone });
  
  // Revalidate the SSR page to show the updated todo
  revalidatePath('/ssr');
}

export async function deleteTodoAction(todoId: string) {
  'use server';
  
  const service = createDefaultTodoService();
  await service.deleteTodo(todoId);
  
  // Revalidate the SSR page to show the updated todo list
  revalidatePath('/ssr');
}
