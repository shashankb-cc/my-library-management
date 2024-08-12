import { IPageRequest, IPagesResponse } from "../../core/pagination";
import { IRepository } from "../../core/repository";
import { ITransaction, ITransactionBase } from "./models/transaction.model";
import { BookRepository } from "../book-management/book.repository";
import { MemberRepository } from "../member-management/member.repository";
import { MySql2Database } from "drizzle-orm/mysql2";
import { transactions } from "../drizzle/schema";
import { eq, count, or, like } from "drizzle-orm";
import { formatDate } from "../../core/formatdate";
import chalk from "chalk";

export class TransactionRepository
  implements IRepository<ITransactionBase, ITransaction>
{
  constructor(private db: MySql2Database<Record<string, never>>) {}

  bookRepo = new BookRepository(this.db);
  memberRepo = new MemberRepository(this.db);

  async create(data: ITransactionBase): Promise<ITransaction | void> {
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
      const transactionRecord = await this.db.transaction(async (txn) => {
        const [result] = await txn
          .insert(transactions)
          .values(transaction)
          .$returningId();

        if (result) {
          const [insertedTransaction] = await txn
            .select()
            .from(transactions)
            .where(eq(transactions.id, result.id));
          return insertedTransaction as ITransaction;
        }
      });
      return transactionRecord;
    } catch (error) {
      throw error;
    }
  }

  async update(transactionId: number): Promise<ITransaction | void> {
    try {
      await this.db.transaction(async (txn) => {
        await txn
          .update(transactions)
          .set({ Status: "Returned", returnDate: formatDate(new Date()) })
          .where(eq(transactions.id, transactionId));

        const [updatedTransaction] = await txn
          .select()
          .from(transactions)
          .where(eq(transactions.id, transactionId))
          .limit(1);

        if (updatedTransaction) {
          const transaction = updatedTransaction as ITransaction;
          const book = await this.bookRepo.getById(transaction.bookId);

          if (transaction.Status === "Returned" && book) {
            await this.bookRepo.update(book.id, {
              availableNumberOfCopies: book.availableNumberOfCopies + 1,
            });
          } else if (transaction.Status === "Issued" && book) {
            await this.bookRepo.update(book.id, {
              availableNumberOfCopies: book.availableNumberOfCopies - 1,
            });
          }

          return updatedTransaction as ITransaction;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(id: number): Promise<ITransaction | void> {
    try {
      const deletedTransaction = await this.getById(id);
      await this.db.transaction(async (txn) => {
        if (!deletedTransaction) {
          console.log(chalk.red("No Such Transaction to delete"));
          return;
        }

        await txn.delete(transactions).where(eq(transactions.id, id));

        return deletedTransaction;
      });
    } catch (error) {
      throw error;
    }
  }

  async list(
    params: IPageRequest
  ): Promise<IPagesResponse<ITransaction> | undefined> {
    try {
      const { limit, offset, search } = params;

      const searchFilter = search
        ? or(
            like(transactions.bookId, `%${search}%`),
            like(transactions.memberId, `%${search}%`)
          )
        : undefined;
      const totalCount = await this.getTotalCount();
      if (!totalCount) {
        console.log(
          chalk.red("You don't have any transactions in the database")
        );
        return;
      }
      const result = await this.db
        .select()
        .from(transactions)
        .where(searchFilter)
        .offset(offset)
        .limit(limit);
      if (result) {
        return {
          items: result as ITransaction[],
          pagination: { offset, limit, total: totalCount },
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getById(id: number): Promise<ITransaction | undefined> {
    try {
      const [result] = await this.db
        .select()
        .from(transactions)
        .where(eq(transactions.id, id))
        .limit(1);

      if (result) {
        return result as ITransaction;
      }
    } catch (error) {
      throw error;
    }
  }

  async getTotalCount(): Promise<number | undefined> {
    try {
      const [result] = await this.db
        .select({ value: count() })
        .from(transactions);

      if (result) {
        return result.value;
      }
    } catch (error) {
      throw error;
    }
  }
  async deleteAll(): Promise<number | void> {
    try {
      this.db.transaction(async (txn) => {
        const [result] = await txn.delete(transactions);
        if (result) {
          return result.affectedRows;
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
