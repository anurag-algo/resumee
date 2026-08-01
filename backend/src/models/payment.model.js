import mongoose from "mongoose";

const PAYMENT_STATUSES = ["CREATED", "SUCCESS", "FAILED", "REFUNDED"];
const PAYMENT_PROVIDERS = ["RAZORPAY"];

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: PAYMENT_PROVIDERS,
      default: "RAZORPAY",
    },
    packageId: {
      type: String,
      required: true,
    },
    // Amount in smallest currency unit (paise for INR)
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    credits: {
      type: Number,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "CREATED",
    },
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model("Payment", paymentSchema);

export { PAYMENT_PROVIDERS, PAYMENT_STATUSES };
export default Payment;
