import {
  HTTPServer,
  CustomRequest,
  CustomResponse,
  AllowedHTTPMethods,
  Middleware,
} from "../server/server";
import { BookRepository } from "./book.repository";
import { getDrizzleDB } from "../src/drizzle/drizzleDB";

const db = getDrizzleDB();
const bookRepository = new BookRepository(db);
const server = new HTTPServer(3000);

// Middleware to set headers and parse JSON body
server.use((request, response, next) => {
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  next?.();
});

server.use((request, response, next) => {
  if (["POST", "PUT", "PATCH"].includes(request.method as AllowedHTTPMethods)) {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      try {
        request.body = JSON.parse(body);
        next?.();
      } catch (error) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    next?.();
  }
});
const validateBookDataMiddleware: Middleware = async (
  request,
  response,
  next
) => {
  // Skip validation for non-POST, PUT, or PATCH requests
  if (["POST", "PUT", "PATCH"].includes(request.method as AllowedHTTPMethods)) {
    const book = await request.body;
    const bodyFields = [
      "title",
      "author",
      "publisher",
      "genre",
      "isbnNo",
      "numOfPages",
      "totalNumOfCopies",
      "availableNumberOfCopies",
    ];

    if (book) {
      if (request.method === "POST" || request.method === "PUT") {
        // Check if all required fields are present in the request body
        for (const field of bodyFields) {
          if (!book[field]) {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: `${field} is required` }));
            return;
          }
        }
      } else if (request.method === "PATCH") {
        // Check if at least one field is present in the request body
        const hasAtLeastOneField = bodyFields.some(field => field in book);

        if (!hasAtLeastOneField) {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: "At least one field must be present for PATCH" }));
          return;
        }
      }

      // Proceed to the next middleware or route handler
      next?.();
    } else {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Request body is missing" }));
    }
  } else {
    // If not a POST, PUT, or PATCH request, simply call next
    next?.();
  }
};


// Handler functions

// Inserting a book
async function handleInsertBook(
  request: CustomRequest,
  response: CustomResponse
) {
  try {
    const book = await request.body;
    console.log(book);
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
    response.writeHead(201, { "Content-Type": "application/json" });
    response.end(
      "Book Created Successfully and Created Book is " +
        JSON.stringify({ result })
    );
  } catch (error) {
    if (error instanceof Error) {
      response.writeHead(500, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: error.message }));
    }
  }
}

// Updating a book
async function handleUpdateBook(
  request: CustomRequest,
  response: CustomResponse
) {
  try {
    const url = new URL(request.url ?? "", `http://${request.headers.host}`);
    const bookId = Number(url.searchParams.get("id"));
    console.log(bookId);
    if (isNaN(bookId)) {
      response
        .writeHead(400, { "Content-Type": "text/plain" })
        .end("Invalid book ID");
      return;
    }

    const data = await request.body;
    console.log(data);

    const updatedBook = await bookRepository.update(bookId, data);
    if (updatedBook) {
      response
        .writeHead(200, { "Content-Type": "application/json" })
        .end(
          "Book Updated Successfully and the Updated Book is " +
            JSON.stringify(updatedBook)
        );
    } else {
      response
        .writeHead(404, { "Content-Type": "text/plain" })
        .end("Book not found");
    }
  } catch (error) {
    console.log("Error is", error);
    response
      .writeHead(500, { "Content-Type": "text/plain" })
      .end("Internal Server Error");
  }
}

// Searching by ID
async function handleGetBookById(
  request: CustomRequest,
  response: CustomResponse
) {
  const url = new URL(request.url ?? "", `http://${request.headers.host}`);
  const bookId = Number(url.searchParams.get("id"));
  if (isNaN(bookId)) {
    response
      .writeHead(400, { "Content-Type": "text/plain" })
      .end("Invalid book ID");
    return;
  }
  try {
    const book = await bookRepository.getById(bookId);
    if (book) {
      response
        .writeHead(200, { "Content-Type": "application/json" })
        .end(JSON.stringify(book));
    } else {
      response
        .writeHead(404, { "Content-Type": "text/plain" })
        .end("Book not found");
    }
  } catch (error) {
    console.log(error);
    response
      .writeHead(500, { "Content-Type": "text/plain" })
      .end("Internal Server Error");
  }
}

// Deleting a book
async function handleDeleteBook(
  request: CustomRequest,
  response: CustomResponse
) {
  const url = new URL(request.url ?? "", `http://${request.headers.host}`);
  const bookId = Number(url.searchParams.get("id"));
  if (isNaN(bookId)) {
    response
      .writeHead(400, { "Content-Type": "text/plain" })
      .end("Invalid book ID");
    return;
  }
  try {
    const deletedBook = await bookRepository.delete(bookId);
    if (deletedBook) {
      response
        .writeHead(200, { "Content-Type": "application/json" })
        .end(
          `Book with Id ${bookId} deleted successfully and Deleted Book is  ` +
            JSON.stringify(deletedBook)
        );
    } else {
      response
        .writeHead(404, { "Content-Type": "text/plain" })
        .end("Book not found");
    }
  } catch (error) {
    console.log(error);
    response
      .writeHead(500, { "Content-Type": "text/plain" })
      .end("Internal Server Error");
  }
}

// Listing books with pagination and search
async function handleListBooks(
  request: CustomRequest,
  response: CustomResponse
) {
  const url = new URL(request.url ?? "", `http://${request.headers.host}`);
  const limit = Number(url.searchParams.get("limit") ?? 5);
  const offset = Number(url.searchParams.get("offset") ?? 0);
  const search = url.searchParams.get("search") ?? "";

  const currentPage = Math.floor(offset / limit) + 1;

  try {
    const params = { limit, offset, search };
    const [result, totalCount] = await Promise.all([
      bookRepository.list(params),
      bookRepository.getTotalCount(),
    ]);

    const totalPages = Math.ceil(totalCount! / limit);

    if (result) {
      response
        .writeHead(200, { "Content-Type": "application/json" })
        .end(JSON.stringify({ currentPage, totalPages, books: result }));
    } else {
      response
        .writeHead(404, { "Content-Type": "text/plain" })
        .end("Books not found");
    }
  } catch (error) {
    console.log(error);
    response
      .writeHead(500, { "Content-Type": "text/plain" })
      .end("Internal Server Error");
  }
}

// Route definitions
// server.post("/library/books", handleInsertBook);
// server.post("/library/books", [validateBookInput, handleInsertBook]);
// server.patch("/library/book", handleUpdateBook);
server.post("/library/books", validateBookDataMiddleware, handleInsertBook);
server.patch("/library/books", validateBookDataMiddleware, handleUpdateBook);
server.get("/library/book", handleGetBookById);
server.delete("/library/book", handleDeleteBook);
server.get("/library/books", handleListBooks);
