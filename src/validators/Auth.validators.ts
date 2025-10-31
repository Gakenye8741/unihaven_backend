import { z } from "zod";

// Helper: validate 18+ age
const isAtLeast18 = (date: Date) => {
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
  return hasBirthdayPassed ? age >= 18 : age - 1 >= 18;
};

// ------------------------- ENUMS -------------------------
const userRoles = [
  "STUDENT",
  "HOSTEL_OWNER",
  "CARETAKER",
  "ADVERTISER",
  "ADMIN",
  "REGULAR",
] as const;

const genders = ["MALE", "FEMALE", "OTHER"] as const;

const orientations = [
  "STRAIGHT",
  "GAY",
  "LESBIAN",
  "BISEXUAL",
  "ASEXUAL",
  "PANSEXUAL",
  "OTHER",
] as const;

const visibilityOptions = ["PUBLIC", "PRIVATE", "FRIENDS_ONLY"] as const;

const verificationBadges = ["NONE", "STUDENT", "HOSTEL_OWNER", "HOSTEL", "BUSINESS", "CARETAKER"] as const;

// ------------------------- USER REGISTRATION -------------------------
export const registerUserValidator = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters").max(255),
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email address"),
  passwordHash: z.string().min(6, "Password must be at least 6 characters"),

  dateOfBirth: z.coerce.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date format",
  }).refine((date) => isAtLeast18(date), {
    message: "You must be at least 18 years old to register",
  }),

  gender: z.enum(genders).optional().default("OTHER"),
  orientation: z.enum(orientations).optional().default("OTHER"),
  bio: z.string().max(1000).optional().default(""),
  avatarUrl: z.string().optional().nullable(),
  coverPhotoUrl: z.string().optional().nullable(),
  visibility: z.enum(visibilityOptions).optional().default("PUBLIC"),
  role: z.enum(userRoles).optional().default("STUDENT"),
  phone: z.string().max(20).optional(),
  nationalId: z.string().max(50).optional(),
  schoolRegNo: z.string().max(50).optional(),
});

// ------------------------- USER LOGIN -------------------------
export const loginUserValidator = z.object({
  email: z.string().email("Invalid email address"),
  passwordHash: z.string().min(6, "Password must be at least 6 characters"),
});

// ------------------------- PASSWORD UPDATE -------------------------
export const updatePasswordValidator = z.object({
  email: z.string().email("Invalid email address"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

// ------------------------- EMAIL VERIFICATION -------------------------
export const verifyEmailValidator = z.object({
  email: z.string().email("Invalid email address"),
  confirmationCode: z.string().length(6, "Confirmation code must be 6 digits"),
});

// ------------------------- PROFILE UPDATE -------------------------
export const updateProfileValidator = z.object({
  fullName: z.string().min(3).optional(),
  username: z.string().min(3).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  coverPhotoUrl: z.string().optional(),
  gender: z.enum(genders).optional(),
  orientation: z.enum(orientations).optional(),
  visibility: z.enum(visibilityOptions).optional(),
  phone: z.string().max(20).optional(),
  nationalId: z.string().max(50).optional(),
  schoolRegNo: z.string().max(50).optional(),
});
