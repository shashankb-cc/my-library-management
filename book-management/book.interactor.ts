import { readLine } from "../core/input.utils";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { IPageRequest } from "../core/pagination";
import { Database } from "../db/ds";
import { BookRepository } from "./book.repository";
import { IBook, IBookBase } from "./models/books.model";
const menu = new Menu("Book-Management", [
  { key: "1", label: "Add Book" },
  { key: "2", label: "Edit Book" },
  { key: "3", label: "Search Book" },
  { key: "4", label: "List Books" },
  { key: "5", label: "Delete Book" },
  { key: "6", label: "<Previous Menu>" },
]);
export class BookInteractor implements IInteractor {
  constructor(
    public libraryInteractor: IInteractor,
    private db: Database
  ) {}
  private repo = new BookRepository(this.db);
  async showMenu(): Promise<void> {
    let loop = true;
    while (loop) {
      const op = await menu.show();
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
          case "5":
            deleteBook(this.repo);
            break;
          case "5":
            this.libraryInteractor.showMenu();
            break;
          case "6":
            loop = false;
            break;

          default:
            break;
        }
      } else {
        console.log("Invalid Option");
      }
    }
  }
}
async function getBookInput() {
  const title = await readLine("Please Enter the Title:");
  const author = await readLine("Please Enter the Author:");
  const publisher = await readLine("Please Enter the Publisher:");
  const genre = await readLine("Please Enter the Genre:");
  const isbnNo = await readLine("Please Enter the ISBN:");
  const numOfPages = await readLine("Please Enter the Number of Pages:");
  const totalNumOfCopies = await readLine(
    "Please Enter the Total Number of Copies:"
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
  const title =
    (await readLine(`Please Enter the Title (${CurrentBook.title}) : `)) ||
    CurrentBook.title;

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
  const book: IBookBase = await getBookInput();
  const createdBook = repo.create(book);
  console.log(`Book added successfully!\nBook ID:${createdBook.id}`);
  console.table(createdBook);
}

async function updateBook(repo: BookRepository) {
  const bookId: number = +(await readLine("Please Enter the Book ID:"));
  const CurrentBook: IBook | null = repo.getById(bookId);
  if (!CurrentBook) {
    await readLine("Please Enter valid Book Id");
    return;
  }
  const book: IBookBase = await getBookInputToUpdate(CurrentBook);
  const updatedBook = repo.update(bookId, book);
  console.table(updatedBook);
}

async function searchBook(repo: BookRepository): Promise<IBook> {
  while (true) {
    const id = +(await readLine("Please Enter the Book Id:"));
    const book = repo.getById(id);
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
  const book = repo.getById(id);
  if (!book) {
    console.log("---------------------Note------------------------");
    console.log("\nNo Book found!!  Please Enter Valid Book ID!!!\n");
    console.log("--------------------------------------------------");
  } else {
    repo.delete(id);
    console.log(`Book with a Id ${id} deleted successfully\n`);
  }
}
