import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { loginUser, logoutUser, getCurrentUser } from "../controllers/auth.controller.js";

const router = Router();

// Public Routes
router.route("/login").post(loginUser);

// JWT Protected Routes
router.route("/logout").post(logoutUser);
router.route("/current-user").get(verifyJwt, getCurrentUser);

export default router;
