import mongoose, { Schema } from "mongoose";

const communicationLogSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead reference is required"],
      index: true,
    },
    bdaId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "BDA handler reference is required"],
      index: true,
    },
    contactPerson: {
      type: String, // Name of the procurement executive or engineer spoken to
      required: [true, "Client contact person's name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Communication type is required"],
      enum: ["Email", "Call", "Meeting", "Site Visit", "WhatsApp", "Other"],
      index: true,
    },
    direction: {
      type: String,
      required: [true, "Direction (Inbound/Outbound) is required"],
      enum: ["Inbound", "Outbound"],
    },
    dateTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    durationMinutes: {
      type: Number,
      min: [0, "Duration cannot be negative"],
      default: 0,
    },
    subject: {
      type: String,
      required: [true, "Discussion subject is required"],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, "Communication summary is required"],
      trim: true,
    },
    outcomes: {
      type: String, // e.g. "Sent sample drawing, scheduled mock quotation"
      trim: true,
    },
    attachments: {
      type: [String], // URLs to PDF transcripts, custom specs sheets, meeting pictures
      default: [],
    },
    nextFollowUpDate: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Advanced text indexes for fast full-text searching inside discussion summaries and subjects
communicationLogSchema.index({
  subject: "text",
  summary: "text",
  outcomes: "text",
});

export const CommunicationLog = mongoose.model(
  "CommunicationLog",
  communicationLogSchema
);
