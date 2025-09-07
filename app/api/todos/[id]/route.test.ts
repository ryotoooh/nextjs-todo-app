import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// Mock storage
vi.mock('@/lib/storage', () => ({
  getTodoById: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import { getTodoById, updateTodo, deleteTodo } from '@/lib/storage';

describe('/api/todos/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/todos/[id]', () => {
    it('should return todo successfully', async () => {
      const mockTodo = {
        id: 'test-id',
        title: 'Test Todo',
        description: 'Test Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(getTodoById).mockReturnValue(mockTodo);

      const response = await GET(
        new NextRequest('http://localhost:3000/api/todos/test-id'),
        { params: Promise.resolve({ id: 'test-id' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(JSON.parse(JSON.stringify(mockTodo)));
      expect(getTodoById).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 when todo not found', async () => {
      vi.mocked(getTodoById).mockReturnValue(undefined);

      const response = await GET(
        new NextRequest('http://localhost:3000/api/todos/non-existent'),
        { params: Promise.resolve({ id: 'non-existent' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Todo not found' });
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(getTodoById).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await GET(
        new NextRequest('http://localhost:3000/api/todos/test-id'),
        { params: Promise.resolve({ id: 'test-id' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch todo' });
    });
  });

  describe('PUT /api/todos/[id]', () => {
    it('should update todo successfully', async () => {
      const existingTodo = {
        id: 'test-id',
        title: 'Original Todo',
        description: 'Original Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      const updateData = {
        title: 'Updated Todo',
        description: 'Updated Description',
        is_done: true,
      };

      const updatedTodo = {
        ...existingTodo,
        ...updateData,
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      vi.mocked(getTodoById).mockReturnValue(existingTodo);
      vi.mocked(updateTodo).mockReturnValue(updatedTodo);

      const request = new NextRequest('http://localhost:3000/api/todos/test-id', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(JSON.parse(JSON.stringify(updatedTodo)));
      expect(updateTodo).toHaveBeenCalledWith('test-id', updateData);
    });

    it('should update todo with partial data', async () => {
      const existingTodo = {
        id: 'test-id',
        title: 'Original Todo',
        description: 'Original Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      const updateData = {
        is_done: true,
      };

      const updatedTodo = {
        ...existingTodo,
        ...updateData,
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      vi.mocked(getTodoById).mockReturnValue(existingTodo);
      vi.mocked(updateTodo).mockReturnValue(updatedTodo);

      const request = new NextRequest('http://localhost:3000/api/todos/test-id', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(JSON.parse(JSON.stringify(updatedTodo)));
      expect(updateTodo).toHaveBeenCalledWith('test-id', updateData);
    });

    it('should return 404 when todo not found', async () => {
      vi.mocked(getTodoById).mockReturnValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/todos/non-existent', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Todo not found' });
      expect(updateTodo).not.toHaveBeenCalled();
    });

    it('should return 400 when title is empty', async () => {
      const existingTodo = {
        id: 'test-id',
        title: 'Original Todo',
        description: 'Original Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(getTodoById).mockReturnValue(existingTodo);

      const request = new NextRequest('http://localhost:3000/api/todos/test-id', {
        method: 'PUT',
        body: JSON.stringify({ title: '' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Title cannot be empty' });
      expect(updateTodo).not.toHaveBeenCalled();
    });

    it('should return 400 when title is only whitespace', async () => {
      const existingTodo = {
        id: 'test-id',
        title: 'Original Todo',
        description: 'Original Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(getTodoById).mockReturnValue(existingTodo);

      const request = new NextRequest('http://localhost:3000/api/todos/test-id', {
        method: 'PUT',
        body: JSON.stringify({ title: '   ' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Title cannot be empty' });
      expect(updateTodo).not.toHaveBeenCalled();
    });

    it('should handle update errors gracefully', async () => {
      const existingTodo = {
        id: 'test-id',
        title: 'Original Todo',
        description: 'Original Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(getTodoById).mockReturnValue(existingTodo);
      vi.mocked(updateTodo).mockImplementation(() => {
        throw new Error('Update error');
      });

      const request = new NextRequest('http://localhost:3000/api/todos/test-id', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update todo' });
    });

    it('should handle invalid JSON', async () => {
      const existingTodo = {
        id: 'test-id',
        title: 'Original Todo',
        description: 'Original Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(getTodoById).mockReturnValue(existingTodo);

      const request = new NextRequest('http://localhost:3000/api/todos/test-id', {
        method: 'PUT',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update todo' });
    });
  });

  describe('DELETE /api/todos/[id]', () => {
    it('should delete todo successfully', async () => {
      const existingTodo = {
        id: 'test-id',
        title: 'Test Todo',
        description: 'Test Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(getTodoById).mockReturnValue(existingTodo);
      vi.mocked(deleteTodo).mockReturnValue(true);

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/todos/test-id'),
        { params: Promise.resolve({ id: 'test-id' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Todo deleted successfully' });
      expect(deleteTodo).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 when todo not found', async () => {
      vi.mocked(getTodoById).mockReturnValue(undefined);

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/todos/non-existent'),
        { params: Promise.resolve({ id: 'non-existent' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Todo not found' });
      expect(deleteTodo).not.toHaveBeenCalled();
    });

    it('should return 500 when deletion fails', async () => {
      const existingTodo = {
        id: 'test-id',
        title: 'Test Todo',
        description: 'Test Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(getTodoById).mockReturnValue(existingTodo);
      vi.mocked(deleteTodo).mockReturnValue(false);

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/todos/test-id'),
        { params: Promise.resolve({ id: 'test-id' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete todo' });
    });

    it('should handle deletion errors gracefully', async () => {
      const existingTodo = {
        id: 'test-id',
        title: 'Test Todo',
        description: 'Test Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(getTodoById).mockReturnValue(existingTodo);
      vi.mocked(deleteTodo).mockImplementation(() => {
        throw new Error('Deletion error');
      });

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/todos/test-id'),
        { params: Promise.resolve({ id: 'test-id' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete todo' });
    });
  });
});
