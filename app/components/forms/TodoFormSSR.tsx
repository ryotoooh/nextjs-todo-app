'use client';

import TodoFormShared from './TodoFormShared';
import { CreateTodoRequest } from '@/lib/types';

export default function TodoFormSSR() {
  const handleSubmit = async (data: CreateTodoRequest) => {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create todo');
    }
  };

  const handleSuccess = () => {
    // Refresh the page to show the new todo
    window.location.reload();
  };

  return (
    <TodoFormShared 
      onSubmit={handleSubmit} 
      formId="ssr"
      onSuccess={handleSuccess}
    />
  );
}
