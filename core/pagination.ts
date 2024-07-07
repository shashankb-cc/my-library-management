import chalk from "chalk";
import { readChar } from "./input.utils";
import { printTableWithoutIndex } from "./printTableFormat";
import { IRepository } from "./repository";

export interface IPagesResponse<T> {
  items: T[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}
export interface IPageRequest {
  search?: string;
  offset: number;
  limit: number;
}

export async function viewCompleteList<T, U extends T>(
  repo: IRepository<T, U>,
  offset: number,
  limit: number,
  totalCount: number,
  search?: string | null
) {
  let currentPage: number;
  currentPage = 0;

  if (offset) {
    currentPage = Math.floor(offset / limit);
  }

  const loadData = async () => {
    const validateOffset = currentPage * limit + (offset % limit);
    const result = repo.list({
      search: search || undefined,
      offset: validateOffset > 0 ? validateOffset : 0,
      limit: limit,
    });

    if (result.items.length > 0) {
      console.log(
        chalk.bold.cyan(
          `\n\nPage: ${currentPage + 1} of ${Math.ceil(totalCount / limit)})`
        )
      );
      printTableWithoutIndex<T>(result.items);
      const hasPreviousPage = currentPage > 0;
      const hasNextPage =
        result.pagination.limit + result.pagination.offset <
        result.pagination.total;
      if (hasPreviousPage) {
        console.log(chalk.bold.yellow(`p\tPrevious Page`));
      }
      if (hasNextPage) {
        console.log(chalk.bold.yellow(`n\tNext Page`));
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
            console.log(chalk.bold.red("\n\nInvalid input"));
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
