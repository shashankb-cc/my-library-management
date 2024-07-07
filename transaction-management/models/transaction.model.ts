export interface ITransactionBase {
  memberId: number;
  bookId: number;
}

export interface ITransaction extends ITransactionBase {
  id: number;
  issueDate: string;
  dueDate: string;
  Status: TStatus;
}

type TStatus = "Issued" | "Returned";
