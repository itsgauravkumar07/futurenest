const express = require("express");
const {
  createProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getPublicProperties,
  getPublicPropertyById,
} = require("../controllers/propertyController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// --- Public routes (must come before "/:id" seller routes conflict-wise; these are distinct anyway) ---
router.get("/", getPublicProperties);
router.get("/:id", getPublicPropertyById);

// --- Seller routes ---
router.post("/", protect, requireRole("seller"), createProperty);
router.get("/mine/all", protect, requireRole("seller"), getMyProperties);
router.put("/:id", protect, requireRole("seller"), updateProperty);
router.delete("/:id", protect, requireRole("seller"), deleteProperty);

module.exports = router;
