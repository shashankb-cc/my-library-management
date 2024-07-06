import { IPageRequest, IPagesResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { Database } from "../db/ds";
import { LibraryDataset } from "../db/library-dataset";
import { IBook, IBookBase } from "./models/books.model";

export class BookRepository implements IRepository<IBookBase, IBook> {
  constructor(private db: Database<LibraryDataset>) {}
  private get books(): IBook[] {
    return this.db.table("books");
  }
  async create(data: IBookBase): Promise<IBook> {
    const book: IBook = {
      ...data,
      id: this.books.length + 1,
      availableNumberOfCopies: data.totalNumOfCopies,
    };

    this.books.push(book);
    await this.db.save();
    return book;
  }

  async update(id: number, data: IBookBase): Promise<IBook | null> {
    const book = this.books.find((book) => book.id === id);
    if (book) {
      book.title = data.title;
      book.author = data.author;
      book.isbnNo = data.isbnNo;
      book.numOfPages = data.numOfPages;
      book.publisher = data.publisher;
      book.totalNumOfCopies = data.totalNumOfCopies;
      book.genre = data.genre;
      this.db.save();
      return this.getById(id);
    }
    return null;
  }

  async delete(id: number): Promise<IBook | null> {
    const index = this.books.findIndex((book) => book.id === id);
    if (index === -1) return null;
    const deletedBook = this.books.splice(index, 1);
    this.db.save();
    return deletedBook[0];
  }

  async getById(id: number): Promise<IBook | null> {
    const book = this.books.find((b) => b.id === id);
    return book || null;
  }

  list(params: IPageRequest): IPagesResponse<IBook> {
    const search = params.search?.toLocaleLowerCase();
    const filteredBooks = search
      ? this.books.filter(
          (b) =>
            b.title.toLowerCase().includes(search) ||
            b.isbnNo.toLowerCase().includes(search)
        )
      : this.books;
    return {
      items: filteredBooks.slice(params.offset, params.offset + params.limit),
      pagination: {
        offset: params.offset,
        limit: params.limit,
        total: filteredBooks.length,
      },
    };
  }

  async deleteAll() {
    this.books.length = 0; 
    await this.db.save();
  }
}
