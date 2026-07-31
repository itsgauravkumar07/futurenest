const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    listingType: {
      type: String,
      enum: ["sale", "rental"],
      required: true,
    },
    propertyType: {
      type: String,
      // Apartment, Villa, Plot, House, Commercial Property, Flat, PG, Office, Shop, Commercial Space
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // For rentals, price is typically monthly rent; sale price is the total sale price.
    priceUnit: {
      type: String,
      enum: ["total", "per_month"],
      default: "total",
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String },
    },
    specs: {
      bedrooms: Number,
      bathrooms: Number,
      areaSqft: Number,
    },
    images: [
      {
        url: String,
        publicId: String, // Cloudinary public_id, useful for deletion later
      },
    ],

    // --- Approval workflow ---
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    // Whether the property is currently visible on the public site.
    // Kept separate from `status` so an edit to an approved property
    // can go back to pending review without instantly unpublishing it,
    // if that's the workflow you want later. For V1 we unpublish immediately on edit.
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Whenever a seller edits their property, send it back for re-review.
// Call this from the controller instead of relying on a middleware hook,
// so the admin-approval controller can set status without re-triggering this.
propertySchema.methods.markPendingReview = function () {
  this.status = "pending";
  this.isPublished = false;
  this.rejectionReason = null;
};

module.exports = mongoose.model("Property", propertySchema);
