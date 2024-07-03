import { beforeEach, describe, expect, test } from "vitest";
import { BookRepository } from "./book.repository";
import { IBook } from "./models/books.model";
import { Database } from "../db/ds";

describe("Book Repository Tests", () => {
  const db = new Database("../data/books.json");
  const bookRepository = new BookRepository(db);
  const books = [
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
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      publisher: "Little, Brown and Company",
      genre: "Fiction",
      isbnNo: "9780316769488",
      numOfPages: 214,
      totalNumOfCopies: 6,
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      publisher: "George Allen & Unwin",
      genre: "Fantasy",
      isbnNo: "9780547928227",
      numOfPages: 310,
      totalNumOfCopies: 9,
    },
    {
      title: "Moby Dick",
      author: "Herman Melville",
      publisher: "Harper & Brothers",
      genre: "Adventure",
      isbnNo: "9781503280786",
      numOfPages: 635,
      totalNumOfCopies: 4,
    },
    {
      title: "War and Peace",
      author: "Leo Tolstoy",
      publisher: "The Russian Messenger",
      genre: "Historical Fiction",
      isbnNo: "9780199232765",
      numOfPages: 1225,
      totalNumOfCopies: 3,
    },
    {
      title: "The Odyssey",
      author: "Homer",
      publisher: "Ancient Greece",
      genre: "Epic",
      isbnNo: "9780140268867",
      numOfPages: 541,
      totalNumOfCopies: 5,
    },
    {
      title: "Crime and Punishment",
      author: "Fyodor Dostoevsky",
      publisher: "The Russian Messenger",
      genre: "Philosophical Fiction",
      isbnNo: "9780143058144",
      numOfPages: 671,
      totalNumOfCopies: 6,
    },
    {
      title: "The Brothers Karamazov",
      author: "Fyodor Dostoevsky",
      publisher: "The Russian Messenger",
      genre: "Philosophical Fiction",
      isbnNo: "9780374528379",
      numOfPages: 796,
      totalNumOfCopies: 5,
    },
  ];
  beforeEach(() => {
    books.forEach((book) => {
      bookRepository.create(book);
    });
  });
  test("Create Book", () => {});
});
