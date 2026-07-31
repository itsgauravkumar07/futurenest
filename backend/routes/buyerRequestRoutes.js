const express = require("express");
const { createBuyerRequest, getMyBuyerRequests } = require("../controllers/buyerRequestController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, requireRole("buyer"), createBuyerRequest);
router.get("/mine", protect, requireRole("buyer"), getMyBuyerRequests);

module.exports = router;
