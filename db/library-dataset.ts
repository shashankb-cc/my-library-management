import { IBook } from "../book-management/models/books.model";
import { IMember } from "../member-management/models/member.model";

export interface LibraryDataset {
  books: IBook[];
  members: IMember[];
}
