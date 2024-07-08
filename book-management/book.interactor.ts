import { ZodError } from "zod";
import { NumberParser, readLine, StringParser } from "../core/input.utils";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { Database } from "../db/ds";
import { BookRepository } from "./book.repository";
import { IBook, IBookBase, bookSchema } from "./models/books.model";
import chalk from "chalk";
import { LibraryInteractor } from "../src/library.interactor";
import { LibraryDataset } from "../db/library-dataset";
import { viewCompleteList } from "../core/pagination";

export class BookInteractor implements IInteractor {
  menu = new Menu("Book-Management", [
    { key: "1", label: "Add Book" },
    { key: "2", label: "Edit Book" },
    { key: "3", label: "Search Book" },
    { key: "4", label: "List Books" },
    { key: "5", label: "Delete Book" },
    { key: "6", label: chalk.yellow("<Previous Menu>") },
  ]);
  constructor(
    public libraryInteractor: LibraryInteractor,
    private readonly db: Database<LibraryDataset>
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
            await listOfBooks(this.repo);
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
        console.log(
          chalk.bold.red("\nInvalid option, Please Enter valid option\n")
        );
      }
    }
  }
}
async function getBookInput(book?: IBook) {
  const title =
    (await readLine(
      `Please Enter the Title ${book?.title ?? ""} :`,
      StringParser(true, !!book)
    )) || book?.title;
  const author =
    (await readLine(
      `Please Enter the Author ${book?.author ?? ""} : `,
      StringParser(true, !!book)
    )) || book?.author;

  const publisher =
    (await readLine(
      `Please Enter the Publisher: ${book?.publisher ?? ""} : `,
      StringParser(true, !!book)
    )) || book?.publisher;
  const genre =
    (await readLine(
      `Please Enter the Genre ${book?.genre ?? ""} : `,
      StringParser(true, !!book)
    )) || book?.genre;

  const isbnNo =
    (await readLine(
      `Please Enter the ISBN: ${book?.isbnNo ?? ""} : `,
      StringParser(true, !!book)
    )) || book?.isbnNo;
  const numOfPages =
    (await readLine(
      `Please Enter the Number of Pages: ${book?.isbnNo ?? ""} : `,
      NumberParser(!!book)
    )) || book?.numOfPages;
  let totalNumOfCopies = book?.totalNumOfCopies;
  if (!totalNumOfCopies) {
    totalNumOfCopies = (await readLine(
      `Please Enter the Total Number of Copies:  `,
      NumberParser()
    ))!;
  }
  return {
    title: title!,
    author: author!,
    publisher: publisher!,
    genre: genre!,
    isbnNo: isbnNo!,
    numOfPages: numOfPages!,
    totalNumOfCopies: totalNumOfCopies!,
  };
}

async function addBook(repo: BookRepository) {
  while (true) {
    try {
      const book: IBookBase = await getBookInput();
      const validatedBook = bookSchema.parse(book);
      const createdBook = await repo.create(validatedBook);
      chalk.green(
        console.log(`Book added successfully!\nBook ID:${createdBook.id}`)
      );
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
    const bookId: number | null = await readLine(
      "Please Enter the Book ID : ",
      NumberParser()
    );
    const CurrentBook: IBook | null = await repo.getById(bookId!);
    if (!CurrentBook) {
      await readLine("Please Enter valid Book Id", NumberParser());
      continue;
    } else {
      loop = false;
      const book: IBookBase = await getBookInput(CurrentBook);
      const updatedBook = await repo.update(bookId!, book);
      console.table(updatedBook);
    }
  }
}

async function searchBook(repo: BookRepository): Promise<IBook | null> {
  while (true) {
    const id = await readLine("Please Enter the Book Id:", NumberParser());
    const book = await repo.getById(id!);
    if (!book) {
      console.log(
        chalk.bold.red("\nNo Book found!!  Please Enter Valid Book ID!!!\n")
      );
      continue;
    } else {
      console.table(book);
      return book;
    }
  }
}

async function deleteBook(repo: BookRepository) {
  const id = await readLine("Please Enter the Book Id:", NumberParser());
  const book = await repo.getById(id!);
  if (!book) {
    console.log(
      chalk.bold.red("\nNo Book found!!  Please Enter Valid Book ID!!!\n")
    );
  } else {
    repo.delete(id!);
    console.log(
      chalk.bold.green(`Book with a Id ${id} deleted successfully\n`)
    );
  }
}

async function listOfBooks(this: any, repo: BookRepository) {
  const search = await readLine(
    "\nPlease Enter the Search Text (You can search by title or ISBN number ):",
    StringParser(true, true)
  );
  const offset =
    (await readLine(
      "Please enter the search offset value (this determines where to start the search from, e.g., 1 for the beginning):",
      NumberParser(true)
    ))! || 0;
  const limit =
    (await readLine(
      "Please enter the search limit value (this determines the number of results to return):",
      NumberParser(true)
    ))! || 10;

  const totalBooks = repo.getTotalCount();

  await viewCompleteList<IBookBase, IBook>(
    repo,
    offset,
    limit,
    totalBooks,
    search
  );
}
