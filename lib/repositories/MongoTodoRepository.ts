import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types';
import { TodoRepository } from './TodoRepository';

export interface MongoTodoRepositoryConfig {
  connectionString?: string;
  collectionName?: string;
}

export class MongoTodoRepository implements TodoRepository {
  private client: MongoClient;
  private db: Db;
  private collection: Collection;
  private config: Required<MongoTodoRepositoryConfig>;

  constructor(config: MongoTodoRepositoryConfig = {}) {
    this.config = {
      connectionString: config.connectionString || process.env.DATABASE_URL || 'mongodb://localhost:27017',
      collectionName: config.collectionName || 'todos',
    };

    this.client = new MongoClient(this.config.connectionString);
    // Extract database name from connection string
    const dbName = this.extractDatabaseName(this.config.connectionString);
    this.db = this.client.db(dbName);
    this.collection = this.db.collection(this.config.collectionName);
  }

  private extractDatabaseName(connectionString: string): string {
    try {
      const url = new URL(connectionString);
      // Extract database name from pathname (e.g., /todoapp -> todoapp)
      const dbName = url.pathname.substring(1); // Remove leading slash
      return dbName || 'todoapp'; // Default to 'todoapp' if no database specified
    } catch (error) {
      // Fallback for invalid URL format
      return 'todoapp';
    }
  }

  async connect(): Promise<void> {
    await this.client.connect();
    await this.initializeCollection();
  }

  private async initializeCollection(): Promise<void> {
    // Create indexes for better performance
    await this.collection.createIndex({ createdAt: -1 });
    await this.collection.createIndex({ is_done: 1 });
  }

  async getAll(): Promise<Todo[]> {
    const documents = await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return documents.map(doc => this.mapDocumentToTodo(doc));
  }

  async getById(id: string): Promise<Todo | null> {
    try {
      const objectId = new ObjectId(id);
      const document = await this.collection.findOne({ _id: objectId });
      
      if (!document) {
        return null;
      }

      return this.mapDocumentToTodo(document);
    } catch (error) {
      // Invalid ObjectId format
      return null;
    }
  }

  async create(data: CreateTodoRequest): Promise<Todo> {
    const now = new Date();
    const document = {
      title: data.title,
      description: data.description || null,
      is_done: data.is_done ?? false,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(document);
    const insertedDocument = await this.collection.findOne({ _id: result.insertedId });

    return this.mapDocumentToTodo(insertedDocument!);
  }

  async update(id: string, data: UpdateTodoRequest): Promise<Todo | null> {
    try {
      const objectId = new ObjectId(id);
      const updateFields: any = {
        updatedAt: new Date(),
      };

      if (data.title !== undefined) {
        updateFields.title = data.title;
      }

      if (data.description !== undefined) {
        updateFields.description = data.description;
      }

      if (data.is_done !== undefined) {
        updateFields.is_done = data.is_done;
      }

      const result = await this.collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      if (!result) {
        return null;
      }

      return this.mapDocumentToTodo(result);
    } catch (error) {
      // Invalid ObjectId format
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(id);
      const result = await this.collection.deleteOne({ _id: objectId });
      
      return result.deletedCount > 0;
    } catch (error) {
      // Invalid ObjectId format
      return false;
    }
  }

  private mapDocumentToTodo(document: any): Todo {
    return {
      id: document._id.toString(),
      title: document.title,
      description: document.description,
      is_done: document.is_done,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  // Cleanup method for graceful shutdown
  async close(): Promise<void> {
    await this.client.close();
  }
}