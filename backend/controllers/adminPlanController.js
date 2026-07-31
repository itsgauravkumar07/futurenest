const PlanPurchase = require("../models/PlanPurchase");
const User = require("../models/User");

// @route  GET /api/admin/plan-purchases?status=pending_activation
// @access Admin, Super Admin
const getPlanPurchases = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const purchases = await PlanPurchase.find(query)
      .populate("purchasedBy", "name email phone role")
      .populate("plan", "name audience")
      .sort({ requestedAt: 1 });

    res.status(200).json({ purchases });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plan purchases", error: error.message });
  }
};

// @route  PUT /api/admin/plan-purchases/:id/activate
// @desc   Admin confirms the offline payment (UPI/bank transfer/cash) and
//         activates the plan — grants the buyer's listing/lead balance
//         (seller plan) or assisted-search balance (buyer plan).
// @access Admin, Super Admin
const activatePlanPurchase = async (req, res) => {
  try {
    const purchase = await PlanPurchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Plan purchase not found" });

    if (purchase.status !== "pending_activation") {
      return res.status(400).json({ message: `Cannot activate a purchase with status "${purchase.status}"` });
    }

    const account = await User.findById(purchase.purchasedBy);
    if (!account) return res.status(404).json({ message: "Account not found" });

    const now = new Date();
    const expiresAt = purchase.planSnapshot.validityDays
      ? new Date(now.getTime() + purchase.planSnapshot.validityDays * 24 * 60 * 60 * 1000)
      : null; // no validityDays set on this plan = never expires

    purchase.status = "active";
    purchase.activatedAt = now;
    purchase.activatedBy = req.user._id;
    purchase.expiresAt = expiresAt;
    await purchase.save();

    // Grant the plan's allowances. This OVERWRITES any leftover balance from
    // a previous plan — each new activation is a fresh plan period.
    // For a buyer plan, listingLimit is always 0 (buyers don't list), and
    // leadsRemaining represents "assisted property matches remaining" instead.
    account.activePlan = purchase.plan;
    account.planStatus = "active";
    account.listingsRemaining = purchase.planSnapshot.listingLimit;
    account.leadsRemaining = purchase.planSnapshot.qualifiedLeadsLimit;
    account.planStartDate = now;
    account.planExpiryDate = expiresAt;
    await account.save();

    res.status(200).json({ message: "Plan activated", purchase, account });
  } catch (error) {
    res.status(500).json({ message: "Failed to activate plan", error: error.message });
  }
};

// @route  PUT /api/admin/plan-purchases/:id/cancel
// @desc   Buyer requested a plan but never completed payment / admin declines it
// @access Admin, Super Admin
const cancelPlanPurchase = async (req, res) => {
  try {
    const purchase = await PlanPurchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Plan purchase not found" });

    if (purchase.status !== "pending_activation") {
      return res.status(400).json({ message: `Cannot cancel a purchase with status "${purchase.status}"` });
    }

    purchase.status = "cancelled";
    await purchase.save();

    // Clear the pending state off the account
    const account = await User.findById(purchase.purchasedBy);
    if (account && account.planStatus === "pending_activation") {
      account.planStatus = "none";
      account.activePlan = null;
      await account.save();
    }

    res.status(200).json({ message: "Plan purchase cancelled", purchase });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel plan purchase", error: error.message });
  }
};

// @route  GET /api/admin/plan-purchases/refund-requests
// @access Admin, Super Admin
const getRefundRequests = async (req, res) => {
  try {
    const purchases = await PlanPurchase.find({ refundStatus: "requested" })
      .populate("purchasedBy", "name email phone role")
      .populate("plan", "name audience")
      .sort({ updatedAt: 1 });

    res.status(200).json({ purchases });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch refund requests", error: error.message });
  }
};

// @route  PUT /api/admin/plan-purchases/:id/refund
// @desc   Approve a refund under the money-back guarantee. Also resets the
//         account's balance if this was their currently active plan, so
//         they can't keep using leads/listings/matches from a refunded plan.
// @body   { approve: boolean, reason }
// @access Admin, Super Admin
const processRefund = async (req, res) => {
  try {
    const { approve, reason } = req.body;
    const purchase = await PlanPurchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Plan purchase not found" });

    if (purchase.refundStatus !== "requested") {
      return res.status(400).json({ message: "This purchase has no pending refund request" });
    }

    if (!approve) {
      purchase.refundStatus = "rejected";
      purchase.refundReason = reason || purchase.refundReason;
      await purchase.save();
      return res.status(200).json({ message: "Refund request rejected", purchase });
    }

    purchase.status = "refunded";
    purchase.refundStatus = "approved";
    purchase.refundedAt = new Date();
    purchase.refundedBy = req.user._id;
    if (reason) purchase.refundReason = reason;
    await purchase.save();

    // If this refunded purchase was the account's current live plan, revoke it
    const account = await User.findById(purchase.purchasedBy);
    if (account && String(account.activePlan) === String(purchase.plan) && account.planStatus === "active") {
      account.planStatus = "none";
      account.activePlan = null;
      account.listingsRemaining = 0;
      account.leadsRemaining = 0;
      account.planExpiryDate = null;
      await account.save();
    }

    res.status(200).json({ message: "Refund approved and processed", purchase });
  } catch (error) {
    res.status(500).json({ message: "Failed to process refund", error: error.message });
  }
};

// @route  GET /api/admin/plan-purchases/revenue
// @desc   Revenue report: total from activated plans (active or expired),
//         excluding refunded ones. Breakdown by plan name and by audience
//         (seller listing-plan revenue vs buyer assisted-search revenue).
// @access Super Admin only
const getRevenueReport = async (req, res) => {
  try {
    const purchases = await PlanPurchase.find({ status: { $in: ["active", "expired"] } })
      .populate("purchasedBy", "name email phone role")
      .sort({ activatedAt: -1 });

    const totalRevenue = purchases.reduce((sum, p) => sum + (p.planSnapshot.price || 0), 0);

    const byPlan = {};
    const byAudience = { seller: 0, buyer: 0 };
    purchases.forEach((p) => {
      const name = p.planSnapshot.name;
      byPlan[name] = (byPlan[name] || 0) + (p.planSnapshot.price || 0);
      const audience = p.planSnapshot.audience === "buyer" ? "buyer" : "seller";
      byAudience[audience] += p.planSnapshot.price || 0;
    });

    // Raw list so Super Admin can see exactly who bought what, not just totals
    const purchasers = purchases.map((p) => ({
      _id: p._id,
      account: p.purchasedBy,
      planName: p.planSnapshot.name,
      price: p.planSnapshot.price,
      status: p.status,
      activatedAt: p.activatedAt,
    }));

    res.status(200).json({
      totalRevenue,
      totalActivations: purchases.length,
      byPlan,
      byAudience,
      purchasers,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate revenue report", error: error.message });
  }
};

module.exports = {
  getPlanPurchases,
  activatePlanPurchase,
  cancelPlanPurchase,
  getRefundRequests,
  processRefund,
  getRevenueReport,
};
