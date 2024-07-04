import { Database } from "../db/ds";
import { LibraryInteractor } from "./library.interactor";

const dataBase = new Database("./data/library.json");
const libraryInteractor = new LibraryInteractor(dataBase);
(async () => {
  await libraryInteractor.showMenu();
})();
