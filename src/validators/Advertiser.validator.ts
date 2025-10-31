// src/validators/Ads.validator.ts
import { z } from "zod";

// ========================== ENUMS ==========================
export const adTypeEnum = z.enum(["POSTER", "VIDEO", "BANNER"]);

// ========================== ADVERTISERS ==========================
export const createAdvertiserSchema = z.object({
  userId: z.string().uuid().optional(), // optional because onDelete: set null
  businessName: z.string().min(1, "Business name is required"),
  nationalId: z.string().min(5, "National ID is required"),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
});

export type CreateAdvertiserInput = z.infer<typeof createAdvertiserSchema>;

export const updateAdvertiserSchema = z.object({
  businessName: z.string().min(1).optional(),
  nationalId: z.string().min(5).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
});

export type UpdateAdvertiserInput = z.infer<typeof updateAdvertiserSchema>;

// ========================== ADS ==========================
export const createAdSchema = z.object({
  advertiserId: z.string().uuid(),
  title: z.string().min(1, "Ad title is required"),
  description: z.string().optional(),
  type: adTypeEnum.optional(),
  campus: z.string().max(255).optional(),
  mediaUrl: z.string().url().optional(),
  limit: z.number().int().min(1).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  active: z.boolean().optional(),
});

export type CreateAdInput = z.infer<typeof createAdSchema>;

export const updateAdSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: adTypeEnum.optional(),
  campus: z.string().max(255).optional(),
  mediaUrl: z.string().url().optional(),
  limit: z.number().int().min(1).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  active: z.boolean().optional(),
});

export type UpdateAdInput = z.infer<typeof updateAdSchema>;

// ========================== AD METRICS ==========================
export const updateAdMetricsSchema = z.object({
  impressions: z.number().int().nonnegative().optional(),
  clicks: z.number().int().nonnegative().optional(),
  saves: z.number().int().nonnegative().optional(),
  shares: z.number().int().nonnegative().optional(),
  reports: z.number().int().nonnegative().optional(),
  engagementScore: z.number().nonnegative().optional(),
  lastViewedAt: z.date().optional(),
  lastClickedAt: z.date().optional(),
});

export type UpdateAdMetricsInput = z.infer<typeof updateAdMetricsSchema>;
