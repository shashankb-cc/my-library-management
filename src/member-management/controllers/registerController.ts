import { Request, Response } from "express";
import { memberRepo } from "./authController";
import bcrypt from "bcrypt";
import { IMember } from "../models/member.model";

export const handleNewUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;

  if (!email || !password || !firstName || !lastName || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const existingMember = await memberRepo.getByEmail(email);
  if (existingMember) return res.sendStatus(409); // Conflict
  try {
    const hashedPwd = await bcrypt.hash(password, 10);
    const newMember: Omit<IMember, "id"> = {
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPwd,
      refreshToken: null,
    };
    const createdMember = await memberRepo.create(newMember);
    res
      .status(201)
      .json({ success: `New user ${createdMember?.email} created!` });
  } catch (err) {
    res.status(500).json({ message: "Cant register member" });
  }
};
