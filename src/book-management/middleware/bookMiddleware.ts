import express, { Request, Response, NextFunction } from "express";
// Middleware to validate book data
export const validateBookDataMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Validation middleware");

  const book = req.body;
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
    if (req.method === "POST" || req.method === "PUT") {
      for (const field of bodyFields) {
        if (!book[field]) {
          return res.status(400).json({ error: `${field} is required` });
        }
      }
      next();
    } else if (req.method === "PATCH") {
      const hasAtLeastOneField = bodyFields.some((field) => field in book);
      if (!hasAtLeastOneField) {
        return res.status(400).json({
          error: "At least one field must be present for PATCH",
        });
      }
      next();
    }
  } else {
    res.status(400).json({ error: "Request body is missing" });
  }
};
