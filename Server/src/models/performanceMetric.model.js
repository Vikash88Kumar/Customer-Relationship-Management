import mongoose, { Schema } from "mongoose";

const performanceMetricSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    period: {
      type: String, // format: "YYYY-MM" (e.g., "2026-05") or "YYYY-QQ" (e.g., "2026-Q2")
      required: [true, "Fiscal tracking period is required"],
      index: true,
    },
    revenueTarget: {
      type: Number,
      default: 0,
      min: 0,
    },
    revenueAchieved: {
      type: Number,
      default: 0,
      min: 0,
    },
    leadsTarget: {
      type: Number,
      default: 0,
      min: 0,
    },
    leadsGenerated: {
      type: Number,
      default: 0,
      min: 0,
    },
    dealsClosedTarget: {
      type: Number,
      default: 0,
      min: 0,
    },
    dealsClosed: {
      type: Number,
      default: 0,
      min: 0,
    },
    callsMade: {
      type: Number,
      default: 0,
      min: 0,
    },
    emailsSent: {
      type: Number,
      default: 0,
      min: 0,
    },
    meetingsDone: {
      type: Number,
      default: 0,
      min: 0,
    },
    conversionRate: {
      type: Number, // percentage: (Won Leads / Total Leads) * 100
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Guarantee a user only has one entry per unique period
performanceMetricSchema.index({ userId: 1, period: 1 }, { unique: true });

export const PerformanceMetric = mongoose.model("PerformanceMetric",performanceMetricSchema);
