import { Router } from "express";
import {
  getAllUsersController,
  getUserController,
  getUserByEmailController,
  updateUserController,
  deleteUserController,
  suspendUserController,
  unsuspendUserController,
  checkUserStatusController,
} from "./users.controller"
import { adminAuth, adminOrModeratorAuth, anyAuth, moderatorAuth } from "../../middleware/AuthBearer";
const userRouter = Router();

// ========================== USER ROUTES ==========================

// Get all users
userRouter.get("/",adminOrModeratorAuth, getAllUsersController);

// Get a user by ID
userRouter.get("/:id",anyAuth, getUserController);

// Get a user by email
userRouter.get("/email/search",anyAuth, getUserByEmailController);

// Update a user by ID
userRouter.put("/:id",anyAuth, updateUserController);

// Delete a user by ID
userRouter.delete("/:id",adminAuth, deleteUserController);

// Suspend a user by ID
userRouter.post("/:id/suspend",adminOrModeratorAuth, suspendUserController);

// Unsuspend a user by ID
userRouter.post("/:id/unsuspend",adminOrModeratorAuth ,unsuspendUserController);

// Check if a user is active
userRouter.get("/:id/status",anyAuth, checkUserStatusController);

export default userRouter;
