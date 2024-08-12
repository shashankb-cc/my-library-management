import express, { Request, Response, NextFunction } from "express";

// Middleware to validate member data
export const validateMemberDataMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const member = req.body;
  const bodyFields = ["firstName", "lastName", "email", "phoneNumber"];

  if (member) {
    if (req.method === "POST" || req.method === "PUT") {
      for (const field of bodyFields) {
        if (!member[field]) {
          return res.status(400).json({ error: `${field} is required` });
        }
      }
      next();
    } else if (req.method === "PATCH") {
      const hasAtLeastOneField = bodyFields.some((field) => field in member);
      if (!hasAtLeastOneField) {
        return res.status(400).json({
          error: "At least one field must be present for PATCH",
        });
      }
      next();
    }
  } else {
    res.status(400).json({ error: "Request body is missing" });
  }
};
