import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// Mock storage
vi.mock('@/lib/storage', () => ({
  getAllTodos: vi.fn(),
  createTodo: vi.fn(),
}));

import { getAllTodos, createTodo } from '@/lib/storage';

describe('/api/todos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/todos', () => {
    it('should return all todos successfully', async () => {
      const mockTodos = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          is_done: false,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ];

      vi.mocked(getAllTodos).mockReturnValue(mockTodos);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(JSON.parse(JSON.stringify(mockTodos)));
      expect(getAllTodos).toHaveBeenCalledOnce();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(getAllTodos).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch todos' });
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo successfully', async () => {
      const requestBody = {
        title: 'New Todo',
        description: 'New Description',
        is_done: true,
      };

      const mockCreatedTodo = {
        id: 'new-uuid',
        ...requestBody,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(createTodo).mockReturnValue(mockCreatedTodo);

      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(JSON.parse(JSON.stringify(mockCreatedTodo)));
      expect(createTodo).toHaveBeenCalledWith('New Todo', 'New Description', true);
    });

    it('should create a todo with minimal data', async () => {
      const requestBody = {
        title: 'Minimal Todo',
      };

      const mockCreatedTodo = {
        id: 'new-uuid',
        title: 'Minimal Todo',
        is_done: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      };

      vi.mocked(createTodo).mockReturnValue(mockCreatedTodo);

      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(JSON.parse(JSON.stringify(mockCreatedTodo)));
      expect(createTodo).toHaveBeenCalledWith('Minimal Todo', undefined, undefined);
    });

    it('should return 400 when title is missing', async () => {
      const requestBody = {
        description: 'No title',
      };

      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Title is required' });
      expect(createTodo).not.toHaveBeenCalled();
    });

    it('should return 400 when title is empty', async () => {
      const requestBody = {
        title: '',
        description: 'Empty title',
      };

      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Title is required' });
      expect(createTodo).not.toHaveBeenCalled();
    });

    it('should return 400 when title is only whitespace', async () => {
      const requestBody = {
        title: '   ',
        description: 'Whitespace title',
      };

      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Title is required' });
      expect(createTodo).not.toHaveBeenCalled();
    });

    it('should handle creation errors gracefully', async () => {
      const requestBody = {
        title: 'Error Todo',
      };

      vi.mocked(createTodo).mockImplementation(() => {
        throw new Error('Creation error');
      });

      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create todo' });
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create todo' });
    });
  });
});
