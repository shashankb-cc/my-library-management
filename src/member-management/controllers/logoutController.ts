import { Request, Response } from "express";
import { memberRepo } from "./authController";
export const handleLogout = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content
  const refreshToken = cookies.jwt;
  const member = await memberRepo.getByToken(refreshToken);
  if (!member) {
    res.clearCookie("jwt", { httpOnly: true, secure: true });
    return res.sendStatus(204);
  }
  // Delete the refreshToken in the database
  await memberRepo.deleteByToken(refreshToken);
  res.clearCookie("accessToken");
  res.clearCookie("jwt", { httpOnly: true, secure: true });
  res.status(401).send("Logged out successfully");
};
