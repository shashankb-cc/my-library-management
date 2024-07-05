import { beforeEach, describe, expect, test, afterEach } from "vitest";
import { BookRepository } from "./book.repository";
import { Database } from "../db/ds";
import { bookSchema, IBook, IBookBase } from "./models/books.model";
import { faker } from "@faker-js/faker";
import { LibraryDataset } from "../db/library-dataset";

describe("Book Repository Tests", () => {
  const db = new Database<LibraryDataset>("./data/library.json");
  const bookRepository = new BookRepository(db);
  let books = [
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      publisher: "J.B. Lippincott & Co.",
      genre: "Fiction",
      isbnNo: "9780060935467",
      numOfPages: 281,
      totalNumOfCopies: 7,
    },
    {
      title: "1984",
      author: "George Orwell",
      publisher: "Secker & Warburg",
      genre: "Dystopian",
      isbnNo: "9780451524935",
      numOfPages: 328,
      totalNumOfCopies: 8,
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      publisher: "T. Egerton",
      genre: "Romance",
      isbnNo: "9780141439518",
      numOfPages: 279,
      totalNumOfCopies: 10,
    },
  ];
  const numBooks = 5;
  const createdBooks: IBook[] = [];
  beforeEach(async () => {
    await bookRepository.deleteAll();
  });
  afterEach(async () => {
    await bookRepository.deleteAll();
  });
  test("Create 100 books ", async () => {
    for (let i = 0; i < numBooks; i++) {
      const book: IBookBase = {
        title: faker.lorem.words(3),
        author: faker.internet.userName(),
        publisher: faker.company.name(),
        genre: faker.lorem.words(),
        isbnNo: faker.number
          .int({ min: 1000000000000, max: 9999999999999 })
          .toString(),
        numOfPages: faker.number.int({ min: 100, max: 1000 }),
        totalNumOfCopies: faker.number.int({ min: 1, max: 50 }),
      };
      const createdBook = await bookRepository.create(book);
      createdBooks.push(createdBook);
      expect(createdBook).toBeDefined();
      expect(createdBook.title).toEqual(book.title);
      expect(createdBook.author).toEqual(book.author);
      expect(createdBook.publisher).toEqual(book.publisher);
      expect(createdBook.genre).toEqual(book.genre);
      expect(createdBook.isbnNo).toEqual(book.isbnNo);
      expect(createdBook.numOfPages).toEqual(book.numOfPages);
      expect(createdBook.totalNumOfCopies).toEqual(book.totalNumOfCopies);
    }
  });
  test("Update the Book details", async () => {
    const newBook = await bookRepository.create(books[0]);
    expect(newBook).toBeDefined();
    expect(newBook.title).toBe("To Kill a Mockingbird");
    newBook.title = "To Save a Mockingbird";
    const updatedBook = await bookRepository.update(newBook.id, newBook);
    expect(updatedBook).toBeDefined();
    expect(updatedBook?.title).toBe("To Save a Mockingbird");
    await bookRepository.deleteAll();
  });
  test("Get book by its id", async () => {
    const newBook = await bookRepository.create(books[0]);
    const fetchedBook = await bookRepository.getById(newBook.id);
    expect(fetchedBook?.id).toBe(newBook.id);
  });
  test("Get a list of added books", async () => {
    const newBook1 = await bookRepository.create(books[0]);
    const newBook2 = await bookRepository.create(books[1]);
    const newBook3 = await bookRepository.create(books[2]);
    const listOfBooks = bookRepository.list({ offset: 0, limit: 3 });
    expect(listOfBooks.items).toEqual([
      {
        ...newBook1,
        availableNumberOfCopies: newBook1.totalNumOfCopies,
      },
      {
        ...newBook2,
        availableNumberOfCopies: newBook2.totalNumOfCopies,
      },
      {
        ...newBook3,
        availableNumberOfCopies: newBook3.totalNumOfCopies,
      },
    ]);
  });
  test("Delete a book from the list", async () => {
    const newBook1 = await bookRepository.create(books[0]);
    const newBook2 = await bookRepository.create(books[1]);
    await bookRepository.delete(newBook1.id);
    const listOfBooks = await bookRepository.list({ offset: 0, limit: 3 });
    expect(listOfBooks.items.length).toBe(1);
    expect(listOfBooks.items[0].id).toBe(newBook2.id);
  });
  test("Delete all the books", async () => {
    await bookRepository.deleteAll();
    expect(bookRepository.list({ offset: 0, limit: 1 }).items.length).toBe(0);
  });
});
