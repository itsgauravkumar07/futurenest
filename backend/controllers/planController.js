const Plan = require("../models/Plan");
const PlanPurchase = require("../models/PlanPurchase");
const User = require("../models/User");

// @route  GET /api/plans?audience=buyer&listingType=rental
// @desc   Public: browse active plans. Filter by audience (seller plans vs
//         buyer/tenant assisted-search plans) and/or listing type intent.
// @access Public
const getPublicPlans = async (req, res) => {
  try {
    const { audience, listingType } = req.query;
    const query = { isActive: true };

    if (audience === "seller" || audience === "buyer") {
      query.audience = audience;
    }
    if (listingType === "sale" || listingType === "rental") {
      query.targetListingType = { $in: [listingType, "both"] };
    }

    const plans = await Plan.find(query).sort({ price: 1 });
    res.status(200).json({ plans });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plans", error: error.message });
  }
};

// @route  POST /api/plans/:id/purchase
// @desc   Seller OR buyer/tenant purchases a plan. Since payment is offline
//         (UPI/bank/cash), a screenshot of the payment is REQUIRED at the
//         same time — nothing is saved to the database until proof exists,
//         so admin never sees a purchase they can't verify.
// @body   { screenshotUrl }
// @access Seller or Buyer (must match the plan's audience)
const requestPlanPurchase = async (req, res) => {
  try {
    const requester = req.user;
    const { screenshotUrl } = req.body;

    if (!screenshotUrl) {
      return res.status(400).json({ message: "A payment screenshot is required to complete a purchase" });
    }

    const plan = await Plan.findOne({ _id: req.params.id, isActive: true });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found or no longer available" });
    }

    if (plan.audience !== requester.role) {
      return res.status(403).json({
        message: `This plan is for ${plan.audience}s. Your account role is ${requester.role}.`,
      });
    }

    // Don't allow a second pending request while one is already awaiting activation
    const existingPending = await PlanPurchase.findOne({
      purchasedBy: requester._id,
      status: "pending_activation",
    });
    if (existingPending) {
      return res.status(409).json({
        message: "You already have a plan purchase awaiting activation",
        purchase: existingPending,
      });
    }
    // Also block a new purchase while the requester already has an active plan
    if (requester.planStatus === "active") {
      return res.status(409).json({ message: "You already have an active plan" });
    }

    const purchase = await PlanPurchase.create({
      purchasedBy: requester._id,
      plan: plan._id,
      planSnapshot: {
        name: plan.name,
        audience: plan.audience,
        targetListingType: plan.targetListingType,
        listingLimit: plan.listingLimit,
        qualifiedLeadsLimit: plan.qualifiedLeadsLimit,
        validityDays: plan.validityDays,
        price: plan.price,
        paymentQr: plan.paymentQr,
        upiId: plan.upiId,
      },
      status: "pending_activation",
      paymentScreenshot: { url: screenshotUrl },
    });

    // Reflect the pending request on the account so the dashboard can show
    // "Plan activation pending" immediately.
    requester.activePlan = plan._id;
    requester.planStatus = "pending_activation";
    await requester.save();

    res.status(201).json({
      message: "Payment submitted. An admin will verify and activate your plan shortly.",
      purchase,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to request plan purchase", error: error.message });
  }
};

// @route  GET /api/plans/my-purchases
// @desc   View your own plan purchase history (seller or buyer)
// @access Authenticated (seller or buyer)
const getMyPurchases = async (req, res) => {
  try {
    const purchases = await PlanPurchase.find({ purchasedBy: req.user._id })
      .populate("plan", "name price audience")
      .sort({ createdAt: -1 });

    res.status(200).json({ purchases });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch purchase history", error: error.message });
  }
};

// @route  POST /api/plans/my-purchases/:id/refund-request
// @desc   Request a refund under the money-back guarantee
// @body   { reason }
// @access Authenticated (seller or buyer)
const requestRefund = async (req, res) => {
  try {
    const purchase = await PlanPurchase.findOne({ _id: req.params.id, purchasedBy: req.user._id });
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    if (!["active", "expired"].includes(purchase.status)) {
      return res.status(400).json({ message: "Only active or expired plans are eligible for a refund request" });
    }
    if (purchase.refundStatus !== "none") {
      return res.status(409).json({ message: `A refund request already exists (${purchase.refundStatus})` });
    }

    purchase.refundStatus = "requested";
    purchase.refundReason = req.body.reason || "Requested under money-back guarantee";
    await purchase.save();

    res.status(200).json({ message: "Refund requested. Our team will review it manually.", purchase });
  } catch (error) {
    res.status(500).json({ message: "Failed to request refund", error: error.message });
  }
};

// @route  PUT /api/plans/my-purchases/:id/payment-proof
// @desc   Attach a payment screenshot to a pending purchase, after paying via
//         the shown QR/UPI. Doesn't change status — admin still manually
//         verifies and activates — but gives them proof to check against.
// @body   { screenshotUrl }
// @access Authenticated (seller or buyer), must own the purchase
const submitPaymentProof = async (req, res) => {
  try {
    const { screenshotUrl } = req.body;
    if (!screenshotUrl) return res.status(400).json({ message: "screenshotUrl is required" });

    const purchase = await PlanPurchase.findOne({ _id: req.params.id, purchasedBy: req.user._id });
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    if (purchase.status !== "pending_activation") {
      return res.status(400).json({ message: "Payment proof can only be submitted for a purchase awaiting activation" });
    }

    purchase.paymentScreenshot = { url: screenshotUrl };
    await purchase.save();

    res.status(200).json({ message: "Payment proof submitted. Awaiting verification.", purchase });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit payment proof", error: error.message });
  }
};

// @route  PUT /api/plans/my-purchases/:id/cancel
// @desc   Seller/buyer changes their mind and withdraws their own purchase
//         while it's still awaiting admin activation.
// @access Authenticated (seller or buyer), must own the purchase
const cancelMyPurchase = async (req, res) => {
  try {
    const purchase = await PlanPurchase.findOne({ _id: req.params.id, purchasedBy: req.user._id });
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    if (purchase.status !== "pending_activation") {
      return res.status(400).json({ message: `Cannot cancel a purchase with status "${purchase.status}"` });
    }

    purchase.status = "cancelled";
    await purchase.save();

    const account = req.user;
    if (account.planStatus === "pending_activation" && String(account.activePlan) === String(purchase.plan)) {
      account.planStatus = "none";
      account.activePlan = null;
      await account.save();
    }

    res.status(200).json({ message: "Purchase cancelled", purchase });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel purchase", error: error.message });
  }
};

module.exports = {
  getPublicPlans,
  requestPlanPurchase,
  getMyPurchases,
  requestRefund,
  submitPaymentProof,
  cancelMyPurchase,
};
