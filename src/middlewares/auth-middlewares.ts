import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";

// Helper function to get the public key
const getPublicKey = (): string => {
  // First, try to read from file (same as auth server)
  const publicKeyPath = path.join(__dirname, "../config/public.pem");
  if (fs.existsSync(publicKeyPath)) {
    try {
      return fs.readFileSync(publicKeyPath, "utf-8");
    } catch (error) {
      console.warn("Failed to read public key from file, trying env variable");
    }
  }

  // Fall back to environment variable
  const publicKeyFromEnv = process.env.JWT_SECRET_PUBLIC_KEY;
  if (!publicKeyFromEnv) {
    throw new Error(
      "JWT_SECRET_PUBLIC_KEY not configured. Either set the env variable or place public.pem in config/"
    );
  }

  // Handle newlines in env variable (replace \n with actual newlines)
  let publicKey = publicKeyFromEnv;

  // If the key doesn't have proper PEM headers, it might be a single line
  // Check if it needs formatting
  if (!publicKey.includes("-----BEGIN PUBLIC KEY-----")) {
    throw new Error("Public key must be in PEM format with BEGIN/END headers");
  }

  // Replace escaped newlines with actual newlines
  publicKey = publicKey.replace(/\\n/g, "\n");

  // Ensure proper PEM format
  if (!publicKey.endsWith("\n") && !publicKey.endsWith("\r\n")) {
    publicKey = publicKey.trim() + "\n";
  }

  return publicKey;
};

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
    // Get the public key for RS256 verification
    let publicKey: string;
    try {
      publicKey = getPublicKey();
      console.log("publicKey", publicKey);
    } catch (error: any) {
      console.error("Failed to load public key:", error.message);
      return res.status(500).json({
        message: "Server configuration error",
        error: error.message,
      });
    }

    // Verify the key format
    // if (
    //   !publicKey.includes("-----BEGIN PUBLIC KEY-----") ||
    //   !publicKey.includes("-----END PUBLIC KEY-----")
    // ) {
    //   console.error("Public key is not in valid PEM format");
    //   return res.status(500).json({
    //     message: "Server configuration error",
    //     error: "Public key must be in PEM format",
    //   });
    // }

    // Verify with RS256 algorithm (matching auth service)
    const decoded = jwt.verify(token, publicKey);

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

    // Provide more helpful error messages
    if (error.message.includes("asymmetric key")) {
      console.error(
        "Public key format issue. Ensure the key is in PEM format with proper headers."
      );
    }

    return res.status(401).json({
      message: "Unauthorized",
      error: error.message,
    });
  }
};
