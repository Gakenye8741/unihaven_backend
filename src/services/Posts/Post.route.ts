// src/routes/posts.router.ts
import { Router } from "express";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  createComment,
  updateComment,
  deleteComment,
  createLike,
  deleteLike,
  updatePostMetrics,
  getUserStats,
  getAllPostsWithMetrics,
} from "./Post.controller";

const postsRouter = Router();

// ======================================================
// 📰 POSTS ROUTES
// ======================================================

// Get all posts (with optional search ?search=)
postsRouter.get("/posts", getAllPosts);

// Get a single post by ID
postsRouter.get("/posts/:postId", getPostById);

// Create a new post
postsRouter.post("/posts", createPost);

// Update a post by ID
postsRouter.put("/posts/:postId", updatePost);

// Delete a post by ID
postsRouter.delete("/posts/:postId", deletePost);

// ======================================================
// 💬 COMMENTS ROUTES
// ======================================================

// Create a comment for a specific post
postsRouter.post("/posts/:postId/comments", createComment);

// Update a specific comment
postsRouter.put("/comments/:commentId", updateComment);

// Delete a specific comment
postsRouter.delete("/comments/:commentId", deleteComment);

// ======================================================
// ❤️ LIKES ROUTES
// ======================================================

// Like a specific post
postsRouter.post("/posts/:postId/likes", createLike);

// Remove a like from a post
postsRouter.delete("/posts/:postId/likes/:likeId", deleteLike);

// ======================================================
// 📊 POST METRICS ROUTES
// ======================================================

// Update metrics (views, likesCount, commentsCount, etc.)
postsRouter.patch("/posts/:postId/metrics", updatePostMetrics);

// ======================================================
// 👤 USER STATS ROUTES
// ======================================================

// Get statistics for a specific user
postsRouter.get("/users/:userId/stats", getUserStats);

// ======================================================
// 🧮 POSTS WITH METRICS ROUTE
// ======================================================

// Get all posts including metrics
postsRouter.get("/posts-with-metrics", getAllPostsWithMetrics);

export default postsRouter;
