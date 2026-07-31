const Property = require("../models/Property");
const User = require("../models/User");
const Plan = require("../models/Plan");

// ============ SELLER ENDPOINTS ============

// @route  POST /api/properties
// @desc   Seller creates a new property (goes in as "pending")
// @access Seller only
const createProperty = async (req, res) => {
  try {
    const seller = req.user;

    const {
      title,
      description,
      listingType,
      propertyType,
      price,
      priceUnit,
      location,
      specs,
      images,
    } = req.body;

    if (!title || !description || !listingType || !propertyType || !price || !location) {
      return res.status(400).json({ message: "Missing required property fields" });
    }

    // Enforce plan gating: seller must have an active plan with listing room left
    if (seller.planStatus !== "active") {
      return res.status(403).json({
        message: "You need an active plan to list a property. Please purchase or activate a plan first.",
      });
    }
    if (seller.listingsRemaining <= 0) {
      return res.status(403).json({
        message: "You've used all the listings included in your current plan. Upgrade your plan to add more.",
      });
    }
    if (seller.planExpiryDate && new Date() > new Date(seller.planExpiryDate)) {
      return res.status(403).json({ message: "Your plan has expired. Please renew to continue listing." });
    }

    // A plan tagged "sale" or "rental" only covers that listing intent.
    // A plan tagged "both" (e.g. an agent plan) covers either.
    if (seller.activePlan) {
      const plan = await Plan.findById(seller.activePlan);
      if (plan && plan.targetListingType !== "both" && plan.targetListingType !== listingType) {
        return res.status(403).json({
          message: `Your current plan only covers ${plan.targetListingType} listings. Purchase a ${listingType} plan to list this property.`,
        });
      }
    }

    const property = await Property.create({
      seller: seller._id,
      title,
      description,
      listingType,
      propertyType,
      price,
      priceUnit: priceUnit || (listingType === "rental" ? "per_month" : "total"),
      location,
      specs,
      images,
      status: "pending",
      isPublished: false,
    });

    // Consume one unit of the seller's listing allowance
    seller.listingsRemaining -= 1;
    await seller.save();

    res.status(201).json({ message: "Property submitted for review", property });
  } catch (error) {
    res.status(500).json({ message: "Failed to create property", error: error.message });
  }
};

// @route  GET /api/properties/mine
// @desc   Seller views all of their own properties (any status)
// @access Seller only
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ properties });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your properties", error: error.message });
  }
};

// @route  PUT /api/properties/:id
// @desc   Seller edits their own property. Any edit sends it back to "pending".
// @access Seller only (must own the property)
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own properties" });
    }

    const editableFields = [
      "title",
      "description",
      "listingType",
      "propertyType",
      "price",
      "priceUnit",
      "location",
      "specs",
      "images",
    ];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) property[field] = req.body[field];
    });

    // If listingType is being changed and priceUnit wasn't explicitly given,
    // switch it to match — prevents a rental showing a "total" price, or vice versa.
    if (req.body.listingType !== undefined && req.body.priceUnit === undefined) {
      property.priceUnit = req.body.listingType === "rental" ? "per_month" : "total";
    }

    // Any edit to an existing listing must go back through admin review
    property.markPendingReview();

    await property.save();
    res.status(200).json({ message: "Property updated and sent for re-review", property });
  } catch (error) {
    res.status(500).json({ message: "Failed to update property", error: error.message });
  }
};

// @route  DELETE /api/properties/:id
// @access Seller only (must own the property)
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own properties" });
    }

    await property.deleteOne();
    res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete property", error: error.message });
  }
};

// ============ PUBLIC ENDPOINTS ============

// @route  GET /api/properties
// @desc   Public browsing with search/filters. Only ever returns approved + published properties.
// @access Public
const getPublicProperties = async (req, res) => {
  try {
    const { listingType, propertyType, city, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;

    const query = { status: "approved", isPublished: true };

    if (listingType) query.listingType = listingType;
    if (propertyType) query.propertyType = propertyType;
    if (city) query["location.city"] = new RegExp(city, "i");
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      properties,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties", error: error.message });
  }
};

// @route  GET /api/properties/:id
// @desc   Public single property view. Seller contact info is intentionally never included.
// @access Public
const getPublicPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      status: "approved",
      isPublished: true,
    });

    if (!property) return res.status(404).json({ message: "Property not found" });

    res.status(200).json({ property });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch property", error: error.message });
  }
};

module.exports = {
  createProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getPublicProperties,
  getPublicPropertyById,
};
