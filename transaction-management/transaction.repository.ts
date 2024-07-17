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
import { ITransaction, ITransactionBase } from "./models/transaction.model";
import { BookRepository } from "../book-management/book.repository";
import { formatDate } from "../core/formatdate";
import { MySqlConnectionPoolFactory } from "../db/mysql-adapter";
import { MemberRepository } from "../member-management/member.repository";

export class TransactionRepository
  implements IRepository<ITransactionBase, ITransaction>
{
  poolConnectionFactory: any;
  constructor(private poolFactory: MySqlConnectionPoolFactory) {}
  bookRepo = new BookRepository(this.poolFactory);
  memberRepo = new MemberRepository(this.poolFactory);
  async create(data: ITransactionBase): Promise<ITransaction | undefined> {
    let connection;
    try {
      const currentDate = new Date();
      const dueDays = 7;
      const dueDate = new Date(currentDate);
      dueDate.setDate(currentDate.getDate() + dueDays);

      const transaction: Omit<ITransaction, "id"> = {
        ...data,
        issueDate: formatDate(currentDate),
        dueDate: formatDate(dueDate),
        returnDate: null,
        Status: "Issued",
      };
      const insertQuery = generateInsertSql<Omit<ITransaction, "id">>(
        "transactions",
        transaction
      );
      console.group(insertQuery);
      connection = await this.poolFactory.acquireTransactionConnection();
      connection.initialize();
      const result = await connection?.query<ResultSetHeader>(
        insertQuery.sql,
        insertQuery.data
      );
      await connection.commit();
      if (result) {
        const insertedTransactionId = result.insertId;
        const insertedTransaction = await this.getById(insertedTransactionId);
        return insertedTransaction as ITransaction;
      }
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }
  async update(transactionId: number): Promise<ITransaction | undefined> {
    const connection = await this.poolFactory.acquireTransactionConnection();
    try {
      await connection.initialize();
      const transaction = await this.getById(transactionId);
      if (transaction) {
        const book = await this.bookRepo.getById(transaction.bookId);
        if (transaction.Status === "Returned" && book) {
          await this.bookRepo.update(book.id, {
            availableNumberOfCopies: book.availableNumberOfCopies++,
          });
        } else if (transaction.Status === "Issued" && book) {
          await this.bookRepo.update(book.id, {
            availableNumberOfCopies: book.availableNumberOfCopies--,
          });
        }
        if (book) {
          const updateQuery = generateUpdateSql<Partial<ITransaction>>(
            "transactions",
            {
              Status: transaction.Status === "Issued" ? "Returned" : "Issued",
              returnDate: formatDate(new Date()),
            },
            { id: { value: transactionId, op: "EQUALS" } }
          );
          await connection.query<ResultSetHeader>(
            updateQuery.sql,
            updateQuery.data
          );
          await this.bookRepo.update(transaction.bookId, book);
          const updatedTransaction = await this.getById(transactionId);
          await connection.commit();
          return updatedTransaction;
        }
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async delete(id: number): Promise<ITransaction | undefined> {
    let connection;
    try {
      const deletedTransaction = await this.getById(id);
      const deleteQuery = generateDeleteSql<ITransaction>("transactions", {
        id: { value: id, op: "EQUALS" },
      });
      connection = await this.poolFactory.acquireTransactionConnection();
      const result = await connection.query<ResultSetHeader>(
        deleteQuery.sql,
        deleteQuery.data
      );
      if (result && result.affectedRows > 0) {
        await connection.commit();
        return deletedTransaction as ITransaction;
      }
    } catch (error) {
      await connection?.rollback();
      throw error;
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  async list(
    params: IPageRequest
  ): Promise<IPagesResponse<ITransaction> | undefined> {
    let connection;
    try {
      const { limit, offset, search } = params;
      const searchFilter: WhereExpression<ITransaction> = search
        ? {
            OR: [
              { bookId: { value: search, op: "CONTAINS" } },
              { memberId: { value: search, op: "CONTAINS" } },
            ],
          }
        : {};

      const totalCount = await this.getTotalCount(searchFilter);
      if (!totalCount) throw new Error("Could not fetch the count");

      const selectQuery = generateSelectSql<ITransaction>(
        "transactions",
        searchFilter,
        offset,
        limit,
        []
      );
      connection = await this.poolFactory.acquireStandAloneConnection();
      const result = await connection.query<RowDataPacket[]>(
        selectQuery.sql,
        selectQuery.data
      );
      if (result) {
        return {
          items: result as ITransaction[],
          pagination: { offset, limit, total: totalCount },
        };
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  async deleteAll() {
    let connection;
    try {
      const deleteQuery = generateDeleteSql<ITransaction>("transactions", {});
      connection =
        await this.poolFactory.acquireStandAloneTransactionConnection();
      const result = await connection.query<ResultSetHeader>(
        deleteQuery.sql,
        deleteQuery.data
      );
      if (result && result.affectedRows > 0) {
        await connection.commit();
        return result.affectedRows;
      }
    } catch (error) {
      await connection?.rollback();
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getTotalCount(
    where: WhereExpression<ITransaction>
  ): Promise<number | undefined> {
    let connection;
    try {
      const countQuery = generateCountSql("transactions", where);
      connection = await this.poolFactory.acquireStandAloneConnection();
      const result = await connection.query<RowDataPacket[]>(
        countQuery.sql,
        countQuery.data
      );
      if (result) {
        return result[0]["COUNT(*)"] as number;
      }
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  async getById(id: number): Promise<ITransaction | undefined> {
    let connection;
    try {
      const selectQuery = generateSelectSql<ITransaction>(
        "transactions",
        { id: { value: id, op: "EQUALS" } },
        0,
        1,
        []
      );
      connection = await this.poolFactory.acquireStandAloneConnection();
      connection.initialize();
      const result = await connection.query<RowDataPacket[]>(
        selectQuery.sql,
        selectQuery.data
      );
      if (result) return result[0] as ITransaction;
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  async getAllTransaction(): Promise<ITransaction[]> {
    const connection = await this.poolFactory.acquireStandAloneConnection();
    try {
      await connection.initialize();
      const totalTransactions = await this.getTotalCount({});
      const selectQuery = generateSelectSql<ITransaction>(
        "transactions",
        {},

        0,
        totalTransactions,
        []
      );
      const [result] = await connection.query<RowDataPacket[]>(
        selectQuery.sql,
        selectQuery.data
      );

      return result as ITransaction[];
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }
}
