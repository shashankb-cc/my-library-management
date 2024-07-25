import { IPageRequest, IPagesResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { IBook, IBookBase } from "./models/books.model";
import { MySqlConnectionPoolFactory } from "../db/mysql-adapter";
import { DBConfig } from "../db/mysql-db";
import { AppEnvs } from "../read-env";
import { MySql2Database } from "drizzle-orm/mysql2";
import { books } from "../src/drizzle/schema";
import { eq, count, SQL, or, like } from "drizzle-orm";

import chalk from "chalk";

export class BookRepository implements IRepository<IBookBase, IBook> {
  constructor(private db: MySql2Database<Record<string, never>>) {}

  async create(data: IBookBase): Promise<IBook | undefined> {
    let connection;
    try {
      const book: Omit<IBook, "id"> = {
        ...data,
        availableNumberOfCopies: data.totalNumOfCopies,
      };
      const [result] = await this.db
        .insert(books)
        .values({
          ...data,
          availableNumberOfCopies: data.totalNumOfCopies,
        })
        .$returningId();
      if (result) {
        const insertedBook = await this.db
          .select()
          .from(books)
          .where(eq(books.id, result.id));
        return insertedBook as unknown as IBook;
      }
    } catch (error) {
      throw error;
    }
  }
  async update(
    bookId: number,
    data: Partial<IBook>
  ): Promise<IBook | undefined> {
    try {
      await this.db.update(books).set(data).where(eq(books.id, bookId));

      const [updatedBook] = await this.db
        .select()
        .from(books)
        .where(eq(books.id, bookId))
        .limit(1);
      if (updatedBook) {
        return updatedBook as IBook;
      }
    } catch (error) {
      throw error;
    }
  }
  async delete(bookId: number): Promise<IBook | undefined> {
    try {
      const deletedBook = await this.getById(bookId);

      if (!deletedBook) {
        console.log(chalk.red("No Such Book to delete"));
        return undefined;
      }

      await this.db.delete(books).where(eq(books.id, bookId));

      return deletedBook;
    } catch (error) {
      throw error;
    }
  }
  async list(params: IPageRequest): Promise<IPagesResponse<IBook> | undefined> {
    try {
      const { limit, offset, search } = params;
      const searchFilter = search
        ? or(
            like(books.title, `%${search}%`),
            like(books.isbnNo, `%${search}%`)
          )
        : undefined;

      const totalCount = await this.getTotalCount();
      if (!totalCount) throw new Error("Could not fetch the count");

      const result = await this.db
        .select()
        .from(books)
        .where(searchFilter)
        .offset(offset)
        .limit(limit);

      if (result) {
        return {
          items: result as IBook[],
          pagination: { offset, limit, total: totalCount },
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getById(bookId: number): Promise<IBook | undefined> {
    try {
      const [result] = await this.db
        .select()
        .from(books)
        .where(eq(books.id, bookId))
        .limit(1);

      if (result) {
        return result as IBook;
      }
    } catch (error) {
      throw error;
    }
  }
  async getTotalCount(): Promise<number | undefined> {
    try {
      const [result] = await this.db.select({ value: count() }).from(books);

      if (result) {
        return result.value;
      }
    } catch (error) {
      throw error;
    }
  }
}
