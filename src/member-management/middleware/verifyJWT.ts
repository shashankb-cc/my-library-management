import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface CustomRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const verifyJWT = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // const authHeader = req.headers["authorization"];
  const token = req.cookies.accessToken;
  if (!token) return res.sendStatus(401); // Unauthorized

  // const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: any, decoded: any) => {
      if (err) return res.sendStatus(403); // Forbidden

      req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
      console.log(req.user);
      next();
    }
  );
};
