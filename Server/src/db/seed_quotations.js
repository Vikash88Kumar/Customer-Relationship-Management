import mongoose from "mongoose";
import dotenv from "dotenv";
import { Quotation } from "../models/quotation.model.js";
import { Lead } from "../models/lead.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import connect from "./index.js";

dotenv.config({
  path: "./.env"
});

const seedQuotations = async () => {
  try {
    console.log("Connecting to MONGODB to seed quotations database...");
    await connect();
    console.log("MONGODB Connected successfully!");

    // 1. Fetch or create a BDA User
    let bdaUser = await User.findOne({ role: "BDA" });
    if (!bdaUser) {
      bdaUser = await User.findOne({});
    }
    if (!bdaUser) {
      console.log("No users found in database. Seeding a default BDA user first...");
      bdaUser = await User.create({
        name: "Vikash Kumar",
        email: "vikash@forgecrm.com",
        password: "password123", // Will be hashed by user.model pre-save
        role: "BDA",
        isActive: true
      });
    }
    console.log(`Using BDA User: ${bdaUser.name} (${bdaUser._id})`);

    // 2. Fetch or create sample Leads
    let tataLead = await Lead.findOne({ companyName: "Tata Motors Defence Division" });
    if (!tataLead) {
      tataLead = await Lead.create({
        companyName: "Tata Motors Defence Division",
        industry: "Automotive",
        companySize: "500+",
        annualRevenue: 45000000,
        address: { city: "Pune", country: "India" },
        contacts: [
          { name: "Dr. Anil Mukherji", designation: "Chief Procurement Officer", email: "anil.m@tatamotors.com", phone: "+91 22 6665 8282", isPrimary: true }
        ],
        status: "Qualified",
        source: "Direct RFQ (Request for Quote)",
        assignedBDA: bdaUser._id,
        leadScore: 88
      });
    }

    let halLead = await Lead.findOne({ companyName: "Hindustan Aeronautics (HAL)" });
    if (!halLead) {
      halLead = await Lead.create({
        companyName: "Hindustan Aeronautics (HAL)",
        industry: "Aerospace",
        companySize: "500+",
        annualRevenue: 150000000,
        address: { city: "Bengaluru", country: "India" },
        contacts: [
          { name: "Wing Cmdr. K. Rao (Retd.)", designation: "Director Aerospace Assemblies", email: "k.rao@hal-india.com", phone: "+91 80 2232 4433", isPrimary: true }
        ],
        status: "Quoted",
        source: "Partner Agent",
        assignedBDA: bdaUser._id,
        leadScore: 95
      });
    }

    console.log(`Resolved Leads: Tata Motors (${tataLead._id}), HAL (${halLead._id})`);

    // 3. Fetch or create products for item lines
    let titaniumProduct = await Product.findOne({ sku: "TI-HEX-M16" });
    if (!titaniumProduct) {
      titaniumProduct = await Product.create({
        sku: "TI-HEX-M16",
        name: "Grade 5 Titanium M16 Hex Bolts",
        category: "Fasteners & Hardware",
        unitOfMeasure: "pcs",
        basePrice: 1450,
        specifications: { dimensions: "M16 x 75mm", material: "Titanium Ti-6Al-4V", tolerance: "+/- 0.01mm", weightKg: 0.15 },
        leadTimeDays: 12,
        isCustomizable: false,
        isActive: true
      });
    }

    let sheetProduct = await Product.findOne({ sku: "AL-SHT-7075" });
    if (!sheetProduct) {
      sheetProduct = await Product.create({
        sku: "AL-SHT-7075",
        name: "7075-T6 Aerospace Aluminium Sheets",
        category: "Raw Materials",
        unitOfMeasure: "sheets",
        basePrice: 32000,
        specifications: { dimensions: "2440mm x 1220mm x 5mm", material: "Aluminium 7075-T6", tolerance: "+/- 0.05mm", weightKg: 42.5 },
        leadTimeDays: 7,
        isCustomizable: true,
        isActive: true
      });
    }

    let flangeProduct = await Product.findOne({ sku: "IN-FLG-718" });
    if (!flangeProduct) {
      flangeProduct = await Product.create({
        sku: "IN-FLG-718",
        name: "Inconel 718 Custom Machined Flanges",
        category: "Custom Manufactured Parts",
        unitOfMeasure: "pcs",
        basePrice: 78000,
        specifications: { dimensions: "DN150 PN40 Standard", material: "Inconel 718 Alloy", tolerance: "+/- 0.005mm", weightKg: 12.8 },
        leadTimeDays: 21,
        isCustomizable: true,
        isActive: true
      });
    }

    console.log("Resolved Products successfully!");

    // 4. Purge existing quotations to avoid unique index collision
    console.log("Cleaning up existing Quotations...");
    await Quotation.deleteMany({});
    console.log("Quotations cleared!");

    // 5. Seed sample quotations
    console.log("Seeding sample B2B Quotations...");
    
    // Quote A: Tata Motors Defence Division (Client Accepted)
    const quoteA_Subtotal = (500 * titaniumProduct.basePrice) + (10 * sheetProduct.basePrice);
    const quoteA_Discount = 25000;
    const quoteA_Tax = Math.round((quoteA_Subtotal - quoteA_Discount) * 0.18);
    const quoteA_Total = quoteA_Subtotal - quoteA_Discount + quoteA_Tax;

    const quoteA = await Quotation.create({
      quotationNumber: "QT-2026-081",
      revisionNumber: 1,
      leadId: tataLead._id,
      bdaId: bdaUser._id,
      items: [
        {
          productId: titaniumProduct._id,
          isCustom: true,
          customDetails: {
            notes: "Aerospace tolerance specification compliance requested",
            tolerance: "+/- 0.005mm",
            material: "Ti-6Al-4V Grade 5",
            drawingUrl: "TATA-DEF-M16-V1.dwg"
          },
          quantity: 500,
          unitPrice: titaniumProduct.basePrice,
          leadTimeDays: 12
        },
        {
          productId: sheetProduct._id,
          isCustom: false,
          quantity: 10,
          unitPrice: sheetProduct.basePrice,
          leadTimeDays: 7
        }
      ],
      subtotal: quoteA_Subtotal,
      discount: quoteA_Discount,
      tax: quoteA_Tax,
      totalPrice: quoteA_Total,
      paymentTerms: "50% Advance / 50% on Delivery",
      shippingTerms: "FOB",
      status: "Client_Accepted",
      validityDays: 30,
      history: [
        { revisedBy: bdaUser._id, revisedAt: new Date(Date.now() - 5*24*60*60*1000), reason: "Initial draft submitted." },
        { revisedBy: bdaUser._id, revisedAt: new Date(Date.now() - 2*24*60*60*1000), reason: "Revised titanium quantity and applied bulk discount." }
      ]
    });

    // Quote B: Hindustan Aeronautics (HAL) (Sent To Client)
    const quoteB_Subtotal = (5 * flangeProduct.basePrice);
    const quoteB_Discount = 15000;
    const quoteB_Tax = Math.round((quoteB_Subtotal - quoteB_Discount) * 0.18);
    const quoteB_Total = quoteB_Subtotal - quoteB_Discount + quoteB_Tax;

    const quoteB = await Quotation.create({
      quotationNumber: "QT-2026-082",
      revisionNumber: 0,
      leadId: halLead._id,
      bdaId: bdaUser._id,
      items: [
        {
          productId: flangeProduct._id,
          isCustom: true,
          customDetails: {
            notes: "Ultrasonic NDT inspection tolerance certificates required",
            tolerance: "+/- 0.002mm",
            drawingUrl: "HAL-TURB-09.dwg"
          },
          quantity: 5,
          unitPrice: flangeProduct.basePrice,
          leadTimeDays: 21
        }
      ],
      subtotal: quoteB_Subtotal,
      discount: quoteB_Discount,
      tax: quoteB_Tax,
      totalPrice: quoteB_Total,
      paymentTerms: "Net 30",
      shippingTerms: "CIF",
      status: "Sent_To_Client",
      validityDays: 15,
      history: [
        { revisedBy: bdaUser._id, revisedAt: new Date(), reason: "Initial engineering drawing verified and custom pricing computed." }
      ]
    });

    console.log("\n-----------------------------------------");
    console.log("DATABASE QUOTATIONS SEEDING COMPLETED SUCCESS!");
    console.log("-----------------------------------------");
    console.log(`Successfully seeded ${Quotation.length || 2} premium B2B Quotations!`);
    console.log(" - Tata Motors Defence Division: QT-2026-081 (v1)");
    console.log(" - Hindustan Aeronautics (HAL): QT-2026-082 (v0)");
    console.log("-----------------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding quotations:", error.message);
    process.exit(1);
  }
};

seedQuotations();
