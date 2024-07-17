import { join } from "node:path";
import { BookInteractor } from "../book-management/book.interactor";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { Database } from "../db/ds";
import { LibraryDataset } from "../db/library-dataset";
import { MemberInteractor } from "../member-management/member.interactor";
import { TransactionInteractor } from "../transaction-management/transaction.interactor";
import chalk from "chalk";
import { LibraryDB } from "../db/libraryDB";
import { DBConfig } from "../db/mysql-db";
import { AppEnvs } from "../read-env";
import { MySqlConnectionPoolFactory } from "../db/mysql-adapter";

export class LibraryInteractor implements IInteractor {
  menu = new Menu("Library-Management", [
    { key: "1", label: "Book Management" },
    { key: "2", label: "Member Management" },
    { key: "3", label: "Transaction" },
    { key: "4", label: "Exit" },
  ]);
  constructor() {}
  async showMenu(): Promise<void> {
    const dbConfig: DBConfig = {
      dbURL: AppEnvs.DATABASE_URL,
    };
    const poolFactory = new MySqlConnectionPoolFactory(dbConfig.dbURL);
    let loop = true;
    while (loop) {
      const op = await this.menu.show();
      if (op) {
        switch (op?.key.toLocaleLowerCase()) {
          case "1":
            const bookInteractor = new BookInteractor(this, poolFactory);
            await bookInteractor.showMenu();
            break;
          case "2":
            const memberInteractor = new MemberInteractor(this, poolFactory);
            await memberInteractor.showMenu();
            break;

          case "3":
            const transactionInteractor = new TransactionInteractor(
              this,
              poolFactory
            );
            await transactionInteractor.showMenu();
            break;

          case "4":
            process.exit(0);
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
