const express = require("express");
const {
  getPublicPlans,
  requestPlanPurchase,
  getMyPurchases,
  requestRefund,
  submitPaymentProof,
  cancelMyPurchase,
} = require("../controllers/planController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// --- Public ---
router.get("/", getPublicPlans);

// --- Seller or Buyer (role checked against the specific plan's audience inside the controller) ---
router.post("/:id/purchase", protect, requireRole("seller", "buyer"), requestPlanPurchase);
router.get("/my-purchases", protect, requireRole("seller", "buyer"), getMyPurchases);
router.post("/my-purchases/:id/refund-request", protect, requireRole("seller", "buyer"), requestRefund);
router.put("/my-purchases/:id/payment-proof", protect, requireRole("seller", "buyer"), submitPaymentProof);
router.put("/my-purchases/:id/cancel", protect, requireRole("seller", "buyer"), cancelMyPurchase);

module.exports = router;
