import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({
      success: true,
      statusCode: 200,
      message: "Server is healthy",
      data: null,
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/resumes", resumeRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/payments", paymentRoutes);

app.use(errorHandler);

export default app;
