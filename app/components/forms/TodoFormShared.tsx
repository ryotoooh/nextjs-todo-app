'use client';

import { useState } from 'react';
import { CreateTodoRequest } from '@/lib/types';

interface TodoFormSharedProps {
  onSubmit: (data: CreateTodoRequest) => Promise<void>;
  loading?: boolean;
  formId?: string;
  onSuccess?: () => void;
}

export default function TodoFormShared({ 
  onSubmit, 
  loading = false, 
  formId = 'todo-form',
  onSuccess 
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
    } catch (error) {
      console.error('Failed to create todo:', error);
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 mb-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Todo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor={`title-${formId}`} className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id={`title-${formId}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter todo title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting || loading}
            />
          </div>
          
          <div>
            <label htmlFor={`description-${formId}`} className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id={`description-${formId}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter todo description (optional)..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSubmitting || loading}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Todo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
