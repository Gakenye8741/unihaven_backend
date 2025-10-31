// src/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  doublePrecision,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ========================== ENUMS ==========================
export const userRoleEnum = pgEnum("user_role", [
  "STUDENT",
  "HOSTEL_OWNER",
  "CARETAKER",
  "ADVERTISER",
  "ADMIN",
  "MODERATOR",
  "REGULAR"
]);

export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHER"]);

export const roomTypeEnum = pgEnum("room_type", [
  "SINGLE",
  "BEDSITTER",
  "ONE_BEDROOM",
  "DOUBLE",
  "OTHER",
]);

export const verificationBadgeEnum = pgEnum("verification_badge_type", [
  "NONE",
  "STUDENT",
  "HOSTEL_OWNER",
  "HOSTEL",
  "BUSINESS",
  "CARETAKER",
]);

export const paymentTypeEnum = pgEnum("payment_type", [
  "SUBSCRIPTION",
  "LISTING_FEE",
  "VERIFICATION",
  "AD",
]);

export const paymentStatusEnum = pgEnum("payment_status", ["PENDING", "COMPLETED", "FAILED"]);

export const reportTypeEnum = pgEnum("report_type", ["USER", "POST", "COMMENT", "HOSTEL", "AD"]);

export const reportStatusEnum = pgEnum("report_status", ["PENDING", "RESOLVED", "REJECTED"]);

export const adTypeEnum = pgEnum("ad_type", ["POSTER", "VIDEO", "ROOM", "SERVICE", "GENERAL"]);




export const roomStatusEnum = pgEnum("room_status", ["AVAILABLE", "OCCUPIED", "RESERVED", "UNDER_REPAIR"]);

export const postTypeEnum = pgEnum("post_type", [
  "GENERAL",
  "ROOM_AVAILABLE",
  "LOOKING_FOR_ROOM",
  "NOTICE",
  "HOSTEL_UPDATE", // <-- must exist here
]);


