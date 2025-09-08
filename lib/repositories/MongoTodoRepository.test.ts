import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { MongoTodoRepository } from './MongoTodoRepository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

describe('MongoTodoRepository', () => {
  let mongoServer: MongoMemoryServer;
  let repository: MongoTodoRepository;

  beforeAll(async () => {
    // Start in-memory MongoDB instance for testing
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    repository = new MongoTodoRepository({
      connectionString: `${uri}testdb`,
      collectionName: 'testtodos',
    });

    await repository.connect();
  });

  afterAll(async () => {
    await repository.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean up collection before each test
    const client = new MongoClient(`${mongoServer.getUri()}testdb`);
    await client.connect();
    const db = client.db('testdb');
    await db.collection('testtodos').deleteMany({});
    await client.close();
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description',
        is_done: false,
      };

      const result = await repository.create(todoData);

      expect(result).toMatchObject({
        title: 'Test Todo',
        description: 'Test Description',
        is_done: false,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a todo with minimal data', async () => {
      const todoData = {
        title: 'Minimal Todo',
      };

      const result = await repository.create(todoData);

      expect(result).toMatchObject({
        title: 'Minimal Todo',
        description: null,
        is_done: false,
      });
    });
  });

  describe('getAll', () => {
    it('should return empty array when no todos exist', async () => {
      const result = await repository.getAll();
      expect(result).toEqual([]);
    });

    it('should return all todos sorted by creation date', async () => {
      const todo1 = await repository.create({
        title: 'First Todo',
        description: 'First Description',
      });

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const todo2 = await repository.create({
        title: 'Second Todo',
        description: 'Second Description',
      });

      const result = await repository.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(todo2.id); // Most recent first
      expect(result[1].id).toBe(todo1.id);
    });
  });

  describe('getById', () => {
    it('should return null for non-existent todo', async () => {
      const result = await repository.getById('507f1f77bcf86cd799439011');
      expect(result).toBeNull();
    });

    it('should return null for invalid ObjectId', async () => {
      const result = await repository.getById('invalid-id');
      expect(result).toBeNull();
    });

    it('should return todo by id', async () => {
      const createdTodo = await repository.create({
        title: 'Test Todo',
        description: 'Test Description',
      });

      const result = await repository.getById(createdTodo.id);

      expect(result).toMatchObject({
        id: createdTodo.id,
        title: 'Test Todo',
        description: 'Test Description',
      });
    });
  });

  describe('update', () => {
    it('should return null for non-existent todo', async () => {
      const result = await repository.update('507f1f77bcf86cd799439011', {
        title: 'Updated Title',
      });
      expect(result).toBeNull();
    });

    it('should return null for invalid ObjectId', async () => {
      const result = await repository.update('invalid-id', {
        title: 'Updated Title',
      });
      expect(result).toBeNull();
    });

    it('should update todo title', async () => {
      const createdTodo = await repository.create({
        title: 'Original Title',
        description: 'Original Description',
      });

      const result = await repository.update(createdTodo.id, {
        title: 'Updated Title',
      });

      expect(result).toMatchObject({
        id: createdTodo.id,
        title: 'Updated Title',
        description: 'Original Description',
      });
      expect(result!.updatedAt.getTime()).toBeGreaterThan(createdTodo.updatedAt.getTime());
    });

    it('should update todo description', async () => {
      const createdTodo = await repository.create({
        title: 'Test Title',
        description: 'Original Description',
      });

      const result = await repository.update(createdTodo.id, {
        description: 'Updated Description',
      });

      expect(result).toMatchObject({
        id: createdTodo.id,
        title: 'Test Title',
        description: 'Updated Description',
      });
    });

    it('should update todo completion status', async () => {
      const createdTodo = await repository.create({
        title: 'Test Title',
        is_done: false,
      });

      const result = await repository.update(createdTodo.id, {
        is_done: true,
      });

      expect(result).toMatchObject({
        id: createdTodo.id,
        title: 'Test Title',
        is_done: true,
      });
    });

    it('should set description to null', async () => {
      const createdTodo = await repository.create({
        title: 'Test Title',
        description: 'Original Description',
      });

      const result = await repository.update(createdTodo.id, {
        description: null,
      });

      expect(result).toMatchObject({
        id: createdTodo.id,
        title: 'Test Title',
        description: null,
      });
    });
  });

  describe('delete', () => {
    it('should return false for non-existent todo', async () => {
      const result = await repository.delete('507f1f77bcf86cd799439011');
      expect(result).toBe(false);
    });

    it('should return false for invalid ObjectId', async () => {
      const result = await repository.delete('invalid-id');
      expect(result).toBe(false);
    });

    it('should delete todo', async () => {
      const createdTodo = await repository.create({
        title: 'To Be Deleted',
        description: 'This will be deleted',
      });

      const result = await repository.delete(createdTodo.id);
      expect(result).toBe(true);

      const deletedTodo = await repository.getById(createdTodo.id);
      expect(deletedTodo).toBeNull();
    });
  });

  describe('database name extraction', () => {
    it('should extract database name from MongoDB Atlas connection string', () => {
      const atlasUri = 'mongodb+srv://user:pass@cluster.mongodb.net/todoapp';
      const repository = new MongoTodoRepository({
        connectionString: atlasUri,
      });
      
      // Access private method for testing
      const dbName = (repository as any).extractDatabaseName(atlasUri);
      expect(dbName).toBe('todoapp');
    });

    it('should use default database name when not specified', () => {
      const uriWithoutDb = 'mongodb+srv://user:pass@cluster.mongodb.net/';
      const repository = new MongoTodoRepository({
        connectionString: uriWithoutDb,
      });
      
      const dbName = (repository as any).extractDatabaseName(uriWithoutDb);
      expect(dbName).toBe('todoapp');
    });
  });
});