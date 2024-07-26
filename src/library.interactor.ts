import { BookInteractor } from "../book-management/book.interactor";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { MemberInteractor } from "../member-management/member.interactor";
import { TransactionInteractor } from "../transaction-management/transaction.interactor";
import chalk from "chalk";
import { DBConfig } from "../db/mysql-db";
import { AppEnvs } from "../read-env";
import { MySqlConnectionPoolFactory } from "../db/mysql-adapter";
import { MySql2Database } from "drizzle-orm/mysql2";

export class LibraryInteractor implements IInteractor {
  menu = new Menu("Library-Management", [
    { key: "1", label: "Book Management" },
    { key: "2", label: "Member Management" },
    { key: "3", label: "Transaction" },
    { key: "4", label: "Exit" },
  ]);
  constructor(private db: MySql2Database<Record<string, never>>) {}
  async showMenu(): Promise<void> {
    const dbConfig: DBConfig = {
      dbURL: AppEnvs.DATABASE_URL,
    };
    // const poolFactory = new MySqlConnectionPoolFactory(dbConfig.dbURL);

    let loop = true;
    while (loop) {
      const op = await this.menu.show();
      if (op) {
        switch (op?.key.toLocaleLowerCase()) {
          case "1":
            const bookInteractor = new BookInteractor(this, this.db);
            await bookInteractor.showMenu();
            break;
          case "2":
            const memberInteractor = new MemberInteractor(this, this.db);
            await memberInteractor.showMenu();
            break;

          case "3":
            const transactionInteractor = new TransactionInteractor(
              this,
              this.db
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
