import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// Updated to match your Drizzle enum
export type UserRole =
  | "STUDENT"
  | "HOSTEL_OWNER"
  | "CARETAKER"
  | "ADVERTISER"
  | "ADMIN"
  | "MODERATOR";

export interface DecodedToken {
  id: string; // UUID from your users table
  email: string;
  role: UserRole;
  name?: string;
  exp: number;
  iat?: number;
}

// ========================== VERIFY TOKEN ==========================
export const verifyToken = (token: string, secret: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch {
    return null;
  }
};

// ========================== AUTH MIDDLEWARE ==========================
export const authMiddleware =
  (allowedRoles: UserRole[] = []) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (process.env.NODE_ENV === "test") return next();

      const authHeader = req.header("Authorization");
      if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        res.status(401).json({ error: "Token not provided" });
        return;
      }

      const decodedToken = verifyToken(token, process.env.JWT_SECRET as string);
      if (!decodedToken) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
      }

      // Check if user role is allowed
      if (allowedRoles.length && !allowedRoles.includes(decodedToken.role)) {
        res.status(403).json({ error: "Forbidden: insufficient permissions" });
        return;
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      res.status(500).json({ error: "Authentication error" });
    }
  };

// ========================== ROLE-BASED EXPORTS ==========================
export const studentAuth = authMiddleware(["STUDENT"]);
export const hostelOwnerAuth = authMiddleware(["HOSTEL_OWNER"]);
export const caretakerAuth = authMiddleware(["CARETAKER"]);
export const advertiserAuth = authMiddleware(["ADVERTISER"]);
export const adminAuth = authMiddleware(["ADMIN"]);
export const moderatorAuth = authMiddleware(["MODERATOR"]);

export const adminOrModeratorAuth = authMiddleware(["ADMIN", "MODERATOR"]);
export const anyAuth = authMiddleware([
  "STUDENT",
  "HOSTEL_OWNER",
  "CARETAKER",
  "ADVERTISER",
  "ADMIN",
  "MODERATOR",
]);

// ========================== OPTIONAL AUTH (Guest Allowed) ==========================
export const optionalAuth =
  (allowedRoles: UserRole[] = []) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.header("Authorization");

      if (!authHeader) {
        req.user = undefined;
        return next();
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        req.user = undefined;
        return next();
      }

      const decodedToken = verifyToken(token, process.env.JWT_SECRET as string);
      if (!decodedToken) {
        req.user = undefined;
        return next();
      }

      if (allowedRoles.length && !allowedRoles.includes(decodedToken.role)) {
        req.user = undefined; // not allowed → continue as guest
        return next();
      }

      req.user = decodedToken;
      next();
    } catch {
      req.user = undefined;
      next();
    }
  };

// ========================== ✅ AUTH FOR HOSTEL ROUTES ==========================
// Allow only Hostel Owners, Admins, or Moderators to manage hostel data
export const authHostel = authMiddleware(["HOSTEL_OWNER", "ADMIN", "MODERATOR"]);
