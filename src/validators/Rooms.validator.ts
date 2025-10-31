// ========================
// ENUMS

import z from "zod";

// ========================
export const roomTypeEnum = ["SINGLE", "DOUBLE", "OTHER", "BEDSITTER", "ONE_BEDROOM"] as const;
export const roomStatusEnum = ["AVAILABLE", "OCCUPIED", "RESERVED", "UNDER_REPAIR"] as const;

// ========================
// BASE ROOM SCHEMA
// ========================
const roomBaseSchema = z.object({
  hostelId: z.string().uuid("Invalid hostel ID"),
  roomNumber: z.string().min(1, "Room number is required"),
  floor: z.string().optional(),
  type: z.enum(roomTypeEnum).default("SINGLE"),
  pricePerMonth: z.number().int().nonnegative().default(0),
  status: z.enum(roomStatusEnum).default("AVAILABLE"),
  amenities: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

// ========================
// CREATE / UPDATE SCHEMAS
// ========================
export const createRoomSchema = roomBaseSchema;
export const updateRoomSchema = roomBaseSchema.partial();

// ========================
// TYPES
// ========================
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
