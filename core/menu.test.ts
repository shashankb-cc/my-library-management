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

    const libraryManagementMenu = new Menu(
      "Library Management",
      libraryManagementMenuItem
    );
    expect(libraryManagementMenu.serialize()).toBe(
      "Library Management\n1.\tBook Management\n2.\tMember Management\n3.\tTransaction\n\nChoice - "
    );

    const bookManagementMenu = new Menu(
      "Book Management",
      bookManagementMenuItem
    );
    expect(bookManagementMenu.serialize()).toBe(
      "Book Management\n1.\tAdd Book\n2.\tUpdate Book\n3.\tSearch Book\n\nChoice - "
    );
  });
});
