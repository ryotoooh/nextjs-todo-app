import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TodoListPresentationSSR from './TodoListPresentationSSR';
import { Todo } from '@/lib/types';

// Mock todos for testing
const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Test Todo 1',
    description: 'Test description 1',
    is_done: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Test Todo 2',
    description: 'Test description 2',
    is_done: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

describe('TodoListPresentationSSR', () => {
  it('renders empty state when no todos', () => {
    render(<TodoListPresentationSSR todos={[]} />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('renders todos correctly', () => {
    render(<TodoListPresentationSSR todos={mockTodos} />);
    
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 2')).toBeInTheDocument();
  });

  it('shows completed todos with strikethrough and opacity', () => {
    render(<TodoListPresentationSSR todos={mockTodos} />);
    
    // Find the todo container div that has the opacity class
    const completedTodoContainer = screen.getByText('Test Todo 2').closest('div.group');
    expect(completedTodoContainer).toHaveClass('opacity-60');
    
    const completedTitle = screen.getByText('Test Todo 2');
    expect(completedTitle).toHaveClass('line-through');
  });

  it('shows checkmark for completed todos', () => {
    render(<TodoListPresentationSSR todos={mockTodos} />);
    
    const completedCheckbox = screen.getByLabelText('Mark as incomplete');
    expect(completedCheckbox).toBeInTheDocument();
    expect(completedCheckbox).toHaveClass('bg-black', 'border-black');
  });

  it('shows empty checkbox for incomplete todos', () => {
    render(<TodoListPresentationSSR todos={mockTodos} />);
    
    const incompleteCheckbox = screen.getByLabelText('Mark as complete');
    expect(incompleteCheckbox).toBeInTheDocument();
    expect(incompleteCheckbox).toHaveClass('bg-white');
  });

  it('renders form with correct action and method for incomplete todo', () => {
    render(<TodoListPresentationSSR todos={mockTodos} />);
    
    const form = screen.getByLabelText('Mark as complete').closest('form');
    expect(form).toHaveAttribute('action', '/api/todos/1');
    expect(form).toHaveAttribute('method', 'POST');
    
    const methodInput = form?.querySelector('input[name="_method"]');
    expect(methodInput).toHaveAttribute('value', 'PUT');
    
    const isDoneInput = form?.querySelector('input[name="is_done"]');
    expect(isDoneInput).toHaveAttribute('value', 'true');
  });

  it('renders form with correct action and method for completed todo', () => {
    render(<TodoListPresentationSSR todos={mockTodos} />);
    
    const form = screen.getByLabelText('Mark as incomplete').closest('form');
    expect(form).toHaveAttribute('action', '/api/todos/2');
    expect(form).toHaveAttribute('method', 'POST');
    
    const methodInput = form?.querySelector('input[name="_method"]');
    expect(methodInput).toHaveAttribute('value', 'PUT');
    
    const isDoneInput = form?.querySelector('input[name="is_done"]');
    expect(isDoneInput).toHaveAttribute('value', 'false');
  });

  it('displays creation date correctly', () => {
    render(<TodoListPresentationSSR todos={mockTodos} />);
    
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 2, 2024')).toBeInTheDocument();
  });
});
