import db from "../drizzle/db";
import { eq } from "drizzle-orm";
import { TSelectUser, TInsertUser, users } from "../drizzle/schema";

// --------------------------- REGISTER USER ---------------------------
export const registerUserService = async (user: TInsertUser): Promise<TSelectUser> => {
  const [newUser] = await db.insert(users).values(user).returning();

  if (!newUser) throw new Error("Failed to create user");
  return newUser;
};

// --------------------------- GET USER BY EMAIL ---------------------------
export const getUserByEmailService = async (email: string): Promise<TSelectUser | undefined> => {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
};

// --------------------------- GET USER BY ID ---------------------------
export const getUserByIdService = async (id: string): Promise<TSelectUser | undefined> => {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
};

// --------------------------- UPDATE USER PASSWORD ---------------------------
export const updateUserPasswordService = async (email: string, newPasswordHash: string): Promise<string> => {
  const result = await db
    .update(users)
    .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
    .where(eq(users.email, email))
    .returning();

  if (result.length === 0) throw new Error("User not found or password update failed");
  return "Password updated successfully";
};

// --------------------------- UPDATE EMAIL VERIFICATION STATUS ---------------------------
export const updateVerificationStatusService = async (
  email: string,
  status: boolean,
  confirmationCode: string | null = null
): Promise<string> => {
  const result = await db
    .update(users)
    .set({
      emailVerified: status, // matches your table column
      confirmationCode,
      updatedAt: new Date(),
    })
    .where(eq(users.email, email))
    .returning();

  if (result.length === 0) throw new Error("User not found or verification status update failed");
  return "Verification status updated successfully";
};

// --------------------------- GENERATE AND UPDATE NEW CONFIRMATION CODE ---------------------------
export const generateAndSetNewConfirmationCode = async (email: string): Promise<string> => {
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();

  const result = await db
    .update(users)
    .set({ 
      confirmationCode: newCode,
      confirmationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min expiry
      updatedAt: new Date(),
    })
    .where(eq(users.email, email))
    .returning();

  if (result.length === 0) throw new Error("User not found or failed to set new confirmation code");
  return newCode;
};
