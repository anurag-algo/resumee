import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async ({ name, email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error("User already exists.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return { token, user: userResponse };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return {
    token,
    user: {
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};

const verifyGoogleToken = async (credentialToken) => {
  if (!credentialToken) {
    const error = new Error("Google credential token is required.");
    error.statusCode = 400;
    throw error;
  }

  const ticket = await client.verifyIdToken({
    idToken: credentialToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    const error = new Error("Google account email not found.");
    error.statusCode = 400;
    throw error;
  }

  let user = await User.findOne({ googleId: payload.sub });

  if (!user) {
    user = await User.findOne({ email: payload.email.toLowerCase() });
  }

  if (!user) {
    user = await User.create({
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.given_name || "Google User",
      avatar: payload.picture,
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    user.avatar = payload.picture || user.avatar;
    user.name =
      user.name || payload.name || payload.given_name || "Google User";
    await user.save();
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return {
    token,
    user: {
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};

export { loginUser, registerUser, verifyGoogleToken };
export default { loginUser, registerUser, verifyGoogleToken };
