import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TodoListPresentation from './TodoListPresentation';
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

// Mock server action for SSR testing
const mockToggleAction = async (todoId: string, isDone: boolean) => {
  // Mock implementation for testing
};

describe('TodoListPresentationSSR', () => {
  it('renders empty state when no todos', () => {
    render(<TodoListPresentation todos={[]} toggleAction={mockToggleAction} />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('renders todos correctly', () => {
    render(<TodoListPresentation todos={mockTodos} toggleAction={mockToggleAction} />);
    
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 2')).toBeInTheDocument();
  });

  it('shows completed todos with strikethrough and opacity', () => {
    render(<TodoListPresentation todos={mockTodos} toggleAction={mockToggleAction} />);
    
    // Find the todo container div that has the opacity class
    const completedTodoContainer = screen.getByText('Test Todo 2').closest('div.group');
    expect(completedTodoContainer).toHaveClass('opacity-60');
    
    const completedTitle = screen.getByText('Test Todo 2');
    expect(completedTitle).toHaveClass('line-through');
  });

  it('shows checkmark for completed todos', () => {
    render(<TodoListPresentation todos={mockTodos} toggleAction={mockToggleAction} />);
    
    const completedCheckbox = screen.getByLabelText('Mark as incomplete');
    expect(completedCheckbox).toBeInTheDocument();
    expect(completedCheckbox).toHaveClass('bg-black', 'border-black');
  });

  it('shows empty checkbox for incomplete todos', () => {
    render(<TodoListPresentation todos={mockTodos} toggleAction={mockToggleAction} />);
    
    const incompleteCheckbox = screen.getByLabelText('Mark as complete');
    expect(incompleteCheckbox).toBeInTheDocument();
    expect(incompleteCheckbox).toHaveClass('bg-white');
  });

  it('renders form with server action for incomplete todo', () => {
    render(<TodoListPresentation todos={mockTodos} toggleAction={mockToggleAction} />);
    
    const form = screen.getByLabelText('Mark as complete').closest('form');
    expect(form).toBeInTheDocument();
    
    const button = form?.querySelector('button[type="submit"]');
    expect(button).toBeInTheDocument();
  });

  it('renders form with server action for completed todo', () => {
    render(<TodoListPresentation todos={mockTodos} toggleAction={mockToggleAction} />);
    
    const form = screen.getByLabelText('Mark as incomplete').closest('form');
    expect(form).toBeInTheDocument();
    
    const button = form?.querySelector('button[type="submit"]');
    expect(button).toBeInTheDocument();
  });

  it('displays creation date correctly', () => {
    render(<TodoListPresentation todos={mockTodos} toggleAction={mockToggleAction} />);
    
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 2, 2024')).toBeInTheDocument();
  });
});
