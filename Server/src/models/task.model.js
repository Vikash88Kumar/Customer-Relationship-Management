import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Task type is required"],
      enum: [
        "Call",
        "Email",
        "Meeting",
        "Site Visit",
        "Send Proposal",
        "Prepare Quote",
        "Follow-up",
      ],
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assignee is required"],
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Overdue", "Cancelled"],
      default: "Pending",
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if task is overdue
taskSchema.virtual("isOverdue").get(function () {
  return this.status !== "Completed" && this.dueDate < new Date();
});

// Middleware to automatically capture completion timestamp
taskSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "Completed") {
    this.completedAt = new Date();
  }
  if (typeof next === "function") {
    next();
  }
});

export const Task = mongoose.model("Task", taskSchema);
