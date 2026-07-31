const Lead = require("../models/Lead");
const User = require("../models/User");

// @route  GET /api/admin/leads?status=new
// @desc   List leads, optionally filtered by status
// @access Admin, Super Admin
const getLeads = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const leads = await Lead.find(query)
      .populate("property", "title listingType propertyType price location")
      .populate("buyer", "name email phone")
      .populate("seller", "name email phone leadsRemaining")
      .sort({ createdAt: 1 }); // oldest first, so nothing sits waiting too long

    res.status(200).json({ leads });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads", error: error.message });
  }
};

// @route  PUT /api/admin/leads/:id/contact
// @desc   Admin marks that they've reached out to the buyer
// @access Admin, Super Admin
const markContacted = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (lead.status !== "new") {
      return res.status(400).json({ message: `Cannot mark as contacted from status "${lead.status}"` });
    }

    lead.status = "contacted";
    if (req.body.adminNotes) lead.adminNotes = req.body.adminNotes;
    await lead.save();

    res.status(200).json({ message: "Lead marked as contacted", lead });
  } catch (error) {
    res.status(500).json({ message: "Failed to update lead", error: error.message });
  }
};

// @route  PUT /api/admin/leads/:id/qualify
// @desc   Admin confirms genuine buyer interest. This is the ONLY step that
//         reduces the seller's leadsRemaining balance, per the business model
//         ("only qualified leads reduce the seller's package").
// @access Admin, Super Admin
const qualifyLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (lead.status === "qualified" || lead.status === "shared") {
      return res.status(400).json({ message: "Lead has already been qualified" });
    }
    if (lead.status === "disqualified") {
      return res.status(400).json({ message: "Cannot qualify a lead that was already disqualified" });
    }

    const seller = await User.findById(lead.seller);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    lead.status = "qualified";
    lead.qualifiedAt = new Date();
    if (req.body.adminNotes) lead.adminNotes = req.body.adminNotes;
    await lead.save();

    // Decrement the seller's balance, floored at 0. If they're already at 0,
    // this qualified lead still counts toward the money-back-guarantee delivery
    // count, but flags that the seller is over their plan and should be
    // encouraged to upgrade (surfaced via the warning message below).
    let warning = null;
    if (seller.leadsRemaining > 0) {
      seller.leadsRemaining -= 1;
      await seller.save();
    } else {
      warning = "Seller had 0 leads remaining on their plan before this qualification.";
    }

    res.status(200).json({ message: "Lead qualified", lead, warning });
  } catch (error) {
    res.status(500).json({ message: "Failed to qualify lead", error: error.message });
  }
};

// @route  PUT /api/admin/leads/:id/share
// @desc   Admin marks that the lead's details have been shared offline with the seller
// @access Admin, Super Admin
const markShared = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (lead.status !== "qualified") {
      return res.status(400).json({ message: "Only qualified leads can be marked as shared" });
    }

    lead.status = "shared";
    lead.sharedAt = new Date();
    await lead.save();

    res.status(200).json({ message: "Lead marked as shared with seller", lead });
  } catch (error) {
    res.status(500).json({ message: "Failed to update lead", error: error.message });
  }
};

// @route  PUT /api/admin/leads/:id/disqualify
// @desc   Buyer was unreachable / not genuine. Does NOT affect seller's lead balance.
// @body   { reason }
// @access Admin, Super Admin
const disqualifyLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (lead.status === "shared") {
      return res.status(400).json({ message: "Cannot disqualify a lead that has already been shared" });
    }

    lead.status = "disqualified";
    lead.adminNotes = req.body.reason || lead.adminNotes || "Buyer unreachable or not genuine";
    await lead.save();

    res.status(200).json({ message: "Lead disqualified", lead });
  } catch (error) {
    res.status(500).json({ message: "Failed to update lead", error: error.message });
  }
};

module.exports = { getLeads, markContacted, qualifyLead, markShared, disqualifyLead };
