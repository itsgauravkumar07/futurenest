const express = require("express");
const { createLead, getMyLeads, cancelLead, getMySellerLeads } = require("../controllers/leadController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, requireRole("buyer"), createLead);
router.get("/mine", protect, requireRole("buyer"), getMyLeads);
router.put("/:id/cancel", protect, requireRole("buyer"), cancelLead);
router.get("/mine/seller", protect, requireRole("seller"), getMySellerLeads);

module.exports = router;
