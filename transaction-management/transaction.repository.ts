import { BookRepository } from "../book-management/book.repository";
import { formatDate } from "../core/formatdate";
import { IPageRequest, IPagesResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { Database } from "../db/ds";
import { LibraryDataset } from "../db/library-dataset";
import { MemberRepository } from "../member-management/member.repository";
import { ITransaction, ITransactionBase } from "./models/transaction.model";

export class TransactionRepository
  implements IRepository<ITransactionBase, ITransaction>
{
  constructor(private db: Database<LibraryDataset>) {}
  private get transactions(): ITransaction[] {
    return this.db.table("transactions");
  }
  bookRepo = new BookRepository(this.db);
  memberRepo = new MemberRepository(this.db);

  async create(data: ITransactionBase): Promise<ITransaction> {
    const currentDate = new Date();
    const dueDays = 7;
    const dueDate = new Date(currentDate);
    dueDate.setDate(currentDate.getDate() + dueDays);
    const transaction: ITransaction = {
      id: this.transactions.length + 1,
      ...data,
      issueDate: formatDate(currentDate),
      dueDate: formatDate(dueDate),
      returnDate: null,
      Status: "Issued",
    };
    this.transactions.push(transaction);
    await this.db.save();
    return transaction;
  }

  async update(id: number): Promise<ITransaction | null> {
    const transaction = this.transactions.find(
      (transaction) => transaction.id === id
    );
    if (transaction) {
      const book = await this.bookRepo.getById(transaction.bookId);
      if (transaction.Status === "Returned" && book) {
        book.availableNumberOfCopies++;
        transaction.returnDate = formatDate(new Date());
      } else if (transaction.Status === "Issued" && book) {
        book.availableNumberOfCopies--;
      }
      await this.db.save();
      return transaction;
    }
    return null;
  }

  async delete(id: number): Promise<ITransaction | null> {
    return null;
  }

  async getById(id: number): Promise<ITransaction | null> {
    const transaction = this.transactions.find(
      (transaction) => transaction.id === id
    );
    return transaction || null;
  }

  list(params: IPageRequest): IPagesResponse<ITransaction> {
    const search = params.search;

    function findExactMatch(ids: string[], search: string): boolean {
      const regex = new RegExp(`^${search}$`, "i");
      return ids.some((id) => regex.test(id));
    }

    const filterTransactions = search
      ? this.transactions.filter((transaction) =>
          findExactMatch(
            [transaction.bookId.toString(), transaction.memberId.toString()],
            search
          )
        )
      : this.transactions;
    return {
      items: filterTransactions.slice(
        params.offset,
        params.offset + params.limit
      ),
      pagination: {
        offset: params.offset,
        limit: params.limit,
        total: filterTransactions.length,
      },
    };
  }
  async deleteAll() {
    this.transactions.length = 0;
    await this.db.save();
  }

  getTotalCount() {
    return this.transactions.length;
  }
  getAllTransaction() {
    return this.transactions;
  }
}
