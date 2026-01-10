const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Order = require("../models/Order");

// Only Delivery
const deliveryOnly = (req, res, next) => {
  if (req.user.role !== "delivery")
    return res.status(403).json({ msg: "Not Authorized" });
  next();
};

// Get Assigned Orders
router.get("/orders", auth, deliveryOnly, async (req, res) => {
  const orders = await Order.find({
    assignedDeliveryBoy: req.user.id,
    orderStatus: { $ne: "delivered" }
  })
  .populate("items.product")
  .populate("address");

  res.json(orders);
});

// Mark Picked
router.put("/picked/:id", auth, deliveryOnly, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ msg: "Order Not Found" });

  order.orderStatus = "picked";
  await order.save();

  res.json({ msg: "Order Picked", order });
});

// Mark On The Way
router.put("/onway/:id", auth, deliveryOnly, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ msg: "Order Not Found" });

  order.orderStatus = "on-the-way";
  await order.save();

  res.json({ msg: "Order Out For Delivery", order });
});

// Mark Delivered
router.put("/delivered/:id", auth, deliveryOnly, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ msg: "Order Not Found" });

  order.orderStatus = "delivered";
  order.paymentStatus = "paid";
  await order.save();

  res.json({ msg: "Delivered Successfully", order });
});

// Update Live Location
router.put("/location/:id", auth, deliveryOnly, async (req, res) => {
  const { lat, lng } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ msg: "Order Not Found" });

  order.trackingLocation = { lat, lng, updatedAt: new Date() };
  await order.save();

  // Emit live location
  const io = req.app.get("io");
  io.to(req.params.id).emit("locationBroadcast", { lat, lng });

  res.json({ msg: "Location Updated" });
});



module.exports = router;
