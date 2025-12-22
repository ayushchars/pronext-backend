import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["subscription", "course", "commission"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet"],
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ createdAt: 1 });

export default mongoose.model("Payments", PaymentSchema);
