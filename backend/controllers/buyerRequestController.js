const BuyerRequest = require("../models/BuyerRequest");

// @route  POST /api/buyer-requests
// @desc   Buyer/tenant submits their requirements for the assisted-search
//         service. Requires an active buyer plan with matches remaining —
//         same gating pattern as seller property creation.
// @access Buyer only
const createBuyerRequest = async (req, res) => {
  try {
    const buyer = req.user;

    if (buyer.planStatus !== "active") {
      return res.status(403).json({
        message: "You need an active assisted-search plan to submit a request. Please purchase a plan first.",
      });
    }
    if (buyer.leadsRemaining <= 0) {
      return res.status(403).json({
        message: "You've used all the assisted searches included in your current plan.",
      });
    }
    if (buyer.planExpiryDate && new Date() > new Date(buyer.planExpiryDate)) {
      return res.status(403).json({ message: "Your plan has expired. Please renew to continue." });
    }

    const { listingType, propertyType, preferredCity, budgetMin, budgetMax, notes } = req.body;

    if (!listingType || !preferredCity) {
      return res.status(400).json({ message: "listingType and preferredCity are required" });
    }

    const request = await BuyerRequest.create({
      buyer: buyer._id,
      listingType,
      propertyType,
      preferredCity,
      budgetMin,
      budgetMax,
      notes,
      status: "new",
    });

    res.status(201).json({ message: "Request submitted. Our team will start sourcing matches for you.", request });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit request", error: error.message });
  }
};

// @route  GET /api/buyer-requests/mine
// @access Buyer only
const getMyBuyerRequests = async (req, res) => {
  try {
    const requests = await BuyerRequest.find({ buyer: req.user._id })
      .populate("matchedProperties", "title price priceUnit listingType propertyType location images specs")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your requests", error: error.message });
  }
};

module.exports = { createBuyerRequest, getMyBuyerRequests };
