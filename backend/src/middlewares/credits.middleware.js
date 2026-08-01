import { getWallet } from "../services/wallet.service.js";

/**
 * Middleware factory: requireCredits(cost)
 *
 * Blocks the request with HTTP 402 if the authenticated user does not
 * have at least `cost` credits in their wallet.
 *
 * Usage:
 *   router.post("/analyze", authenticateUser, requireCredits(10), analyzeHandler)
 */
const requireCredits = (cost) => async (req, res, next) => {
  try {
    if (!req.user?.userId) {
      const error = new Error("Authentication required.");
      error.statusCode = 401;
      throw error;
    }

    const wallet = await getWallet(req.user.userId);

    if (wallet.balance < cost) {
      const error = new Error(
        `Insufficient credits. This action requires ${cost} credits, but you only have ${wallet.balance}. Please purchase more credits to continue.`,
      );
      error.statusCode = 402;
      throw error;
    }

    // Attach wallet to request so downstream handlers can reference it if needed
    req.wallet = wallet;

    next();
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};

export { requireCredits };
export default requireCredits;
