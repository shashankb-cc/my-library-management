import { Database } from "../db/ds";
import { LibraryInteractor } from "./library.interactor";

const dataBase = new Database("./data/books.json");
const libraryInteractor = new LibraryInteractor(dataBase);

libraryInteractor.showMenu();
