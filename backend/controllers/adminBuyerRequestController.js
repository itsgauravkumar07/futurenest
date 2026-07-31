const BuyerRequest = require("../models/BuyerRequest");
const User = require("../models/User");

// @route  GET /api/admin/buyer-requests?status=new
// @access Admin, Super Admin
const getBuyerRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const requests = await BuyerRequest.find(query)
      .populate("buyer", "name email phone leadsRemaining")
      .sort({ createdAt: 1 });

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch buyer requests", error: error.message });
  }
};

// @route  PUT /api/admin/buyer-requests/:id/start
// @desc   Admin marks that they've started actively sourcing matches
// @access Admin, Super Admin
const startBuyerRequest = async (req, res) => {
  try {
    const request = await BuyerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "new") {
      return res.status(400).json({ message: `Cannot start from status "${request.status}"` });
    }

    request.status = "in_progress";
    await request.save();

    res.status(200).json({ message: "Request marked in progress", request });
  } catch (error) {
    res.status(500).json({ message: "Failed to update request", error: error.message });
  }
};

// @route  PUT /api/admin/buyer-requests/:id/match
// @desc   Admin shares curated property matches with the buyer. This is the
//         ONLY step that consumes 1 unit of the buyer's leadsRemaining
//         (assisted-match balance), mirroring how a seller lead only
//         reduces their balance at "qualify".
// @body   { propertyIds: [...], adminNotes }
// @access Admin, Super Admin
const matchBuyerRequest = async (req, res) => {
  try {
    const { propertyIds, adminNotes } = req.body;
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({ message: "propertyIds (non-empty array) is required" });
    }

    const request = await BuyerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status === "matched" || request.status === "closed") {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    const buyer = await User.findById(request.buyer);
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });

    request.status = "matched";
    request.matchedProperties = propertyIds;
    request.matchedAt = new Date();
    if (adminNotes) request.adminNotes = adminNotes;
    await request.save();

    let warning = null;
    if (buyer.leadsRemaining > 0) {
      buyer.leadsRemaining -= 1;
      await buyer.save();
    } else {
      warning = "Buyer had 0 assisted searches remaining on their plan before this match.";
    }

    res.status(200).json({ message: "Matches shared with buyer", request, warning });
  } catch (error) {
    res.status(500).json({ message: "Failed to update request", error: error.message });
  }
};

// @route  PUT /api/admin/buyer-requests/:id/close
// @desc   Close out a request (buyer found something elsewhere, went cold, etc.)
// @access Admin, Super Admin
const closeBuyerRequest = async (req, res) => {
  try {
    const request = await BuyerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "closed";
    if (req.body.adminNotes) request.adminNotes = req.body.adminNotes;
    await request.save();

    res.status(200).json({ message: "Request closed", request });
  } catch (error) {
    res.status(500).json({ message: "Failed to update request", error: error.message });
  }
};

module.exports = { getBuyerRequests, startBuyerRequest, matchBuyerRequest, closeBuyerRequest };
