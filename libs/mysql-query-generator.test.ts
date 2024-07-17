import { test, describe, expect } from "vitest";
import { MySqlQueryGenerator } from "./mysql-query-generator.";
import {
  WhereExpression,
  SimpleWhereExpression,
  OrWhereExpression,
} from "./types";
import { IBook } from "../book-management/models/books.model";
type User = {
  name: string;
  email: string;
  dob: string;
  address: string;
};
describe.skip("SQL Query testing", () => {
  test("Should generate INSERT SQL", () => {
    const insertData = {
      name: "Shashank",
      email: "Shashank@gmail.com",
      dob: "2002-10-17",
      address: "Bangalore",
    };
    const expectedSql =
      'INSERT INTO `users` (name, email, dob, address) VALUES ("Shashank", "Shashank@gmail.com", "2002-10-17", "Bangalore")';
    const actualSql = MySqlQueryGenerator.generateInsertSql(
      "users",
      insertData
    );

    expect(actualSql).toBe(expectedSql);
  });
  // test("Should generate  UPDATE SQL", () => {
  //   const updateData: UserWithoutId = { address: "Mangaluru" };
  //   const conditions: WhereExpression<User> = [
  //     {
  //       name: { op: "EQUALS", value: "Shashank" },
  //       dob: { op: "EQUALS", value: "2002-10-17" },
  //     },
  //   ];
  //   const expectedSql =
  //     'UPDATE `users` SET address="Mangaluru"  WHERE `name`  =  "Shashank" AND `dob`  =  "2002-10-17" ';
  //   const actualSql = MySqlQueryGenerator.generateUpdateSql(
  //     "users",
  //     updateData,
  //     conditions
  //   );
  //   expect(actualSql).toBe(expectedSql);
  // });

  // //   test("Should generate DELETE SQL", () => {
  // //     const conditions: WhereParam<User>[] = [
  // //       {
  // //         name: { op: "EQUALS", value: "Shashank" },
  // //         dob: { op: "EQUALS", value: "2002-10-17" },
  // //       },
  // //     ];
  // //     const actualSql = MySqlQueryGenerator.generateDeleteSql(
  // //       "users",
  // //       conditions
  // //     );
  // //     const expectedSql =
  // //       'DELETE FROM `users`  WHERE `name`  =  "Shashank" AND `dob`  =  "2002-10-17" ';
  // //     expect(actualSql).toBe(expectedSql);
  // //   });

  // test("Should generate SELECT SQL with columns name", () => {
  //   const conditions: WhereParam<User>[] = [
  //     {
  //       name: { op: "EQUALS", value: "Shashank" },
  //       dob: { op: "EQUALS", value: "2002-10-17" },
  //     },
  //   ];

  //   const expectedSql =
  //     'SELECT `name`, `email`, `dob` FROM users WHERE `name`  =  "Shashank" AND `dob`  =  "2002-10-17"  LIMIT 10 OFFSET 0';
  //   const actualSql = MySqlQueryGenerator.generateSelectSql(
  //     "users",
  //     conditions,
  //     0,
  //     10,
  //     ["name", "email", "dob"]
  //   );

  //   expect(actualSql).toBe(expectedSql);
  // });
  test("Should generate UPDATE SQL", () => {
    const updateData: ColumnSet = { address: "Mangaluru" };
    const conditions: WhereExpression<Partial<User>> = {
      name: { op: "EQUALS", value: "Shashank" },
      dob: { op: "EQUALS", value: "2002-10-17" },
    };
    const expectedSql =
      'UPDATE `users` SET address="Mangaluru"  WHERE (`name`  =  "Shashank" AND `dob`  =  "2002-10-17")';
    const actualSql = MySqlQueryGenerator.generateUpdateSql(
      "users",
      updateData,
      conditions
    );

    expect(actualSql).toBe(expectedSql);
  });

  test("Should generate SELECT SQL with columns name", () => {
    const conditions: WhereExpression<Partial<User>> = {
      name: { op: "EQUALS", value: "Shashank" },
      dob: { op: "EQUALS", value: "2002-10-17" },
    };

    const pageOpts: PageOption = {
      offset: 0,
      limit: 10,
      columns: ["name", "email", "dob"],
    };

    const expectedSql =
      'SELECT `name`, `email`, `dob` FROM users WHERE (`name`  =  "Shashank" AND `dob`  =  "2002-10-17")  LIMIT 10 OFFSET 0';
    const actualSql = MySqlQueryGenerator.generateSelectSql(
      "users",
      conditions,
      pageOpts
    );

    expect(actualSql).toBe(expectedSql);
  });
});
describe("Test SQL generator with queries on Book DB", () => {
  const { generateSelectSql } = MySqlQueryGenerator;
  const authorClause: SimpleWhereExpression<IBook> = {
    author: {
      op: "CONTAINS",
      value: "Sudha Murthy",
    },
  };
  const authAndPublisher: SimpleWhereExpression<IBook> = {
    author: {
      op: "CONTAINS",
      value: "Sudha Murthy",
    },
    publisher: {
      op: "EQUALS",
      value: "Penguin UK",
    },
  };
  const authAndPublisherOrCopies: OrWhereExpression<Partial<IBook>> = {
    OR: [
      {
        author: {
          op: "CONTAINS",
          value: "Sudha Murthy",
        },
        publisher: {
          op: "EQUALS",
          value: "Penguin UK",
        },
      },
      {
        totalNumOfCopies: {
          op: "GREATER_THAN_EQUALS",
          value: 10,
        },
      },
    ],
  };
  const authOrCopies: OrWhereExpression<Partial<IBook>> = {
    OR: [
      {
        author: {
          op: "EQUALS",
          value: "Sudha Murthy",
        },
      },
      {
        totalNumOfCopies: {
          op: "GREATER_THAN",
          value: 10,
        },
      },
    ],
  };
  const titleORtitle: WhereExpression<Partial<IBook>> = {
    OR: [
      {
        title: {
          value: "AKshay",
          op: "EQUALS",
        },
      },
      {
        title: {
          value: "Mukajjiya kanasugalu",
          op: "EQUALS",
        },

        publisher: {
          value: "appa andre akasha",
          op: "ENDS_WITH",
        },
      },
    ],
  };

  test("where clause generation", () => {
    const queryStr =
      MySqlQueryGenerator.generateWhereClauseSql<IBook>(authorClause);
    // expect(queryStr).toEqual('(`author`  LIKE  "%Sudha Murthy%")');

    const authAndPublisherQuery =
      MySqlQueryGenerator.generateWhereClauseSql<IBook>(authAndPublisher);
    // expect(authAndPublisherQuery).toEqual(
    //   '(`author`  LIKE  "%Sudha Murthy%" AND `publisher`  =  "Penguin UK")'
    // );

    //(`author`  LIKE  "%Sudha Murthy%" AND `publisher`  =  "Penguin UK") OR ('totalNumOfCOpies' >= 10)

    const authAndPublisherOrCopiesQuery =
      MySqlQueryGenerator.generateWhereClauseSql<Partial<IBook>>(
        authAndPublisherOrCopies
      );
    expect(authAndPublisherOrCopiesQuery).toEqual(
      '((`author`  LIKE  "%Sudha Murthy%" AND `publisher`  =  "Penguin UK") OR (`totalNumOfCopies`  >=  10))'
    );

    //authOrCOpies

    const authOrCopiesQuery =
      MySqlQueryGenerator.generateWhereClauseSql<Partial<IBook>>(authOrCopies);
    expect(authOrCopiesQuery).toEqual(
      '((`author`  =  "Sudha Murthy") OR (`totalNumOfCopies`  >  10))'
    );
    const titleORtitleQuery =
      MySqlQueryGenerator.generateWhereClauseSql<Partial<IBook>>(titleORtitle);
    expect(titleORtitleQuery).toEqual(
      '((`title`  =  "AKshay") OR (`title`  =  "Mukajjiya kanasugalu" AND `publisher`  LIKE  "%appa andre akasha"))'
    );
  });
  // test("select clause test", () => {
  //   //selct * from books  where (`author`  LIKE  "%Sudha Murthy%")
  //   const selectByAuthorQuery = generateSelectSql<IBook>(
  //     "books",
  //     authorClause,
  //     { offset: 0, limit: 10, columns: ["id", "title", "author"] }
  //   );
  //   expect(selectByAuthorQuery).toEqual(
  //     'SELECT `id`, `title`, `author` FROM books WHERE (`author`  LIKE  "%Sudha Murthy%")  LIMIT 10 OFFSET 0'
  //   );
  //   const authAndPublisherOrCopiesQuery = generateSelectSql<IBook>(
  //     "books",
  //     authAndPublisherOrCopies,
  //     {
  //       offset: 0,
  //       limit: 50,
  //       columns: ["id", "title", "author", "publisher", "totalNumOfCopies"],
  //     }
  //   );
  //   expect(authAndPublisherOrCopiesQuery).toEqual(
  //     'SELECT `id`, `title`, `author`, `publisher`, `totalNumOfCopies` FROM books WHERE ((`author`  LIKE  "%Sudha Murthy%" AND `publisher`  =  "Penguin UK") OR (`totalNumOfCopies`  >=  10))  LIMIT 50 OFFSET 0'
  //   );
  // });
});
describe.skip("Test SQL generator with In and NOT IN", () => {
  const authorClause: SimpleWhereExpression<Partial<IBook>> = {
    author: {
      op: "CONTAINS",
      value: "Sudha Murthy",
    },
  };
  const whereParams = {
    id: {
      op: "IN",
      value: [1, 2, 3],
    },
  };
  test("In Operator test", () => {
    const queryStr =
      MySqlQueryGenerator.generateWhereClauseSql<Partial<IBook>>(authorClause);
    console.dir(queryStr);
    expect(queryStr).toEqual('(`author`  LIKE  "%Sudha Murthy%")');
  });
});
