import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Payment from "../models/payment.model.js";
import { getPackageById } from "../config/creditPackages.js";
import { addCredits } from "./wallet.service.js";

/**
 * Creates a Razorpay order and saves a CREATED payment record.
 * The frontend only sends packageId; all prices are resolved server-side.
 */
const createOrder = async (userId, packageId) => {
  const pkg = getPackageById(packageId);
  if (!pkg) {
    const error = new Error(
      `Invalid package ID: "${packageId}". Valid options are: starter, professional, ultimate.`,
    );
    error.statusCode = 400;
    throw error;
  }

  // Razorpay receipt must be ≤ 40 characters.
  // Use last 8 chars of userId + last 8 chars of timestamp = 22 chars total.
  const receiptSuffix = String(userId).slice(-8);
  const timeSuffix = String(Date.now()).slice(-8);
  const receipt = `r_${receiptSuffix}_${timeSuffix}`;

  // Create the Razorpay order
  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: pkg.amountPaise,
      currency: pkg.currency,
      receipt,
      notes: {
        userId: String(userId),
        packageId: pkg.id,
        credits: String(pkg.credits),
      },
    });
  } catch (error) {
    console.error(
      "Razorpay order creation failed:",
      error?.error?.description || error?.message || error,
    );
    const err = new Error(
      error?.error?.description || "Failed to create payment order. Please try again.",
    );
    err.statusCode = 502;
    throw err;
  }

  // Persist the payment record with CREATED status
  const payment = await Payment.create({
    userId,
    packageId: pkg.id,
    amount: pkg.amountPaise,
    currency: pkg.currency,
    credits: pkg.credits,
    razorpayOrderId: razorpayOrder.id,
    status: "CREATED",
  });

  return {
    orderId: razorpayOrder.id,
    amount: pkg.amountPaise,
    currency: pkg.currency,
    packageName: pkg.name,
    credits: pkg.credits,
    paymentId: payment._id,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

/**
 * Verifies a Razorpay payment using HMAC SHA256.
 * Idempotent: calling this multiple times with the same orderId is safe —
 * credits are NEVER added twice.
 *
 * @returns {{ success: boolean, alreadyVerified: boolean }}
 */
const verifyPayment = async (
  userId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    const error = new Error(
      "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
    );
    error.statusCode = 400;
    throw error;
  }

  // Find the payment record
  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) {
    const error = new Error("Payment order not found.");
    error.statusCode = 404;
    throw error;
  }

  // Ensure the payment belongs to the authenticated user
  if (String(payment.userId) !== String(userId)) {
    const error = new Error("Unauthorized payment access.");
    error.statusCode = 403;
    throw error;
  }

  // Idempotency check — if already verified successfully, do nothing
  if (payment.status === "SUCCESS") {
    return { success: true, alreadyVerified: true, credits: payment.credits };
  }

  // Verify Razorpay signature using HMAC SHA256
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const isSignatureValid = expectedSignature === razorpay_signature;

  if (!isSignatureValid) {
    // Mark payment as FAILED
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = "FAILED";
    await payment.save();

    const error = new Error(
      "Payment verification failed: invalid signature. Payment not processed.",
    );
    error.statusCode = 400;
    throw error;
  }

  // Signature is valid — update payment to SUCCESS
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "SUCCESS";
  await payment.save();

  // Add credits to the user's wallet
  await addCredits(
    userId,
    payment.credits,
    "PAYMENT",
    payment._id.toString(),
    {
      packageId: payment.packageId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    },
  );

  return { success: true, alreadyVerified: false, credits: payment.credits };
};

/**
 * Returns the user's payment history (successful purchases only).
 */
const getPaymentHistory = async (userId) => {
  return Payment.find({ userId, status: "SUCCESS" })
    .sort({ createdAt: -1 })
    .select("-razorpaySignature") // Don't expose the signature
    .lean();
};

export { createOrder, getPaymentHistory, verifyPayment };
