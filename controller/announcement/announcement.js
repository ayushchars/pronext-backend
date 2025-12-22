import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "./anouncementController.js";

import { requireSignin, isAdmin } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/announcements", requireSignin, isAdmin, createAnnouncement);

router.get("/announcements", requireSignin, getAllAnnouncements);
router.get("/announcements/:id", requireSignin, getAnnouncementById);

router.put("/announcements/:id", requireSignin, isAdmin, updateAnnouncement);

router.delete("/announcements/:id", requireSignin, isAdmin, deleteAnnouncement);

export default router;
