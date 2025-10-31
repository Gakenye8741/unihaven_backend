import { Request, Response } from "express";
import {
  getAllHostelOwners,
  getHostelOwnerById,
  createHostelOwner,
  updateHostelOwner,
  deleteHostelOwner,
  getOwnersByHostelId,
  getHostelsByOwnerId,
} from "./HostelOwners.service";
import {
  createHostelOwnerSchema,
  updateHostelOwnerSchema,
} from "../../validators/HostelOwners.validator";

// ========================== GET ALL HOSTEL OWNERS ==========================
export const getAllHostelOwnersController = async (req: Request, res: Response) => {
  try {
    const owners = await getAllHostelOwners();
    if (!owners?.length) return res.status(404).json({ error: "No hostel owners found" });
    res.status(200).json({ count: owners.length, data: owners });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch hostel owners" });
  }
};

// ========================== GET HOSTEL OWNER BY ID ==========================
export const getHostelOwnerController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const owner = await getHostelOwnerById(id);
    if (!owner) return res.status(404).json({ error: "Hostel owner not found" });
    res.status(200).json({ data: owner });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch hostel owner" });
  }
};

// ========================== CREATE HOSTEL OWNER ==========================
export const createHostelOwnerController = async (req: Request, res: Response) => {
  try {
    const validated = createHostelOwnerSchema.parse(req.body);
    const newOwner = await createHostelOwner(validated);
    res.status(201).json({ message: "Hostel owner created successfully", data: newOwner });
  } catch (error: any) {
    if (error?.errors) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: error.message || "Failed to create hostel owner" });
  }
};

// ========================== UPDATE HOSTEL OWNER ==========================
export const updateHostelOwnerController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const validated = updateHostelOwnerSchema.parse(req.body);
    const updatedOwner = await updateHostelOwner(id, validated);
    if (!updatedOwner) return res.status(404).json({ error: "Hostel owner not found" });
    res.status(200).json({ message: "Hostel owner updated successfully", data: updatedOwner });
  } catch (error: any) {
    if (error?.errors) return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: error.message || "Failed to update hostel owner" });
  }
};

// ========================== DELETE HOSTEL OWNER ==========================
export const deleteHostelOwnerController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const deletedOwner = await deleteHostelOwner(id);
    if (!deletedOwner) return res.status(404).json({ error: "Hostel owner not found" });
    res.status(200).json({ message: "Hostel owner deleted successfully", data: deletedOwner });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete hostel owner" });
  }
};

// ========================== GET OWNERS BY HOSTEL ==========================
export const getOwnersByHostelController = async (req: Request, res: Response) => {
  try {
    const hostelId = req.params.hostelId;
    const owners = await getOwnersByHostelId(hostelId);
    if (!owners?.length) return res.status(404).json({ error: "No owners found for this hostel" });
    res.status(200).json({ count: owners.length, data: owners });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch owners by hostel" });
  }
};

// ========================== GET HOSTELS BY OWNER ==========================
export const getHostelsByOwnerController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const hostels = await getHostelsByOwnerId(userId);
    if (!hostels?.length) return res.status(404).json({ error: "No hostels found for this owner" });
    res.status(200).json({ count: hostels.length, data: hostels });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch hostels by owner" });
  }
};
