import { describe, expect, test } from "vitest";
import { BookRepository } from "./book.repository";
import { z } from "zod";

describe("Book Repository Tests", () => {
  test("Create Book", () => {
    const bookRepository = new BookRepository();
    const bookDetails = {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      publisher: "Scribner",
      genre: "Fiction",
      isbnNo: "9780743273565",
      numOfPages: 180,
      totalNumOfCopies: 5,
    };
    const book = bookRepository.create(bookDetails);
  });
});
