import { getWalletSummary, getTransactionHistory } from "../services/wallet.service.js";
import { createApiResponse } from "../utils/apiResponse.js";

/**
 * GET /api/v1/wallet
 * Returns the user's wallet balance and lifetime credit stats.
 */
const getWalletHandler = async (req, res, next) => {
  try {
    const summary = await getWalletSummary(req.user.userId);

    res.status(200).json(
      createApiResponse({
        statusCode: 200,
        message: "Wallet fetched successfully.",
        data: summary,
      }),
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/wallet/history
 * Returns all credit transactions for the user, sorted newest-first.
 */
const getTransactionHistoryHandler = async (req, res, next) => {
  try {
    const transactions = await getTransactionHistory(req.user.userId);

    res.status(200).json(
      createApiResponse({
        statusCode: 200,
        message: "Transaction history fetched successfully.",
        data: { transactions },
      }),
    );
  } catch (error) {
    next(error);
  }
};

export { getTransactionHistoryHandler, getWalletHandler };
