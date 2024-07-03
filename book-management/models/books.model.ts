import z from "zod";
export interface IBookBase {
  title: string;
  author: string;
  publisher: string;
  genre: string;
  isbnNo: string;
  numOfPages: number;
  totalNumOfCopies: number;
}
export interface IBook extends IBookBase {
  id: number;
  availableNumberOfCopies: number;
}

export const bookSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(30, { message: "Title must be less than 30 characters" }),
  author: z
    .string()
    .min(1, { message: "Author is required" })
    .max(30, { message: "Author must be less than 30 characters" }),
  publisher: z
    .string()
    .min(1, { message: "Publisher is required" })
    .max(30, { message: "Publisher must be less than 30 characters" }),
  genre: z
    .string()
    .min(1, { message: "Genre is required" })
    .max(20, { message: "Genre must be less than 20 characters" }),
  isbnNo: z
    .string()
    .length(13, { message: "ISBN number must be exactly 13 characters long" })
    .regex(/^\d{13}$/, { message: "ISBN number must contain only digits" }),
  numOfPages: z
    .number()
    .int()
    .min(1, { message: "Number of pages must be at least 1" }),
  totalNumOfCopies: z
    .number()
    .int()
    .min(0, { message: "Total number of copies cannot be negative" }),
});
