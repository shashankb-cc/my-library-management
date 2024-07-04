import { ZodError } from "zod";
import { editableReadLine, readLine } from "../core/input.utils";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { IPageRequest } from "../core/pagination";
import { Database } from "../db/ds";
import { BookRepository } from "./book.repository";
import { IBook, IBookBase, bookSchema } from "./models/books.model";
import chalk from "chalk";
import { LibraryInteractor } from "../src/library.interactor";

export class BookInteractor implements IInteractor {
  menu = new Menu("Book-Management", [
    { key: "1", label: "Add Book" },
    { key: "2", label: "Edit Book" },
    { key: "3", label: "Search Book" },
    { key: "4", label: "List Books" },
    { key: "5", label: "Delete Book" },
    { key: "6", label: "<Previous Menu>" },
  ]);
  constructor(
    public libraryInteractor: LibraryInteractor,
    private readonly db: Database
  ) {}
  private repo = new BookRepository(this.db);
  async showMenu(): Promise<void> {
    while (true) {
      const op = await this.menu.show();
      if (op) {
        switch (op?.key.toLocaleLowerCase()) {
          case "1":
            await addBook(this.repo);
            break;
          case "2":
            await updateBook(this.repo);
            break;
          case "3":
            await searchBook(this.repo);
            break;
          case "4":
            await listBooks(this.repo);
            break;
          case "5":
            await deleteBook(this.repo);
            break;
          case "6":
            await this.libraryInteractor.showMenu();
          default:
            break;
        }
      } else {
        console.log("-----------------");
        console.log("| Invalid option |");
        console.log("-----------------");
      }
    }
  }
}
async function getBookInput() {
  const title = await readLine("Please Enter the Title: ");
  const author = await readLine("Please Enter the Author: ");
  const publisher = await readLine("Please Enter the Publisher: ");
  const genre = await readLine("Please Enter the Genre: ");
  const isbnNo = await readLine("Please Enter the ISBN: ");
  const numOfPages = await readLine("Please Enter the Number of Pages: ");
  const totalNumOfCopies = await readLine(
    "Please Enter the Total Number of Copies: "
  );
  return {
    title: title,
    author: author,
    publisher: publisher,
    genre: genre,
    isbnNo: isbnNo,
    numOfPages: +numOfPages,
    totalNumOfCopies: +totalNumOfCopies,
  };
}

async function getBookInputToUpdate(CurrentBook: IBook) {
  await readLine(`Please Enter the Title  : `);
  const title =
    (await editableReadLine(CurrentBook.title)) || CurrentBook.title;
  const author =
    (await readLine(`Please Enter the Author (${CurrentBook.author}) : `)) ||
    CurrentBook.author;
  const publisher =
    (await readLine(
      `Please Enter the Publisher (${CurrentBook.publisher}) : `
    )) || CurrentBook.publisher;
  const genre =
    (await readLine(`Please Enter the Genre (${CurrentBook.genre}) : `)) ||
    CurrentBook.genre;
  const isbnNo =
    (await readLine(`Please Enter the ISBN (${CurrentBook.isbnNo}) : `)) ||
    CurrentBook.isbnNo;
  const numOfPages =
    (await readLine(
      `Please Enter the Number of Pages (${CurrentBook.numOfPages}) : `
    )) || CurrentBook.numOfPages;
  const totalNumOfCopies =
    (await readLine(
      `Please Enter the Total Number of Copies (${CurrentBook.totalNumOfCopies}) : `
    )) || CurrentBook.totalNumOfCopies;

  return {
    title: title,
    author: author,
    publisher: publisher,
    genre: genre,
    isbnNo: isbnNo,
    numOfPages: +numOfPages,
    totalNumOfCopies: +totalNumOfCopies,
  };
}

async function addBook(repo: BookRepository) {
  while (true) {
    try {
      const book: IBookBase = await getBookInput();
      const validatedBook = bookSchema.parse(book);
      const createdBook = await repo.create(validatedBook);
      console.log(`Book added successfully!\nBook ID:${createdBook.id}`);
      console.table(createdBook);
      break;
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        console.log(
          chalk.red("\nData is invalid! Please enter the valid data")
        );
        const errors = error.flatten().fieldErrors;
        Object.entries(errors).forEach((e) => {
          console.log(`${e[0]}: ${chalk.red(e[1])}`);
        });
      }
    }
  }
}

async function updateBook(repo: BookRepository) {
  let loop = true;
  while (loop) {
    const bookId: number = +(await readLine("Please Enter the Book ID:"));
    const CurrentBook: IBook | null = await repo.getById(bookId);
    if (!CurrentBook) {
      await readLine("Please Enter valid Book Id");
    } else {
      loop = false;
      const book: IBookBase = await getBookInputToUpdate(CurrentBook);
      const updatedBook = repo.update(bookId, book);
      console.table(updatedBook);
    }
  }
}

async function searchBook(repo: BookRepository): Promise<IBook | null> {
  while (true) {
    const id = +(await readLine("Please Enter the Book Id:"));
    const book = await repo.getById(id);
    if (!book) {
      console.log("---------------------Note------------------------");
      console.log("\nNo Book found!!  Please Enter Valid Book ID!!!\n");
      console.log("-------------------------------------------------");
      continue;
    } else {
      console.table(book);
      return book;
    }
  }
}

async function listBooks(repo: BookRepository) {
  const param = await readLine(
    "\nPlease Enter the Search (You can search by ISBN and Title):"
  );
  const offset = +(await readLine(
    "Please enter the search offset value (this determines where to start the search from, e.g., 0 for the beginning):"
  ));
  const limit = +(await readLine(
    "Please enter the search limit value (this determines the number of results to return):"
  ));
  const params: IPageRequest = {
    search: param,
    offset,
    limit,
  };
  const booksList = repo.list(params);
  console.table(booksList.items);
}
async function deleteBook(repo: BookRepository) {
  const id = +(await readLine("Please Enter the Book Id:"));
  const book = await repo.getById(id);
  if (!book) {
    console.log("---------------------Note------------------------");
    console.log("\nNo Book found!!  Please Enter Valid Book ID!!!\n");
    console.log("--------------------------------------------------");
  } else {
    repo.delete(id);
    console.log(`Book with a Id ${id} deleted successfully\n`);
  }
}
