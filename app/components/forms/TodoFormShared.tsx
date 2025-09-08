'use client';

import { useState } from 'react';
import { CreateTodoRequest } from '@/lib/types';

interface TodoFormSharedProps {
  onSubmit?: (data: CreateTodoRequest) => Promise<void>;
  loading?: boolean;
  formId?: string;
  onSuccess?: () => void;
  // Server action for SSR mode
  serverAction?: (formData: FormData) => Promise<void>;
}

export default function TodoFormShared({ 
  onSubmit, 
  loading = false, 
  formId = 'todo-form',
  onSuccess,
  serverAction 
}: TodoFormSharedProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        // Client-side submission
        await onSubmit({
          title: title.trim(),
          description: description.trim() || undefined,
        });
        
        // Reset form after successful submission
        setTitle('');
        setDescription('');
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServerSubmit = async (formData: FormData) => {
    if (serverAction) {
      await serverAction(formData);
    }
  };

  return (
    <div className="mb-12">
      {serverAction ? (
        // Server action form for SSR
        <form action={handleServerSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                name="title"
                placeholder="What needs to be done?"
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-200 focus:border-black focus:outline-none text-sm placeholder-gray-400 transition-colors"
                required
              />
            </div>
            
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
            >
              Add
            </button>
          </div>
          
          <div className="mt-2">
            <textarea
              name="description"
              placeholder="Add details (optional)"
              rows={2}
              className="w-full px-0 py-2 bg-transparent border-0 border-b border-gray-200 focus:border-black focus:outline-none text-sm placeholder-gray-400 resize-none transition-colors"
            />
          </div>
        </form>
      ) : (
        // Client-side form for CSR
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-200 focus:border-black focus:outline-none text-sm placeholder-gray-400 transition-colors"
                required
                disabled={isSubmitting || loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting || loading}
              className="px-6 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </button>
          </div>
          
          <div className="mt-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)"
              rows={2}
              className="w-full px-0 py-2 bg-transparent border-0 border-b border-gray-200 focus:border-black focus:outline-none text-sm placeholder-gray-400 resize-none transition-colors"
              disabled={isSubmitting || loading}
            />
          </div>
        </form>
      )}
    </div>
  );
}
