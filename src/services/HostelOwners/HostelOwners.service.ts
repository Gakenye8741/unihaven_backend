import db from "../../drizzle/db";
import { hostelOwners } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import {
  createHostelOwnerSchema,
  updateHostelOwnerSchema,
} from "../../validators/HostelOwners.validator";

// ========================== GET ALL HOSTEL OWNERS ==========================
export const getAllHostelOwners = async () => {
  const data = await db.query.hostelOwners.findMany({
    with: {
      user: true,
      hostel: true,
    },
    orderBy: (ho, { desc }) => [desc(ho.createdAt)],
  });

  return data;
};

// ========================== GET HOSTEL OWNER BY ID ==========================
export const getHostelOwnerById = async (id: string) => {
  const owner = await db.query.hostelOwners.findFirst({
    where: eq(hostelOwners.id, id),
    with: {
      user: true,
      hostel: true,
    },
  });

  return owner || null;
};

// ========================== CREATE HOSTEL OWNER ==========================
export const createHostelOwner = async (data: unknown) => {
  const validated = createHostelOwnerSchema.parse(data);

  const [newOwner] = await db
    .insert(hostelOwners)
    .values({
      ...validated,
      createdAt: new Date(),
    })
    .returning();

  // Fetch the newly created owner with relations
  const ownerWithRelations = await getHostelOwnerById(newOwner.id);

  return ownerWithRelations;
};

// ========================== UPDATE HOSTEL OWNER ==========================
export const updateHostelOwner = async (id: string, updates: unknown) => {
  const validated = updateHostelOwnerSchema.parse(updates);

  const [updatedOwner] = await db
    .update(hostelOwners)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(hostelOwners.id, id))
    .returning();

  // Fetch the updated owner with relations
  const ownerWithRelations = await getHostelOwnerById(updatedOwner.id);

  return ownerWithRelations;
};

// ========================== DELETE HOSTEL OWNER ==========================
export const deleteHostelOwner = async (id: string) => {
  const [deletedOwner] = await db
    .delete(hostelOwners)
    .where(eq(hostelOwners.id, id))
    .returning();

  return deletedOwner;
};

// ========================== GET OWNERS BY HOSTEL ==========================
export const getOwnersByHostelId = async (hostelId: string) => {
  const data = await db.query.hostelOwners.findMany({
    where: eq(hostelOwners.hostelId, hostelId),
    with: {
      user: true,
    },
    orderBy: (ho, { desc }) => [desc(ho.createdAt)],
  });

  return data;
};

// ========================== GET HOSTELS BY OWNER ==========================
export const getHostelsByOwnerId = async (userId: string) => {
  const data = await db.query.hostelOwners.findMany({
    where: eq(hostelOwners.userId, userId),
    with: {
      hostel: true,
    },
    orderBy: (ho, { desc }) => [desc(ho.createdAt)],
  });

  return data;
};
