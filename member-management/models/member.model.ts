export interface IMemberBase {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface IMember extends IMemberBase {
  memberId: number;
}
