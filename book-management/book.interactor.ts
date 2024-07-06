import { number, optional, ZodError } from "zod";
import {
  NumberParser,
  readChar,
  readLine,
  StringParser,
} from "../core/input.utils";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { IPageRequest } from "../core/pagination";
import { Database } from "../db/ds";
import { BookRepository } from "./book.repository";
import { IBook, IBookBase, bookSchema } from "./models/books.model";
import chalk from "chalk";
import { LibraryInteractor } from "../src/library.interactor";
import { LibraryDataset } from "../db/library-dataset";
import { Console } from "console";

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
            await viewCompleteList(this.repo);
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
      `Please Enter the Genre: ${book?.genre ?? ""} `,
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
    const bookId: number | null = await readLine(
      "Please Enter the Book ID:",
      NumberParser()
    );
    const CurrentBook: IBook | null = await repo.getById(bookId!);
    console.table(CurrentBook);

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

async function deleteBook(repo: BookRepository) {
  const id = await readLine("Please Enter the Book Id:", NumberParser());
  const book = await repo.getById(id!);
  if (!book) {
    console.log("---------------------Note------------------------");
    console.log("\nNo Book found!!  Please Enter Valid Book ID!!!\n");
    console.log("--------------------------------------------------");
  } else {
    repo.delete(id!);
    console.log(`Book with a Id ${id} deleted successfully\n`);
  }
}
async function viewCompleteList(repo: BookRepository) {
  let currentPage: number;
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
  currentPage = 0;
  if (offset) {
    currentPage = Math.floor(offset / limit);
  }

  const loadData = async () => {
    const validateOffset = currentPage * limit + (offset % limit) - 1;
    const result = await repo.list({
      search: search || undefined,
      offset: validateOffset > 0 ? validateOffset : 0,
      limit: limit,
    });

    if (result.items.length > 0) {
      console.log(`\n\nPage: ${currentPage + 1}`);
      // console.table(result.items);
      printTableWithoutIndex(result.items);
      const hasPreviousPage = currentPage > 0;
      const hasNextPage =
        result.pagination.limit + result.pagination.offset <
        result.pagination.total;
      if (hasPreviousPage) {
        console.log(`p\tPrevious Page`);
      }
      if (hasNextPage) {
        console.log(`n\tNext Page`);
      }
      if (hasPreviousPage || hasNextPage) {
        console.log(`q\tExit List`);
        const askChoice = async () => {
          const op = await readChar("\nChoice - ");
          console.log(op, "\n\n");
          if (op === "p" && hasPreviousPage) {
            currentPage--;
            await loadData();
          } else if (op === "n" && hasNextPage) {
            currentPage++;
            await loadData();
          } else if (op !== "q") {
            console.log("---", op, "---");
            console.log("\n\nInvalid input");
            await askChoice();
          }
        };
        await askChoice();
      }
    } else {
      console.log("\n\nNo data to show\n");
    }
  };
  await loadData();
}
function printTableWithoutIndex(data: IBook[]): void {
  const maxLengths: { [key: string]: number } = {};
  data.forEach((book) => {
    for (const key in book) {
      if (book.hasOwnProperty(key)) {
        const keyLength = String(key).length;
        const valueLength = String(book[key as keyof IBook]).length;
        const lengthToBePrinted = Math.max(keyLength, valueLength);

        if (!maxLengths[key] || lengthToBePrinted > maxLengths[key]) {
          maxLengths[key] = lengthToBePrinted;
        }
      }
    }
  });
  const headers = Object.keys(maxLengths);
  const divider = headers
    .map((header) => "-".repeat(maxLengths[header]))
    .join(" - ");
  console.log(divider);
  console.log(
    headers.map((header) => header.padEnd(maxLengths[header])).join(" | ")
  );
  console.log(divider);
  function printRow(book: IBook): void {
    console.log(
      headers
        .map((header) =>
          String(book[header as keyof IBook]).padEnd(maxLengths[header])
        )
        .join(" | ")
    );
  }
  data.forEach((book) => {
    printRow(book);
  });
  console.log(divider);
}
