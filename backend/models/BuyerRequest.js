const mongoose = require("mongoose");

const buyerRequestSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // What they're looking for
    listingType: {
      type: String,
      enum: ["sale", "rental"],
      required: true,
    },
    propertyType: {
      type: String,
      trim: true,
    },
    preferredCity: {
      type: String,
      required: true,
      trim: true,
    },
    budgetMin: Number,
    budgetMax: Number,
    notes: {
      type: String,
      default: "",
    },

    // new             -> buyer submitted, awaiting admin pickup
    // in_progress      -> admin/team actively sourcing matches
    // matched          -> admin has shared curated matches; consumes 1 unit
    //                     of the buyer's leadsRemaining (assisted-match balance)
    // closed           -> buyer found something or service period ended
    status: {
      type: String,
      enum: ["new", "in_progress", "matched", "closed"],
      default: "new",
    },

    // Properties the admin has actively shortlisted for this buyer
    matchedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    adminNotes: {
      type: String,
      default: "",
    },
    matchedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BuyerRequest", buyerRequestSchema);
