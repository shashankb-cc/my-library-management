import { NumberParser, readLine, StringParser } from "../core/input.utils";
import { IInteractor } from "../core/interactor";
import { Menu } from "../core/menu";
import { IMember, IMemberBase, memberSchema } from "./models/member.model";
import { MemberRepository } from "./member.repository";
import chalk from "chalk";
import { ZodError } from "zod";
import { LibraryInteractor } from "../src/library.interactor";
import { LibraryDataset } from "../db/library-dataset";
import { viewCompleteList } from "../core/pagination";
import { MySqlConnectionPoolFactory } from "../db/mysql-adapter";
import { MySql2Database } from "drizzle-orm/mysql2";

const menu = new Menu("Member-Management", [
  { key: "1", label: "Add Member" },
  { key: "2", label: "Edit Member" },
  { key: "3", label: "Search Member" },
  { key: "4", label: "List Members" },
  { key: "5", label: "Delete Member" },
  { key: "6", label: chalk.yellow("<Previous Menu>") },
]);

export class MemberInteractor implements IInteractor {
  constructor(
    public libraryInteractor: LibraryInteractor,
    private readonly db: MySql2Database<Record<string, never>>
  ) {}
  private repo = new MemberRepository(this.db);
  async showMenu(): Promise<void> {
    let loop = true;
    while (loop) {
      const op = await menu.show();
      if (op) {
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
            await listOfMembers(this.repo);
            break;
          case "5":
            await deleteMember(this.repo);
            break;
          case "6":
            loop = false;
            await this.libraryInteractor.showMenu();
            break;
        }
      } else {
        chalk.bold.red("\nInvalid option, Please Enter valid option\n");
      }
    }
  }
}
async function getMemberInput(member?: IMember) {
  try {
    const firstName =
      (await readLine(
        `Please Enter the first name: ${member ? `(${member.firstName})` : ""}`,
        StringParser(true, !!member)
      )) || member?.firstName;
    const lastName =
      (await readLine(
        `Please Enter the last name: ${member ? `(${member.lastName})` : ""}`,
        StringParser(true, !!member)
      )) || member?.lastName;
    const email =
      (await readLine(
        `Please Enter the email id: ${member ? `(${member.email})` : ""}`,
        StringParser(true, !!member)
      )) || member?.email;
    const phoneNumber =
      (await readLine(
        `Please Enter the Phone number: ${member ? `(${member.phoneNumber})` : ""}`,
        StringParser(true, !!member)
      )) || member?.phoneNumber;
    return {
      firstName: firstName!,
      lastName: lastName!,
      email: email!,
      phoneNumber: phoneNumber!,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        chalk.bold.red("\nError while getting member input:\n"),
        error.message
      );
    }
  }
}

async function addMember(repo: MemberRepository) {
  while (true) {
    try {
      const member: IMemberBase | undefined = await getMemberInput();
      const validateMember = memberSchema.parse(member);
      const createdMember = await repo.create(validateMember);
      console.log(
        chalk.green(
          `Member added successfully!\nMember ID:${createdMember?.id}`
        )
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

async function updateMember(repo: MemberRepository) {
  let loop = true;
  while (loop) {
    try {
      const memberId = await readLine(
        "Please Enter the member ID: ",
        NumberParser()
      );
      const currentMember: IMember | undefined = await repo.getById(memberId!);
      if (!currentMember) {
        console.log(
          chalk.bold.red("\nNo Member found! Please Enter a valid Member ID.\n")
        );
        continue;
      } else {
        loop = false;
        const member: IMemberBase | undefined =
          await getMemberInput(currentMember);
        const updatedMember = await repo.update(memberId!, member!);
        console.log(
          chalk.green(`\nMember with ID ${memberId} updated successfully.\n7`)
        );
        console.table(updatedMember);
      }
    } catch (error) {
      console.error(
        chalk.bold.red("\nError while updating the book:\n"),
        error
      );
    }
  }
}

async function searchMember(repo: MemberRepository): Promise<IMember | null> {
  while (true) {
    try {
      const id = await readLine("Please Enter the Member Id:", NumberParser());
      const member = await repo.getById(id!);
      if (!member) {
        console.log(
          chalk.red(
            "No member found with the given ID. Please enter a valid Member ID."
          )
        );
        continue;
      } else {
        console.table(member);
        return member;
      }
    } catch (error) {
      console.error(
        chalk.bold.red("\nError while searching the Member:\n"),
        error
      );
    }
  }
}

async function deleteMember(repo: MemberRepository) {
  try {
    const id = (await readLine("Please Enter the Member Id:", NumberParser()))!;
    const member = await repo.getById(id!);
    if (!member) {
      console.log(
        chalk.red(
          "No member found with the given ID. Please enter a valid Member ID."
        )
      );
    } else {
      const deletedMember = await repo.delete(id!);
      console.log(chalk.green(`Member with a Id ${id} deleted successfully\n`));
      console.table(deletedMember);
    }
  } catch (error) {
    console.error(
      chalk.bold.red("\nError while deleting the Member:\n"),
      error
    );
  }
}

async function listOfMembers(repo: MemberRepository) {
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

  const totalMembers = await repo.getTotalCount();

  await viewCompleteList(repo, offset, limit, totalMembers!, search);
}
