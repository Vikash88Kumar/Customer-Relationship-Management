import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Product } from "../models/product.model.js";

/**
 * Get Catalog Products List
 * Returns all products, with optional category filtering and search query mappings (SKU, name, alloys).
 */
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const query = {};

  // Apply category filter if set and not "All"
  if (category && category !== "All") {
    query.category = category;
  }

  // Apply dynamic text search over SKU, Name, and Material specifications
  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { sku: searchRegex },
      { name: searchRegex },
      { "specifications.material": searchRegex }
    ];
  }

  const products = await Product.find(query).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Catalog inventory loaded successfully"));
});

/**
 * Register New Product SKU
 * Validates, checks for duplicates, and creates a new commercial manufacturing product in MongoDB.
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    sku,
    name,
    description,
    category,
    unitOfMeasure,
    basePrice,
    specifications,
    leadTimeDays,
    isCustomizable
  } = req.body;

  // 1. Core Parameter Validations
  if (!sku || !name || !category || !basePrice) {
    throw new ApiError(400, "SKU code, product name, category, and base price are required parameters.");
  }

  const normalizedSku = sku.toUpperCase().trim();

  // 2. Active Duplicate SKU Code Protection
  const existingProduct = await Product.findOne({ sku: normalizedSku });
  if (existingProduct) {
    throw new ApiError(
      400,
      `Duplicate Entry: A manufacturing product SKU with the code "${normalizedSku}" already exists in the catalog.`
    );
  }

  // 3. Create the pre-qualified B2B Product
  const newProduct = await Product.create({
    sku: normalizedSku,
    name: name.trim(),
    description: description?.trim() || "No product description provided.",
    category,
    unitOfMeasure: unitOfMeasure || "pcs",
    basePrice: parseFloat(basePrice) || 0,
    specifications: {
      dimensions: specifications?.dimensions?.trim() || "N/A",
      material: specifications?.material?.trim() || "N/A",
      tolerance: specifications?.tolerance?.trim() || "AS9100D Standard",
      weightKg: parseFloat(specifications?.weightKg) || 0.1
    },
    leadTimeDays: parseInt(leadTimeDays) || 7,
    isCustomizable: !!isCustomizable,
    isActive: true
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newProduct, `Product SKU "${normalizedSku}" registered in corporate catalog successfully.`)
    );
});
