import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";

/**
 * Authentication Middleware
 * Verifies the incoming JWT access token and attaches the authenticated user to the request object.
 */
export const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to users with specific authorized roles.
 * 
 * @param {...string} allowedRoles - List of roles permitted to access the resource (e.g., "Admin", "BDA_Manager")
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, _, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required to access this resource");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};
