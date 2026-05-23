import { Router } from "express";
import { verifyJwt, authorizeRoles } from "../middlewares/auth.middleware.js";
import { getProducts, createProduct } from "../controllers/product.controller.js";

const router = Router();

// Apply JWT verification globally to all Product Catalog endpoints
router.use(verifyJwt);

router.route("/")
  .get(getProducts)
  .post(authorizeRoles("Admin", "BDA_Manager"), createProduct);

export default router;
