import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

describe('TodoListPresentation', () => {
  it('renders empty state when no todos', () => {
    render(<TodoListPresentation todos={[]} />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('renders todos correctly', () => {
    render(<TodoListPresentation todos={mockTodos} />);
    
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 2')).toBeInTheDocument();
  });

  it('shows completed todos with strikethrough and opacity', () => {
    render(<TodoListPresentation todos={mockTodos} />);
    
    // Find the todo container div that has the opacity class
    const completedTodoContainer = screen.getByText('Test Todo 2').closest('div.group');
    expect(completedTodoContainer).toHaveClass('opacity-60');
    
    const completedTitle = screen.getByText('Test Todo 2');
    expect(completedTitle).toHaveClass('line-through');
  });

  it('shows checkmark for completed todos', () => {
    render(<TodoListPresentation todos={mockTodos} />);
    
    const completedCheckbox = screen.getByLabelText('Mark as incomplete');
    expect(completedCheckbox).toBeInTheDocument();
    expect(completedCheckbox).toHaveClass('bg-black', 'border-black');
  });

  it('shows empty checkbox for incomplete todos', () => {
    render(<TodoListPresentation todos={mockTodos} />);
    
    const incompleteCheckbox = screen.getByLabelText('Mark as complete');
    expect(incompleteCheckbox).toBeInTheDocument();
    expect(incompleteCheckbox).toHaveClass('bg-white');
  });

  it('calls onToggleDone when checkbox is clicked', () => {
    const mockOnToggleDone = vi.fn();
    render(<TodoListPresentation todos={mockTodos} onToggleDone={mockOnToggleDone} />);
    
    const incompleteCheckbox = screen.getByLabelText('Mark as complete');
    fireEvent.click(incompleteCheckbox);
    
    expect(mockOnToggleDone).toHaveBeenCalledWith('1', true);
  });

  it('calls onToggleDone with correct parameters for completed todo', () => {
    const mockOnToggleDone = vi.fn();
    render(<TodoListPresentation todos={mockTodos} onToggleDone={mockOnToggleDone} />);
    
    const completedCheckbox = screen.getByLabelText('Mark as incomplete');
    fireEvent.click(completedCheckbox);
    
    expect(mockOnToggleDone).toHaveBeenCalledWith('2', false);
  });

  it('does not crash when onToggleDone is not provided', () => {
    render(<TodoListPresentation todos={mockTodos} />);
    
    const incompleteCheckbox = screen.getByLabelText('Mark as complete');
    expect(() => fireEvent.click(incompleteCheckbox)).not.toThrow();
  });

  it('displays creation date correctly', () => {
    render(<TodoListPresentation todos={mockTodos} />);
    
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 2, 2024')).toBeInTheDocument();
  });
});
