require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const auth = require("./middleware/authMiddleware");

const app = express();
const server = http.createServer(app);

// Create socket server
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Make socket available in routes
app.set("io", io);

// Connect DB
connectDB();
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
app.use("/api/delivery", require("./routes/deliveryAuthRoutes"));
app.use("/api/delivery", require("./routes/deliveryOrderRoutes"));
app.use(express.static("public"));

app.use("/api/eta", require("./routes/etaRoutes"));

// Socket logic
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinOrderRoom", (orderId) => {
    socket.join(orderId);
    console.log("Joined order room:", orderId);
  });

  socket.on("locationUpdate", ({ orderId, lat, lng }) => {
    io.to(orderId).emit("locationBroadcast", { lat, lng });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});

// Test
app.get("/", (req, res) => {
  res.send("API is Working 🚀");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
