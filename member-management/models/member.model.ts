import z from "zod";
export interface IMemberBase {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface IMember extends IMemberBase {
  id: number;
}

export const memberSchema = z.object({
  firstName: z.string().min(3).max(30),
  lastName: z.string().min(3).max(30),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$/, {
    message: "Entered phone number is Invalid",
  }),
});
