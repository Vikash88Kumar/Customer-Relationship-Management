import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

/**
 * Configure cookie options for secure token delivery
 */
const isProdOrCrossSite = process.env.NODE_ENV === "production" || (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.includes("vercel.app"));

const cookieOptions = {
  httpOnly: true,
  secure: isProdOrCrossSite,
  sameSite: isProdOrCrossSite ? "none" : "lax",
  path: "/"
};

/**
 * Handle B2B User login
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    throw new ApiError(400, "Corporate email, password, and workspace role are required.");
  }

  // Find user and explicitly select password
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(404, "Authentication Failed: Workspace user profile not found.");
  }

  // Verify workspace role assignment
  if (user.role !== role) {
    throw new ApiError(403, `Access Denied: Your assigned role '${user.role}' does not match the requested role '${role}'.`);
  }

  // Verify password correctness
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Authentication Failed: Incorrect password credentials.");
  }

  // Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token on user document
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Clean user object before sending response
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "Sign-In authentication successful. Access granted to CRM workspace."
      )
    );
});

/**
 * Handle B2B User logout
 */
export const logoutUser = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "ACCESS_SECRET");
      if (decodedToken?._id) {
        await User.findByIdAndUpdate(
          decodedToken._id,
          { $unset: { refreshToken: 1 } },
          { new: true }
        );
      }
    }
  } catch (error) {
    console.warn("Could not clear refresh token from database during logout:", error.message);
  }

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Session ended. Logged out of CRM workspace successfully."));
});

/**
 * Get active user session info
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "No active user session found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Active user session retrieved successfully."));
});
