import { createOrder, verifyPayment, getPaymentHistory } from "../services/payment.service.js";
import { getAllPackages } from "../config/creditPackages.js";
import { createApiResponse } from "../utils/apiResponse.js";

/**
 * POST /api/v1/payments/create-order
 * Validates packageId, creates Razorpay order, saves CREATED payment.
 *
 * Request body: { packageId: "starter" | "professional" | "ultimate" }
 */
const createOrderHandler = async (req, res, next) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      const error = new Error("packageId is required.");
      error.statusCode = 400;
      throw error;
    }

    const result = await createOrder(req.user.userId, packageId);

    res.status(201).json(
      createApiResponse({
        statusCode: 201,
        message: "Payment order created successfully.",
        data: result,
      }),
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/payments/verify
 * Verifies Razorpay signature and credits the wallet on success.
 * Idempotent — safe to call multiple times for the same order.
 *
 * Request body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
const verifyPaymentHandler = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const result = await verifyPayment(
      req.user.userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    const message = result.alreadyVerified
      ? "Payment was already verified. Credits are up to date."
      : `Payment verified successfully. ${result.credits} credits have been added to your wallet.`;

    res.status(200).json(
      createApiResponse({
        statusCode: 200,
        message,
        data: {
          credits: result.credits,
          alreadyVerified: result.alreadyVerified,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/payments/history
 * Returns the user's successful purchase history.
 */
const getPaymentHistoryHandler = async (req, res, next) => {
  try {
    const payments = await getPaymentHistory(req.user.userId);

    res.status(200).json(
      createApiResponse({
        statusCode: 200,
        message: "Payment history fetched successfully.",
        data: { payments },
      }),
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/payments/packages
 * Returns available credit packages (safe to expose to frontend).
 */
const getPackagesHandler = async (req, res) => {
  const packages = getAllPackages();

  res.status(200).json(
    createApiResponse({
      statusCode: 200,
      message: "Credit packages fetched successfully.",
      data: { packages },
    }),
  );
};

export {
  createOrderHandler,
  getPackagesHandler,
  getPaymentHistoryHandler,
  verifyPaymentHandler,
};
