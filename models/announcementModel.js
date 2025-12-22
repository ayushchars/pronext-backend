import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["announcement", "promotion", "news"],
      required: true,
      index: true,
    },
    flag: {
      type: String,
      enum: ["important", "promotional"],
      default: "important",
      index: true,
    },
    image: { type: String }, // URL
    isActive: { type: Boolean, default: true, index: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },

    // NEW: Only specific users can see this announcement if important
    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
  },
  { timestamps: true }
);

AnnouncementSchema.index({ type: 1, flag: 1, isActive: 1 });
AnnouncementSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("Announcements", AnnouncementSchema);
