const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const Order = require("../models/Order");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

// ==============================
// GET ALL ORDERS
// ==============================
router.get("/orders", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .populate("address");

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch orders" });
  }
});

// ==============================
// UPDATE ORDER STATUS
// ==============================
router.put("/order/status/:id", auth, admin, async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["placed","packed","shipped","picked","on-the-way","delivered"];

    if (!allowed.includes(status))
      return res.status(400).json({ msg: "Invalid status" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    order.orderStatus = status;
    await order.save();

    res.json({ msg: "Order status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Status update failed" });
  }
});

// ==============================
// ASSIGN DELIVERY BOY
// ==============================
router.put("/order/assign/:id", auth, admin, async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    order.assignedDeliveryBoy = deliveryBoyId;
    await order.save();

    res.json({ msg: "Delivery boy assigned", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Assignment failed" });
  }
});

// ==============================
// CANCEL ORDER + REFUND + RESTORE STOCK
// ==============================
router.put("/order/cancel/:id", auth, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) return res.status(404).json({ msg: "Order not found" });
    if (order.orderStatus === "cancelled")
      return res.json({ msg: "Order already cancelled", order });

    // Restore stock
    for (let item of order.items) {
      item.product.stock += item.quantity;
      await item.product.save();
    }

    // Refund logic
    if (order.paymentStatus === "paid") {
      if (process.env.NODE_ENV !== "production") {
        console.log("DEV MODE: refund simulated");
        order.paymentStatus = "refunded";
      } else {
        await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: order.totalAmount * 100
        });
        order.paymentStatus = "refunded";
      }
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.json({ msg: "Order cancelled and refunded", order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Cancellation failed" });
  }
});

module.exports = router;
