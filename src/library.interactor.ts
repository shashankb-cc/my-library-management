import { BookInteractor } from "../book-management/book.interactor";
import { readChar } from "../core/input.utils";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";

const menu = new Menu([
  { key: "1", label: "Book Management" },
  { key: "2", label: "Member Management" },
  { key: "3", label: "Transaction" },
  { key: "4", label: "exit" },
]);
export class LibraryInteractor implements IInteractor {
  async showMenu(): Promise<void> {
    console.log("\n-----------------------------------------------");
    console.log("Main Menu");
    const op = await readChar(menu.serialize());
    switch (op) {
      case "1":
        console.log("\n-----------------------------------------------");
        console.log(" Book Management");
        const bookInteractor = new BookInteractor(this);
        bookInteractor.showMenu();
        break;

      case "2":
        break;
      case "3":
        break;

      case "4":
        process.exit(0);
    }
  }
}
