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
    .max(30, { message: "Title must be less than 30 characters" })
    .regex(/^[a-zA-Z0-9\s]+$/, {
      message: "Title can only contain letters, numbers, and spaces",
    }),
  author: z
    .string()
    .min(1, { message: "Author is required" })
    .max(30, { message: "Author must be less than 30 characters" })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Author can only contain letters, numbers, and spaces",
    }),
  publisher: z
    .string()
    .min(1, { message: "Publisher is required" })
    .max(30, { message: "Publisher must be less than 30 characters" })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Publisher can only contain letters, numbers, and spaces",
    }),
  genre: z
    .string()
    .min(1, { message: "Genre is required" })
    .max(20, { message: "Genre must be less than 20 characters" })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Genre can only contain letters, numbers, and spaces",
    }),
  isbnNo: z
    .string()
    .length(13, { message: "ISBN number must be exactly 13 characters long" })
    .regex(/^\d{13}$/, { message: "ISBN number must contain only digits" }),
  numOfPages: z
    .number()
    .int({ message: "Number of pages must be an integer" })
    .min(1, { message: "Number of pages must be at least 1" }),
  totalNumOfCopies: z
    .number()
    .int({ message: "Total number of copies must be an integer" })
    .min(0, { message: "Total number of copies cannot be negative" }),
});
