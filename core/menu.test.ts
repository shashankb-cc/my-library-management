import { describe, expect, test } from "vitest";
import { IMenuItem, Menu } from "./menu";

describe("Menu Test", () => {
  test("Creating Menu", () => {
    const libraryManagementMenuItem: IMenuItem[] = [
      { key: "1", label: "Book Management" },
      { key: "2", label: "Member Management" },
      { key: "3", label: "Transaction" },
    ];
    const bookManagementMenuItem: IMenuItem[] = [
      { key: "1", label: "Add Book" },
      { key: "2", label: "Update Book" },
      { key: "3", label: "Search Book" },
    ];

    //TODO Member management menu Test
    //@ts-expect-error
    const meberManagementMenu: IMenuItem = [];

    const libraryManagementMenu = new Menu(libraryManagementMenuItem);
    expect(libraryManagementMenu.serialize()).toBe(
      "1.\tBook Management\n2.\tMember Management\n3.\tTransaction"
    );

    const bookManagementMenu = new Menu(bookManagementMenuItem);
    expect(bookManagementMenu.serialize()).toBe(
      "1.\tAdd Book\n2.\tUpdate Book\n3.\tSearch Book"
    );
  });
});
