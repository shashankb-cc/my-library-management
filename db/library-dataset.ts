import { IBook } from "../src/book-management/models/books.model";
import { IMember } from "../src/member-management/models/member.model";
import { ITransaction } from "../src/transaction-management/models/transaction.model";

export interface LibraryDataset {
  books: IBook[];
  members: IMember[];
  transactions: ITransaction[];
}
