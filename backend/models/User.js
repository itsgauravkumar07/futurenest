const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "seller", "buyer"],
      required: true,
      default: "buyer",
    },

    // --- Plan tracking fields (seller listing plans AND buyer assisted-search plans) ---
    // A seller's dashboard capabilities are gated by their active plan,
    // not by a separate role — same now applies to buyers/tenants who've
    // purchased the paid assisted-search service. These fields are only
    // meaningful when role is "seller" or "buyer".
    // For a seller: listingsRemaining = properties they can still list,
    //   leadsRemaining = qualified leads their plan still owes them.
    // For a buyer: listingsRemaining is unused (stays 0), leadsRemaining =
    //   assisted property matches our team still owes them.
    activePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    planStatus: {
      type: String,
      enum: ["none", "pending_activation", "active", "expired"],
      default: "none",
    },
    listingsRemaining: {
      type: Number,
      default: 0,
    },
    leadsRemaining: {
      type: Number,
      default: 0,
    },
    planStartDate: {
      type: Date,
      default: null,
    },
    planExpiryDate: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never send password back in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
