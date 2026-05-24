import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Lead } from "../models/lead.model.js";
import { Quotation } from "../models/quotation.model.js";

/**
 * Get Admin Workspace Summary Statistics
 * Returns high-level database counts and financial volumes for dashboard administration.
 */
export const getAdminSummary = asyncHandler(async (req, res) => {
  // Gathers core metric totals from MongoDB
  const totalUsers = await User.countDocuments();
  const activeBdas = await User.countDocuments({ role: "BDA", isActive: true });
  const totalLeadsCount = await Lead.countDocuments();
  
  // Aggregate total Won sales volumes in Rupees (₹)
  const wonQuotes = await Quotation.find({ status: "Client_Accepted" });
  const totalWonRevenue = wonQuotes.reduce((sum, q) => sum + (q.totalPrice || 0), 0);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        activeBdas,
        totalLeadsCount,
        totalWonRevenue,
        systemHealth: "Optimal",
        dbConnection: "Connected (Cluster0)"
      },
      "Admin workspace summary loaded successfully"
    )
  );
});
