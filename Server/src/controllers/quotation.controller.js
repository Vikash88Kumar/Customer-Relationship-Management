import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Quotation } from "../models/quotation.model.js";
import { Lead } from "../models/lead.model.js";
import { Product } from "../models/product.model.js";

/**
 * Helper: Write a quick compliance audit log (console output only)
 */
const writeAuditLog = async (userId, actionType, details) => {
  try {
    console.log(`[AUDIT LOG] User: ${userId} | Action: ${actionType} | Details: ${details}`);
  } catch (err) {
    console.error("Audit logging helper failed:", err);
  }
};

/**
 * Get All B2B Quotations
 * Supports role-based filtering:
 * - Managers/Supervisors get all records.
 * - BDA associates get only their handled quotations.
 */
export const getQuotations = asyncHandler(async (req, res) => {
  const query = {};
  
  // Filter by user if not manager
  if (req.user && req.user.role !== "BDA_Manager") {
    query.bdaId = req.user._id;
  }

  const quotations = await Quotation.find(query)
    .populate("leadId", "companyName industry contacts")
    .populate("bdaId", "name email role")
    .populate("items.productId", "sku name basePrice unitOfMeasure specifications")
    .populate("history.revisedBy", "name")
    .sort({ createdAt: -1 });

  // Map backend ObjectId references back to the flat structure expected by the client UI
  const formattedQuotes = quotations.map(q => {
    const items = q.items.map(item => ({
      sku: item.productId?.sku || "N/A",
      name: item.productId?.name || "N/A",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      isCustom: item.isCustom,
      customDetails: {
        tolerance: item.customDetails?.tolerance || "",
        material: item.customDetails?.material || "",
        drawingFile: item.customDetails?.drawingUrl || ""
      }
    }));

    return {
      _id: q._id,
      quotationNumber: q.quotationNumber,
      revisionNumber: q.revisionNumber,
      customer: q.leadId?.companyName || "Unknown Client",
      bda: q.bdaId?.name || "N/A",
      items,
      subtotal: q.subtotal,
      discount: q.discount,
      tax: q.tax,
      totalPrice: q.totalPrice,
      paymentTerms: q.paymentTerms,
      shippingTerms: q.shippingTerms,
      status: q.status,
      validityDays: q.validityDays,
      expiryDate: q.expiryDate?.toISOString().split("T")[0],
      history: q.history.map((hist, idx) => ({
        revision: idx,
        revisedBy: hist.revisedBy?.name || "N/A",
        revisedAt: hist.revisedAt?.toISOString().split("T")[0],
        reason: hist.reason
      }))
    };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, formattedQuotes, "Quotations registry loaded successfully."));
});

/**
 * Register New Quotation Draft
 * Resolves Client Leads and Catalog Product SKUs in MongoDB.
 */
