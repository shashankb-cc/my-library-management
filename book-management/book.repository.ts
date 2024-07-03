import { IPageRequest, IPagesResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { IBook, IBookBase } from "./models/books.model";

const books: IBook[] = [];

export class BookRepository implements IRepository<IBookBase, IBook> {
  create(data: IBookBase): IBook {
    //TODO:impl validation
    const book: IBook = {
      ...data,
      id: books.length + 1,
      availableNumberOfCopies: data.totalNumOfCopies,
    };
    books.push(book);
    return book;
  }

  update(id: number, data: IBookBase): IBook | null {
    const book = books.find((book) => book.id === id);
    if (book) {
      book.title = data.title;
      book.author = data.author;
      book.isbnNo = data.isbnNo;
      book.numOfPages = data.numOfPages;
      book.publisher = data.publisher;
      book.totalNumOfCopies = data.totalNumOfCopies;
      book.genre = data.genre;
      return book;
    }
    return null;
  }

  delete(id: number): IBook | null {
    const index = books.findIndex((book) => book.id === id);
    if (index === -1) return null;
    const deletedBook = books.splice(index, 1);
    return deletedBook[0];
  }

  getById(id: number): IBook | null {
    const book = books.find((b) => b.id === id);
    return book || null;
  }

  list(params: IPageRequest): IPagesResponse<IBook> {
    const search = params.search?.toLocaleLowerCase();
    const filteredBooks = search
      ? books.filter(
          (b) =>
            b.title.toLowerCase().includes(search) ||
            b.isbnNo.toLowerCase().includes(search)
        )
      : books; //.slice(params.offset, params.offset + params.limit);
    return {
      items: filteredBooks.slice(params.offset, params.offset + params.limit),
      pagination: {
        offset: params.offset,
        limit: params.limit,
        total: filteredBooks.length,
      },
    };
  }
}
