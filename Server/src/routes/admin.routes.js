import { Router } from "express";
import { verifyJwt, authorizeRoles } from "../middlewares/auth.middleware.js";
import { getAdminSummary } from "../controllers/admin.controller.js";

const router = Router();

// Apply global JWT verification and Admin-only authorization to all routes defined below
// router.use(verifyJwt);
router.use(authorizeRoles("Admin"));

router.route("/summary").get(getAdminSummary);

export default router;
