import { IInteractor } from "../core/interactor";
import { Database } from "../db/ds";
import { LibraryDataset } from "../db/library-dataset";
import { LibraryInteractor } from "../src/library.interactor";
import { TransactionRepository } from "./transaction.repository";
import {
  NumberParser,
  StringParser,
  readChar,
  readLine,
} from "../core/input.utils";
import {
  ITransaction,
  ITransactionBase,
  TransactionTableEntry,
} from "./models/transaction.model";
import { Menu } from "../core/menu";
import { MemberRepository } from "../member-management/member.repository";
import { BookRepository } from "../book-management/book.repository";
import chalk from "chalk";
import { IBook } from "../book-management/models/books.model";
import { IPageRequest } from "../core/pagination";

export class TransactionInteractor implements IInteractor {
  menu = new Menu("\nTransaction-Management", [
    { key: "1", label: "Issue Book" },
    { key: "2", label: "Return Book " },
    { key: "3", label: "Search Transaction" },
    { key: "4", label: "List Transaction" },
    { key: "5", label: "<Previous Transaction>" },
  ]);
  constructor(
    public libraryInteractor: LibraryInteractor,
    private readonly db: Database<LibraryDataset>
  ) {}
  bookRepo = new BookRepository(this.db);
  memberRepo = new MemberRepository(this.db);
  private repo = new TransactionRepository(this.db);
  async showMenu(): Promise<void> {
    while (true) {
      const op = await this.menu.show();
      if (op) {
        switch (op?.key.toLocaleLowerCase()) {
          case "1":
            await issueBook(this.repo, this.bookRepo, this.memberRepo);
            break;
          case "2":
            await returnBook(this.repo, this.bookRepo, this.memberRepo);
            break;
          case "3":
            await searchTransaction(this.repo);
            break;
          case "4":
            await listTransaction(this.repo);
            break;
          case "5":
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

async function issueBook(
  repo: TransactionRepository,
  bookRepo: BookRepository,
  memberRepo: MemberRepository
) {
  const transaction: ITransactionBase = await getTransactionInput(
    bookRepo,
    memberRepo
  );
  const createdTransaction: ITransaction = await repo.create(transaction);
  repo.update(createdTransaction.id, createdTransaction);
  console.log(
    `Transaction added successfully!\nBook ID:${createdTransaction.id}`
  );
  console.table([transactionToTableEntry(createdTransaction)]);
}

async function returnBook(
  repo: TransactionRepository,
  bookRepo: BookRepository,
  memberRepo: MemberRepository
) {
  while (true) {
    const transactionId = (await readLine(
      `Please Enter the Transaction Id :`,
      NumberParser(true)
    )) as number;
    const transaction = await repo.getById(transactionId);
    if (transaction) {
      if (!transaction?.isBookReturned) {
        transaction!.isBookReturned = true;
        repo.update(transaction!.id, transaction!);
        console.log(
          chalk.green(
            `Transaction added successfully!\nBook ID:${transaction?.id}`
          )
        );
        break;
      } else {
        console.log(chalk.red("This Transaction is already completed.\n"));
      }
    } else {
      console.log(chalk.red("No transactions found for the given ID.\n"));
    }
  }
}

async function readConfirmation(message: string): Promise<boolean> {
  while (true) {
    const input = await readChar(message);
    if (input.toLowerCase() === "y") {
      return true;
    } else if (input.toLowerCase() === "n") {
      return false;
    } else {
      console.log(chalk.red("Invalid input. Please enter 'Y' or 'N'."));
    }
  }
}

async function getTransactionInput(
  bookRepo: BookRepository,
  memberRepo: MemberRepository
) {
  let bookId: number | null;
  let memberId: number | null;
  let book: IBook;
  while (true) {
    bookId = await readLine(`Please Enter the BookId :`, NumberParser(true));
    const book = await bookRepo.getById(bookId!);
    if (book && bookId) {
      console.table(book);
      if (book.availableNumberOfCopies === 0) {
        console.log(
          chalk.yellow(
            "Sorry, this book is currently out of stock. Please select another book.\n"
          )
        );
        continue;
      }
      const status = await readConfirmation(
        "If the data is correct then enter (Y or y), else (N or n): \n"
      );
      if (status) {
        console.log(chalk.green("\nData confirmed as correct.\n"));
        break;
      } else {
        console.log(chalk.red("\nInvalid Book ID. Please try again.\n"));
      }
    } else {
      console.log(chalk.red("\nInvalid Member ID. Please try again.\n"));
    }
  }

  while (true) {
    memberId = await readLine(
      `\nPlease Enter the Member Id :`,
      NumberParser(true)
    );
    if (memberId && (await memberRepo.getById(memberId))) {
      break;
    } else {
      console.log(chalk.red("Invalid Member ID. Please try again."));
    }
  }
  return {
    bookId: bookId!,
    memberId: memberId!,
  };
}

async function searchTransaction(
  repo: TransactionRepository
): Promise<ITransaction | null> {
  while (true) {
    const id = await readLine(
      "Please Enter the Transaction Id:",
      NumberParser()
    );
    const transaction = await repo.getById(id!);
    if (!transaction) {
      console.log("---------------------Note------------------------");
      console.log("\nNo Member found!!  Please Enter Valid Member ID!!!\n");
      console.log("-------------------------------------------------");
      continue;
    } else {
      console.table([transactionToTableEntry(transaction)]);
      return transaction;
    }
  }
}

async function listTransaction(repo: TransactionRepository) {
  const param = await readLine(
    "\nPlease enter your search criteria (Member ID or Book ID):\n",
    StringParser(true, true)
  );
  const offset = await readLine(
    "Please enter the search offset value (e.g., 0 to start from the beginning):\n",
    NumberParser(true)
  );
  const limit = await readLine(
    "\nPlease enter the search limit value (the number of results to return):\n",
    NumberParser(true)
  );
  const params: IPageRequest = {
    search: param!,
    offset: offset!,
    limit: limit!,
  };
  const TransactionList = repo.list(params);
  console.table(TransactionList.items);
}

export function transactionToTableEntry(
  transaction: ITransaction
): TransactionTableEntry {
  return {
    Id: transaction.id,
    BookID: transaction.bookId,
    MemberID: transaction.memberId,
    IssueDate: transaction.issueDate.toISOString().split("T")[0],
    DueDate: transaction.dueDate.toISOString().split("T")[0],
    Returned: transaction.isBookReturned ? "Yes" : "No",
  };
}
