import { RowDataPacket } from "mysql2";
import {
  generateCountSql,
  generateDeleteSql,
  generateInsertSql,
  generateSelectSql,
  generateUpdateSql,
} from "../libs/mysql-query-generator.";
import { WhereExpression } from "../libs/types";
import { DBConfig, MySQLAdapter } from "./mysql-db";
import { LibraryDataset } from "./library-dataset";
import mysql from "mysql2/promise";
import { MySqlConnectionPoolFactory } from "./mysql-adapter";


export class LibraryDB {
  mySQLAdapter: MySQLAdapter | null = null;
  // poolConnection: mysql.PoolConnection;
  constructor(private readonly config: DBConfig) {
    this.mySQLAdapter = new MySQLAdapter(this.config);
    // this.poolConnection = new MySqlConnectionPoolFactory(this.config.dbURL);
  }

  async insert<ReturnType, CompleteModel>(
    data: CompleteModel,
    tableName: keyof LibraryDataset
  ): Promise<ReturnType | undefined> {
    try {
      const insertQuery = generateInsertSql<CompleteModel>(tableName, data);
      const result = await this.mySQLAdapter?.runQuery<ReturnType>(
        insertQuery.sql,
        insertQuery.data
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  async update<ReturnType, CompleteModel>(
    data: Partial<CompleteModel>,
    tableName: keyof LibraryDataset,
    whereExpression: WhereExpression<CompleteModel>
  ): Promise<ReturnType | undefined> {
    try {
      const updateQuery = generateUpdateSql<CompleteModel>(
        tableName,
        data,
        whereExpression
      );
      const result = await this.mySQLAdapter?.runQuery<ReturnType>(
        updateQuery.sql,
        updateQuery.data
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  async select<ReturnType, CompleteModel>(
    tableName: keyof LibraryDataset,
    whereExpression: WhereExpression<CompleteModel>,
    offset?: number,
    limit?: number,
    fields?: Partial<keyof CompleteModel>[]
  ): Promise<ReturnType | undefined> {
    try {
      const selectQuery = generateSelectSql<CompleteModel>(
        tableName,
        whereExpression,
        offset,
        limit,
        fields
      );
      const result = await this.mySQLAdapter?.runQuery<ReturnType>(
        selectQuery.sql,
        selectQuery.data
      );
      console.log(result);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async deleteRecord<ReturnType, CompleteModel>(
    tableName: keyof LibraryDataset,
    whereExpression: WhereExpression<CompleteModel>
  ): Promise<ReturnType | undefined> {
    try {
      const deleteQuery = generateDeleteSql<CompleteModel>(
        tableName,
        whereExpression
      );
      const result = await this.mySQLAdapter?.runQuery<ReturnType>(
        deleteQuery.sql,
        deleteQuery.data
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  async count<CompleteModel>(
    tableName: keyof LibraryDataset,
    where: WhereExpression<CompleteModel>,
    columnName?: keyof CompleteModel,
    columnNameAlias?: string
  ): Promise<number | undefined> {
    try {
      const countQuery = generateCountSql(tableName, where, columnName);
      const result = await this.mySQLAdapter?.runQuery<RowDataPacket[]>(
        countQuery.sql,
        countQuery.data
      );
      if (result) return result[0][columnNameAlias ?? "COUNT(*)"] as number;
    } catch (err) {
      throw err;
    }
  }
}
