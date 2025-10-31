import db from "../../drizzle/db";
import { rooms } from "../../drizzle/schema";
import { eq, ilike, and, or, desc } from "drizzle-orm";
import {
  CreateRoomInput,
  UpdateRoomInput,
  createRoomSchema,
  updateRoomSchema,
} from "../../validators/Rooms.validator";


// ========================== GET ALL ROOMS ==========================
export const getAllRooms = async (query?: { search?: string }) => {
  const conditions: any[] = [];

  if (query?.search) {
    conditions.push(
      or(
        ilike(rooms.roomNumber, `%${query.search}%`),
        ilike(rooms.floor, `%${query.search}%`),
        ilike(rooms.amenities, `%${query.search}%`)
      )
    );
  }

  const data = await db.query.rooms.findMany({
    with: {
      hostel: true, 
    },
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: (r) => [desc(r.createdAt)],
  });

  return data;
};

// ========================== GET ROOM BY ID ==========================
export const getRoomById = async (id: string) => {
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, id),
    with: {
      hostel: true, // include the related hostel
    },
  });
  return room || null;
};

// ========================== CREATE ROOM ==========================
export const createRoom = async (roomData: CreateRoomInput) => {
  const validated: CreateRoomInput = createRoomSchema.parse(roomData);

  const [newRoom] = await db
    .insert(rooms)
    .values({
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newRoom;
};

// ========================== UPDATE ROOM ==========================
export const updateRoom = async (id: string, updates: UpdateRoomInput) => {
  const validated: UpdateRoomInput = updateRoomSchema.parse(updates);

  const [updatedRoom] = await db
    .update(rooms)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(rooms.id, id))
    .returning();

  return updatedRoom;
};

// ========================== DELETE ROOM ==========================
export const deleteRoom = async (id: string) => {
  const [deletedRoom] = await db.delete(rooms).where(eq(rooms.id, id)).returning();
  return deletedRoom;
};

// ========================== CHANGE ROOM STATUS ==========================
export const changeRoomStatus = async (
  id: string,
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "UNDER_REPAIR"
) => {
  const [updatedRoom] = await db
    .update(rooms)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(rooms.id, id))
    .returning();

  return updatedRoom;
};

// ========================== GET ROOMS BY HOSTEL ==========================
export const getRoomsByHostelId = async (hostelId: string) => {
  const data = await db.query.rooms.findMany({
    where: eq(rooms.hostelId, hostelId),
    with: {
      hostel: true, // include the related hostel
    },
    orderBy: (r) => [desc(r.createdAt)],
  });

  return data;
};
