import { z } from "zod";

// ==========================
// BASE HOSTEL OWNER SHAPE
// ==========================
const hostelOwnerBaseSchema = z.object({
  hostelId: z.string().uuid("Invalid hostel ID"),
  userId: z.string().uuid("Invalid user ID"),
  // optional createdAt / updatedAt if needed in the future
});

// ==========================
// CREATE HOSTEL OWNER
// ==========================
export const createHostelOwnerSchema = hostelOwnerBaseSchema;

// ==========================
// UPDATE HOSTEL OWNER
// (partial allows updating either field)
// ==========================
export const updateHostelOwnerSchema = hostelOwnerBaseSchema.partial();

// ==========================
// TYPES
// ==========================
export type CreateHostelOwnerInput = z.infer<typeof createHostelOwnerSchema>;
export type UpdateHostelOwnerInput = z.infer<typeof updateHostelOwnerSchema>;
