import { Router } from "express";
import {
  getAllRoomsController,
  getRoomByIdController,
  createRoomController,
  updateRoomController,
  deleteRoomController,
  changeRoomStatusController,
  getRoomsByHostelController,
} from "./Rooms.controller";

const roomsRouter = Router();

// ========================== ROOM ROUTES ==========================

roomsRouter.get("/rooms", getAllRoomsController);
roomsRouter.get("/rooms/:id", getRoomByIdController);
roomsRouter.post("/rooms", createRoomController);
roomsRouter.put("/rooms/:id", updateRoomController);
roomsRouter.delete("/rooms/:id", deleteRoomController);
roomsRouter.patch("/rooms/:id/status", changeRoomStatusController);

// Get all rooms for a specific hostel
roomsRouter.get("/hostel/:hostelId/rooms", getRoomsByHostelController);

export default roomsRouter;
