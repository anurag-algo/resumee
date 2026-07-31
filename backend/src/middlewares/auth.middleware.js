import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      const error = new Error("Authentication required.");
      error.statusCode = 401;
      throw error;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 401;
      throw error;
    }

    req.user = {
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

export { authenticateUser };
export default authenticateUser;
