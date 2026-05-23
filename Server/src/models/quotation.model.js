import mongoose, { Schema } from "mongoose";

const quotationItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product reference is required"],
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  customDetails: {
    notes: { type: String, trim: true },
    dimensions: { type: String, trim: true }, // custom dimensions if overriding standard SKU
    material: { type: String, trim: true }, // custom material
    tolerance: { type: String, trim: true }, // custom tolerance e.g. "+/- 0.005mm"
    drawingUrl: { type: String }, // Link to CAD file, blueprint PDF
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  unitPrice: {
    type: Number,
    required: [true, "Quoted unit price is required"],
    min: [0, "Quoted price cannot be negative"],
  },
  leadTimeDays: {
    type: Number,
    required: [true, "Production lead time is required for line items"],
    min: [0, "Lead time cannot be negative"],
  },
});

const quotationSchema = new Schema(
  {
    quotationNumber: {
      type: String,
      required: [true, "Quotation ID code is required"],
      trim: true,
      index: true,
    },
    revisionNumber: {
      type: Number,
      default: 0,
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead/Customer reference is required"],
      index: true,
    },
    bdaId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "BDA handler is required"],
      index: true,
    },
    items: {
      type: [quotationItemSchema],
      validate: [
        (val) => val.length > 0,
        "A quotation must contain at least one product item",
      ],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentTerms: {
      type: String,
      enum: [
        "100% Advance",
        "50% Advance / 50% on Delivery",
        "30% Advance / 70% on Delivery",
        "Net 30",
        "Net 60",
        "Net 90",
      ],
      default: "50% Advance / 50% on Delivery",
    },
    shippingTerms: {
      type: String,
      enum: ["EXW", "FOB", "CIF", "DDP", "CFR", "FCA"],
      default: "EXW", // Ex Works standard for manufacturing shipping
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Manager_Approved",
        "Sent_To_Client",
        "Client_Accepted",
        "Client_Rejected",
        "Expired",
        "Revised",
      ],
      default: "Draft",
      index: true,
    },
    validityDays: {
      type: Number,
      default: 30, // Default quote validity 30 days due to raw material price changes
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    history: [
      {
        revisedBy: { type: Schema.Types.ObjectId, ref: "User" },
        revisedAt: { type: Date, default: Date.now },
        previousQuotationId: { type: Schema.Types.ObjectId, ref: "Quotation" },
        reason: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness of quotation number + revision number
quotationSchema.index({ quotationNumber: 1, revisionNumber: 1 }, { unique: true });

// Auto-calculate expiryDate based on validityDays and calculate financials before validation
quotationSchema.pre("validate", function (next) {
  if (this.isModified("validityDays") || !this.expiryDate) {
    const creationTime = this.createdAt || new Date();
    const expiry = new Date(creationTime);
    expiry.setDate(expiry.getDate() + this.validityDays);
    this.expiryDate = expiry;
  }

  // Double check item pricing calculations
  if (this.items && this.items.length > 0) {
    let subtotalSum = 0;
    this.items.forEach((item) => {
      subtotalSum += item.quantity * item.unitPrice;
    });
    this.subtotal = subtotalSum;
    this.totalPrice = Math.max(0, this.subtotal - this.discount + this.tax);
  }
  next();
});

export const Quotation = mongoose.model("Quotation", quotationSchema);
