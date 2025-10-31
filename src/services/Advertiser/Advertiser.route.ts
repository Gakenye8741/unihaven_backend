import express from "express";
import {
  createAdvertiserController,
  updateAdvertiserController,
  deleteAdvertiserController,
  createAdController,
  deleteAdController,
  updateAdMetricsController,
  getAdMetricsController,
  processAdsCronController,
  getAllAdvertisersController
} from "./Advertiser.controller";

import { getAdvertiserById, getAdsByAdvertiser, getAdById, updateAd } from "../../services/Advertiser/Advertiser.service";

const adRouter = express.Router();

/* =========================================================
   📌 Advertiser Routes
========================================================= */

adRouter.get('/advertisers', getAllAdvertisersController)
adRouter.post("/advertiser", createAdvertiserController);
adRouter.put("/advertiser/:id", updateAdvertiserController);

// ✅ Inline controller since function exists in service but not exported as a controller
adRouter.get("/advertiser/:id", async (req, res) => {
  try {
    const result = await getAdvertiserById(req.params.id);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

adRouter.delete("/advertiser/:id", deleteAdvertiserController);

/* =========================================================
   📢 Ads Routes
========================================================= */

// Create ad
adRouter.post("/ads", createAdController);

// Update ad (inline controller bridge)
adRouter.put("/ads/:id", async (req, res) => {
  try {
    const result = await updateAd(req.params.id, req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get single ad
adRouter.get("/ads/:id", async (req, res) => {
  try {
    const result = await getAdById(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get ads by advertiser
adRouter.get("/advertiser/:advertiserId/ads", async (req, res) => {
  try {
    const result = await getAdsByAdvertiser(req.params.advertiserId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete ad
adRouter.delete("/ads/:id", deleteAdController);

/* =========================================================
   📈 Metrics
========================================================= */
adRouter.put("/ads/:adId/metrics", updateAdMetricsController);
adRouter.get("/ads/:adId/metrics", getAdMetricsController);

/* =========================================================
   🕒 Cron Route (Manually trigger via browser/Postman)
========================================================= */
adRouter.get("/cron/ads-expiry", processAdsCronController);

export default adRouter;
