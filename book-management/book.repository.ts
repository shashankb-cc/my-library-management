import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  generateCountSql,
  generateDeleteSql,
  generateInsertSql,
  generateSelectSql,
  generateUpdateSql,
} from "../libs/mysql-query-generator.";
import { WhereExpression } from "../libs/types";
import { IPageRequest, IPagesResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { IBook, IBookBase } from "./models/books.model";
import { MySqlConnectionPoolFactory } from "../db/mysql-adapter";
import { DBConfig } from "../db/mysql-db";
import { AppEnvs } from "../read-env";

const config: DBConfig = {
  dbURL: AppEnvs.DATABASE_URL,
};

export class BookRepository implements IRepository<IBookBase, IBook> {
  constructor(private poolFactory: MySqlConnectionPoolFactory) {}

  async create(data: IBookBase): Promise<IBook | undefined> {
    let connection;
    try {
      const book: Omit<IBook, "id"> = {
        ...data,
        availableNumberOfCopies: data.totalNumOfCopies,
      };
      const insertQuery = generateInsertSql<Omit<IBook, "id">>("books", book);
      connection = await this.poolFactory.acquireConnection();
      connection.initialize();
      const result = await connection?.query<ResultSetHeader>(
        insertQuery.sql,
        insertQuery.data
      );
      if (result) {
        const insertedBookId = result.insertId;
        const insertedBook = await this.getById(insertedBookId);
        return insertedBook as IBook;
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async update(
    bookId: number,
    data: Partial<IBook>
  ): Promise<IBook | undefined> {
    let connection;
    try {
      const updateQuery = generateUpdateSql<IBook>("books", data, {
        id: { value: bookId, op: "EQUALS" },
      });
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<ResultSetHeader>(
        updateQuery.sql,
        updateQuery.data
      );
      if (result) {
        const updatedBook = await this.getById(bookId);
        return updatedBook as IBook;
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async delete(bookId: number): Promise<IBook | undefined> {
    let connection;
    try {
      const deletedBook = await this.getById(bookId);
      const deleteQuery = generateDeleteSql<IBook>("books", {
        id: { value: bookId, op: "EQUALS" },
      });
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<ResultSetHeader>(
        deleteQuery.sql,
        deleteQuery.data
      );
      if (result && result.affectedRows > 0) {
        return deletedBook as IBook;
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async list(params: IPageRequest): Promise<IPagesResponse<IBook> | undefined> {
    let connection;
    try {
      const { limit, offset, search } = params;
      const searchFilter: WhereExpression<IBook> = search
        ? {
            OR: [
              { title: { value: search, op: "CONTAINS" } },
              { isbnNo: { value: search, op: "CONTAINS" } },
            ],
          }
        : {};

      const totalCount = await this.getTotalCount(searchFilter);
      if (!totalCount) throw new Error("Could not fetch the count");

      const selectQuery = generateSelectSql<IBook>(
        "books",
        searchFilter,
        offset,
        limit,
        []
      );
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<RowDataPacket[]>(
        selectQuery.sql,
        selectQuery.data
      );
      if (result) {
        return {
          items: result as IBook[],
          pagination: { offset, limit, total: totalCount },
        };
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async deleteAll() {
    let connection;
    try {
      const deleteQuery = generateDeleteSql<IBook>("books", {});
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<ResultSetHeader>(
        deleteQuery.sql,
        deleteQuery.data
      );
      if (result && result.affectedRows > 0) {
        return result.affectedRows;
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async getTotalCount(
    where: WhereExpression<IBook>
  ): Promise<number | undefined> {
    let connection;
    try {
      const countQuery = generateCountSql("books", where);
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<RowDataPacket[]>(
        countQuery.sql,
        countQuery.data
      );
      if (result) return result[0]["COUNT(*)"] as number;
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async getById(bookId: number): Promise<IBook | undefined> {
    let connection;
    try {
      const selectQuery = generateSelectSql<IBook>(
        "books",
        { id: { value: bookId, op: "EQUALS" } },
        0,
        1,
        []
      );
      connection = await this.poolFactory.acquireConnection();
      const result = await connection.query<RowDataPacket[]>(
        selectQuery.sql,
        selectQuery.data
      );
      if (result) return result[0] as IBook;
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }
}
