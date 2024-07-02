import { IInteractor } from "../core/interactor";

const menu = `
    1.Add Book
    2.Edit Book
    3.Search Book
    4.<Previous Menu>
    `;
export class LibraryInteractor implements IInteractor {
  showMenu(): void {
    throw new Error("Method not implemented.");
  }
}
