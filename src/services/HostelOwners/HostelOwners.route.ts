import { Router } from "express";
import {
  getAllHostelOwnersController,
  getHostelOwnerController,
  createHostelOwnerController,
  updateHostelOwnerController,
  deleteHostelOwnerController,
  getOwnersByHostelController,
  getHostelsByOwnerController,
} from "./HostelOwner.controller";

const hostelOwnerRouter = Router();

// ========================== HOSTEL OWNER ROUTES ==========================

// Get all hostel owners
hostelOwnerRouter.get("/hostel-owners", getAllHostelOwnersController);

// Get a hostel owner by ID
hostelOwnerRouter.get("/hostel-owners/:id", getHostelOwnerController);

// Create a new hostel owner
hostelOwnerRouter.post("/hostel-owners", createHostelOwnerController);

// Update a hostel owner
hostelOwnerRouter.put("/hostel-owners/:id", updateHostelOwnerController);

// Delete a hostel owner
hostelOwnerRouter.delete("/hostel-owners/:id", deleteHostelOwnerController);

// Get all owners for a specific hostel
hostelOwnerRouter.get("/hostel/:hostelId/owners", getOwnersByHostelController);

// Get all hostels for a specific owner
hostelOwnerRouter.get("/user/:userId/hostels", getHostelsByOwnerController);

export default hostelOwnerRouter;
