import path from 'path';
import 'reflect-metadata';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { Logger as TypeOrmLogger } from 'typeorm/logger/Logger';

import env, { DataBaseEnv } from '../env';
import Logger from '@core/logger';

const logger = Logger.create('database');

class TypeOrmLoggerImpl implements TypeOrmLogger {
  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    queryRunner?: QueryRunner,
  ): any {
    switch (level) {
      case 'log':
        logger.debug(message);
        break;
      case 'info':
        logger.info(message);
        break;
      case 'warn':
        logger.alert(message);
        break
    }
  }

  logMigration(message: string, queryRunner?: QueryRunner): any {
    logger.info(message);
  }

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    logger.debug(query);
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(error);
    }
    logger.debug(query);
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    logger.info(`Slow Query (${time}): ` + query);
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
    logger.debug(message);
  }
}

class TransactionExecutor {
  private runner: QueryRunner|null = null;
  constructor(private database: Database) {}
  async start() {
    if (this.runner) {
      throw new Error("Tran")
    }
  }
}

class Database {
  public dataSource: DataSource;
  constructor(private env: DataBaseEnv) {
    const { DATABASE_URL, TABLE_SYNC, SHOW_SQL } = env;
    const url = new URL(DATABASE_URL);
    const { hostname, username, port, password, pathname } = url;
    const database = pathname.startsWith('/')
      ? pathname.substring(1)
      : pathname;
    const entitiesPath = path.join(__dirname, './entity/**/*.entity{.js,.ts}');
    this.dataSource = new DataSource({
      type: 'postgres',
      host: hostname,
      port: parseInt(port, 10),
      username,
      password,
      database,
      synchronize: TABLE_SYNC,
      logging: SHOW_SQL,
      entities: [entitiesPath],
      subscribers: [],
      migrations: [],
      logger: new TypeOrmLoggerImpl(),
    });
  }
  async initialize() {
    logger.info('Initializing database');
    return this.dataSource.initialize();
  }

  async transactional(transaction: (em: EntityManager) => Promise<void>) {
    const runner = await this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await transaction(runner.manager);
    } catch (e) {
      await runner.rollbackTransaction();
    } finally {
      await runner.release();
    }
  }
}

export const database = new Database(env);

export default database;
