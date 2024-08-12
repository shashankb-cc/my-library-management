import express, { Request, Response, NextFunction } from "express";
import { getDrizzleDB } from "../../src/drizzle/drizzleDB";
import { BookRepository } from "../book.repository";
const db = getDrizzleDB();
const bookRepository = new BookRepository(db);
// Insert a new book
export const handleInsertBook = async (req: Request, res: Response) => {
  try {
    const book = req.body;
    const requiredFields = [
      "title",
      "author",
      "publisher",
      "genre",
      "isbnNo",
      "numOfPages",
      "totalNumOfCopies",
      "availableNumberOfCopies",
    ];
    for (const field of requiredFields) {
      if (!book[field]) {
        throw new Error(`${field} is required`);
      }
    }

    const result = await bookRepository.create(book);
    res.status(201).json({
      message: "Book Created Successfully",
      createdBook: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

// Update a book
export const handleUpdateBook = async (req: Request, res: Response) => {
  try {
    const bookId = Number(req.query.id);
    if (isNaN(bookId)) {
      return res.status(400).send("Invalid book ID");
    }

    const data = req.body;
    const updatedBook = await bookRepository.update(bookId, data);
    if (updatedBook) {
      res.status(200).json({
        message: "Book Updated Successfully",
        updatedBook,
      });
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.log("Error is", error);
    res.status(500).send("Internal Server Error");
  }
};

export const handleBooks = async (req: Request, res: Response) => {
  const bookId = req.query.id ? Number(req.query.id) : null;

  if (bookId) {
    return handleGetBookById(req, res);
  } else {
    return handleListBooks(req, res);
  }
};

// Get a book by ID
export const handleGetBookById = async (req: Request, res: Response) => {
  const bookId = Number(req.query.id); // Use req.query to access the id
  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }
  try {
    const book = await bookRepository.getById(bookId);
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// Delete a book
export const handleDeleteBook = async (req: Request, res: Response) => {
  const bookId = Number(req.query.id); // Use req.query to access the id
  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }
  try {
    const deletedBook = await bookRepository.delete(bookId);
    if (deletedBook) {
      res.status(200).json({
        message: `Book with Id ${bookId} deleted successfully`,
        deletedBook,
      });
    } else {
      res.status(404).send("Book not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// List books with pagination and search
export const handleListBooks = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 5;
  const offset = Number(req.query.offset) || 0;
  const search = (req.query.search as string) || "";

  const currentPage = Math.floor(offset / limit) + 1;

  try {
    const params = { limit, offset, search };
    const [result, totalCount] = await Promise.all([
      bookRepository.list(params),
      bookRepository.getTotalCount(),
    ]);

    const totalPages = Math.ceil(totalCount! / limit);

    if (result) {
      res.status(200).json({ currentPage, totalPages, books: result });
    } else {
      res.status(404).send("Books not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
