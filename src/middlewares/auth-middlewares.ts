import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'super-secret-key-123';
    
    // Verify with HS256 algorithm
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).user = decoded as {
      userId: string;
      email: string;
      userName: string;
    };
    next();
  } catch (error: any) {
    console.error("JWT verification error:", error.message);

    return res.status(401).json({
      message: "Unauthorized",
      error: error.message,
    });
  }
};
