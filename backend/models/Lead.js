const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- Lead workflow ---
    // new           -> buyer clicked "I'm Interested"
    // contacted     -> admin has reached out to the buyer
    // qualified     -> admin confirmed genuine interest; this is the point
    //                  the seller's leadsRemaining balance gets reduced
    // shared        -> lead details shared offline with the seller
    // disqualified  -> buyer was not genuine / unreachable, does not count against seller balance
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "shared", "disqualified"],
      default: "new",
    },

    adminNotes: {
      type: String,
      default: "",
    },
    qualifiedAt: {
      type: Date,
      default: null,
    },
    sharedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
