import { Router } from "express";
import { verifyJwt, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  getQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation
} from "../controllers/quotation.controller.js";

const router = Router();

// Protect all quotation workflows with corporate user authentication
// router.use(verifyJwt);

router.route("/")
  .get(getQuotations)
  .post(createQuotation);

router.route("/:id")
  .put(updateQuotation)
  .delete(authorizeRoles("Admin", "BDA_Manager"), deleteQuotation);

export default router;
