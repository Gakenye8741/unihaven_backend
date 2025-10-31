import { Request, Response } from "express";
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  changeRoomStatus,
  getRoomsByHostelId,
} from "./Rooms.service"
import { CreateRoomInput, UpdateRoomInput } from "../../validators/Rooms.validator";

// ========================== GET ALL ROOMS ==========================
export const getAllRoomsController = async (req: Request, res: Response) => {
  try {
    const rooms = await getAllRooms(req.query);
    res.status(200).json({ data: rooms });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ========================== GET ROOM BY ID ==========================
export const getRoomByIdController = async (req: Request, res: Response) => {
  try {
    const room = await getRoomById(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.status(200).json({ data: room });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ========================== CREATE ROOM ==========================
export const createRoomController = async (req: Request, res: Response) => {
  try {
    const roomData: CreateRoomInput = req.body;
    const newRoom = await createRoom(roomData);
    res.status(201).json({ data: newRoom });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// ========================== UPDATE ROOM ==========================
export const updateRoomController = async (req: Request, res: Response) => {
  try {
    const updates: UpdateRoomInput = req.body;
    const updatedRoom = await updateRoom(req.params.id, updates);
    if (!updatedRoom) return res.status(404).json({ error: "Room not found" });
    res.status(200).json({ data: updatedRoom });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// ========================== DELETE ROOM ==========================
export const deleteRoomController = async (req: Request, res: Response) => {
  try {
    const deletedRoom = await deleteRoom(req.params.id);
    if (!deletedRoom) return res.status(404).json({ error: "Room not found" });
    res.status(200).json({ data: deletedRoom });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ========================== CHANGE ROOM STATUS ==========================
export const changeRoomStatusController = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updatedRoom = await changeRoomStatus(req.params.id, status);
    if (!updatedRoom) return res.status(404).json({ error: "Room not found" });
    res.status(200).json({ data: updatedRoom });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// ========================== GET ROOMS BY HOSTEL ==========================
export const getRoomsByHostelController = async (req: Request, res: Response) => {
  try {
    const rooms = await getRoomsByHostelId(req.params.hostelId);
    res.status(200).json({ data: rooms });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
