import db from "../../drizzle/db";
import { advertisers, ads, adMetrics } from "../../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import {
  CreateAdvertiserInput,
  UpdateAdvertiserInput,
  CreateAdInput,
  UpdateAdInput,
  UpdateAdMetricsInput,
  createAdvertiserSchema,
  updateAdvertiserSchema,
  createAdSchema,
  updateAdSchema,
  updateAdMetricsSchema
} from "../../validators/Advertiser.validator";

/* ======================= ADVERTISERS ======================= */

export const createAdvertiser = async (data: CreateAdvertiserInput) => {
  const payload = createAdvertiserSchema.parse(data);

  const [newAdvertiser] = await db
    .insert(advertisers)
    .values({
      ...payload,
      createdAt: new Date()
    })
    .returning();

  return {
    message: "✅ Advertiser created successfully",
    data: newAdvertiser
  };
};

export const updateAdvertiser = async (id: string, data: UpdateAdvertiserInput) => {
  const payload = updateAdvertiserSchema.parse(data);

  const [updated] = await db
    .update(advertisers)
    .set(payload)
    .where(eq(advertisers.id, id))
    .returning();

  return {
    message: "✅ Advertiser updated",
    data: updated
  };
};

export const getAdvertiserById = async (id: string) => {
  const advertiser = await db.query.advertisers.findFirst({
    where: eq(advertisers.id, id),
  });

  return advertiser
    ? { message: "✅ Advertiser found", data: advertiser }
    : { message: "❌ Advertiser not found", data: null };
};

export const deleteAdvertiser = async (id: string) => {
  const [deleted] = await db
    .delete(advertisers)
    .where(eq(advertisers.id, id))
    .returning();

  return {
    message: "✅ Advertiser deleted",
    data: deleted
  };
};

/* ======================= ADS ======================= */

export const createAd = async (data: CreateAdInput) => {
  const payload = createAdSchema.parse(data);

  // Use provided start date or default to now
  const start = payload.startDate ?? new Date();

  // Require endDate from payload
  if (!payload.endDate) {
    throw new Error("❌ endDate is required when creating an ad");
  }

  const adValues: any = {
    ...payload,
    startDate: start,
    endDate: payload.endDate,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastReminderSentAt: null // added for daily reminders
  };

  if (adValues.type === "BANNER") {
    adValues.type = "GENERAL";
  }

  const [newAd] = await db.insert(ads).values(adValues).returning();

  await db.insert(adMetrics).values({
    adId: newAd.id,
    createdAt: new Date()
  });

  return {
    message: "✅ Ad created",
    data: newAd
  };
};

export const updateAd = async (id: string, data: UpdateAdInput) => {
  const payload = updateAdSchema.parse(data);

  const updateValues: any = {
    ...payload,
    updatedAt: new Date(),
  };

  if (updateValues.type === "BANNER") {
    updateValues.type = "GENERAL";
  }

  const [updated] = await db
    .update(ads)
    .set(updateValues)
    .where(eq(ads.id, id))
    .returning();

  return {
    message: "✅ Ad updated",
    data: updated
  };
};

export const getAdById = async (id: string) => {
  const ad = await db.query.ads.findFirst({
    where: eq(ads.id, id)
  });

  return ad
    ? { message: "✅ Ad found", data: ad }
    : { message: "❌ Ad not found", data: null };
};

export const getAdsByAdvertiser = async (advertiserId: string) => {
  const result = await db.query.ads.findMany({
    where: eq(ads.advertiserId, advertiserId),
    orderBy: (a) => [desc(a.createdAt)],
  });

  return {
    message: "✅ Ads fetched",
    data: result
  };
};

export const deleteAd = async (id: string) => {
  const [deleted] = await db
    .delete(ads)
    .where(eq(ads.id, id))
    .returning();

  return {
    message: "✅ Ad deleted",
    data: deleted
  };
};

/* ======================= AD METRICS ======================= */

export const updateAdMetrics = async (adId: string, data: UpdateAdMetricsInput) => {
  const payload = updateAdMetricsSchema.parse(data);

  const [updated] = await db
    .update(adMetrics)
    .set({
      ...payload,
      updatedAt: new Date()
    })
    .where(eq(adMetrics.adId, adId))
    .returning();

  return {
    message: "✅ Metrics updated",
    data: updated
  };
};

export const getAdMetrics = async (adId: string) => {
  const result = await db.query.adMetrics.findFirst({
    where: eq(adMetrics.adId, adId)
  });

  return result
    ? { message: "✅ Metrics found", data: result }
    : { message: "❌ Metrics not found", data: null };
};

/* ======================= GET ALL ADVERTISERS ======================= */

export const getAllAdvertisers = async () => {
  const result = await db.query.advertisers.findMany({
    orderBy: (a) => [desc(a.createdAt)],
  });

  return {
    message: "✅ All advertisers fetched",
    data: result
  };
};

/* ======================= PROCESS EXPIRY FOR CRON ======================= */

export const processAdExpiryCron = async () => {
  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Disable expired
  const expiredAds = await db
    .update(ads)
    .set({ active: false, updatedAt: new Date() })
    .where(and(eq(ads.active, true), sql`${ads.endDate} <= ${now}`))
    .returning();

  // Find ads expiring in 3 days OR daily reminders (24h since last reminder)
  const expiringSoonAds = await db.query.ads.findMany({
    where: and(
      eq(ads.active, true),
      sql`${ads.endDate} > ${now} AND ${ads.endDate} <= ${threeDaysLater}`,
      sql`(${ads.lastReminderSentAt} IS NULL OR ${ads.lastReminderSentAt} <= ${new Date(now.getTime() - 24*60*60*1000)})`
    ),
  });

  // Attach advertiser emails
  const fetchAdvertiserEmail = async (ad: any) => {
    const adv = await db.query.advertisers.findFirst({
      where: eq(advertisers.id, ad.advertiserId)
    });
    return { ...ad, advertiserEmail: adv?.email };
  };

  const expiredWithEmail = await Promise.all(expiredAds.map(fetchAdvertiserEmail));
  const expiringWithEmail = await Promise.all(expiringSoonAds.map(fetchAdvertiserEmail));

  // Update lastReminderSentAt for expiring ads
  for (const ad of expiringSoonAds) {
    await db.update(ads).set({ lastReminderSentAt: now }).where(eq(ads.id, ad.id));
  }

  return {
    message: "✅ Cron processed ads",
    expired: expiredWithEmail,
    expiringSoon: expiringWithEmail
  };
};
