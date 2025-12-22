import Announcement from "../../models/announcementModel.js";
import {
  successResponse,
  successResponseWithData,
  ErrorResponse,
  notFoundResponse,
} from "../../helpers/apiResponse.js";

/* =========================
   CREATE ANNOUNCEMENT
========================= */
export const createAnnouncement = async (req, res) => {
  try {
    const { title, description, type, flag, image, startDate, endDate, targetUsers } = req.body;

    if (!title || !description || !type) {
      return ErrorResponse(res, "Title, description and type are required");
    }

    const announcement = await Announcement.create({
      title,
      description,
      type,
      flag, // important or promotional
      image,
      startDate,
      endDate,
      targetUsers, // array of userIds
      createdBy: req.user._id,
    });

    return successResponseWithData(
      res,
      "Content created successfully",
      announcement
    );
  } catch (error) {
    console.error("Create announcement error:", error);
    return ErrorResponse(res, "Error creating content");
  }
};

export const getAllAnnouncements = async (req, res) => {
  try {
    const { type, isActive, flag, userId } = req.query;

    const filter = {
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
    };

    if (type) filter.type = type;
    if (flag) filter.flag = flag;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    if (flag === "important" && userId) {
      filter.$or = [
        { targetUsers: { $exists: false } }, // general
        { targetUsers: { $size: 0 } },       // general
        { targetUsers: userId },             // targeted user
      ];
    }

    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "fname lname email");

    return successResponseWithData(
      res,
      "Content fetched successfully",
      announcements
    );
  } catch (error) {
    console.error("Get announcements error:", error);
    return ErrorResponse(res, "Error fetching content");
  }
};

export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .populate("createdBy", "fname lname email");

    if (!announcement) {
      return notFoundResponse(res, "Content not found");
    }

    return successResponseWithData(
      res,
      "Content fetched successfully",
      announcement
    );
  } catch (error) {
    console.error("Get announcement by id error:", error);
    return ErrorResponse(res, "Error fetching content");
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!announcement) {
      return notFoundResponse(res, "Content not found");
    }

    return successResponseWithData(
      res,
      "Content updated successfully",
      announcement
    );
  } catch (error) {
    console.error("Update announcement error:", error);
    return ErrorResponse(res, "Error updating content");
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!announcement) {
      return notFoundResponse(res, "Content not found");
    }

    return successResponse(res, "Content deleted successfully");
  } catch (error) {
    console.error("Delete announcement error:", error);
    return ErrorResponse(res, "Error deleting content");
  }
};
