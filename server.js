require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const auth = require("./middleware/authMiddleware");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/address", require("./routes/addressRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// Delivery App
app.use("/api/delivery", require("./routes/deliveryAuthRoutes"));
app.use("/api/delivery", require("./routes/deliveryOrderRoutes"));

// Protected Test Route
app.get("/protected", auth, (req, res) => {
  res.json({ msg: "Protected Route Access Granted", user: req.user });
});

// Default Route
app.get("/", (req, res) => {
  res.send("API is Working 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
