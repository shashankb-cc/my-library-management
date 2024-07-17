// SQL DB layer must facilitate a mechanism
// to connect with the required data base server
//this will require url, post, user name, password.
//It should provide an API to execute a sql query

//Interaction will talk to this db layer to run their queries
//and get the result . before they can talk at the global level the db
//layer should have been initialized. In our case library interactor for
//example, can supply necessary DB configurations that db layer expects
//and initialized it.
import { da } from "@faker-js/faker";
import mysql from "mysql2/promise";
/**
 * THis config object must be passed to create the SQL DB manager
 */
export interface DBConfig {
  dbURL: string;
}
interface Adapter {
  shutdown: () => Promise<void>;
  runQuery: <T>(sql: string, data: any[]) => Promise<T | undefined>;
}
export class MySQLAdapter implements Adapter {
  private pool: mysql.Pool;
  private loaded: boolean = false;
  constructor(private readonly config: DBConfig) {
    this.pool = mysql.createPool(this.config.dbURL);
  }
  /**
   *
   * @returns this will not allow the new connection but waits already connected connection to complete their operations
   */
  async load() {
    try {
      const connection = await this.pool.getConnection();
      this.pool.releaseConnection(connection);
      this.loaded = true;
    } catch (err) {
      if (err instanceof Error) throw new Error(err.message);
    }
  }
  isLoaded(): boolean {
    return this.loaded;
  }
  shutdown() {
    return this.pool.end();
  }
  async runQuery<T>(sql: string, data: any[]): Promise<T | undefined> {
    let connection: mysql.PoolConnection | null = null;
    try {
      const connection = await this.pool.getConnection();
      const [result] = await connection.query(sql, data);
      return result as T;
    } catch (err) {
      if (err instanceof Error) throw new Error(err.message);
    } finally {
      if (connection) {
        this.pool.releaseConnection(connection);
      }
    }
  }
}
