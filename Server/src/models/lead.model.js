import mongoose, { Schema } from "mongoose";

const contactPersonSchema = new Schema({
  name: {
    type: String,
    required: [true, "Contact name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Contact email is required"],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  designation: {
    type: String, // e.g., "Procurement Manager", "VP of Operations", "Chief Metallurgist"
    trim: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
});

const leadSchema = new Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      index: true,
    },
    industry: {
      type: String,
      required: [true, "Industry vertical is required"],
      enum: [
        "Automotive",
        "Aerospace",
        "Electronics",
        "Construction & Infrastructure",
        "Medical Devices",
        "Energy & Utilities",
        "Chemicals & Plastics",
        "Heavy Machinery",
        "Other",
      ],
      index: true,
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    annualRevenue: {
      type: Number, // In base currency, useful for qualifying lead value
      default: 0,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true, index: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, index: true },
      zipCode: { type: String, trim: true },
    },
    contacts: {
      type: [contactPersonSchema],
      validate: [
        (val) => val.length > 0,
        "At least one contact person is required",
      ],
    },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Qualified",
        "Nurturing",
        "Quoted",
        "Negotiating",
        "Won",
        "Lost",
      ],
      default: "New",
      index: true,
    },
    lossReason: {
      type: String, // Filled when status is 'Lost' (e.g. "Price Mismatch", "Competitor Beat Us", "Specs Incompatibility")
      trim: true,
    },
    source: {
      type: String,
      required: [true, "Lead source is required"],
      enum: [
        "Website Inbound",
        "Cold Outreach",
        "Referral",
        "Trade Show",
        "LinkedIn",
        "Partner Agent",
        "Direct RFQ (Request for Quote)",
      ],
      index: true,
    },
    assignedBDA: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    leadScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },
    customFields: {
      type: Map,
      of: String, // Extensible structure for manufacturing specs e.g. {"preferredMaterial": "Alum-6061", "shippingCertReq": "ISO-9001"}
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for advanced searching across company name, city, and contacts
leadSchema.index({
  companyName: "text",
  "contacts.name": "text",
  "address.city": "text",
});

// Pre-save validation: Ensure only one contact is marked primary
leadSchema.pre("save", function (next) {
  if (this.contacts && this.contacts.length > 0) {
    const primaryContacts = this.contacts.filter((c) => c.isPrimary);
    if (primaryContacts.length > 1) {
      return next(new Error("A lead can only have one primary contact person."));
    }
    // Default the first contact to primary if none is explicitly set
    if (primaryContacts.length === 0) {
      this.contacts[0].isPrimary = true;
    }
  }
  next();
});

export const Lead = mongoose.model("Lead", leadSchema);
