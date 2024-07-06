export interface ITransactionBase {
  memberId: number;
  bookId: number;
}

export interface ITransaction extends ITransactionBase {
  id: number;
  issueDate: Date;
  dueDate: Date;
  isBookReturned: boolean | null;
}

export interface TransactionTableEntry {
  Id: number;
  BookID: number;
  MemberID: number;
  IssueDate: string;
  DueDate: string;
  Returned: string;
}
