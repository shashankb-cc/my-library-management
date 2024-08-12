import { Request, Response } from "express";
import { memberRepo } from "./authController";
export const handleLogout = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204); // No content
  const refreshToken = cookies.jwt;

  const member = await memberRepo.getByRefreshToken(refreshToken);
  if (!member) {
    res.clearCookie("jwt", { httpOnly: true, secure: true });
    return res.sendStatus(204);
  }
  // Delete the refreshToken in the database
  await memberRepo.update(member.id, { refreshToken: null });

  res.clearCookie("jwt", { httpOnly: true, secure: true });
  res.status(401).send("Logged out successfully");
};
