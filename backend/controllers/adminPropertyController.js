const Property = require("../models/Property");

// @route  GET /api/admin/properties/pending
// @desc   List all properties awaiting admin review
// @access Admin, Super Admin
const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: "pending" })
      .populate("seller", "name email phone role")
      .sort({ createdAt: 1 }); // oldest first, so nothing sits waiting too long

    res.status(200).json({ properties });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending properties", error: error.message });
  }
};

// @route  GET /api/admin/properties
// @desc   List all properties regardless of status (for the admin dashboard overview)
// @access Admin, Super Admin
const getAllPropertiesForAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const properties = await Property.find(query)
      .populate("seller", "name email phone role")
      .sort({ createdAt: -1 });

    res.status(200).json({ properties });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
};

// @route  PUT /api/admin/properties/:id/approve
// @access Admin, Super Admin
const approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    property.status = "approved";
    property.isPublished = true;
    property.rejectionReason = null;
    await property.save();

    res.status(200).json({ message: "Property approved and published", property });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve property", error: error.message });
  }
};

// @route  PUT /api/admin/properties/:id/reject
// @body   { reason: string }
// @access Admin, Super Admin
const rejectProperty = async (req, res) => {
  try {
    const { reason } = req.body;
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    property.status = "rejected";
    property.isPublished = false;
    property.rejectionReason = reason || "Did not meet listing requirements";
    await property.save();

    res.status(200).json({ message: "Property rejected", property });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject property", error: error.message });
  }
};

// @route  GET /api/admin/properties/:id
// @desc   Full detail view of a single property, any status — used when an
//         admin clicks into a listing to review all photos/details before
//         approving or rejecting.
// @access Admin, Super Admin
const getPropertyByIdForAdmin = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("seller", "name email phone role");
    if (!property) return res.status(404).json({ message: "Property not found" });

    res.status(200).json({ property });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch property", error: error.message });
  }
};

module.exports = {
  getPendingProperties,
  getAllPropertiesForAdmin,
  getPropertyByIdForAdmin,
  approveProperty,
  rejectProperty,
};