export const createQuotation = asyncHandler(async (req, res) => {
  const {
    quotationNumber,
    customer, // Company Name string
    items, // UI items array
    discount,
    paymentTerms,
    shippingTerms,
    status,
    validityDays
  } = req.body;

  if (!customer || !items || items.length === 0) {
    throw new ApiError(400, "Client customer name and at least one catalog item are required.");
  }

  // 1. Resolve Lead/Customer ObjectId
  const lead = await Lead.findOne({ companyName: customer });
  if (!lead) {
    throw new ApiError(404, `Client Lead "${customer}" was not found in the workspace databases.`);
  }

  // 2. Resolve Product SKUs and build database payload items
  const itemsPayload = [];
  for (const item of items) {
    const product = await Product.findOne({ sku: item.sku });
    if (!product) {
      throw new ApiError(404, `Product SKU code "${item.sku}" is not registered in the catalog.`);
    }

    itemsPayload.push({
      productId: product._id,
      isCustom: !!item.isCustom,
      customDetails: {
        tolerance: item.customDetails?.tolerance || "AS9100D Standard",
        material: item.customDetails?.material || product.specifications?.material || "N/A",
        dimensions: item.customDetails?.dimensions || product.specifications?.dimensions || "N/A",
        drawingUrl: item.customDetails?.drawingFile || ""
      },
      quantity: parseInt(item.quantity) || 1,
      unitPrice: parseFloat(item.unitPrice) || product.basePrice,
      leadTimeDays: parseInt(product.leadTimeDays) || 7
    });
  }

  // 3. Compute Financials
  const discountVal = parseFloat(discount) || 0;
  const subtotal = itemsPayload.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = Math.round((subtotal - discountVal) * 0.18); // 18% standard GST
  const totalPrice = Math.max(0, subtotal - discountVal + tax);

  // 4. Create Quotation Draft in DB
  const bdaId = req.user ? req.user._id : lead.assignedBDA;
  if (!bdaId) {
    throw new ApiError(400, "Could not determine BDA handler for this quotation.");
  }

  const generatedQuoteNumber = quotationNumber || `QT-2026-0${Math.floor(Math.random() * 90) + 10}`;

  const newQuotation = await Quotation.create({
    quotationNumber: generatedQuoteNumber,
    revisionNumber: 0,
    leadId: lead._id,
    bdaId,
    items: itemsPayload,
    subtotal,
    discount: discountVal,
    tax,
    totalPrice,
    paymentTerms: paymentTerms || "50% Advance / 50% on Delivery",
    shippingTerms: shippingTerms || "EXW",
    status: status || "Draft",
    validityDays: parseInt(validityDays) || 30,
    history: [
      {
        revisedBy: bdaId,
        revisedAt: new Date(),
        reason: "Initial custom build draft registered."
      }
    ]
  });

  if (req.user) {
    await writeAuditLog(
      req.user._id,
      "QUOTATION_CREATION",
      `Drafted commercial quote ${newQuotation.quotationNumber} for ${customer} totaling ₹${totalPrice.toLocaleString("en-IN")}`
    );
  }

  // Return the newly formatted quotation record
  const result = await Quotation.findById(newQuotation._id)
    .populate("leadId", "companyName")
    .populate("bdaId", "name");

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: result._id,
        quotationNumber: result.quotationNumber,
        revisionNumber: result.revisionNumber,
        customer: result.leadId?.companyName,
        bda: result.bdaId?.name,
        items,
        subtotal: result.subtotal,
        discount: result.discount,
        tax: result.tax,
        totalPrice: result.totalPrice,
        paymentTerms: result.paymentTerms,
        shippingTerms: result.shippingTerms,
        status: result.status,
        validityDays: result.validityDays,
        expiryDate: result.expiryDate?.toISOString().split("T")[0],
        history: [{
          revision: 0,
          revisedBy: result.bdaId?.name || "N/A",
          revisedAt: new Date().toISOString().split("T")[0],
          reason: "Initial custom build draft registered."
        }]
      },
      "B2B quotation draft created successfully."
    )
  );
});

/**
 * Update Quotation
 * Handles status updates (Draft ➔ Under_Negotiation ➔ Client_Accepted)
 * and technical/commercial revisions.
 */
