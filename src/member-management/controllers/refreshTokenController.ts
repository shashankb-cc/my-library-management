import { Request, Response } from "express";
import { memberRepo } from "./authController";
import jwt from "jsonwebtoken";

export const handleRefreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  console.log("kss", cookies);

  if (!cookies?.jwt) return res.status(401).send("You're not authorized yet"); // Unauthorized

  const refreshToken = cookies.jwt;

  const member = await memberRepo.getByRefreshToken(refreshToken);
  if (!member)
    return res.status(403).send("You're forbidden to access the resource"); // Forbidden

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
    (err: any, decoded: any) => {
      if (err || member.email !== decoded.email) return res.sendStatus(403);

      const accessToken = jwt.sign(
        { id: member.id, email: member.email },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "30s" }
      );

      res.json({ accessToken });
    }
  );
};
