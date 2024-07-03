import { BookInteractor } from "../book-management/book.interactor";
import { readChar } from "../core/input.utils";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";

const menu = new Menu([
  { key: "1", label: "Book Management" },
  { key: "2", label: "Member Management" },
  { key: "3", label: "Transaction" },
  { key: "4", label: "Today's due list" },
  { key: "5", label: "Exit" },
]);

export class LibraryInteractor implements IInteractor {
  private readonly bookIteractor = new BookInteractor();
  async showMenu(): Promise<void> {
    const op = await readChar(menu.serialize());
    const menuItem = menu.getItem(op);
    if (menuItem) {
      console.log(`Choice: ${menuItem.key}\t${menuItem.label}`);
    }

    switch (op.toLowerCase()) {
      case "1":
        await this.bookIteractor.showMenu();
        break;
      case "5":
        process.exit(0);
      default:
        console.log("Invalid input");
    }
    await this.showMenu();
  }
}
