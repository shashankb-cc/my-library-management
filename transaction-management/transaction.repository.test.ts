import { TransactionRepository } from "./transaction.repository";
import { describe, expect, test, beforeAll } from "vitest";
import { LibraryDataset } from "../db/library-dataset";
import { Database } from "../db/ds";
import { BookRepository } from "../book-management/book.repository";
import { MemberRepository } from "../member-management/member.repository";

describe("TransactionRepository", () => {
  const db: Database<LibraryDataset> = new Database("./data/mock-library.json");
  const transactionRepository = new TransactionRepository(db);
  const bookRepo = new BookRepository(db);
  const memberRepo = new MemberRepository(db);
  const repo = new TransactionRepository(db);

  // Mock transaction data for testing
  const mockTransactionData = {
    memberId: 1,
    bookId: 1,
  };

  // Test case for create method
  test("create transaction", async () => {
    const createdTransaction =
      await transactionRepository.create(mockTransactionData);
    expect(createdTransaction).toHaveProperty("id");
    expect(createdTransaction.memberId).toBe(mockTransactionData.memberId);
    expect(createdTransaction.bookId).toBe(mockTransactionData.bookId);
  });

  // Test case for getById method
  test("get transaction by id", async () => {
    const existingTransactionId = 1;
    const transaction = await transactionRepository.getById(
      existingTransactionId
    );
    expect(transaction).toBeTruthy();
    expect(transaction!.id).toBe(existingTransactionId);
  });

  // Test case for list method
  test("list transactions", () => {
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
