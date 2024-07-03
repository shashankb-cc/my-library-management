import { readChar, readLine } from "../core/input.utils";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { IPageRequest } from "../core/pagination";
import { IMember, IMemberBase, memberSchema } from "./models/member.model";
import { MemberRepository } from "./member.repository";
import { I } from "vitest/dist/reporters-yx5ZTtEV.js";
import { a } from "vitest/dist/suite-IbNSsUWN.js";
import chalk from "chalk";
import { ZodError } from "zod";

const menu = new Menu("Book-Management", [
  { key: "1", label: "Add Member" },
  { key: "2", label: "Edit Member" },
  { key: "3", label: "Search Member" },
  { key: "4", label: "List Members" },
  { key: "5", label: "<Previous Menu>" },
]);

export class MemberInteractor implements IInteractor {
  constructor(public libraryInteractor: IInteractor) {}
  private repo = new MemberRepository();
  async showMenu(): Promise<void> {
    const op = await readChar(menu.serialize());
    switch (op) {
      case "1":
        addMember(this.repo);
        this.showMenu();
    }
  }
}

async function addMember(repo: MemberRepository) {
  while (true) {
    try {
      const member: IMemberBase = await getMemberInput();
      const parser = memberSchema.parse(member);
      const createdMember = repo.create(member);
      console.log(
        `Book added successfully!\nBook ID:${createdMember.memberId}`
      );
      console.table(createdMember);
      break;
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        console.log(
          chalk.red("\nData is invalid! Please enter the valid data")
        );
        const errors = error.flatten().fieldErrors;
        Object.entries(errors).forEach((e) => {
          console.log(`${e[0]}:${chalk.red(e[1])}`);
        });
      }
    }
  }
}

async function getMemberInput() {
  console.log("\n-----------------------------------------------");
  console.log("Adding Member Details");
  console.log("-----------------------------------------------");
  const firstName = await readLine("Please Enter the first name:");
  const lastName = await readLine("Please Enter the last name:");
  const email = await readLine("Please Enter the email id:");
  const phoneNumber = await readLine("Please Enter the Phone number:");
  return {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phoneNumber: phoneNumber,
  };
}
