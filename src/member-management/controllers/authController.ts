import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MemberRepository } from "../member.repository";
import "dotenv/config";
import { getDrizzleDB } from "../../drizzle/drizzleDB";

export const db = getDrizzleDB();
export const memberRepo = new MemberRepository(db);

export const handleLibrarianLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const member = await memberRepo.getByEmail(email);
  if (!member) return res.sendStatus(401); // Unauthorized

  // Check if the user is a librarian
  if (member.role !== "librarian") {
    return res
      .status(403)
      .send("You're not allowed to login through this path"); // Forbidden
  }

  const match = await bcrypt.compare(password, member.password);
  if (match) {
    const accessToken = jwt.sign(
      { id: member.id, email: member.email, role: member.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "60s" }
    );
    const refreshToken = jwt.sign(
      { id: member.id, email: member.email, role: member.role },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    // Save refreshToken in the database
    await memberRepo.insertRefreshToken({ memberId: member.id, refreshToken });

    res.cookie("accessToken", accessToken, {
      maxAge: 1 * 60 * 1000, // 1 minute
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({ accessToken });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  console.log("i am here bro");
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const member = await memberRepo.getByEmail(email);
  if (!member) return res.status(401).send("not present in table  "); // Unauthorized

  const match = await bcrypt.compare(password, member.password);
  if (match) {
    const accessToken = jwt.sign(
      { id: member.id, email: member.email, role: member.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "60s" }
    );
    const refreshToken = jwt.sign(
      { id: member.id, email: member.email, role: member.role },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    // Save refreshToken in the database
    await memberRepo.insertRefreshToken({ memberId: member.id, refreshToken });

    res.cookie("accessToken", accessToken, {
      maxAge: 1 * 60 * 1000, // 1 minute
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({ accessToken: accessToken, member: member });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};