export const updateQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    status,
    items,
    discount,
    paymentTerms,
    shippingTerms,
    validityDays,
    reason
  } = req.body;

  const quotation = await Quotation.findById(id);
  if (!quotation) {
    throw new ApiError(404, "Quotation not found");
  }

  const bdaId = req.user ? req.user._id : quotation.bdaId;

  // Case A: Pure Status Promotion Update (interactive chevron tracking)
  if (status && !items) {
    const oldStatus = quotation.status;
    quotation.status = status;
    
    // Check if adding revision history entry
    quotation.history.push({
      revisedBy: bdaId,
      revisedAt: new Date(),
      reason: `Promoted quotation status to ${status.replace(/_/g, ' ')}.`
    });

    await quotation.save();

    if (req.user) {
      await writeAuditLog(
        req.user._id,
        "QUOTATION_STATUS_CHANGE",
        `Quotation ${quotation.quotationNumber} promoted status from ${oldStatus} ➔ ${status}`
      );
    }
  } 
  // Case B: Technical/Commercial Revision Update (vN ➔ vN+1)
  else if (items) {
    const nextRevision = quotation.revisionNumber + 1;
    
    // Resolve SKUs for the revised items
    const itemsPayload = [];
    for (const item of items) {
      const product = await Product.findOne({ sku: item.sku });
      if (!product) {
        throw new ApiError(404, `Product SKU code "${item.sku}" is not registered in the catalog.`);
      }

      itemsPayload.push({
        productId: product._id,
        isCustom: !!item.isCustom,
        customDetails: {
          tolerance: item.customDetails?.tolerance || "AS9100D Standard",
          material: item.customDetails?.material || product.specifications?.material || "N/A",
          dimensions: item.customDetails?.dimensions || product.specifications?.dimensions || "N/A",
          drawingUrl: item.customDetails?.drawingFile || ""
        },
        quantity: parseInt(item.quantity) || 1,
        unitPrice: parseFloat(item.unitPrice) || product.basePrice,
        leadTimeDays: parseInt(product.leadTimeDays) || 7
      });
    }

    const discountVal = parseFloat(discount) || 0;
    const subtotal = itemsPayload.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = Math.round((subtotal - discountVal) * 0.18);
    const totalPrice = Math.max(0, subtotal - discountVal + tax);

    quotation.revisionNumber = nextRevision;
    quotation.items = itemsPayload;
    quotation.subtotal = subtotal;
    quotation.discount = discountVal;
    quotation.tax = tax;
    quotation.totalPrice = totalPrice;
    quotation.paymentTerms = paymentTerms || quotation.paymentTerms;
    quotation.shippingTerms = shippingTerms || quotation.shippingTerms;
    quotation.status = "Revised";
    
    if (validityDays) {
      quotation.validityDays = parseInt(validityDays);
    }

    quotation.history.push({
      revisedBy: bdaId,
      revisedAt: new Date(),
      reason: reason || "Revised technical specifications, quantity configurations, and commercial discount schedules."
    });

    await quotation.save();

    if (req.user) {
      await writeAuditLog(
        req.user._id,
        "QUOTATION_REVISION",
        `Created revision v${nextRevision} for Quotation ${quotation.quotationNumber}`
      );
    }
  }

  // Populate references and return updated record
  const result = await Quotation.findById(id)
    .populate("leadId", "companyName")
    .populate("bdaId", "name")
    .populate("history.revisedBy", "name");

  const formattedItems = result.items.map(item => ({
    sku: item.productId?.sku || items?.find(i => i.sku)?.sku || "N/A",
    name: item.productId?.name || items?.find(i => i.sku)?.name || "N/A",
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    isCustom: item.isCustom,
    customDetails: {
      tolerance: item.customDetails?.tolerance || "",
      material: item.customDetails?.material || "",
      drawingFile: item.customDetails?.drawingUrl || ""
    }
  }));

  const formattedQuotation = {
    _id: result._id,
    quotationNumber: result.quotationNumber,
    revisionNumber: result.revisionNumber,
    customer: result.leadId?.companyName,
    bda: result.bdaId?.name,
    items: formattedItems,
    subtotal: result.subtotal,
    discount: result.discount,
    tax: result.tax,
    totalPrice: result.totalPrice,
    paymentTerms: result.paymentTerms,
    shippingTerms: result.shippingTerms,
    status: result.status,
    validityDays: result.validityDays,
    expiryDate: result.expiryDate?.toISOString().split("T")[0],
    history: result.history.map((hist, idx) => ({
      revision: idx,
      revisedBy: hist.revisedBy?.name || "N/A",
      revisedAt: hist.revisedAt?.toISOString().split("T")[0],
      reason: hist.reason
    }))
  };

  return res
    .status(200)
    .json(new ApiResponse(200, formattedQuotation, "Quotation record updated successfully."));
});

/**
 * Delete B2B Quotation
 */
export const deleteQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quotation = await Quotation.findById(id);
  if (!quotation) {
    throw new ApiError(404, "Quotation not found");
  }

  await Quotation.findByIdAndDelete(id);

  if (req.user) {
    await writeAuditLog(
      req.user._id,
      "QUOTATION_DELETION",
      `Permanently deleted Quotation ${quotation.quotationNumber}`
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Quotation permanently purged from corporate registry."));
});
