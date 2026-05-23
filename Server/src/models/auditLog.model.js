import mongoose, { Schema } from "mongoose";

const auditLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Audited user reference is required"],
      index: true,
    },
    action: {
      type: String, // e.g. "LEAD_STATUS_UPDATE", "QUOTATION_REVISED", "LEAD_ASSIGNMENT"
      required: [true, "Audited action is required"],
      trim: true,
      index: true,
    },
    entityType: {
      type: String,
      required: [true, "Entity type classification is required"],
      enum: ["Lead", "Quotation", "Product", "Task", "User", "Team"],
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: [true, "Entity identifier is required"],
      index: true,
    },
    previousState: {
      type: Schema.Types.Mixed, // Stores a JSON snapshot of changed keys before operations
      default: null,
    },
    newState: {
      type: Schema.Types.Mixed, // Stores a JSON snapshot of changed keys after operations
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false }, // Only need timestamp for audit logs
  }
);

// High-speed index on entityType + entityId for looking up full histories of single records
auditLogSchema.index({ entityType: 1, entityId: 1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
