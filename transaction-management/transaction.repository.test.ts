import { TransactionRepository } from "./transaction.repository";
import { describe, expect, test, beforeAll } from "vitest";
import { LibraryDataset } from "../db/library-dataset";
import { Database } from "../db/ds";
import { faker } from "@faker-js/faker";
import { ITransaction, ITransactionBase } from "./models/transaction.model";
import { IMemberBase } from "../member-management/models/member.model";
import { rm } from "fs/promises";

describe("TransactionRepository", () => {
  const db: Database<LibraryDataset> = new Database("./data/mock-library.json");
  const transactionRepository = new TransactionRepository(db);

  beforeEach(async () => {
    await transactionRepository.deleteAll();
    await rm("./data/mock-library.json");
  });
  afterEach(async () => {
    await transactionRepository.deleteAll();
    await rm("./data/mock-library.json");
  });

  const generateBooks = (count: number) => {
    return Array.from({ length: count }, () => ({
      title: faker.lorem.words(3),
      author: faker.internet.userName(),
      publisher: faker.company.name(),
      genre: faker.lorem.words(),
      isbnNo: faker.number
        .int({ min: 1000000000000, max: 9999999999999 })
        .toString(),
      numOfPages: faker.number.int({ min: 100, max: 1000 }),
      totalNumOfCopies: faker.number.int({ min: 50, max: 100 }),
    }));
  };

  const generateMembers = (count: number): IMemberBase[] => {
    return Array.from({ length: count }, () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
    }));
  };

  const generateTransaction = (count: number): ITransactionBase[] => {
    return Array.from({ length: count }, () => ({
      bookId: faker.number.int({ min: 1, max: 100 }),
      memberId: faker.number.int({ min: 1, max: 100 }),
    }));
  };

  const transactions: ITransactionBase[] = generateTransaction(100);
  // Test case for create method

  test("create transaction", async () => {
    const transaction: ITransaction = await transactionRepository.create(
      transactions[0]
    );

    expect(transaction).toBeDefined();
    expect(transaction.id).toBeDefined();
    expect(transaction.dueDate).toBeDefined();
    expect(transaction.bookId).toBe(transactions[0].bookId);
    expect(transaction.memberId).toBe(transactions[0].memberId);
    expect(transaction.Status).toBe("Issued");
  });

  test("Create Many transactions", () => {
    transactions.forEach((transactionData) => {
      transactionRepository.create(transactionData);
    });
    const totalTransactions = transactionRepository.getTotalCount();
    expect(transactions.length).toBe(totalTransactions);
  });

  // Test case for getById method
  test("get transaction by id", async () => {
    const transaction: ITransaction = await transactionRepository.create(
      transactions[0]
    );
    const retrievedTransaction = await transactionRepository.getById(
      transaction.id
    );
    expect(retrievedTransaction).toEqual(transaction);
  });

  test("Update Transactions", async () => {
    const transaction: ITransaction = await transactionRepository.create(
      transactions[0]
    );
    expect(transaction.Status).toBe("Issued");
    transaction.Status = "Returned";
    const updatedTransaction = await transactionRepository.update(
      transaction.id
    );
    expect(updatedTransaction?.Status).toBe("Returned");
  });

  test("list transactions", async () => {
    const pageRequest = {
      offset: 0,
      limit: 10,
    };
    const transactionsPage = transactionRepository.list(pageRequest);
    expect(transactionsPage.items.length).toBeGreaterThanOrEqual(0); // Adjust based on your test data
    expect(transactionsPage.pagination.offset).toBe(pageRequest.offset);
    expect(transactionsPage.pagination.limit).toBe(pageRequest.limit);
  });
});
