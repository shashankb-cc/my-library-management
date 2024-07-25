import mysql, { QueryResult } from "mysql2/promise";
import { drizzle, MySqlDatabase } from "drizzle-orm/mysql2";
import { AppEnvs } from "../read-env";
export interface IConnection<QR> {
  initialize(): Promise<void>;
  query: <T extends QR>(sql: string, values: any) => Promise<T>;
}

export interface IConnectionFactory<QR> {
  acquireConnection(): Promise<PoolConnection<QR>>;
  acquireTransactionConnection(): Promise<TransactionPoolConnection<QR>>;
}

export abstract class StandaloneConnection<QR> implements IConnection<QR> {
  //////---------->
  abstract initialize(): Promise<void>;
  abstract query<T extends QR>(sql: string, values: any): Promise<T>;
  abstract close(): Promise<void>;
}

export abstract class PoolConnection<QR> implements IConnection<QR> {
  abstract initialize(): Promise<void>;
  abstract query<T extends QR>(sql: string, values: any): Promise<T>;
  abstract release(): Promise<void>;
}

export abstract class TransactionConnection<QR> implements IConnection<QR> {
  abstract initialize(): Promise<void>;
  abstract query<T extends QR>(sql: string, values: any): Promise<T>;
  abstract close(): Promise<void>;
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
}

export abstract class TransactionPoolConnection<QR> implements IConnection<QR> {
  abstract initialize(): Promise<void>;
  abstract query<T extends QR>(sql: string, values: any): Promise<T>;
  abstract release(): Promise<void>;
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
}

// -----XXXXX-----

export class MySqlStandaloneConnection extends StandaloneConnection<QueryResult> {
  private connection: mysql.Connection | undefined;
  constructor(private readonly connectionString: string) {
    super();
  }

  async initialize() {
    if (this.connection) return;
    this.connection = await mysql.createConnection(this.connectionString);
  }
  async query<T extends QueryResult>(sql: string, values: any): Promise<T> {
    if (!this.connection) {
      await this.initialize();
    }
    const [result] = await this.connection!.query<T>(sql, values);
    return result;
  }
  async close(): Promise<void> {
    if (!this.connection) return;
    return this.connection.end();
  }
}
export class MySqlPoolConnection extends PoolConnection<QueryResult> {
  private connection: mysql.PoolConnection | undefined;

  constructor(private readonly pool: mysql.Pool) {
    super();
  }

  async initialize() {
    if (this.connection) return;
    this.connection = await this.pool.getConnection();
  }

  async query<T extends QueryResult>(sql: string, values: any): Promise<T> {
    if (!this.connection) {
      await this.initialize();
    }
    const [result] = await this.connection!.query<T>(sql, values);
    return result;
  }

  async release(): Promise<void> {
    if (!this.connection) return;
    this.pool.releaseConnection(this.connection);
    this.connection = undefined;
  }
}
export class MySqlTransactionConnection extends TransactionConnection<QueryResult> {
  private connection: mysql.Connection | undefined;
  constructor(private readonly connectionString: string) {
    super();
  }

  async initialize(): Promise<void> {
    if (this.connection) return;
    this.connection = await mysql.createConnection(this.connectionString);
    await this.connection.beginTransaction();
  }
  async query<T extends mysql.QueryResult>(
    sql: string,
    values: any
  ): Promise<T> {
    if (!this.connection) {
      await this.initialize();
    }
    const [result] = await this.connection!.query<T>(sql, values);
    return result;
  }
  async close(): Promise<void> {
    if (!this.connection) return;
    return this.connection.end();
  }
  async commit(): Promise<void> {
    if (!this.connection) return;
    return this.connection.commit();
  }
  async rollback(): Promise<void> {
    if (!this.connection) return;
    return this.connection.rollback();
  }
}
export class MySqlTransactionPoolConnection extends TransactionPoolConnection<QueryResult> {
  private connection: mysql.PoolConnection | undefined;

  constructor(private readonly pool: mysql.Pool) {
    super();
  }

  async initialize() {
    if (this.connection) return;
    this.connection = await this.pool.getConnection();
    await this.connection.beginTransaction();
  }

  async query<T extends QueryResult>(sql: string, values: any): Promise<T> {
    if (!this.connection) {
      await this.initialize();
    }
    const [result] = await this.connection!.query<T>(sql, values);
    return result;
  }

  async commit(): Promise<void> {
    if (!this.connection) return;
    return this.connection.commit();
  }
  async rollback(): Promise<void> {
    if (!this.connection) return;
    return this.connection.rollback();
  }
  async release(): Promise<void> {
    if (!this.connection) return;
    this.pool.releaseConnection(this.connection);
    this.connection = undefined;
  }
}

export class MySqlConnectionPoolFactory
  implements IConnectionFactory<QueryResult>
{
  private pool: mysql.Pool | undefined;
  private readonly connectionString: string;
  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  async acquireStandAloneConnection(): Promise<
    StandaloneConnection<QueryResult>
  > {
    const standAloneConnection = new MySqlStandaloneConnection(
      this.connectionString
    );
    return standAloneConnection;
  }
  async acquireConnection(): Promise<PoolConnection<QueryResult>> {
    if (!this.pool && this.connectionString)
      this.pool = mysql.createPool(this.connectionString);

    const poolConnection = new MySqlPoolConnection(this.pool!);
    return poolConnection;
  }

  async acquireStandAloneTransactionConnection(): Promise<
    TransactionConnection<QueryResult>
  > {
    const txnConnection = new MySqlTransactionConnection(this.connectionString);
    return txnConnection;
  }
  async acquireTransactionConnection(): Promise<
    TransactionPoolConnection<QueryResult>
  > {
    if (!this.pool && this.connectionString)
      this.pool = mysql.createPool(this.connectionString);
    const txnPoolConnection = new MySqlTransactionPoolConnection(this.pool!);
    return txnPoolConnection;
  }
  async shutdown(): Promise<void> {
    this.pool?.end();
  }
  async drizzleConnection(): Promise<MySqlDatabase<any, any, any, any>> {
    const pool = mysql.createPool(AppEnvs.DATABASE_URL);
    const db = drizzle(pool);
    return db;
  }
}
