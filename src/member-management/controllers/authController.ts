import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MemberRepository } from "../member.repository";
import { IMember } from "../models/member.model";
import "dotenv/config";
import { getDrizzleDB } from "../../drizzle/drizzleDB";

export const db = getDrizzleDB();
export const memberRepo = new MemberRepository(db);

export const handleLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const member = await memberRepo.getByEmail(email);
  if (!member) return res.sendStatus(401); // Unauthorized

  const match = await bcrypt.compare(password, member.password);
  if (match) {
    const accessToken = jwt.sign(
      { id: member.id, email: member.email },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      { id: member.id, email: member.email },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    // Save refreshToken in the database
    await memberRepo.update(member.id, { refreshToken });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 1 * 60 * 1000, // 30 minutes
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
};
