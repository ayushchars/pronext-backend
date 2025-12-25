
import express from "express";
import { requireSignin, hasActiveSubscription } from "../../middleware/authMiddleware.js";
import { upload } from "../../middleware/multerConfig.js";
import {
  uploadFile,
  getAllFiles,
  getFileById,
  updateFile,
  deleteFile,
} from "./filesController.js";
// Storage configuration


const router = express.Router();

// Upload PPT / eBook (Admin only - no subscription required)
router.post("/upload", requireSignin, upload.single("file"), uploadFile);

// Get all files (subscription required to download/view)
router.get("/", requireSignin, hasActiveSubscription, getAllFiles);

// Get file by ID (subscription required to download/view)
router.get("/:id", requireSignin, hasActiveSubscription, getFileById);

// Update file metadata (Admin only)
router.put("/:id", requireSignin, updateFile);

// Delete file (Admin only)
router.delete("/:id", requireSignin, deleteFile);

export default router;

