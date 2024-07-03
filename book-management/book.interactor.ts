import { readChar, readLine } from "../core/input.utils";
import { IInteractor } from "../core/interactor";
import { BookRepository } from "./book.repository";
import { IBookBase } from "./models/books.model";
const menu = `
    1.Add Book
    2.Edit Book
    3.Search Book
    4.<Previous Menu>
    `;
export class BookInteractor implements IInteractor {
  private repo = new BookRepository();
  async showMenu(): Promise<void> {
    const op = await readChar(menu);
    switch (op.toLowerCase()) {
      case "1":
        await addBook(this.repo);
        // console.table(this.repo.list({ limit: 1000, offset: 0 }).items);

        break;
      case "2":
        break;
      case "3":
        // console.table(this.repo.list({ limit: 1000, offset: 0 }).items);
        break;
      case "4":
        break;

      default:
        break;
    }
  }
}
async function getBookInput() {
  const title = await readLine("Please Enter the Title:");
  const author = await readLine("Please Enter the Author:");
  const publisher = await readLine("Please Enter the Publisher:");
  const genre = await readLine("Please Enter the Genre:");
  const isbnNo = await readLine("Please Enter the ISBN:");
  const numOfPages = await readLine("Please Enter the Number of Pages:");
  const totalNumOfCopies = await readLine(
    "Please Enter the Total Number of Copies:"
  );
  return {
    title: title,
    author: author,
    publisher: publisher,
    genre: genre,
    isbnNo: isbnNo,
    numOfPages: +numOfPages,
    totalNumOfCopies: +totalNumOfCopies,
  };
}
async function addBook(repo: BookRepository) {
  const book: IBookBase = await getBookInput();
  const createdBook = repo.create(book);
  console.log(`Book added successfully!\nBook ID:${createdBook.id}`);
  console.table(createdBook);
}
