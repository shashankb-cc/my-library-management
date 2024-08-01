import { getDrizzleDB } from "./drizzle/drizzleDB";
import { LibraryInteractor } from "./library.interactor";

const db = getDrizzleDB();
const libraryInteractor = new LibraryInteractor(db);
(async () => {
  await libraryInteractor.showMenu();
})();
