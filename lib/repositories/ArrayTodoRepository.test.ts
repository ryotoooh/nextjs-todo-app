import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArrayTodoRepository } from './ArrayTodoRepository';
import { CreateTodoRequest, UpdateTodoRequest } from '../types';

describe('ArrayTodoRepository', () => {
  let repository: ArrayTodoRepository;

  beforeEach(() => {
    // Reset the repository state before each test
    repository = new ArrayTodoRepository();
    
    // Mock the global todos array to start fresh for each test
    // We need to access the module's internal state
    vi.resetModules();
  });

  describe('getAll', () => {
    it('should return all todos', async () => {
      const todos = await repository.getAll();
      
      expect(todos).toBeDefined();
      expect(Array.isArray(todos)).toBe(true);
      expect(todos.length).toBeGreaterThanOrEqual(1); // At least the sample TODO
      
      // Check the sample TODO structure
      const sampleTodo = todos.find(todo => todo.id === '1');
      expect(sampleTodo).toBeDefined();
      expect(sampleTodo?.title).toBe('Sample TODO');
      expect(sampleTodo?.description).toBe('This is a sample TODO item');
      expect(sampleTodo?.is_done).toBe(false);
    });

    it('should return a copy of todos array', async () => {
      const todos1 = await repository.getAll();
      const todos2 = await repository.getAll();
      
      expect(todos1).not.toBe(todos2); // Different array instances
      expect(todos1).toEqual(todos2); // Same content
    });
  });

  describe('getById', () => {
    it('should return todo when found', async () => {
      const todo = await repository.getById('1');
      
      expect(todo).toBeDefined();
      expect(todo?.id).toBe('1');
      expect(todo?.title).toBe('Sample TODO');
    });

    it('should return null when todo not found', async () => {
      const todo = await repository.getById('999');
      
      expect(todo).toBeNull();
    });

    it('should return null for empty string id', async () => {
      const todo = await repository.getById('');
      
      expect(todo).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new todo with required fields', async () => {
      const createData: CreateTodoRequest = {
        title: 'New Todo',
        description: 'New description',
        is_done: false
      };

      const createdTodo = await repository.create(createData);

      expect(createdTodo).toBeDefined();
      expect(createdTodo.id).toBeDefined();
      expect(createdTodo.title).toBe(createData.title);
      expect(createdTodo.description).toBe(createData.description);
      expect(createdTodo.is_done).toBe(createData.is_done);
      expect(createdTodo.createdAt).toBeInstanceOf(Date);
      expect(createdTodo.updatedAt).toBeInstanceOf(Date);
      expect(createdTodo.createdAt).toEqual(createdTodo.updatedAt);
    });

    it('should create todo with default is_done value when not provided', async () => {
      const createData: CreateTodoRequest = {
        title: 'New Todo'
      };

      const createdTodo = await repository.create(createData);

      expect(createdTodo.is_done).toBe(false);
    });

    it('should generate unique IDs for multiple todos', async () => {
      const todo1 = await repository.create({ title: 'Todo 1' });
      const todo2 = await repository.create({ title: 'Todo 2' });

      expect(todo1.id).not.toBe(todo2.id);
      expect(todo1.id).toBeDefined();
      expect(todo2.id).toBeDefined();
    });

    it('should add created todo to the repository', async () => {
      const createData: CreateTodoRequest = {
        title: 'Test Todo'
      };

      const createdTodo = await repository.create(createData);
      const retrievedTodo = await repository.getById(createdTodo.id);

      expect(retrievedTodo).toEqual(createdTodo);
    });
  });

  describe('update', () => {
    it('should update existing todo', async () => {
      // First create a todo
      const createdTodo = await repository.create({
        title: 'Original Title',
        description: 'Original Description',
        is_done: false
      });

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));

      const updateData: UpdateTodoRequest = {
        title: 'Updated Title',
        description: 'Updated Description',
        is_done: true
      };

      const updatedTodo = await repository.update(createdTodo.id, updateData);

      expect(updatedTodo).toBeDefined();
      expect(updatedTodo?.id).toBe(createdTodo.id);
      expect(updatedTodo?.title).toBe(updateData.title);
      expect(updatedTodo?.description).toBe(updateData.description);
      expect(updatedTodo?.is_done).toBe(updateData.is_done);
      expect(updatedTodo?.createdAt).toEqual(createdTodo.createdAt);
      expect(updatedTodo?.updatedAt.getTime()).toBeGreaterThan(createdTodo.updatedAt.getTime());
    });

    it('should update only provided fields', async () => {
      const createdTodo = await repository.create({
        title: 'Original Title',
        description: 'Original Description',
        is_done: false
      });

      const updateData: UpdateTodoRequest = {
        title: 'Updated Title Only'
      };

      const updatedTodo = await repository.update(createdTodo.id, updateData);

      expect(updatedTodo?.title).toBe(updateData.title);
      expect(updatedTodo?.description).toBe(createdTodo.description); // Unchanged
      expect(updatedTodo?.is_done).toBe(createdTodo.is_done); // Unchanged
    });

    it('should return null when updating non-existent todo', async () => {
      const updateData: UpdateTodoRequest = {
        title: 'Updated Title'
      };

      const result = await repository.update('999', updateData);

      expect(result).toBeNull();
    });

    it('should update updatedAt timestamp', async () => {
      const createdTodo = await repository.create({
        title: 'Test Todo'
      });

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));

      const updateData: UpdateTodoRequest = {
        title: 'Updated Title'
      };

      const updatedTodo = await repository.update(createdTodo.id, updateData);

      expect(updatedTodo?.updatedAt.getTime()).toBeGreaterThan(createdTodo.updatedAt.getTime());
    });
  });

  describe('delete', () => {
    it('should delete existing todo', async () => {
      const createdTodo = await repository.create({
        title: 'To Be Deleted'
      });

      const deleteResult = await repository.delete(createdTodo.id);

      expect(deleteResult).toBe(true);

      const retrievedTodo = await repository.getById(createdTodo.id);
      expect(retrievedTodo).toBeNull();
    });

    it('should return false when deleting non-existent todo', async () => {
      const deleteResult = await repository.delete('999');

      expect(deleteResult).toBe(false);
    });

    it('should not affect other todos when deleting', async () => {
      const todo1 = await repository.create({ title: 'Todo 1' });
      const todo2 = await repository.create({ title: 'Todo 2' });

      await repository.delete(todo1.id);

      const remainingTodo = await repository.getById(todo2.id);
      expect(remainingTodo).toBeDefined();
      expect(remainingTodo?.id).toBe(todo2.id);
    });
  });

  describe('integration tests', () => {
    it('should handle complete CRUD operations', async () => {
      // Create
      const createdTodo = await repository.create({
        title: 'Integration Test Todo',
        description: 'Testing full CRUD',
        is_done: false
      });

      // Read
      const retrievedTodo = await repository.getById(createdTodo.id);
      expect(retrievedTodo).toEqual(createdTodo);

      // Update
      const updatedTodo = await repository.update(createdTodo.id, {
        title: 'Updated Integration Test Todo',
        is_done: true
      });
      expect(updatedTodo?.title).toBe('Updated Integration Test Todo');
      expect(updatedTodo?.is_done).toBe(true);

      // Delete
      const deleteResult = await repository.delete(createdTodo.id);
      expect(deleteResult).toBe(true);

      // Verify deletion
      const deletedTodo = await repository.getById(createdTodo.id);
      expect(deletedTodo).toBeNull();
    });
  });
});
