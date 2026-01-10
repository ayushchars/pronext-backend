import mongoose from "mongoose";

const SecureMediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["video", "pdf"],
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    encryptedPath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // Video duration in seconds
    },
    thumbnail: {
      type: String, // Thumbnail path for videos
    },
    isEncrypted: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    accessLevel: {
      type: String,
      enum: ["public", "subscribers", "admin"],
      default: "subscribers",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
SecureMediaSchema.index({ type: 1, isActive: 1 });
SecureMediaSchema.index({ uploadedBy: 1 });
SecureMediaSchema.index({ category: 1 });
SecureMediaSchema.index({ createdAt: -1 });

const SecureMedia = mongoose.model("SecureMedia", SecureMediaSchema);

export default SecureMedia;
