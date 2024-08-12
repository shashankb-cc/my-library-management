import { MySQLAdapter } from "./mysql-db";
import { AppEnvs } from "../read-env";
import "dotenv/config";
import { MySqlQueryGenerator } from "../libs/mysql-query-generator.";
import { SimpleWhereExpression, WhereExpression } from "../libs/types";
import { IBook } from "../src/book-management/models/books.model";
describe("my sql db adapter tests", () => {
  let mySQLAdapter: MySQLAdapter;
  beforeAll(async () => {
    mySQLAdapter = new MySQLAdapter({
      dbURL: AppEnvs.DATABASE_URL,
    });
    await mySQLAdapter.load();
  });
  test("run a selecr on books table", async () => {
    const authorClause: SimpleWhereExpression<Partial<IBook>> = {
      author: {
        op: "CONTAINS",
        value: "Sudha Murthy",
      },
    };
    const selectByAuthorQuery = MySqlQueryGenerator.generateSelectSql<IBook>(
      "books",
      authorClause,
      { offset: 0, limit: 10, columns: ["id", "title", "author"] }
    );
    const result = await mySQLAdapter.runQuery(selectByAuthorQuery);
    console.log(result);
  });
  afterAll(() => {
    mySQLAdapter.shutdown();
  });
});
