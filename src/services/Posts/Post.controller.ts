// src/controllers/post.controller.ts
import { Request, Response } from "express";
import * as postService from "./post.service";

// ========================== POSTS CONTROLLER ==========================

// Get all posts with optional search
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const query = req.query as { search?: string };
    const posts = await postService.getAllPosts(query);

    res.status(200).json({
      message: "Posts fetched successfully",
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts",
      error: (error as Error).message,
    });
  }
};

// Get a single post by ID with metrics
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = await postService.getPostById(postId);

    if (!post)
      return res.status(404).json({ message: "Post not found" });

    res.status(200).json({
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch post",
      error: (error as Error).message,
    });
  }
};

// Create a new post
export const createPost = async (req: Request, res: Response) => {
  try {
    const postData = req.body;
    const newPost = await postService.createPost(postData);

    res.status(201).json({
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create post",
      error: (error as Error).message,
    });
  }
};

// Update an existing post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const updates = req.body;
    const updatedPost = await postService.updatePost(postId, updates);

    res.status(200).json({
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update post",
      error: (error as Error).message,
    });
  }
};

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const deletedPost = await postService.deletePost(postId);

    res.status(200).json({
      message: "Post deleted successfully",
      data: deletedPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete post",
      error: (error as Error).message,
    });
  }
};

// ========================== COMMENTS CONTROLLER ==========================

// Create a comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const commentData = req.body;
    const newComment = await postService.createComment(commentData);

    res.status(201).json({
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create comment",
      error: (error as Error).message,
    });
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const updates = req.body;
    const updatedComment = await postService.updateComment(commentId, updates);

    res.status(200).json({
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update comment",
      error: (error as Error).message,
    });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const deletedComment = await postService.deleteComment(commentId);

    res.status(200).json({
      message: "Comment deleted successfully",
      data: deletedComment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete comment",
      error: (error as Error).message,
    });
  }
};

// ========================== LIKES CONTROLLER ==========================

// Create a like
export const createLike = async (req: Request, res: Response) => {
  try {
    const likeData = req.body;
    const newLike = await postService.createLike(likeData);

    res.status(201).json({
      message: "Post liked successfully",
      data: newLike,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to like post",
      error: (error as Error).message,
    });
  }
};

// Remove a like
export const deleteLike = async (req: Request, res: Response) => {
  try {
    const { likeId, postId } = req.params;
    const deletedLike = await postService.deleteLike(likeId, postId);

    res.status(200).json({
      message: "Like removed successfully",
      data: deletedLike,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove like",
      error: (error as Error).message,
    });
  }
};

// ========================== POST METRICS CONTROLLER ==========================

// Update metrics
export const updatePostMetrics = async (req: Request, res: Response) => {
  try {
    const metricsData = req.body;
    const updatedMetrics = await postService.updatePostMetrics(metricsData);

    res.status(200).json({
      message: "Post metrics updated successfully",
      data: updatedMetrics,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update post metrics",
      error: (error as Error).message,
    });
  }
};

// ========================== USER STATS CONTROLLER ==========================

// Get user stats
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const stats = await postService.getUserStats(userId);

    res.status(200).json({
      message: "User statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user stats",
      error: (error as Error).message,
    });
  }
};

// ========================== POSTS WITH METRICS ==========================

// Get all posts with metrics
export const getAllPostsWithMetrics = async (req: Request, res: Response) => {
  try {
    const query = req.query as { search?: string };
    const posts = await postService.getAllPostsWithMetrics(query);

    res.status(200).json({
      message: "Posts with metrics fetched successfully",
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts with metrics",
      error: (error as Error).message,
    });
  }
};
