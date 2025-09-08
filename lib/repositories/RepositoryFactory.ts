import { TodoRepository } from './TodoRepository';
import { ArrayTodoRepository } from './ArrayTodoRepository';
import { SqliteTodoRepository } from './SqliteTodoRepository';
import { MongoTodoRepository } from './MongoTodoRepository';

export type RepositoryType = 'array' | 'sqlite' | 'mongodb';

export interface RepositoryConfig {
  type: RepositoryType;
  sqlite?: {
    dbPath?: string;
  };
  mongodb?: {
    connectionString?: string;
    collectionName?: string;
  };
}

export class RepositoryFactory {
  static createRepository(config: RepositoryConfig): TodoRepository {
    switch (config.type) {
      case 'array':
        return new ArrayTodoRepository();
      
      case 'sqlite':
        return new SqliteTodoRepository(config.sqlite);
      
      case 'mongodb':
        return new MongoTodoRepository(config.mongodb);
      
      default:
        throw new Error(`Unsupported repository type: ${config.type}`);
    }
  }

  static createFromEnvironment(): TodoRepository {
    const repositoryType = (process.env.DATABASE_STORAGE as RepositoryType) || 'sqlite';

    switch (repositoryType) {
      case 'array':
        return new ArrayTodoRepository();
      
      case 'sqlite':
        return new SqliteTodoRepository({
          dbPath: process.env.DATABASE_URL,
        });
      
      case 'mongodb':
        return new MongoTodoRepository({
          connectionString: process.env.DATABASE_URL,
          collectionName: 'todos',
        });
      
      default:
        throw new Error(`Unsupported repository type: ${repositoryType}`);
    }
  }
}