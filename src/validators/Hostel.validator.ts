import { z } from "zod";

// ========================
// ENUM-LIKE CONSTANTS (mirror your schema enums)
// ========================
export const genderEnum = ["MALE", "FEMALE", "MIXED"] as const;
export const hostelStatusEnum = ["AVAILABLE", "FULL", "UNDER_MAINTENANCE"] as const;

// ========================
// BASE HOSTEL SHAPE (shared by create/update)
// ========================
const hostelBaseSchema = z.object({
  name: z.string().min(3, "Hostel name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  address: z.string().min(5, "Address is required"),
  campus: z.string().min(2, "Campus is required"),
  location: z.string().min(2, "Location is required"),

  gender: z.enum(genderEnum).default("MIXED"),
  status: z.enum(hostelStatusEnum).default("AVAILABLE"),
  verified: z.boolean().default(false),

  totalRooms: z
    .number({ invalid_type_error: "Total rooms must be a number" })
    .int()
    .nonnegative("Total rooms must be a non-negative integer")
    .default(0),

  roomMapJson: z.string().optional(),
  averageRating: z.number().min(0).max(5).default(0),
  ratingCount: z.number().int().nonnegative().default(0),

  minPrice: z
    .number({ invalid_type_error: "Minimum price must be a number" })
    .int()
    .nonnegative("Minimum price must be a positive number")
    .default(0),

  maxPrice: z
    .number({ invalid_type_error: "Maximum price must be a number" })
    .int()
    .nonnegative("Maximum price must be a positive number")
    .default(0),

  contactNumber: z
    .string()
    .min(7, "Contact number is too short")
    .max(15, "Contact number is too long")
    .optional(),

  images: z.array(z.string().url("Invalid image URL")).optional(),
  amenities: z.array(z.string()).optional(),
});

// ========================
// CREATE HOSTEL VALIDATION
// (adds business logic refinement)
// ========================
export const createHostelSchema = hostelBaseSchema.refine(
  (data) => data.maxPrice >= data.minPrice,
  {
    message: "Maximum price must be greater than or equal to minimum price",
    path: ["maxPrice"],
  }
);

// ========================
// UPDATE HOSTEL VALIDATION
// (partial version of the base schema)
// ========================
export const updateHostelSchema = hostelBaseSchema.partial();

// ========================
// FILTER / QUERY VALIDATION (for GET endpoints)
// ========================
export const getHostelsQuerySchema = z.object({
  campus: z.string().optional(),
  location: z.string().optional(),
  gender: z.enum(genderEnum).optional(),
  status: z.enum(hostelStatusEnum).optional(),
  verified: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  page: z.coerce.number().min(1).default(1),
});

// ========================
// TYPES
// ========================
export type CreateHostelInput = z.infer<typeof createHostelSchema>;
export type UpdateHostelInput = z.infer<typeof updateHostelSchema>;
export type GetHostelsQuery = z.infer<typeof getHostelsQuerySchema>;
