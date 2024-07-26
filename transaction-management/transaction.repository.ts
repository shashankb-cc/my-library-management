import { IPageRequest, IPagesResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { ITransaction, ITransactionBase } from "./models/transaction.model";
import { BookRepository } from "../book-management/book.repository";
import { MemberRepository } from "../member-management/member.repository";
import { MySql2Database } from "drizzle-orm/mysql2";
import { transactions } from "../src/drizzle/schema";
import { eq, count, or, like } from "drizzle-orm";
import { formatDate } from "../core/formatdate";
import chalk from "chalk";
import { log } from "console";

export class TransactionRepository
  implements IRepository<ITransactionBase, ITransaction>
{
  constructor(private db: MySql2Database<Record<string, never>>) {}

  bookRepo = new BookRepository(this.db);
  memberRepo = new MemberRepository(this.db);

  async create(data: ITransactionBase): Promise<ITransaction | undefined> {
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

      const [result] = await this.db
        .insert(transactions)
        .values({
          ...data,
          bookId: BigInt(data.bookId),
          memberId: BigInt(data.memberId),
          issueDate: formatDate(currentDate),
          dueDate: formatDate(dueDate),
          returnDate: null,
          Status: "Issued",
        })
        .$returningId();

      if (result) {
        const insertedTransaction = await this.db
          .select()
          .from(transactions)
          .where(eq(transactions.id, result.id));

        return insertedTransaction as unknown as ITransaction;
      }
    } catch (error) {
      throw error;
    }
  }

  async update(transactionId: number): Promise<ITransaction | undefined> {
    try {
      await this.db
        .update(transactions)
        .set({ Status: "Returned", returnDate: formatDate(new Date()) })
        .where(eq(transactions.id, transactionId));

      const [updatedTransaction] = await this.db
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId))
        .limit(1);

      if (updatedTransaction) {
        const transaction = updatedTransaction as unknown as ITransaction;
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

        return updatedTransaction as unknown as ITransaction;
      }
    } catch (error) {
      throw error;
    }
  }

  async delete(id: number): Promise<ITransaction | undefined> {
    try {
      const deletedTransaction = await this.getById(id);

      if (!deletedTransaction) {
        console.log(chalk.red("No Such Transaction to delete"));
        return undefined;
      }

      await this.db.delete(transactions).where(eq(transactions.id, id));

      return deletedTransaction;
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
          items: result as unknown as ITransaction[],
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
        return result as unknown as ITransaction;
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
  async deleteAll(): Promise<number | undefined> {
    try {
      const [result] = await this.db.delete(transactions);
      if (result) {
        return result.affectedRows;
      }
    } catch (error) {
      throw error;
    }
  }
}
