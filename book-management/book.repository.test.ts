import { beforeEach, describe, expect, test, afterEach } from "vitest";
import { BookRepository } from "./book.repository";
import { Database } from "../db/ds";
import { IBook, IBookBase } from "./models/books.model";
import { faker } from "@faker-js/faker";
import { LibraryDataset } from "../db/library-dataset";
import { rm } from "fs/promises";

describe("Book Repository Tests", () => {
  const db = new Database<LibraryDataset>("./data/mock-library.json");
  const bookRepository = new BookRepository(db);

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
      totalNumOfCopies: faker.number.int({ min: 1, max: 50 }),
    }));
  };

  let books: IBookBase[] = generateBooks(100);
  beforeEach(async () => {
    await bookRepository.deleteAll();
    await rm("./data/mock-library.json");
  });
  afterEach(async () => {
    await bookRepository.deleteAll();
    await rm("./data/mock-library.json");
  });
  test("Create single book ", async () => {
    const createdBook: IBook = await bookRepository.create(books[0]);
    expect(createdBook).toBeDefined();
    expect(createdBook.title).toEqual(books[0].title);
    expect(createdBook.author).toEqual(books[0].author);
    expect(createdBook.publisher).toEqual(books[0].publisher);
    expect(createdBook.genre).toEqual(books[0].genre);
    expect(createdBook.isbnNo).toEqual(books[0].isbnNo);
    expect(createdBook.numOfPages).toEqual(books[0].numOfPages);
    expect(createdBook.totalNumOfCopies).toEqual(books[0].totalNumOfCopies);
  });

  test("Create books", () => {
    let booksCount = books.length;
    books.forEach((book) => {
      bookRepository.create(book);
    });
    expect(bookRepository.list({ offset: 0, limit: 100 }).items.length).toBe(
      booksCount
    );
  });
  test("Update the Book details", async () => {
    const newBook: IBook = await bookRepository.create(books[0]);
    expect(newBook).toBeDefined();
    newBook.title = "To Save a Mockingbird";
    const updatedBook = await bookRepository.update(newBook.id, newBook);
    expect(updatedBook).toBeDefined();
    expect(updatedBook?.title).toBe("To Save a Mockingbird");
    await bookRepository.deleteAll();
  });
  test("Get book by its id", async () => {
    const newBook: IBook = await bookRepository.create(books[0]);
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
