
import express from "express";
import { requireSignin } from "../../middleware/authMiddleware.js";
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

// Upload PPT / eBook
router.post("/upload", requireSignin, upload.single("file"), uploadFile);

// Get all files
router.get("/", requireSignin, getAllFiles);

// Get file by ID
router.get("/:id", requireSignin, getFileById);

// Update file metadata
router.put("/:id", requireSignin, updateFile);

// Delete file
router.delete("/:id", requireSignin, deleteFile);

export default router;

