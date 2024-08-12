import { log } from "console";
import { IBook, IBookBase } from "../src/book-management/models/books.model";
import { AppEnvs } from "../read-env";
import { LibraryDB } from "./libraryDB";
import { DBConfig, MySQLAdapter } from "./mysql-db";
import { th } from "@faker-js/faker";
import { WhereExpression } from "../libs/types";

// describe.skip("", () => {
//   const dbConfig: DBConfig = {
//     dbURL: AppEnvs.DATABASE_URL,
//   };
//   const db = new LibraryDB<Partial<IBook>>(dbConfig);
//   test("Insert tests ", async () => {
//     const book = {
//       id: 180,
//       title: "Narabhakshaka",
//       author: "KPP",
//       publisher: "Nagu",
//       genre: "Animal",
//       numOfPages: 100,
//       isbnNo: "852963741852",
//       totalNumOfCopies: 10,
//       availableNumberOfCopies: 30,
//     };
//     const result = await db.insert<IBook>("books", book);
//   });
//   test("Update tests", async () => {
//     const updatedBookData = {
//       title: "Narabhakshaka Revised",
//       author: "KPP Revised",
//     };
//     const whereCondition = {
//       id: {
//         op: "EQUALS",
//         value: 180,
//       },
//     };
//     const result = await db.update<IBook>(
//       "books",
//       updatedBookData,
//       whereCondition
//     );
//     expect(result).toBeTruthy();
//     console.log(result);
//   });
//   test("Select test", async () => {
//     const whereCondition = {
//       id: {
//         op: "EQUALS",
//         value: 180,
//       },
//     };
//     const fields = ["id", "title", "author", "publisher"];
//     const result = await db.select<IBook>(
//       "books",
//       whereCondition,
//       0,
//       10,
//       fields
//     );
//     console.log(result);
//   });
//   test("Count test", async () => {
//     const whereCondition = {
//       author: {
//         op: "EQUALS",
//         value: "KPP",
//       },
//     };
//     const result = await db.count("books", whereCondition);
//     console.log(result);
//   });
//   test("delete Test", async () => {
//     const whereCondition = {
//       id: {
//         op: "EQUALS",
//         value: 180,
//       },
//     };
//     const result = await db.delete<IBook>("books", whereCondition);
//     console.log(result);
//   });
// });
describe("", () => {
  const dbConfig: DBConfig = {
    dbURL: AppEnvs.DATABASE_URL,
  };
  const db = new LibraryDB(dbConfig);
  test("In operator test", async () => {
    const whereCOndition: WhereExpression<IBook> = {
      title: {
        op: "IN",
        value: ["A Book on C", "Programming in C"],
      },
    };
    const selectQuery1 = await db.select("books", whereCOndition, 1, 10, [
      "author",
      "title",
    ]);
    console.log(selectQuery1);
  });
});
