import { Request, Response } from "express";
import {
  getAllHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  changeHostelStatus,
  searchHostels,
} from "./Hostel.service"
import {
  createHostelSchema,
  updateHostelSchema,
  getHostelsQuerySchema,
} from "../../validators/Hostel.validator";

// ========================== GET ALL HOSTELS ==========================
export const getAllHostelsController = async (req: Request, res: Response) => {
  try {
    const validated = getHostelsQuerySchema.safeParse(req.query);
    if (!validated.success) {
      return res.status(400).json({ error: validated.error.flatten() });
    }

    const hostels = await getAllHostels(validated.data);
    if (!hostels?.length) {
      return res.status(404).json({ error: "No hostels found" });
    }

    res.status(200).json({ count: hostels.length, data: hostels });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch hostels" });
  }
};

// ========================== GET HOSTEL BY ID ==========================
export const getHostelByIdController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const hostel = await getHostelById(id);

    if (!hostel) return res.status(404).json({ error: "Hostel not found" });
    res.status(200).json({ data: hostel });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch hostel" });
  }
};

// ========================== CREATE HOSTEL ==========================
export const createHostelController = async (req: Request, res: Response) => {
  try {
    const parsed = createHostelSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const newHostel = await createHostel(parsed.data);
    res.status(201).json({ message: "Hostel created successfully", data: newHostel });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create hostel" });
  }
};

// ========================== UPDATE HOSTEL ==========================
export const updateHostelController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const parsed = updateHostelSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const updatedHostel = await updateHostel(id, parsed.data);
    if (!updatedHostel) return res.status(404).json({ error: "Hostel not found" });

    res.status(200).json({ message: "Hostel updated successfully", data: updatedHostel });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update hostel" });
  }
};

// ========================== DELETE HOSTEL ==========================
export const deleteHostelController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const deletedHostel = await deleteHostel(id);
    if (!deletedHostel) return res.status(404).json({ error: "Hostel not found" });

    res.status(200).json({ message: "Hostel deleted successfully", data: deletedHostel });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete hostel" });
  }
};

// ========================== CHANGE HOSTEL STATUS ==========================
export const changeHostelStatusController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: "Hostel status is required" });

    const updatedHostel = await changeHostelStatus(id, status);
    if (!updatedHostel) return res.status(404).json({ error: "Hostel not found" });

    res.status(200).json({ message: `Hostel status changed to ${status}`, data: updatedHostel });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to change hostel status" });
  }
};

// ========================== SEARCH HOSTELS ==========================
export const searchHostelsController = async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.search as string;
    const verified = req.query.verified ? req.query.verified === "true" : undefined;

    if (!searchTerm || typeof searchTerm !== "string") {
      return res.status(400).json({ error: "Search term is required" });
    }

    const results = await searchHostels(searchTerm, verified);
    if (!results?.length) {
      return res.status(404).json({ error: "No hostels matched your search" });
    }

    res.status(200).json({ count: results.length, data: results });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to search hostels" });
  }
};
