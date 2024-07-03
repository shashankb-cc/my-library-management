import { z } from "zod";
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

export const BookBaseSchema = z.object({
  title: z.string(),
  author: z.string(),
  publisher: z.string(),
  genre: z.string(),
  isbnNo: z.string(),
  numOfPages: z.number(),
  totalNumOfCopies: z.number(),
});

export const BookSchema = z.object({});
