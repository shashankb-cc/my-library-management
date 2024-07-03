import { readLine } from "../core/input.utils";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { IMember, IMemberBase, memberSchema } from "./models/member.model";
import { MemberRepository } from "./member.repository";
import chalk from "chalk";
import { ZodError } from "zod";
import { Database } from "../db/ds";
import { IPageRequest } from "../core/pagination";
import { LibraryInteractor } from "../src/library.interactor";

const menu = new Menu("Member-Management", [
  { key: "1", label: "Add Member" },
  { key: "2", label: "Edit Member" },
  { key: "3", label: "Search Member" },
  { key: "4", label: "List Members" },
  { key: "6", label: "Delete Member" },
  { key: "7", label: "<Previous Menu>" },
]);

export class MemberInteractor implements IInteractor {
  constructor(
    public libraryInteractor: LibraryInteractor,
    private db: Database
  ) {}
  private repo = new MemberRepository(this.db);
  async showMenu(): Promise<void> {
    let loop = true;
    while (loop) {
      const op = await menu.show();
      switch (op?.key.toLocaleLowerCase()) {
        case "1":
          await addMember(this.repo);
          break;
        case "2":
          await updateMember(this.repo);
          break;
        case "3":
          await searchMember(this.repo);
          break;
        case "4":
          await listMember(this.repo);
          break;
        case "6":
          await deleteMember(this.repo);
          break;
        case "7":
          loop = false;
          await this.libraryInteractor.showMenu();
          break;
      }
    }
  }
}

async function addMember(repo: MemberRepository) {
  while (true) {
    try {
      const member: IMemberBase = await getMemberInput();
      const validateMember = memberSchema.parse(member);
      const createdMember = await repo.create(validateMember);
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

async function getUpdatedMemberInput(
  CurrentMember: IMember
): Promise<IMemberBase> {
  const firstName =
    (await readLine(
      `Please Enter the first name (${CurrentMember.firstName}) : `
    )) ?? CurrentMember.firstName;
  const lastName =
    (await readLine(
      `Please Enter the last name (${CurrentMember.lastName}) :`
    )) ?? CurrentMember.lastName;
  const email =
    (await readLine(`Please Enter the email id (${CurrentMember.email}) :`)) ??
    CurrentMember.email;
  const phoneNumber =
    (await readLine(
      `Please Enter the Phone number: (${CurrentMember.phoneNumber})`
    )) ?? CurrentMember.phoneNumber;
  return {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phoneNumber: phoneNumber,
  };
}

async function updateMember(repo: MemberRepository) {
  let loop = true;
  while (loop) {
    const memberId: number = +(await readLine("Please Enter the member ID:"));
    const currentMember: IMember | null = await repo.getById(memberId);
    if (!currentMember) {
      await readLine("Please Enter valid Book Id");
    } else {
      loop = false;
      const member: IMemberBase = await getUpdatedMemberInput(currentMember);
      const updatedMember = await repo.update(memberId, member);
      console.table(updatedMember);
    }
  }
}

async function searchMember(repo: MemberRepository): Promise<IMember | null> {
  while (true) {
    const id = +(await readLine("Please Enter the Member Id:"));
    const member = await repo.getById(id);
    if (!member) {
      console.log("---------------------Note------------------------");
      console.log("\nNo Member found!!  Please Enter Valid Member ID!!!\n");
      console.log("-------------------------------------------------");
      continue;
    } else {
      console.table(member);
      return member;
    }
  }
}

async function listMember(repo: MemberRepository) {
  const param = await readLine(
    "\nPlease Enter the Search (You can search by ID, Name and Email):"
  );
  const offset = +(await readLine(
    "Please enter the search offset value (this determines where to start the search from, e.g., 0 for the beginning):"
  ));
  const limit = +(await readLine(
    "Please enter the search limit value (this determines the number of results to return):"
  ));
  const params: IPageRequest = {
    search: param,
    offset,
    limit,
  };
  const memberList = repo.list(params);
  console.table(memberList.items);
}

async function deleteMember(repo: MemberRepository) {
  const id = +(await readLine("Please Enter the Member Id:"));
  const member = await repo.getById(id);
  if (!member) {
    console.log("---------------------Note------------------------");
    console.log("\nNo Member found!!  Please Enter Valid Member ID!!!\n");
    console.log("--------------------------------------------------");
  } else {
    await repo.delete(id);
    console.log(`Book with a Id ${id} deleted successfully\n`);
  }
}
