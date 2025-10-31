import { Router } from "express";
import {
  getAllHostelsController,
  getHostelByIdController,
  createHostelController,
  updateHostelController,
  deleteHostelController,
  changeHostelStatusController,
  searchHostelsController,
} from "./Hostel.controller";
import { anyAuth, authHostel } from "../../middleware/AuthBearer";

const hostelRouter = Router();

hostelRouter.get("/hostel", getAllHostelsController);
hostelRouter.get("/hostel/search/", searchHostelsController);
hostelRouter.get("/hostel/:id",anyAuth, getHostelByIdController);
hostelRouter.post("/hostel/",authHostel, createHostelController);
hostelRouter.put("/hostel/:id",authHostel, updateHostelController);
hostelRouter.delete("/hostel/:id",authHostel, deleteHostelController);
hostelRouter.patch("/hostel/:id/status",authHostel, changeHostelStatusController);

export default hostelRouter;
