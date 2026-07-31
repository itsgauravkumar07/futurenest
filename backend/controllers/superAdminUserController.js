const User = require("../models/User");

// @route  GET /api/superadmin/users?role=buyer&search=john
// @desc   List all users, optionally filtered by role or name/email search
// @access Super Admin only
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    // Super Admin accounts are managed on the dedicated Admins page, not
    // mixed into this general user list.
    const query = { role: { $ne: "superadmin" } };

    if (role && role !== "superadmin") query.role = role;
    if (search) {
      query.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// @route  PUT /api/superadmin/users/:id/status
// @desc   Activate or deactivate any user account (buyer, seller, or admin)
// @body   { isActive: boolean }
// @access Super Admin only
const setUserActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive (boolean) is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // A super admin should never be able to lock themselves out via this endpoint
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own active status" });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({ message: `User ${isActive ? "activated" : "deactivated"}`, user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};

// @route  POST /api/superadmin/admins
// @desc   Create a new Admin account. Admins can't self-register through the
//         public /auth/register endpoint — only a Super Admin can create one.
// @access Super Admin only
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: "admin",
    });

    res.status(201).json({ message: "Admin account created", admin });
  } catch (error) {
    res.status(500).json({ message: "Failed to create admin account", error: error.message });
  }
};

// @route  GET /api/superadmin/admins
// @desc   List all admin and superadmin accounts
// @access Super Admin only
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } }).sort({ createdAt: -1 });
    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admins", error: error.message });
  }
};

module.exports = { getAllUsers, setUserActiveStatus, createAdmin, getAllAdmins };
