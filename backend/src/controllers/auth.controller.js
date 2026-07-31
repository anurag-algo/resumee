import {
  loginUser,
  registerUser,
  verifyGoogleToken,
} from "../services/auth.service.js";
import { createApiResponse } from "../utils/apiResponse.js";

const registerHandler = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    res.status(201).json(
      createApiResponse({
        statusCode: 201,
        message: "Account created successfully.",
        data: result,
      }),
    );
  } catch (error) {
    next(error);
  }
};

const loginHandler = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    res.status(200).json(
      createApiResponse({
        statusCode: 200,
        message: "Login successful.",
        data: result,
      }),
    );
  } catch (error) {
    next(error);
  }
};

const googleLoginHandler = async (req, res, next) => {
  try {
    const result = await verifyGoogleToken(req.body?.credential);

    res.status(200).json(
      createApiResponse({
        statusCode: 200,
        message: "Google login successful.",
        data: result,
      }),
    );
  } catch (error) {
    next(error);
  }
};

const meHandler = async (req, res) => {
  res.status(200).json(
    createApiResponse({
      statusCode: 200,
      message: "Current user fetched successfully.",
      data: { user: req.user },
    }),
  );
};

export { googleLoginHandler, loginHandler, meHandler, registerHandler };
