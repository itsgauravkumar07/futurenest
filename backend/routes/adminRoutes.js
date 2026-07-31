const express = require("express");
const {
  getPendingProperties,
  getAllPropertiesForAdmin,
  getPropertyByIdForAdmin,
  approveProperty,
  rejectProperty,
} = require("../controllers/adminPropertyController");
const {
  getLeads,
  markContacted,
  qualifyLead,
  markShared,
  disqualifyLead,
} = require("../controllers/adminLeadController");
const {
  getPlanPurchases,
  activatePlanPurchase,
  cancelPlanPurchase,
  getRefundRequests,
  processRefund,
  getRevenueReport,
} = require("../controllers/adminPlanController");
const {
  getBuyerRequests,
  startBuyerRequest,
  matchBuyerRequest,
  closeBuyerRequest,
} = require("../controllers/adminBuyerRequestController");
const {
  createBlog,
  getAllBlogsAdmin,
  updateBlog,
  deleteBlog,
  publishBlog,
  unpublishBlog,
} = require("../controllers/adminBlogController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// All admin routes require an authenticated admin or superadmin
router.use(protect, requireRole("admin", "superadmin"));

router.get("/properties/pending", getPendingProperties);
router.get("/properties", getAllPropertiesForAdmin);
router.get("/properties/:id", getPropertyByIdForAdmin);
router.put("/properties/:id/approve", approveProperty);
router.put("/properties/:id/reject", rejectProperty);

router.get("/leads", getLeads);
router.put("/leads/:id/contact", markContacted);
router.put("/leads/:id/qualify", qualifyLead);
router.put("/leads/:id/share", markShared);
router.put("/leads/:id/disqualify", disqualifyLead);

router.get("/plan-purchases", getPlanPurchases);
router.get("/plan-purchases/refund-requests", getRefundRequests);
router.get("/plan-purchases/revenue", requireRole("superadmin"), getRevenueReport);
router.put("/plan-purchases/:id/activate", activatePlanPurchase);
router.put("/plan-purchases/:id/cancel", cancelPlanPurchase);
router.put("/plan-purchases/:id/refund", processRefund);

router.get("/buyer-requests", getBuyerRequests);
router.put("/buyer-requests/:id/start", startBuyerRequest);
router.put("/buyer-requests/:id/match", matchBuyerRequest);
router.put("/buyer-requests/:id/close", closeBuyerRequest);

router.post("/blogs", createBlog);
router.get("/blogs", getAllBlogsAdmin);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);
router.put("/blogs/:id/publish", publishBlog);
router.put("/blogs/:id/unpublish", unpublishBlog);

module.exports = router;
