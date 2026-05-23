import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getProducts, createProduct } from "../controllers/product.controller.js";

const router = Router();

// Apply JWT verification globally to all Product Catalog endpoints
// router.use(verifyJwt);

router.route("/")
  .get(getProducts)
  .post(createProduct);

export default router;
