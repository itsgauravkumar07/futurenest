const express = require("express");
const {
  createPlan,
  getAllPlansAdmin,
  updatePlan,
  togglePlanActive,
} = require("../controllers/superAdminPlanController");
const {
  getAllUsers,
  setUserActiveStatus,
  createAdmin,
  getAllAdmins,
} = require("../controllers/superAdminUserController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// All routes here are Super Admin only
router.use(protect, requireRole("superadmin"));

router.post("/plans", createPlan);
router.get("/plans", getAllPlansAdmin);
router.put("/plans/:id", updatePlan);
router.put("/plans/:id/toggle-active", togglePlanActive);

router.get("/users", getAllUsers);
router.put("/users/:id/status", setUserActiveStatus);

router.post("/admins", createAdmin);
router.get("/admins", getAllAdmins);

module.exports = router;
