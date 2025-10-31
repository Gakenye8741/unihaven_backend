import db from "../../drizzle/db";
import { posts, postLikes, postComments, postMetrics } from "../../drizzle/schema";
import { eq, ilike, and, or, desc, sql } from "drizzle-orm";
import {
  CreatePostInput,
  UpdatePostInput,
  CreateCommentInput,
  UpdateCommentInput,
  CreateLikeInput,
  UpdatePostMetricsInput,
} from "../../validators/Post.validator";

// ========================== POSTS ==========================

// Get all posts with optional search
export const getAllPosts = async (query?: { search?: string }) => {
  const conditions: any[] = [];
  if (query?.search) {
    conditions.push(
      or(
        ilike(posts.content, `%${query.search}%`),
        ilike(posts.type, `%${query.search}%`)
      )
    );
  }

  return db.query.posts.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: (p) => [desc(p.createdAt)],
  });
};

// Get post by ID with metrics
export const getPostById = async (postId: string) => {
  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!post) return null;

  const likesResult = await db.select({ count: sql<number>`count(*)`.as("count") })
    .from(postLikes)
    .where(eq(postLikes.postId, postId))
    .execute();

  const commentsResult = await db.select({ count: sql<number>`count(*)`.as("count") })
    .from(postComments)
    .where(eq(postComments.postId, postId))
    .execute();

  const metrics = await db.query.postMetrics.findFirst({ where: eq(postMetrics.postId, postId) });

  return {
    ...post,
    metrics: {
      totalLikes: likesResult[0]?.count || 0,
      totalComments: commentsResult[0]?.count || 0,
      totalShares: metrics?.shares || 0,
      engagementScore: metrics?.engagementScore || 0,
      views: metrics?.views || 0,
    },
  };
};

// Create post
export const createPost = async (postData: CreatePostInput) => {
  const { mediaType, ...rest } = postData;
  const [newPost] = await db.insert(posts)
    .values({
      ...rest,
      ...(mediaType && mediaType !== "NONE" ? { mediaType } : {}),
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();

  await db.insert(postMetrics)
    .values({ postId: newPost.id })
    .returning();

  return newPost;
};

// Update post
export const updatePost = async (postId: string, updates: UpdatePostInput) => {
  const { mediaType, ...rest } = updates;
  const updateData = {
    ...rest,
    ...(mediaType && mediaType !== "NONE" ? { mediaType } : {}),
    updatedAt: new Date(),
  };

  const [updatedPost] = await db.update(posts)
    .set(updateData)
    .where(eq(posts.id, postId))
    .returning();

  return updatedPost;
};

// Delete post
export const deletePost = async (postId: string) => {
  const [deletedPost] = await db.delete(posts)
    .where(eq(posts.id, postId))
    .returning();
  return deletedPost;
};

// ========================== COMMENTS ==========================

// Create comment
export const createComment = async (commentData: CreateCommentInput) => {
  const [newComment] = await db.insert(postComments)
    .values({ ...commentData, createdAt: new Date(), updatedAt: new Date() })
    .returning();

  await db.update(postMetrics)
    .set({ engagementScore: sql`engagement_score + 1` })
    .where(eq(postMetrics.postId, commentData.postId));

  return newComment;
};

// Update comment
export const updateComment = async (commentId: string, updates: UpdateCommentInput) => {
  const [updatedComment] = await db.update(postComments)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(postComments.id, commentId))
    .returning();
  return updatedComment;
};

// Delete comment
export const deleteComment = async (commentId: string) => {
  const [deletedComment] = await db.delete(postComments)
    .where(eq(postComments.id, commentId))
    .returning();
  return deletedComment;
};

// ========================== LIKES ==========================

// ========================== LIKES ==========================

// Create like (only once per user per post)
export const createLike = async (likeData: CreateLikeInput) => {
  // Check if the user has already liked this post
  const existingLike = await db.query.postLikes.findFirst({
    where: and(
      eq(postLikes.userId, likeData.userId),
      eq(postLikes.postId, likeData.postId)
    ),
  });

  if (existingLike) {
    return { message: "You already liked this post" };
  }

  // Otherwise, insert new like
  const [newLike] = await db
    .insert(postLikes)
    .values({ ...likeData, createdAt: new Date() })
    .returning();

  // Increment engagement score
  await db
    .update(postMetrics)
    .set({ engagementScore: sql`engagement_score + 1` })
    .where(eq(postMetrics.postId, likeData.postId));

  return { message: "Post liked successfully", like: newLike };
};

// Remove like (dislike)
export const deleteLike = async (likeId: string, postId: string) => {
  const [deletedLike] = await db
    .delete(postLikes)
    .where(eq(postLikes.id, likeId))
    .returning();

  if (!deletedLike) {
    return { message: "You haven't liked this post yet" };
  }

  // Decrease engagement score only if like existed
  await db
    .update(postMetrics)
    .set({ engagementScore: sql`engagement_score - 1` })
    .where(eq(postMetrics.postId, postId));

  return { message: "Like removed successfully", like: deletedLike };
};


// ========================== POST METRICS ==========================

export const updatePostMetrics = async (metricsData: UpdatePostMetricsInput) => {
  const { lastViewedAt, ...rest } = metricsData;
  const [updatedMetrics] = await db.update(postMetrics)
    .set({
      ...rest,
      ...(lastViewedAt !== undefined
        ? { lastViewedAt: lastViewedAt ? new Date(lastViewedAt) : null }
        : {}),
    })
    .where(eq(postMetrics.postId, metricsData.postId))
    .returning();
  return updatedMetrics;
};

// ========================== USER STATS ==========================

export const getUserStats = async (userId: string) => {
  const totalPostsResult = await db.select({ count: sql<number>`count(*)`.as("count") })
    .from(posts)
    .where(eq(posts.authorId, userId))
    .execute();

  const totalLikesResult = await db.select({ count: sql<number>`count(*)`.as("count") })
    .from(postLikes)
    .where(eq(postLikes.userId, userId))
    .execute();

  const totalCommentsResult = await db.select({ count: sql<number>`count(*)`.as("count") })
    .from(postComments)
    .where(eq(postComments.authorId, userId))
    .execute();

  return {
    totalPosts: totalPostsResult[0]?.count || 0,
    totalLikes: totalLikesResult[0]?.count || 0,
    totalComments: totalCommentsResult[0]?.count || 0,
  };
};

// ========================== POSTS WITH METRICS ==========================

export const getAllPostsWithMetrics = async (query?: { search?: string }) => {
  const allPosts = await getAllPosts(query);

  const postsWithMetrics = await Promise.all(
    allPosts.map(async (p) => {
      const likesResult = await db.select({ count: sql<number>`count(*)`.as("count") })
        .from(postLikes)
        .where(eq(postLikes.postId, p.id))
        .execute();

      const commentsResult = await db.select({ count: sql<number>`count(*)`.as("count") })
        .from(postComments)
        .where(eq(postComments.postId, p.id))
        .execute();

      const metrics = await db.query.postMetrics.findFirst({ where: eq(postMetrics.postId, p.id) });

      return {
        ...p,
        metrics: {
          totalLikes: likesResult[0]?.count || 0,
          totalComments: commentsResult[0]?.count || 0,
          totalShares: metrics?.shares || 0,
          engagementScore: metrics?.engagementScore || 0,
          views: metrics?.views || 0,
        },
      };
    })
  );

  return postsWithMetrics;
};
