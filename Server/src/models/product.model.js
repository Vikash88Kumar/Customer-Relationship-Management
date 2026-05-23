import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: String,
    category: {
      type: String,
      required: true,
      enum: [
        "Raw Materials",
        "Fasteners & Hardware",
        "Custom Manufactured Parts",
        "Sub-Assemblies",
        "Tooling & Dies",
        "Finished Goods",
      ],
      index: true,
    },
    unitOfMeasure: {
      type: String,
      required: true,
      enum: ["pcs", "kg", "m", "liters", "tons", "boxes", "sheets"],
      default: "pcs",
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    specifications: {
      dimensions: String,
      material: { type: String, index: true },
      tolerance: String,
      weightKg: { type: Number, min: 0 },
    },
    leadTimeDays: {
      type: Number,
      required: true,
      min: 0,
      default: 7,
    },
    isCustomizable: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
