const Lead = require("../models/Lead");
const Property = require("../models/Property");

// @route  POST /api/leads
// @desc   Buyer clicks "I'm Interested" on a property -> creates a lead
// @body   { propertyId }
// @access Buyer only
const createLead = async (req, res) => {
  try {
    const buyer = req.user;
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: "propertyId is required" });
    }

    // Only allow interest on properties that are actually live on the public site
    const property = await Property.findOne({
      _id: propertyId,
      status: "approved",
      isPublished: true,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found or not currently available" });
    }

    // Prevent spamming the same property with duplicate leads.
    // A buyer can raise interest again only if their previous lead was disqualified.
    const existingLead = await Lead.findOne({
      property: property._id,
      buyer: buyer._id,
      status: { $ne: "disqualified" },
    });

    if (existingLead) {
      return res.status(409).json({
        message: "You've already expressed interest in this property. Our team will be in touch.",
        lead: existingLead,
      });
    }

    const lead = await Lead.create({
      property: property._id,
      seller: property.seller,
      buyer: buyer._id,
      status: "new",
    });

    res.status(201).json({ message: "Interest submitted. Our team will contact you shortly.", lead });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit interest", error: error.message });
  }
};

// @route  GET /api/leads/mine
// @desc   Buyer views the leads they've raised, with property info
// @access Buyer only
const getMyLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ buyer: req.user._id })
      .populate("property", "title price listingType propertyType location images")
      .sort({ createdAt: -1 });

    res.status(200).json({ leads });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your leads", error: error.message });
  }
};

// @route  PUT /api/leads/:id/cancel
// @desc   Buyer withdraws their own interest, only while it's still "new"
//         (once admin has started working it — contacted/qualified/shared —
//         it can no longer be self-cancelled, only disqualified by admin).
// @access Buyer only, must own the lead
const cancelLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (lead.status !== "new") {
      return res.status(400).json({ message: `Cannot cancel interest once it's been ${lead.status}` });
    }

    lead.status = "disqualified";
    lead.adminNotes = "Cancelled by buyer";
    await lead.save();

    res.status(200).json({ message: "Interest cancelled", lead });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel interest", error: error.message });
  }
};

// @route  GET /api/leads/mine/seller?status=shared
// @desc   Seller views leads raised on their properties. Buyer contact info
//         (name/email/phone) is only populated for "shared" leads — that's
//         the actual moment of delivery in the business model; leads not
//         yet shared keep the buyer's identity hidden, same as everywhere else.
// @access Seller only
const getMySellerLeads = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { seller: req.user._id };
    if (status) query.status = status;

    const leads = await Lead.find(query)
      .populate("property", "title price listingType propertyType location images")
      .populate("buyer", status === "shared" || !status ? "name email phone" : "name")
      .sort({ createdAt: -1 });

    // Strip buyer contact details for anything that isn't shared, in case a
    // mixed-status query (no status filter) was used.
    const sanitized = leads.map((lead) => {
      if (lead.status !== "shared" && lead.buyer && typeof lead.buyer === "object") {
        lead.buyer = { _id: lead.buyer._id, name: lead.buyer.name };
      }
      return lead;
    });

    res.status(200).json({ leads: sanitized });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads", error: error.message });
  }
};

module.exports = { createLead, getMyLeads, cancelLead, getMySellerLeads };
