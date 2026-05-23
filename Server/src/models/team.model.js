import mongoose, { Schema } from "mongoose";

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Team manager is required"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
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

export const Team = mongoose.model("Team", teamSchema);
