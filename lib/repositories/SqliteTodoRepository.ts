import Database from 'better-sqlite3';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types';
import { TodoRepository } from './TodoRepository';

export interface SqliteTodoRepositoryConfig {
  dbPath?: string;
}

export class SqliteTodoRepository implements TodoRepository {
  private db: Database.Database;

  constructor(config: SqliteTodoRepositoryConfig = {}) {
    const dbPath = config.dbPath || './data/todos.db';
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // Create todos table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        is_done INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `;
    
    this.db.exec(createTableSQL);
  }

  async getAll(): Promise<Todo[]> {
    const stmt = this.db.prepare('SELECT * FROM todos ORDER BY createdAt DESC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      is_done: Boolean(row.is_done),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async getById(id: string): Promise<Todo | null> {
    const stmt = this.db.prepare('SELECT * FROM todos WHERE id = ?');
    const row = stmt.get(parseInt(id)) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      is_done: Boolean(row.is_done),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  async create(data: CreateTodoRequest): Promise<Todo> {
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO todos (title, description, is_done, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.title,
      data.description || null,
      data.is_done ? 1 : 0,
      now,
      now
    );
    
    const id = result.lastInsertRowid as number;
    
    return {
      id: id.toString(),
      title: data.title,
      description: data.description,
      is_done: data.is_done ?? false,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  async update(id: string, data: UpdateTodoRequest): Promise<Todo | null> {
    const existingTodo = await this.getById(id);
    if (!existingTodo) {
      return null;
    }
    
    const now = new Date().toISOString();
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (data.title !== undefined) {
      updateFields.push('title = ?');
      values.push(data.title);
    }
    
    if (data.description !== undefined) {
      updateFields.push('description = ?');
      values.push(data.description);
    }
    
    if (data.is_done !== undefined) {
      updateFields.push('is_done = ?');
      values.push(data.is_done ? 1 : 0);
    }
    
    updateFields.push('updatedAt = ?');
    values.push(now);
    values.push(parseInt(id));
    
    const stmt = this.db.prepare(`
      UPDATE todos 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values);
    
    return await this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(parseInt(id));
    
    return result.changes > 0;
  }

  // Cleanup method for graceful shutdown
  close(): void {
    this.db.close();
  }
}
