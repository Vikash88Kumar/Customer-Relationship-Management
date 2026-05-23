import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/product.model.js";
import connect from "./index.js";

dotenv.config({
  path: "./.env"
});

const defaultProducts = [
  {
    sku: "TI-HEX-M16",
    name: "Grade 5 Titanium M16 Hex Bolts",
    description: "High tensile strength aerospace-grade titanium hex bolts for turbine housing assembly and military aviation specs.",
    category: "Fasteners & Hardware",
    unitOfMeasure: "pcs",
    basePrice: 1450,
    specifications: {
      dimensions: "M16 x 75mm",
      material: "Titanium Ti-6Al-4V",
      tolerance: "+/- 0.01mm",
      weightKg: 0.15
    },
    leadTimeDays: 12,
    isCustomizable: false,
    isActive: true
  },
  {
    sku: "AL-SHT-7075",
    name: "7075-T6 Aerospace Aluminium Sheets",
    description: "High-strength structural aluminium plates for aerospace fabrication and aircraft wing skin sheets.",
    category: "Raw Materials",
    unitOfMeasure: "sheets",
    basePrice: 32000,
    specifications: {
      dimensions: "2440mm x 1220mm x 5mm",
      material: "Aluminium 7075-T6",
      tolerance: "+/- 0.05mm",
      weightKg: 42.5
    },
    leadTimeDays: 7,
    isCustomizable: true,
    isActive: true
  },
  {
    sku: "IN-FLG-718",
    name: "Inconel 718 Custom Machined Flanges",
    description: "Superalloy nickel-chromium-iron flange parts engineered for extreme heat resistance in nuclear and chemical plant valves.",
    category: "Custom Manufactured Parts",
    unitOfMeasure: "pcs",
    basePrice: 78000,
    specifications: {
      dimensions: "DN150 PN40 Standard",
      material: "Inconel 718 Alloy",
      tolerance: "+/- 0.005mm",
      weightKg: 12.8
    },
    leadTimeDays: 21,
    isCustomizable: true,
    isActive: true
  },
  {
    sku: "ST-TUB-4130",
    name: "4130 Seamless Chrome-Moly Tubing",
    description: "Cold-drawn seamless structural tubes with exceptional strength-to-weight ratios for roll cages and suspension rigs.",
    category: "Raw Materials",
    unitOfMeasure: "m",
    basePrice: 2850,
    specifications: {
      dimensions: "OD 50.8mm x WT 2.1mm",
      material: "Chrome-Moly Steel 4130",
      tolerance: "+/- 0.1mm",
      weightKg: 2.53
    },
    leadTimeDays: 5,
    isCustomizable: false,
    isActive: true
  },
  {
    sku: "ASM-WING-L",
    name: "Left Wing Structural Rib Sub-Assembly",
    description: "Structural wing rib support system integrated for light aircraft frame distributions.",
    category: "Sub-Assemblies",
    unitOfMeasure: "pcs",
    basePrice: 245000,
    specifications: {
      dimensions: "1800mm x 450mm x 120mm",
      material: "Hybrid Aluminium & Titanium",
      tolerance: "AS9100D Aerospace Std",
      weightKg: 8.4
    },
    leadTimeDays: 30,
    isCustomizable: true,
    isActive: true
  },
  {
    sku: "DIE-CARB-08",
    name: "Tungsten Carbide Precision Extrusion Die",
    description: "Ultra-hard wear-resistant carbon press dies configured for heavy-gauge wire extrusion systems.",
    category: "Tooling & Dies",
    unitOfMeasure: "pcs",
    basePrice: 165000,
    specifications: {
      dimensions: "Dia 250mm x H 180mm",
      material: "Tungsten Carbide (WC-Co)",
      tolerance: "+/- 0.002mm",
      weightKg: 34.0
    },
    leadTimeDays: 45,
    isCustomizable: true,
    isActive: true
  },
  {
    sku: "VAL-NIT-3K",
    name: "3000 PSI High-Flow Nitrogen Valves",
    description: "Heavy-duty industrial high-flow regulator valves with automated relief triggers.",
    category: "Finished Goods",
    unitOfMeasure: "pcs",
    basePrice: 8400,
    specifications: {
      dimensions: "Inlet 1/4\" NPT Male",
      material: "Brass Alloy C36000",
      tolerance: "+/- 0.15mm",
      weightKg: 1.85
    },
    leadTimeDays: 6,
    isCustomizable: false,
    isActive: true
  }
];

const seedProducts = async () => {
  try {
    console.log("Connecting to MONGODB to seed products catalog...");
    await connect();
    console.log("MONGODB Connected successfully!");

    for (const p of defaultProducts) {
      console.log(`Checking if product SKU "${p.sku}" already exists...`);
      const existingProduct = await Product.findOne({ sku: p.sku });

      if (existingProduct) {
        console.log(`Product SKU "${p.sku}" already exists. Updating specs and base price...`);
        existingProduct.name = p.name;
        existingProduct.description = p.description;
        existingProduct.category = p.category;
        existingProduct.unitOfMeasure = p.unitOfMeasure;
        existingProduct.basePrice = p.basePrice;
        existingProduct.specifications = p.specifications;
        existingProduct.leadTimeDays = p.leadTimeDays;
        existingProduct.isCustomizable = p.isCustomizable;
        existingProduct.isActive = p.isActive;
        await existingProduct.save();
        console.log(`Successfully updated SKU: ${p.sku}`);
      } else {
        console.log(`Registering product SKU "${p.sku}"...`);
        const newProduct = new Product(p);
        await newProduct.save();
        console.log(`Successfully registered SKU: ${p.sku}`);
      }
    }

    console.log("\n-----------------------------------------");
    console.log("DATABASE PRODUCT SEEDING COMPLETED SUCCESS!");
    console.log("-----------------------------------------");
    console.log(`Successfully seeded ${defaultProducts.length} industrial SKU specifications!`);
    console.log("-----------------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error.message);
    process.exit(1);
  }
};

seedProducts();
