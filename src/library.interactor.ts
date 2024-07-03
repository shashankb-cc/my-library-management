import { BookInteractor } from "../book-management/book.interactor";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
<<<<<<< HEAD
import { Database } from "../db/ds";
=======
import { MemberInteractor } from "../member-management/member.interactor";
>>>>>>> ba69d40 (added zod schema for validating input data in book.interactor, partially implemented member.interactor and added tests for the same)

const menu = new Menu("Library-Management", [
  { key: "1", label: "Book Management" },
  { key: "2", label: "Member Management" },
  { key: "3", label: "Transaction" },
  { key: "4", label: "exit" },
]);
export class LibraryInteractor implements IInteractor {
  constructor(private readonly db: Database) {}
  async showMenu(): Promise<void> {
    const op = await menu.show();
    switch (op?.key.toLocaleLowerCase()) {
      case "1":
        const bookInteractor = new BookInteractor(this, this.db);
        bookInteractor.showMenu();
        break;

      case "2":
        console.log("\n-----------------------------------------------");
        console.log(" member Management");
        const memberInteractor = new MemberInteractor(this);
        memberInteractor.showMenu();
        break;
      case "3":
        break;

      case "4":
        process.exit(0);
        break;
    }
  }
}
