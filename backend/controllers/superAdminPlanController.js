const Plan = require("../models/Plan");

// @route  POST /api/superadmin/plans
// @access Super Admin only
const createPlan = async (req, res) => {
  try {
    const { name, audience, targetListingType, listingLimit, qualifiedLeadsLimit, validityDays, price, paymentQr, upiId } =
      req.body;

    if (!name || !qualifiedLeadsLimit || price === undefined) {
      return res.status(400).json({
        message: "name, qualifiedLeadsLimit, and price are required",
      });
    }
    if (audience === "seller" && !listingLimit) {
      return res.status(400).json({ message: "listingLimit is required for seller plans" });
    }

    const plan = await Plan.create({
      name,
      audience: audience || "seller",
      targetListingType: targetListingType || "both",
      listingLimit: listingLimit || 0,
      qualifiedLeadsLimit,
      validityDays: validityDays || null,
      price,
      paymentQr,
      upiId,
    });

    res.status(201).json({ message: "Plan created", plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to create plan", error: error.message });
  }
};

// @route  GET /api/superadmin/plans
// @desc   List ALL plans including inactive/retired ones (admin view)
// @access Super Admin only
const getAllPlansAdmin = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.status(200).json({ plans });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plans", error: error.message });
  }
};

// @route  PUT /api/superadmin/plans/:id
// @desc   Edit a plan's terms. Existing PlanPurchase records keep their
//         original snapshot, so this never retroactively changes what
//         sellers who already bought it are entitled to.
// @access Super Admin only
const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const editableFields = [
      "name",
      "audience",
      "targetListingType",
      "listingLimit",
      "qualifiedLeadsLimit",
      "validityDays",
      "price",
      "paymentQr",
      "upiId",
    ];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) plan[field] = req.body[field];
    });

    await plan.save();
    res.status(200).json({ message: "Plan updated", plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to update plan", error: error.message });
  }
};

// @route  PUT /api/superadmin/plans/:id/toggle-active
// @desc   Retire or reactivate a plan. Retiring hides it from sellers without
//         deleting history (deleting could orphan existing PlanPurchase records).
// @access Super Admin only
const togglePlanActive = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    plan.isActive = !plan.isActive;
    await plan.save();

    res.status(200).json({ message: `Plan ${plan.isActive ? "activated" : "retired"}`, plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to update plan status", error: error.message });
  }
};

module.exports = { createPlan, getAllPlansAdmin, updatePlan, togglePlanActive };
