import { BookInteractor } from "../book-management/book.interactor";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { Database } from "../db/ds";
import { LibraryDataset } from "../db/library-dataset";
import { MemberInteractor } from "../member-management/member.interactor";

export class LibraryInteractor implements IInteractor {
  menu = new Menu("Library-Management", [
    { key: "1", label: "Book Management" },
    { key: "2", label: "Member Management" },
    { key: "3", label: "Transaction" },
    { key: "4", label: "exit" },
  ]);
  constructor() {}
  async showMenu(): Promise<void> {
    const database = new Database<LibraryDataset>("./data/library.json");
    let loop = true;
    while (loop) {
      const op = await this.menu.show();
      if (op) {
        switch (op?.key.toLocaleLowerCase()) {
          case "1":
            const bookInteractor = new BookInteractor(this, database);
            await bookInteractor.showMenu();
            break;
          case "2":
            const memberInteractor = new MemberInteractor(this, database);
            await memberInteractor.showMenu();
            break;

          case "3":
            break;

          case "4":
            process.exit(0);
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
