const mongoose = require("mongoose");

const planPurchaseSchema = new mongoose.Schema(
  {
    // Renamed from "seller" — either a seller (listing plan) or a
    // buyer/tenant (assisted-search plan) can purchase a plan now.
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    // Snapshot the plan's terms at the time of purchase, so editing/retiring
    // a Plan later never changes what a seller already bought.
    planSnapshot: {
      name: String,
      audience: String,
      targetListingType: String,
      listingLimit: Number,
      qualifiedLeadsLimit: Number,
      validityDays: Number,
      price: Number,
      paymentQr: { url: String, publicId: String },
      upiId: String,
    },

    // Screenshot the buyer/seller uploads after paying via the shown QR/UPI.
    // Purely evidence for the admin to check before activating — doesn't
    // change status on its own.
    paymentScreenshot: {
      url: String,
    },

    // pending_activation -> seller requested it, admin hasn't confirmed payment yet
    // active              -> admin activated it, currently the seller's live plan
    // expired             -> validity period ran out
    // refunded            -> money-back guarantee refund was processed
    // cancelled           -> seller requested it but never paid / admin declined
    status: {
      type: String,
      enum: ["pending_activation", "active", "expired", "refunded", "cancelled"],
      default: "pending_activation",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    activatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },

    // --- Refund (money-back guarantee) ---
    refundStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected"],
      default: "none",
    },
    refundReason: {
      type: String,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlanPurchase", planPurchaseSchema);
