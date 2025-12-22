import mongoose from "mongoose";

const FileResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["ppt", "ebook"],
      required: true,
    },

    fileUrl: {
      type: String, // path or URL of uploaded file
      required: true,
    },

    description: {
      type: String,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FileResource", FileResourceSchema);
