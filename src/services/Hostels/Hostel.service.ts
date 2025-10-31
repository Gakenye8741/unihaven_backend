import db from "../../drizzle/db";
import { hostels } from "../../drizzle/schema";
import { eq, and, ilike, or } from "drizzle-orm";
import {
  CreateHostelInput,
  UpdateHostelInput,
  GetHostelsQuery,
  createHostelSchema,
  updateHostelSchema,
  getHostelsQuerySchema,
} from "../../validators/Hostel.validator";

// ========================== GET ALL HOSTELS ==========================
export const getAllHostels = async (query: GetHostelsQuery) => {
  const validated = getHostelsQuerySchema.parse(query);
  const {
    location,
    gender,
    status,
    search,
    verified,
    limit,
    page,
  } = validated;

  const conditions: any[] = [];

  if (location) conditions.push(ilike(hostels.location, `%${location}%`));
  if (gender) conditions.push(eq(hostels.gender, gender));
  if (status) conditions.push(eq(hostels.status, status));
  if (typeof verified === "boolean") conditions.push(eq(hostels.verified, verified));
  if (search) {
    conditions.push(
      or(
        ilike(hostels.name, `%${search}%`),
        ilike(hostels.address, `%${search}%`),
        ilike(hostels.location, `%${search}%`),
        ilike(hostels.description, `%${search}%`)
      )
    );
  }

  const offset = (page - 1) * limit;

  const data = await db
    .select()
    .from(hostels)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .offset(offset);

  return data;
};

// ========================== GET HOSTEL BY ID ==========================
export const getHostelById = async (id: string) => {
  const [hostel] = await db
    .select()
    .from(hostels)
    .where(eq(hostels.id, id));

  return hostel || null;
};

// ========================== CREATE HOSTEL ==========================
export const createHostel = async (hostelData: CreateHostelInput) => {
  const validated = createHostelSchema.parse(hostelData);

  const [newHostel] = await db
    .insert(hostels)
    .values({
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newHostel;
};

// ========================== UPDATE HOSTEL ==========================
export const updateHostel = async (id: string, updates: UpdateHostelInput) => {
  const validated = updateHostelSchema.parse(updates);

  const [updatedHostel] = await db
    .update(hostels)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(hostels.id, id))
    .returning();

  return updatedHostel;
};

// ========================== DELETE HOSTEL ==========================
export const deleteHostel = async (id: string) => {
  const [deletedHostel] = await db
    .delete(hostels)
    .where(eq(hostels.id, id))
    .returning();

  return deletedHostel;
};

// ========================== CHANGE HOSTEL STATUS ==========================
export const changeHostelStatus = async (
  id: string,
  status: "AVAILABLE" | "FULL" | "UNDER_MAINTENANCE"
) => {
  const [updatedHostel] = await db
    .update(hostels)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(hostels.id, id))
    .returning();

  return updatedHostel;
};

// ========================== SEARCH HOSTELS ==========================
export const searchHostels = async (searchTerm: string, verified?: boolean) => {
  const conditions: any[] = [
    or(
      ilike(hostels.name, `%${searchTerm}%`),
      ilike(hostels.location, `%${searchTerm}%`),
      ilike(hostels.description, `%${searchTerm}%`),
      ilike(hostels.address, `%${searchTerm}%`)
    ),
  ];

  // If verified filter is passed, apply it
  if (typeof verified === "boolean") {
    conditions.push(eq(hostels.verified, verified));
  }

  const results = await db
    .select()
    .from(hostels)
    .where(and(...conditions));

  return results;
};
