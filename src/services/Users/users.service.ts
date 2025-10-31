import db from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { TUserValidator, userValidator } from "../../validators/Users.Validator";

// ========================== GET ALL USERS ==========================
export const getAllUsers = async () => {
  const allUsers = await db.select().from(users);
  return allUsers;
};

// ========================== GET USER BY ID ==========================
export const getUserById = async (id: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
};

// ========================== GET USER BY EMAIL ==========================
export const getUserByEmail = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
};

// ========================== CREATE USER ==========================
export const createUser = async (userData: TUserValidator) => {
  const validated = userValidator.parse(userData);

  // Hash password
  const hashedPassword = await bcrypt.hash(validated.passwordHash, 10);

  const [newUser] = await db
    .insert(users)
    .values({
      ...validated,
      passwordHash: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newUser;
};

// ========================== UPDATE USER ==========================
// Allows partial updates. Automatically hashes password if provided.
export const updateUser = async (id: string, updates: Partial<TUserValidator>) => {
  const validated = userValidator.partial().parse(updates);

  let updateData = { ...validated };

  if (updates.passwordHash) {
    updateData.passwordHash = await bcrypt.hash(updates.passwordHash, 10);
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return updatedUser;
};

// ========================== DELETE USER ==========================
export const deleteUser = async (id: string) => {
  const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning();
  return deletedUser;
};

// ========================== SUSPEND USER ==========================
export const suspendUser = async (id: string, until?: Date) => {
  const [updatedUser] = await db
    .update(users)
    .set({
      isSuspended: true,
      suspendedUntil: until ?? null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return updatedUser;
};

// ========================== UNSUSPEND USER ==========================
export const unsuspendUser = async (id: string) => {
  const [updatedUser] = await db
    .update(users)
    .set({
      isSuspended: false,
      suspendedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return updatedUser;
};

// ========================== CHECK IF USER IS ACTIVE ==========================
export const isUserActive = (user: TUserValidator & { isSuspended?: boolean; suspendedUntil?: Date }): boolean => {
  if (!user) return false;
  if (!user.isSuspended) return true;
  if (user.suspendedUntil && new Date(user.suspendedUntil) < new Date()) return true;
  return false;
};
