import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SqliteTodoRepository } from './SqliteTodoRepository';
import { CreateTodoRequest, UpdateTodoRequest } from '../types';
import fs from 'fs';
import path from 'path';

describe('SqliteTodoRepository', () => {
  let repository: SqliteTodoRepository;
  const testDbPath = './data/test-todos.db';

  beforeEach(() => {
    // Remove test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Create repository with test database
    repository = new SqliteTodoRepository({ dbPath: testDbPath });
  });

  afterEach(() => {
    // Clean up test database
    repository.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('getAll', () => {
    it('should return empty array when no todos exist', async () => {
      const todos = await repository.getAll();
      
      expect(todos).toBeDefined();
      expect(Array.isArray(todos)).toBe(true);
      expect(todos.length).toBe(0);
    });

    it('should return all todos ordered by createdAt DESC', async () => {
      // Create multiple todos
      const todo1 = await repository.create({
        title: 'First Todo',
        description: 'First description'
      });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));

      const todo2 = await repository.create({
        title: 'Second Todo',
        description: 'Second description'
      });

      const todos = await repository.getAll();

      expect(todos.length).toBe(2);
      expect(todos[0].id).toBe(todo2.id); // Most recent first
      expect(todos[1].id).toBe(todo1.id);
    });
  });

  describe('getById', () => {
    it('should return null when todo not found', async () => {
      const todo = await repository.getById('999');
      
      expect(todo).toBeNull();
    });

    it('should return todo when found', async () => {
      const createdTodo = await repository.create({
        title: 'Test Todo',
        description: 'Test Description',
        is_done: true
      });

      const retrievedTodo = await repository.getById(createdTodo.id);

      expect(retrievedTodo).toBeDefined();
      expect(retrievedTodo?.id).toBe(createdTodo.id);
      expect(retrievedTodo?.title).toBe(createdTodo.title);
      expect(retrievedTodo?.description).toBe(createdTodo.description);
      expect(retrievedTodo?.is_done).toBe(createdTodo.is_done);
      expect(retrievedTodo?.createdAt).toEqual(createdTodo.createdAt);
      expect(retrievedTodo?.updatedAt).toEqual(createdTodo.updatedAt);
    });
  });

  describe('create', () => {
    it('should create a new todo with all fields', async () => {
      const createData: CreateTodoRequest = {
        title: 'New Todo',
        description: 'New description',
        is_done: true
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

    it('should create todo with undefined description when not provided', async () => {
      const createData: CreateTodoRequest = {
        title: 'New Todo'
      };

      const createdTodo = await repository.create(createData);

      expect(createdTodo.description).toBeUndefined(); // Repository returns original undefined
    });

    it('should generate auto-incrementing IDs', async () => {
      const todo1 = await repository.create({ title: 'Todo 1' });
      const todo2 = await repository.create({ title: 'Todo 2' });

      expect(parseInt(todo1.id)).toBeLessThan(parseInt(todo2.id));
    });

    it('should persist created todo to database', async () => {
      const createData: CreateTodoRequest = {
        title: 'Persistent Todo'
      };

      const createdTodo = await repository.create(createData);
      
      // Create new repository instance to test persistence
      const newRepository = new SqliteTodoRepository({ dbPath: testDbPath });
      const retrievedTodo = await newRepository.getById(createdTodo.id);
      
      // Adjust expectation for SQLite behavior (null vs undefined)
      expect(retrievedTodo?.id).toBe(createdTodo.id);
      expect(retrievedTodo?.title).toBe(createdTodo.title);
      expect(retrievedTodo?.description).toBe(null); // SQLite returns null for undefined
      expect(retrievedTodo?.is_done).toBe(createdTodo.is_done);
      expect(retrievedTodo?.createdAt).toEqual(createdTodo.createdAt);
      expect(retrievedTodo?.updatedAt).toEqual(createdTodo.updatedAt);
      newRepository.close();
    });
  });

  describe('update', () => {
    it('should update all fields of existing todo', async () => {
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

    it('should not update description when undefined is passed', async () => {
      const createdTodo = await repository.create({
        title: 'Test Todo',
        description: 'Original Description'
      });

      const updateData: UpdateTodoRequest = {
        description: undefined
      };

      const updatedTodo = await repository.update(createdTodo.id, updateData);

      expect(updatedTodo?.description).toBe('Original Description'); // Undefined doesn't trigger update
    });

    it('should update description to null when explicitly set to null', async () => {
      const createdTodo = await repository.create({
        title: 'Test Todo',
        description: 'Original Description'
      });

      const updateData: UpdateTodoRequest = {
        description: null
      };

      const updatedTodo = await repository.update(createdTodo.id, updateData);

      expect(updatedTodo?.description).toBe(null); // Explicit null updates the field
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

    it('should persist updates to database', async () => {
      const createdTodo = await repository.create({
        title: 'Original Title'
      });

      const updateData: UpdateTodoRequest = {
        title: 'Updated Title'
      };

      await repository.update(createdTodo.id, updateData);
      
      // Create new repository instance to test persistence
      const newRepository = new SqliteTodoRepository({ dbPath: testDbPath });
      const retrievedTodo = await newRepository.getById(createdTodo.id);
      
      expect(retrievedTodo?.title).toBe(updateData.title);
      newRepository.close();
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

    it('should persist deletion to database', async () => {
      const createdTodo = await repository.create({
        title: 'To Be Deleted'
      });

      await repository.delete(createdTodo.id);
      
      // Create new repository instance to test persistence
      const newRepository = new SqliteTodoRepository({ dbPath: testDbPath });
      const retrievedTodo = await newRepository.getById(createdTodo.id);
      
      expect(retrievedTodo).toBeNull();
      newRepository.close();
    });
  });

  describe('database initialization', () => {
    it('should create database file if it does not exist', () => {
      const newDbPath = './data/new-test-db.db';
      
      if (fs.existsSync(newDbPath)) {
        fs.unlinkSync(newDbPath);
      }

      const newRepository = new SqliteTodoRepository({ dbPath: newDbPath });
      
      expect(fs.existsSync(newDbPath)).toBe(true);
      
      newRepository.close();
      fs.unlinkSync(newDbPath);
    });

    it('should create todos table with correct schema', async () => {
      // Create a todo to verify table structure
      const todo = await repository.create({
        title: 'Schema Test',
        description: 'Testing table schema',
        is_done: true
      });

      expect(todo.id).toBeDefined();
      expect(todo.title).toBe('Schema Test');
      expect(todo.description).toBe('Testing table schema');
      expect(todo.is_done).toBe(true);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
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

    it('should handle multiple concurrent operations', async () => {
      // Create multiple todos concurrently
      const createPromises = Array.from({ length: 5 }, (_, i) =>
        repository.create({
          title: `Concurrent Todo ${i + 1}`,
          description: `Description ${i + 1}`
        })
      );

      const createdTodos = await Promise.all(createPromises);

      expect(createdTodos.length).toBe(5);
      
      // Verify all todos were created
      const allTodos = await repository.getAll();
      expect(allTodos.length).toBe(5);

      // Update all todos concurrently
      const updatePromises = createdTodos.map(todo =>
        repository.update(todo.id, { is_done: true })
      );

      const updatedTodos = await Promise.all(updatePromises);

      expect(updatedTodos.every(todo => todo?.is_done === true)).toBe(true);
    });
  });
});
