// One-time script to create the very first Super Admin account, so you
// never have to hand-edit a user's role in Atlas again.
//
// Usage:
//   node scripts/seedSuperAdmin.js
//
// Reads SEED_SUPERADMIN_* values from .env (see .env.example). If a user
// with that email already exists, it just promotes them to superadmin
// instead of failing.

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
  const email = process.env.SEED_SUPERADMIN_EMAIL;
  const password = process.env.SEED_SUPERADMIN_PASSWORD;
  const name = process.env.SEED_SUPERADMIN_NAME || "Super Admin";

  if (!email || !password) {
    console.error(
      "Missing SEED_SUPERADMIN_EMAIL / SEED_SUPERADMIN_PASSWORD in your .env file."
    );
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    user.role = "superadmin";
    user.isActive = true;
    await user.save();
    console.log(`Existing user ${email} promoted to superadmin.`);
  } else {
    user = await User.create({
      name,
      email,
      password,
      role: "superadmin",
    });
    console.log(`Super Admin account created: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
