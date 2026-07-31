const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Who this plan is sold to. "seller" plans grant listing/lead allowances
    // (existing behavior). "buyer" plans are the paid assisted-search /
    // house-hunting service for buyers and tenants — same purchase/payment/
    // activation flow, different thing it grants.
    audience: {
      type: String,
      enum: ["seller", "buyer"],
      required: true,
      default: "seller",
    },
    // Which kind of listings this plan is meant for. For a seller plan:
    // sale-only, rental-only, or both. For a buyer plan: are they being
    // helped to buy (sale) or find a rental (tenant house-hunting).
    targetListingType: {
      type: String,
      enum: ["sale", "rental", "both"],
      required: true,
      default: "both",
    },
    // Seller plans: max properties they can list. Buyer plans: not used, defaults to 0.
    listingLimit: {
      type: Number,
      default: 0,
    },
    // Seller plans: qualified buyer/tenant leads this plan delivers to them.
    // Buyer plans: qualified property matches our team will actively source
    // and share with this buyer/tenant. Same field, mirrored meaning.
    qualifiedLeadsLimit: {
      type: Number,
      required: true,
    },
    validityDays: {
      type: Number,
      default: null, // null/omitted = plan never expires
    },
    price: {
      type: Number,
      required: true,
    },
    // Optional payment QR code + UPI ID shown to the buyer/seller at purchase
    // time, since payment is offline-only (UPI/bank/cash) — set once per
    // plan by Super Admin, reused for every purchase of that plan.
    paymentQr: {
      url: String,
      publicId: String,
    },
    upiId: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Super Admin can retire old plans without deleting them
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
