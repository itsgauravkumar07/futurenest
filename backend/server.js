require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const leadRoutes = require("./routes/leadRoutes");
const planRoutes = require("./routes/planRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const buyerRequestRoutes = require("./routes/buyerRequestRoutes");
const blogRoutes = require("./routes/blogRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "FutureNest API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/buyer-requests", buyerRequestRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/upload", uploadRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Give multer's file-size error a clear, specific message instead of a generic 500
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Image is too large — max size is 2MB" });
  }

  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`FutureNest API running on port ${PORT}`);
  });
});
