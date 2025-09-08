import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT, POST, DELETE } from './route';
import { NextRequest } from 'next/server';

// Mock TodoService
const mockTodoService = {
  getTodoById: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
};

vi.mock('@/lib/todoService', () => ({
  createDefaultTodoService: vi.fn(() => mockTodoService),
}));

describe('/api/todos/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/todos/[id]', () => {
    it('should return todo successfully', async () => {
      const mockTodo = {
        id: '1',
        title: 'Test Todo',
        description: 'Test Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      mockTodoService.getTodoById.mockResolvedValue(mockTodo);

      const response = await GET(
        new NextRequest('http://localhost:3000/api/todos/1'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(JSON.parse(JSON.stringify(mockTodo)));
      expect(mockTodoService.getTodoById).toHaveBeenCalledWith('1');
    });

    it('should return 404 when todo not found', async () => {
      mockTodoService.getTodoById.mockRejectedValue(new Error('Todo not found'));

      const response = await GET(
        new NextRequest('http://localhost:3000/api/todos/non-existent'),
        { params: Promise.resolve({ id: 'non-existent' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Todo not found' });
    });

    it('should handle errors gracefully', async () => {
      mockTodoService.getTodoById.mockRejectedValue(new Error('Database error'));

      const response = await GET(
        new NextRequest('http://localhost:3000/api/todos/1'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch todo' });
    });
  });

  describe('PUT /api/todos/[id]', () => {
    it('should update todo successfully', async () => {
      const updateData = {
        title: 'Updated Todo',
        description: 'Updated Description',
        is_done: true,
      };

      const updatedTodo = {
        id: '1',
        ...updateData,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      mockTodoService.updateTodo.mockResolvedValue(updatedTodo);

      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(JSON.parse(JSON.stringify(updatedTodo)));
      expect(mockTodoService.updateTodo).toHaveBeenCalledWith('1', updateData);
    });

    it('should update todo with partial data', async () => {
      const updateData = {
        is_done: true,
      };

      const updatedTodo = {
        id: '1',
        title: 'Original Todo',
        description: 'Original Description',
        ...updateData,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      mockTodoService.updateTodo.mockResolvedValue(updatedTodo);

      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(JSON.parse(JSON.stringify(updatedTodo)));
      expect(mockTodoService.updateTodo).toHaveBeenCalledWith('1', updateData);
    });

    it('should return 404 when todo not found', async () => {
      mockTodoService.updateTodo.mockRejectedValue(new Error('Todo not found'));

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
    });

    it('should return 400 when title is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify({ title: '' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Title cannot be empty' });
      expect(mockTodoService.updateTodo).not.toHaveBeenCalled();
    });

    it('should return 400 when title is only whitespace', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify({ title: '   ' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Title cannot be empty' });
      expect(mockTodoService.updateTodo).not.toHaveBeenCalled();
    });

    it('should handle update errors gracefully', async () => {
      mockTodoService.updateTodo.mockRejectedValue(new Error('Update error'));

      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update todo' });
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update todo' });
    });
  });

  describe('POST /api/todos/[id]', () => {
    it('should handle form-based PUT request successfully', async () => {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('is_done', 'true');

      const updatedTodo = {
        id: '1',
        title: 'Original Todo',
        description: 'Original Description',
        is_done: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      mockTodoService.updateTodo.mockResolvedValue(updatedTodo);

      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toBe('http://localhost:3000/ssr');
      expect(mockTodoService.updateTodo).toHaveBeenCalledWith('1', { is_done: true });
    });

    it('should handle form-based PUT request with title and description', async () => {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('title', 'Updated Title');
      formData.append('description', 'Updated Description');
      formData.append('is_done', 'false');

      const updatedTodo = {
        id: '1',
        title: 'Updated Title',
        description: 'Updated Description',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      mockTodoService.updateTodo.mockResolvedValue(updatedTodo);

      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(307);
      expect(mockTodoService.updateTodo).toHaveBeenCalledWith('1', {
        title: 'Updated Title',
        description: 'Updated Description',
        is_done: false,
      });
    });

    it('should return 400 for invalid method', async () => {
      const formData = new FormData();
      formData.append('_method', 'INVALID');

      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid method' });
      expect(mockTodoService.updateTodo).not.toHaveBeenCalled();
    });

    it('should return 404 when todo not found', async () => {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('is_done', 'true');

      mockTodoService.updateTodo.mockRejectedValue(new Error('Todo not found'));

      const request = new NextRequest('http://localhost:3000/api/todos/non-existent', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Todo not found' });
    });

    it('should handle form submission errors gracefully', async () => {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('is_done', 'true');

      mockTodoService.updateTodo.mockRejectedValue(new Error('Update error'));

      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: Promise.resolve({ id: '1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to process request' });
    });
  });

  describe('DELETE /api/todos/[id]', () => {
    it('should delete todo successfully', async () => {
      mockTodoService.deleteTodo.mockResolvedValue(undefined);

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/todos/1'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Todo deleted successfully' });
      expect(mockTodoService.deleteTodo).toHaveBeenCalledWith('1');
    });

    it('should return 404 when todo not found', async () => {
      mockTodoService.deleteTodo.mockRejectedValue(new Error('Todo not found'));

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/todos/non-existent'),
        { params: Promise.resolve({ id: 'non-existent' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Todo not found' });
    });

    it('should handle deletion errors gracefully', async () => {
      mockTodoService.deleteTodo.mockRejectedValue(new Error('Deletion error'));

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/todos/1'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete todo' });
    });
  });
});