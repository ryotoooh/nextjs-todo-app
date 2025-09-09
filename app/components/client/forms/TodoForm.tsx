import TodoFormShared from '../../shared/forms/TodoFormShared';
import { CreateTodoRequest } from '@/lib/types';

interface TodoFormProps {
  onSubmit: (data: CreateTodoRequest) => Promise<void>;
  loading?: boolean;
}

export default function TodoForm({ onSubmit, loading = false }: TodoFormProps) {
  return (
    <TodoFormShared 
      onSubmit={onSubmit} 
      loading={loading} 
      formId="client"
    />
  );
}
