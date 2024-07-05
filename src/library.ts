import { LibraryInteractor } from "./library.interactor";

const libraryInteractor = new LibraryInteractor();
(async () => {
  await libraryInteractor.showMenu();
})();