export const mediaTypeEnum = pgEnum("media_type", ["IMAGE", "VIDEO"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", ["ACTIVE", "INACTIVE", "EXPIRED"]);

export const hostelGenderEnum = pgEnum("gender_enum", ["MALE", "FEMALE", "MIXED"]);

export const hostelStatusEnum = pgEnum("hostel_status_enum", ["AVAILABLE","FULL", "UNDER_MAINTENANCE",]);

// ========================== USERS ==========================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }),
  nationalId: varchar("national_id", { length: 50 }),
  schoolRegNo: varchar("school_reg_no", { length: 50 }),
  role: userRoleEnum("role").default("STUDENT").notNull(),
  gender: genderEnum("gender"),
  passwordHash: varchar("password_hash", { length: 255 }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverPhotoUrl: text("cover_photo_url"),

  confirmationCode: varchar("confirmation_code", { length: 255 }),
  confirmationCodeExpiresAt: timestamp("confirmation_code_expires_at"),
  emailVerified: boolean("email_verified").default(false),

  verificationBadge: verificationBadgeEnum("verification_badge").default("NONE").notNull(),
  verificationExpiresAt: timestamp("verification_expires_at"),

  isSuspended: boolean("is_suspended").default(false),
  suspendedUntil: timestamp("suspended_until"),

  visibility: varchar("visibility", { length: 50 }).default("PUBLIC"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================== HOSTELS ==========================

export const hostels = pgTable("hostels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  campus: varchar("campus", { length: 255 }).notNull(),
  description: text("description"),

  gender: hostelGenderEnum("gender").default("MIXED"),
  status: hostelStatusEnum("status").default("AVAILABLE"),
  verified: boolean("verified").default(false),

  minPrice: doublePrecision("min_price").default(0),
  maxPrice: doublePrecision("max_price").default(0),

  location: varchar("location", { length: 255 }).notNull(),
  totalRooms: integer("total_rooms").default(0),
  roomMapJson: text("room_map_json"),

  averageRating: doublePrecision("average_rating").default(0),
  ratingCount: integer("rating_count").default(0),

  // ✅ NEW FIELD: array of amenities (text[])
  amenities: text("amenities").array(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// ========================== HOSTEL OWNERS ==========================
export const hostelOwners = pgTable("hostel_owners", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostelId: uuid("hostel_id").references(() => hostels.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()), // ✅ add this
});


// ========================== HOSTEL TENANTS ==========================
export const hostelTenants = pgTable("hostel_tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostelId: uuid("hostel_id").references(() => hostels.id, { onDelete: "set null" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  roomNumber: varchar("room_number", { length: 50 }),
  moveInDate: timestamp("move_in_date"),
  moveOutDate: timestamp("move_out_date"),
  createdAt: timestamp("created_at").defaultNow(),
});


// ========================== ADVERTISERS ==========================
export const advertisers = pgTable("advertisers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  nationalId: varchar("national_id", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});
// ========================== ROOMS ==========================
export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostelId: uuid("hostel_id")
    .notNull()
    .references(() => hostels.id, { onDelete: "cascade" }),
  roomNumber: varchar("room_number", { length: 50 }).notNull(),
  floor: varchar("floor", { length: 50 }).default(""),
  type: roomTypeEnum("type").notNull().default("SINGLE"),
  pricePerMonth: integer("price_per_month").notNull().default(0),
  status: roomStatusEnum("status").notNull().default("AVAILABLE"),
  amenities: text("amenities").default(""),
  imageUrl: text("image_url").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ========================== ROOM OCCUPANTS ==========================
export const roomOccupants = pgTable("room_occupants", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id").references(() => rooms.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  checkInDate: timestamp("check_in_date").defaultNow(),
  checkOutDate: timestamp("check_out_date"),
  billingCycle: varchar("billing_cycle", { length: 20 }).default("MONTHLY"), // "MONTHLY" or "SEMESTER"
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================== INTERESTS ==========================
export const interests = pgTable("interests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const userInterests = pgTable("user_interests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  interestId: uuid("interest_id").references(() => interests.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ========================== ROOMMATE PREFERENCES ==========================
export const roommatePreferences = pgTable("roommate_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  preferredGender: genderEnum("preferred_gender"),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  cleanlinessLevel: integer("cleanliness_level"),
  smoking: boolean("smoking").default(false),
  partying: boolean("partying").default(false),
  socialLevel: integer("social_level"),
  studyFocus: integer("study_focus"),
  sameCampusOnly: boolean("same_campus_only").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================== POSTS (FEED) ==========================
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  // some earlier variants used userId; keep both for compatibility
  
  authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  hostelId: uuid("hostel_id").references(() => hostels.id, { onDelete: "set null" }),
  type: postTypeEnum("type").default("GENERAL").notNull(),
  content: text("content"),
  mediaType: mediaTypeEnum("media_type"),
  mediaUrl: text("media_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// legacy-style posts tables kept (do not remove)
export const postLikes = pgTable("post_likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postComments = pgTable("post_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// also keep generic names used earlier
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ========================== POST METRICS ==========================
export const postMetrics = pgTable("post_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  views: integer("views").default(0),
  saves: integer("saves").default(0),
  shares: integer("shares").default(0),
  engagementScore: doublePrecision("engagement_score").default(0),
  lastViewedAt: timestamp("last_viewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ========================== ADS + METRICS ==========================


export const ads = pgTable("ads", {
  id: uuid("id").primaryKey().defaultRandom(),

  // ✅ Reference advertisers table instead of users
  advertiserId: uuid("advertiser_id").references(() => advertisers.id, { onDelete: "cascade" }).notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: adTypeEnum("type").default("POSTER").notNull(),
  campus: varchar("campus", { length: 255 }),
  mediaUrl: text("media_url"),
  limit: integer("limit").default(1),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").notNull(), // Require endDate
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastReminderSentAt: timestamp("last_reminder_sent_at"),

});


export const adMetrics = pgTable("ad_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  adId: uuid("ad_id").references(() => ads.id, { onDelete: "cascade" }).notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  saves: integer("saves").default(0),
  shares: integer("shares").default(0),
  reports: integer("reports").default(0),
  engagementScore: doublePrecision("engagement_score").default(0),
  lastViewedAt: timestamp("last_viewed_at"),
  lastClickedAt: timestamp("last_clicked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================== PAYMENTS ==========================
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  amount: integer("amount").notNull(),
  type: paymentTypeEnum("type").notNull(),
  status: paymentStatusEnum("status").default("PENDING").notNull(),
  transactionRef: varchar("transaction_ref", { length: 255 }),
  provider: varchar("provider", { length: 100 }), // MPESA, STRIPE, etc
  metadata: text("metadata"), // raw webhook payload if useful
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================== VERIFICATION BADGES ==========================
export const verificationBadges = pgTable("verification_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  hostelId: uuid("hostel_id").references(() => hostels.id, { onDelete: "set null" }),
  paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "cascade" }).notNull(),
  type: verificationBadgeEnum("type").notNull(),
  active: boolean("active").default(true),
  activatedAt: timestamp("activated_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================== HOSTEL LISTING FEES ==========================
export const hostelListingPayments = pgTable("hostel_listing_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostelId: uuid("hostel_id").references(() => hostels.id, { onDelete: "cascade" }).notNull(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  amount: integer("amount").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  transactionRef: varchar("transaction_ref", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================== REVIEWS & HOSTEL RATINGS ==========================
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  hostelId: uuid("hostel_id").references(() => hostels.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVerifiedResident: boolean("is_verified_resident").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// separate hostelRatings (kept for history & separate table)
export const hostelRatings = pgTable("hostel_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  hostelId: uuid("hostel_id").references(() => hostels.id, { onDelete: "cascade" }).notNull(),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVerifiedStay: boolean("is_verified_stay").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================== REPORTS ==========================
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  reportedEntityId: uuid("reported_entity_id").notNull(), // id of user/post/comment/ad/hostel etc.
  reportType: reportTypeEnum("report_type").notNull(),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================== SOCIAL: FOLLOWS, BLOCKS ==========================
export const follows = pgTable("follows", {
  id: uuid("id").primaryKey().defaultRandom(),
  followerId: uuid("follower_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  followingId: uuid("following_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blocks = pgTable("blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockerId: uuid("blocker_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  blockedId: uuid("blocked_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ========================== MESSAGING (DIRECT) ==========================
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  receiverId: uuid("receiver_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: mediaTypeEnum("media_type"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================== GROUP CHATS (HOSTEL GROUPS) ==========================
export const groupChats = pgTable("group_chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  hostelId: uuid("hostel_id").references(() => hostels.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").references(() => groupChats.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 50 }).default("MEMBER"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const groupMessages = pgTable("group_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").references(() => groupChats.id, { onDelete: "cascade" }).notNull(),
  senderId: uuid("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: mediaTypeEnum("media_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================== METRICS & INTERACTIONS ==========================
export const userMetrics = pgTable("user_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  postsCount: integer("posts_count").default(0),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  adsCount: integer("ads_count").default(0),
  roomsListed: integer("rooms_listed").default(0),
  engagementScore: doublePrecision("engagement_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const interactions = pgTable("interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // e.g. "POST", "AD", "HOSTEL"
  entityId: uuid("entity_id").notNull(),
  action: varchar("action", { length: 50 }).notNull(), // e.g. "VIEW", "LIKE", "CLICK"
  createdAt: timestamp("created_at").defaultNow(),
});

// ========================== SUBSCRIPTIONS ==========================
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  amount: integer("amount").notNull(),
  status: subscriptionStatusEnum("status").default("ACTIVE"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ========================== RELATIONS ==========================
// Drizzle will infer relationships from FK declarations; add convenient relation properties for querying.

export const usersRelations = relations(users, ({ one, many }) => ({
  hostelsOwned: many(hostels),
  hostelsCaretaking: many(hostels),
  roomsOccupied: many(roomOccupants),
  roomOccupantRecords: many(roomOccupants),
  userInterests: many(userInterests),
  roommatePreferences: many(roommatePreferences),
  postsAuthored: many(posts),
  postsAsUserId: many(posts),
  postLikes: many(postLikes),
  postComments: many(postComments),
  comments: many(comments),
  likes: many(likes),
  ads: many(ads),
  adMetrics: many(adMetrics),
  payments: many(payments),
  verificationBadges: many(verificationBadges),
  hostelListingPayments: many(hostelListingPayments),
  reviewsGiven: many(reviews),
  hostelRatingsGiven: many(hostelRatings),
  reportsFiled: many(reports),
  follows: many(follows),
  blocks: many(blocks),
  messagesSent: many(messages),
  messagesReceived: many(messages),
  groupMembers: many(groupMembers),
  groupMessages: many(groupMessages),
  userMetrics: many(userMetrics),
  interactions: many(interactions),
  subscriptions: many(subscriptions),
  advertisers: many(advertisers),
}));

// ========================== HOSTEL OWNERS RELATIONS ==========================
export const hostelOwnersRelations = relations(hostelOwners, ({ one }) => ({
  user: one(users, { fields: [hostelOwners.userId], references: [users.id] }),
  hostel: one(hostels, { fields: [hostelOwners.hostelId], references: [hostels.id] }),
}));

// ========================== HOSTEL TENANTS RELATIONS ==========================
export const hostelTenantsRelations = relations(hostelTenants, ({ one }) => ({
  hostel: one(hostels, { fields: [hostelTenants.hostelId], references: [hostels.id] }),
  tenant: one(users, { fields: [hostelTenants.userId], references: [users.id] }),
}));

export const advertisersRelations = relations(advertisers, ({ one, many }) => ({
  user: one(users),
  ads: many(ads),
}));

export const hostelsRelations = relations(hostels, ({ one, many }) => ({
  owner: one(users),
  caretaker: one(users),
  rooms: many(rooms),
  posts: many(posts),
  reviews: many(reviews),
  hostelRatings: many(hostelRatings),
  verificationBadges: many(verificationBadges),
  listingPayments: many(hostelListingPayments),
  groupChats: many(groupChats),
}));



export const roomsRelations = relations(rooms, ({ one }) => ({
  hostel: one(hostels, {
    fields: [rooms.hostelId],
    references: [hostels.id],
  }),
}));
export const roomOccupantsRelations = relations(roomOccupants, ({ one }) => ({
  room: one(rooms),
  user: one(users),
}));

export const interestsRelations = relations(interests, ({ many }) => ({
  userInterests: many(userInterests),
}));

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user: one(users),
  interest: one(interests),
}));

export const roommatePreferencesRelations = relations(roommatePreferences, ({ one }) => ({
  user: one(users),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users),
  user: one(users),
  hostel: one(hostels),
  likesLegacy: many(likes),
  likes: many(postLikes),
  commentsLegacy: many(comments),
  comments: many(postComments),
  postMetrics: many(postMetrics),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts),
  user: one(users),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(posts),
  author: one(users),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts),
  user: one(users),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts),
  user: one(users),
}));

export const postMetricsRelations = relations(postMetrics, ({ one }) => ({
  post: one(posts),
}));

export const adsRelations = relations(ads, ({ one, many }) => ({
  advertiser: one(users),
  advertiserRecord: one(advertisers),
  hostel: one(hostels),
  adMetrics: many(adMetrics),
}));

export const adMetricsRelations = relations(adMetrics, ({ one }) => ({
  ad: one(ads),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users),
}));

export const verificationBadgesRelations = relations(verificationBadges, ({ one }) => ({
  user: one(users),
  hostel: one(hostels),
  payment: one(payments),
}));

export const hostelListingPaymentsRelations = relations(hostelListingPayments, ({ one }) => ({
  hostel: one(hostels),
  owner: one(users),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users),
  hostel: one(hostels),
}));

export const hostelRatingsRelations = relations(hostelRatings, ({ one }) => ({
  hostel: one(hostels),
  reviewer: one(users),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users),
  following: one(users),
}));

export const blocksRelations = relations(blocks, ({ one }) => ({
  blocker: one(users),
  blocked: one(users),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users),
  receiver: one(users),
}));

export const groupChatsRelations = relations(groupChats, ({ one, many }) => ({
  hostel: one(hostels),
  creator: one(users),
  members: many(groupMembers),
  messages: many(groupMessages),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groupChats),
  user: one(users),
}));

export const groupMessagesRelations = relations(groupMessages, ({ one }) => ({
  group: one(groupChats),
  sender: one(users),
}));

export const userMetricsRelations = relations(userMetrics, ({ one }) => ({
  user: one(users),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  user: one(users),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users),
}));

// ========================== TYPES (Drizzle Type Inference) ==========================
export type TSelectUser = typeof users.$inferSelect;
export type TInsertUser = typeof users.$inferInsert;

export type TSelectAdvertiser = typeof advertisers.$inferSelect;
export type TInsertAdvertiser = typeof advertisers.$inferInsert;

export type TSelectHostel = typeof hostels.$inferSelect;
export type TInsertHostel = typeof hostels.$inferInsert;

export type TSelectRoom = typeof rooms.$inferSelect;
export type TInsertRoom = typeof rooms.$inferInsert;

export type TSelectRoomOccupant = typeof roomOccupants.$inferSelect;
export type TInsertRoomOccupant = typeof roomOccupants.$inferInsert;

export type TSelectInterest = typeof interests.$inferSelect;
export type TInsertInterest = typeof interests.$inferInsert;

export type TSelectUserInterest = typeof userInterests.$inferSelect;
export type TInsertUserInterest = typeof userInterests.$inferInsert;

export type TSelectRoommatePreference = typeof roommatePreferences.$inferSelect;
export type TInsertRoommatePreference = typeof roommatePreferences.$inferInsert;

export type TSelectPost = typeof posts.$inferSelect;
export type TInsertPost = typeof posts.$inferInsert;

export type TSelectPostLike = typeof postLikes.$inferSelect;
export type TInsertPostLike = typeof postLikes.$inferInsert;

export type TSelectPostComment = typeof postComments.$inferSelect;
export type TInsertPostComment = typeof postComments.$inferInsert;

export type TSelectComment = typeof comments.$inferSelect;
export type TInsertComment = typeof comments.$inferInsert;

export type TSelectLike = typeof likes.$inferSelect;
export type TInsertLike = typeof likes.$inferInsert;

export type TSelectPostMetric = typeof postMetrics.$inferSelect;
export type TInsertPostMetric = typeof postMetrics.$inferInsert;

export type TSelectAd = typeof ads.$inferSelect;
export type TInsertAd = typeof ads.$inferInsert;

export type TSelectAdMetric = typeof adMetrics.$inferSelect;
export type TInsertAdMetric = typeof adMetrics.$inferInsert;

export type TSelectPayment = typeof payments.$inferSelect;
export type TInsertPayment = typeof payments.$inferInsert;

export type TSelectVerificationBadge = typeof verificationBadges.$inferSelect;
export type TInsertVerificationBadge = typeof verificationBadges.$inferInsert;

export type TSelectHostelListingPayment = typeof hostelListingPayments.$inferSelect;
export type TInsertHostelListingPayment = typeof hostelListingPayments.$inferInsert;

export type TSelectReview = typeof reviews.$inferSelect;
export type TInsertReview = typeof reviews.$inferInsert;

export type TSelectHostelRating = typeof hostelRatings.$inferSelect;
export type TInsertHostelRating = typeof hostelRatings.$inferInsert;

export type TSelectReport = typeof reports.$inferSelect;
export type TInsertReport = typeof reports.$inferInsert;

export type TSelectFollow = typeof follows.$inferSelect;
export type TInsertFollow = typeof follows.$inferInsert;

export type TSelectBlock = typeof blocks.$inferSelect;
export type TInsertBlock = typeof blocks.$inferInsert;

export type TSelectMessage = typeof messages.$inferSelect;
export type TInsertMessage = typeof messages.$inferInsert;

export type TSelectGroupChat = typeof groupChats.$inferSelect;
export type TInsertGroupChat = typeof groupChats.$inferInsert;

export type TSelectGroupMember = typeof groupMembers.$inferSelect;
export type TInsertGroupMember = typeof groupMembers.$inferInsert;

export type TSelectGroupMessage = typeof groupMessages.$inferSelect;
export type TInsertGroupMessage = typeof groupMessages.$inferInsert;

export type TSelectUserMetric = typeof userMetrics.$inferSelect;
export type TInsertUserMetric = typeof userMetrics.$inferInsert;

export type TSelectInteraction = typeof interactions.$inferSelect;
export type TInsertInteraction = typeof interactions.$inferInsert;

export type TSelectSubscription = typeof subscriptions.$inferSelect;
export type TInsertSubscription = typeof subscriptions.$inferInsert;

export type TSelectHostelOwners = typeof hostelOwners.$inferSelect;
export type TInsertHostelOwners = typeof hostelOwners.$inferInsert;

export type TSelectHostelTenants = typeof hostelTenants.$inferSelect;
export type TInsertHostelTenants = typeof hostelTenants.$inferInsert;
