import { z } from "zod";

// --------------------------- ENUMS ---------------------------
export const roleEnum = z.enum([
  "STUDENT",
  "HOSTEL_OWNER",
  "CARETAKER",
  "ADVERTISER",
  "ADMIN",
  "MODERATOR",
]);

export const genderEnum = z.enum(["MALE", "FEMALE", "OTHER"]).nullable();

export const verificationBadgeEnum = z.enum([
  "NONE",
  "STUDENT",
  "HOSTEL_OWNER",
  "CARETAKER",
  "HOSTEL",
  "BUSINESS",
]);

export const visibilityEnum = z.enum(["PUBLIC", "PRIVATE", "FRIENDS_ONLY"]);

// --------------------------- USER VALIDATOR ---------------------------
export const userValidator = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .nullable()
    .transform((val) => val ?? ""), // convert null → empty string

  fullName: z.string().min(1, "Full name is required"),

  email: z.string().email("Invalid email"),

  passwordHash: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .nullable()
    .transform((val) => val ?? ""),

  phone: z.string().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  schoolRegNo: z.string().nullable().optional(),

  role: roleEnum,

  gender: genderEnum.optional(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().url("Invalid URL").nullable().optional(),
  coverPhotoUrl: z.string().url("Invalid URL").nullable().optional(),

  confirmationCode: z.string().nullable().optional(),
  confirmationCodeExpiresAt: z.date().nullable().optional(),
  emailVerified: z.boolean().nullable().optional(),

  verificationBadge: verificationBadgeEnum,
  verificationExpiresAt: z.date().nullable().optional(),

  isSuspended: z.boolean().default(false),
  suspendedUntil: z.date().nullable().optional(),

  visibility: visibilityEnum.default("PUBLIC"),

  createdAt: z.date().optional(),
  updatedAt: z.date().nullable().optional(),
});

// --------------------------- TYPE ---------------------------
export type TUserValidator = z.infer<typeof userValidator>;

// --------------------------- PARTIAL VALIDATOR (for updates) ---------------------------
export const userUpdateValidator = userValidator.partial();
