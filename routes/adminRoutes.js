const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const Order = require("../models/Order");
const Product = require("../models/Product");

// 🔥 Get ALL Orders
router.get("/orders", auth, admin, async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product")
    .populate("address");

  res.json(orders);
});

// 🔥 Update Order Status
router.put("/order/status/:id", auth, admin, async (req, res) => {
  const { status } = req.body;
  const valid = ["placed","packed","shipped","delivered","cancelled"];

  if(!valid.includes(status)) 
    return res.status(400).json({msg:"Invalid Status"});

  const order = await Order.findById(req.params.id);
  if(!order) return res.status(404).json({msg:"Order Not Found"});

  order.orderStatus = status;
  await order.save();

  res.json({msg:"Status Updated", order});
});

// 🔥 Cancel Order + Restore Stock
router.put("/order/cancel/:id", auth, admin, async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");

  if(!order) return res.status(404).json({msg:"Order Not Found"});
  if(order.orderStatus === "cancelled")
    return res.json({msg:"Already Cancelled"});

  order.items.forEach(item => {
    item.product.stock += item.quantity;
    item.product.save();
  });

  order.orderStatus = "cancelled";
  await order.save();

  res.json({msg:"Order Cancelled & Stock Restored"});
});

module.exports = router;
