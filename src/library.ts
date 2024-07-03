import { Database } from "../db/ds";
import { LibraryInteractor } from "./library.interactor";

const dataBase = new Database("../Data/books.json");
const libraryInteractor = new LibraryInteractor(dataBase);

libraryInteractor.showMenu();
