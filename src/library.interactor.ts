import { BookInteractor } from "../book-management/book.interactor";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { Database } from "../db/ds";

const menu = new Menu("Library-Management", [
  { key: "1", label: "Book Management" },
  { key: "2", label: "Member Management" },
  { key: "3", label: "Transaction" },
  { key: "4", label: "exit" },
]);
export class LibraryInteractor implements IInteractor {
  constructor(private db: Database) {}
  async showMenu(): Promise<void> {
    const op = await menu.show();
    switch (op?.key.toLocaleLowerCase()) {
      case "1":
        const bookInteractor = new BookInteractor(this, this.db);
        bookInteractor.showMenu();
        break;

      case "2":
        break;
      case "3":
        break;

      case "4":
        process.exit(0);
        break;
    }
  }
}
