import FileResource from "../../models/fileModel.js";
import {
  successResponse,
  successResponseWithData,
  ErrorResponse,
  notFoundResponse,
} from "../../helpers/apiResponse.js";

/* =========================
   UPLOAD FILE
========================= */
export const uploadFile = async (req, res) => {
  try {
    const { title, type, description } = req.body;

    if (!req.file) {
      return ErrorResponse(res, "File is required");
    }

    const fileResource = await FileResource.create({
      title,
      type,
      description,
      fileUrl: req.file.path, // saved path from multer
      uploadedBy: req.user._id,
    });

    return successResponseWithData(res, "File uploaded successfully", fileResource);
  } catch (error) {
    console.error("File upload error:", error);
    return ErrorResponse(res, error.message || "Error uploading file");
  }
};

/* =========================
   GET ALL FILES
========================= */
export const getAllFiles = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const files = await FileResource.find(filter)
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "fname lname email");

    return successResponseWithData(res, "Files fetched successfully", files);
  } catch (error) {
    console.error("Get files error:", error);
    return ErrorResponse(res, "Error fetching files");
  }
};

/* =========================
   GET FILE BY ID
========================= */
export const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await FileResource.findById(id).populate("uploadedBy", "fname lname email");
    if (!file) return notFoundResponse(res, "File not found");

    return successResponseWithData(res, "File fetched successfully", file);
  } catch (error) {
    console.error("Get file by id error:", error);
    return ErrorResponse(res, "Error fetching file");
  }
};

/* =========================
   UPDATE FILE METADATA
========================= */
export const updateFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await FileResource.findByIdAndUpdate(id, req.body, { new: true });
    if (!file) return notFoundResponse(res, "File not found");

    return successResponseWithData(res, "File updated successfully", file);
  } catch (error) {
    console.error("Update file error:", error);
    return ErrorResponse(res, "Error updating file");
  }
};

/* =========================
   DELETE FILE (SOFT DELETE)
========================= */
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await FileResource.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!file) return notFoundResponse(res, "File not found");

    return successResponse(res, "File deleted successfully");
  } catch (error) {
    console.error("Delete file error:", error);
    return ErrorResponse(res, "Error deleting file");
  }
};
