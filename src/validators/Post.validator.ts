import { z } from "zod";

// ========================== ENUMS ==========================

export const mediaTypeEnum = ["IMAGE", "VIDEO", "NONE"] as const;
export const postTypeEnum = ["GENERAL", "ROOM_AVAILABLE", "LOOKING_FOR_ROOM", "NOTICE","HOSTEL_UPDATE"] as const;

// ========================== POST SCHEMAS ==========================

// Base schema for creating a post
const postBaseSchema = z.object({
  authorId: z.string().uuid("Invalid author ID"),
  userId: z.string().uuid("Invalid user ID").optional(), // optional for legacy support
  hostelId: z.string().uuid("Invalid hostel ID").optional(),
  type: z.enum(postTypeEnum).default("GENERAL"),
  content: z.string().max(5000, "Content too long").optional(),
  mediaType: z.enum(mediaTypeEnum).default("NONE"),
  mediaUrl: z.string().url("Invalid media URL").optional(),
});

// Create Post
export const createPostSchema = postBaseSchema;

// Update Post (partial for optional updates)
export const updatePostSchema = postBaseSchema.partial();

// ========================== COMMENT SCHEMAS ==========================
export const createCommentSchema = z.object({
  postId: z.string().uuid("Invalid post ID"),
  authorId: z.string().uuid("Invalid author ID"),
  content: z.string().min(1, "Comment content is required").max(1000, "Comment too long"),
});

// Update comment schema (optional content)
export const updateCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment too long"),
});

// ========================== LIKE SCHEMAS ==========================
export const createLikeSchema = z.object({
  postId: z.string().uuid("Invalid post ID"),
  userId: z.string().uuid("Invalid user ID"),
});

// ========================== POST METRICS SCHEMAS ==========================
export const updatePostMetricsSchema = z.object({
  postId: z.string().uuid("Invalid post ID"),
  views: z.number().int().nonnegative().optional(),
  saves: z.number().int().nonnegative().optional(),
  shares: z.number().int().nonnegative().optional(),
  engagementScore: z.number().nonnegative().optional(),
  lastViewedAt: z.string().datetime().optional(),
});

// ========================== TYPES ==========================
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CreateLikeInput = z.infer<typeof createLikeSchema>;
export type UpdatePostMetricsInput = z.infer<typeof updatePostMetricsSchema>;
