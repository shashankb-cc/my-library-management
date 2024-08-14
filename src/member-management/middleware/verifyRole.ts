import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const verifyRole = (roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.send("You're forbidden to access the resource").status(401); // Forbidden
    }
    next();
  };
};
