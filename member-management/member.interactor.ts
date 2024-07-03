import {
  NumberParser,
  readChar,
  readLine,
  StringParser,
} from "../core/input.utils";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { IMember, IMemberBase, memberSchema } from "./models/member.model";
import { MemberRepository } from "./member.repository";
import chalk from "chalk";
import { ZodError } from "zod";
import { Database } from "../db/ds";
import { IPageRequest } from "../core/pagination";
import { LibraryInteractor } from "../src/library.interactor";
import { LibraryDataset } from "../db/library-dataset";

const menu = new Menu("Member-Management", [
  { key: "1", label: "Add Member" },
  { key: "2", label: "Edit Member" },
  { key: "3", label: "Search Member" },
  { key: "4", label: "List Members " },
  { key: "5", label: "Delete Member" },
  { key: "6", label: "<Previous Menu>" },
]);

export class MemberInteractor implements IInteractor {
  constructor(
    public libraryInteractor: LibraryInteractor,
    private readonly db: Database<LibraryDataset>
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
          await viewCompleteList(this.repo);
          break;
        case "5":
          await deleteMember(this.repo);
          break;
        case "6":
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
      console.log(`Member added successfully!\nMember ID:${createdMember.id}`);
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

async function getMemberInput(member?: IMember) {
  const firstName =
    (await readLine(
      `Please Enter the first name: ${member?.lastName ?? ""}`,
      StringParser(true, !!member)
    )) || member?.firstName;
  const lastName =
    (await readLine(
      `Please Enter the last name: ${member?.lastName ?? ""}`,
      StringParser(true, !!member)
    )) || member?.lastName;
  const email =
    (await readLine(
      `Please Enter the email id: ${member?.email ?? ""}`,
      StringParser(true, !!member)
    )) || member?.email;
  const phoneNumber =
    (await readLine(
      `Please Enter the Phone number: ${member?.phoneNumber ?? ""}`,
      StringParser(true, !!member)
    )) || member?.phoneNumber;
  return {
    firstName: firstName!,
    lastName: lastName!,
    email: email!,
    phoneNumber: phoneNumber!,
  };
}

async function updateMember(repo: MemberRepository) {
  let loop = true;
  while (loop) {
    const memberId = await readLine(
      "Please Enter the member ID:",
      NumberParser()
    );
    const currentMember: IMember | null = await repo.getById(memberId!);
    if (!currentMember) {
      await readLine("Please Enter valid Member Id", NumberParser());
    } else {
      loop = false;
      const member: IMemberBase = await getMemberInput(currentMember);
      await repo.update(memberId!, member);
    }
  }
}

async function searchMember(repo: MemberRepository): Promise<IMember | null> {
  while (true) {
    const id = await readLine("Please Enter the Member Id:", NumberParser());
    const member = await repo.getById(id!);
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

async function deleteMember(repo: MemberRepository) {
  const id = (await readLine("Please Enter the Member Id:", NumberParser()))!;
  const member = await repo.getById(id!);
  if (!member) {
    console.log("---------------------Note------------------------");
    chalk.cyanBright(
      console.log("\nNo Member found!!  Please Enter Valid Member ID!!!\n")
    );
    console.log("--------------------------------------------------");
  } else {
    await repo.delete(id);
    console.log(`Member with a Id ${id} deleted successfully\n`);
  }
}
async function viewCompleteList(repo: MemberRepository) {
  let currentPage: number;
  const search = await readLine(
    "\nPlease Enter the Search Text (You can search by Member Id or Name ):",
    StringParser(true, true)
  );
  const offset =
    (await readLine(
      "Please enter the search offset value (this determines where to start the search from, e.g., 1 for the beginning):",
      NumberParser(true)
    ))! || 0;
  const limit =
    (await readLine(
      "Please enter the search limit value (this determines the number of results to return):",
      NumberParser(true)
    ))! || 10;
  currentPage = 0;
  if (offset) {
    currentPage = Math.floor(offset / limit);
  }

  const loadData = async () => {
    const validateOffset = currentPage * limit + (offset % limit) - 1;
    const result = await repo.list({
      search: search || undefined,
      offset: validateOffset > 0 ? validateOffset : 0,
      limit: limit,
    });
    if (result.items.length > 0) {
      console.log(`\n\nPage: ${currentPage + 1}`);
      console.table(result.items);
      const hasPreviousPage = currentPage > 0;
      const hasNextPage =
        result.pagination.limit + result.pagination.offset <
        result.pagination.total;
      if (hasPreviousPage) {
        console.log(`p\tPrevious Page`);
      }
      if (hasNextPage) {
        console.log(`n\tNext Page`);
      }
      if (hasPreviousPage || hasNextPage) {
        console.log(`q\tExit List`);
        const askChoice = async () => {
          const op = await readChar("\nChoice - ");
          console.log(op, "\n\n");
          if (op === "p" && hasPreviousPage) {
            currentPage--;
            await loadData();
          } else if (op === "n" && hasNextPage) {
            currentPage++;
            await loadData();
          } else if (op !== "q") {
            console.log("---", op, "---");
            console.log("\n\nInvalid input");
            await askChoice();
          }
        };
        await askChoice();
      }
    } else {
      console.log("\n\nNo data to show\n");
    }
  };
  await loadData();
}
