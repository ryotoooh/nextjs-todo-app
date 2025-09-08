import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TodoList from './TodoList';
import { useTodos } from '../../hooks/useTodos';

// Mock the useTodos hook
vi.mock('../../hooks/useTodos');

const mockUseTodos = vi.mocked(useTodos);

// Mock todos for testing
const mockTodos = [
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

describe('TodoList', () => {
  const mockCreateTodo = vi.fn();
  const mockUpdateTodo = vi.fn();
  const mockDeleteTodo = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseTodos.mockReturnValue({
      todos: mockTodos,
      loading: false,
      error: null,
      refetch: mockRefetch,
      createTodo: mockCreateTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
    });
  });

  it('renders todos correctly', () => {
    render(<TodoList />);
    
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  it('shows loading state when loading and no todos', () => {
    mockUseTodos.mockReturnValue({
      todos: [],
      loading: true,
      error: null,
      refetch: mockRefetch,
      createTodo: mockCreateTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
    });

    render(<TodoList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    mockUseTodos.mockReturnValue({
      todos: [],
      loading: false,
      error: 'Test error',
      refetch: mockRefetch,
      createTodo: mockCreateTodo,
      updateTodo: mockUpdateTodo,
      deleteTodo: mockDeleteTodo,
    });

    render(<TodoList />);
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
  });

  it('calls updateTodo when checkbox is clicked', async () => {
    render(<TodoList />);
    
    const incompleteCheckbox = screen.getByLabelText('Mark as complete');
    fireEvent.click(incompleteCheckbox);
    
    await waitFor(() => {
      expect(mockUpdateTodo).toHaveBeenCalledWith('1', { is_done: true });
    });
  });

  it('handles updateTodo errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUpdateTodo.mockRejectedValue(new Error('Update failed'));
    
    render(<TodoList />);
    
    const incompleteCheckbox = screen.getByLabelText('Mark as complete');
    fireEvent.click(incompleteCheckbox);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle todo:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('renders TodoForm with correct props', () => {
    render(<TodoList />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    expect(input).toBeInTheDocument();
    
    const button = screen.getByText('Add');
    expect(button).toBeInTheDocument();
  });
});
