const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// ================================
// CREATE RAZORPAY ORDER
// ================================
router.post("/create/:orderId", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ msg: "Order not found" });

    // Already paid?
    if (order.paymentStatus === "paid") {
      return res.json({ msg: "Order already paid", order });
    }

    const options = {
      amount: order.totalAmount * 100, // INR → paise
      currency: "INR",
      receipt: order._id.toString()
    };

    const razorpayOrder = await razorpay.orders.create(options);

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY
    });

  } catch (err) {
    console.error("Create Payment Error:", err);
    res.status(500).json({ msg: "Payment order creation failed" });
  }
});


// ================================
// VERIFY PAYMENT
// ================================
router.post("/verify", auth, async (req, res) => {
  try {
    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    // -----------------------------
    // 🔥 DEV MODE (Postman / Fake Payments)
    // -----------------------------
    if (process.env.NODE_ENV !== "production") {
      console.log("DEV MODE: Skipping Razorpay signature verification");

      order.paymentStatus = "paid";
      order.razorpayPaymentId = razorpay_payment_id || "dev_payment";
      order.razorpayOrderId = razorpay_order_id || order.razorpayOrderId;
      order.razorpaySignature = razorpay_signature || "dev_signature";

      await order.save();

      return res.json({ msg: "Payment Successful (DEV MODE)", order });
    }

    // -----------------------------
    // PRODUCTION MODE — REAL RAZORPAY CHECK
    // -----------------------------
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Invalid payment signature" });
    }

    // Mark order as paid
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpayOrderId = razorpay_order_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();

    res.json({ msg: "Payment Successful", order });

  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ msg: "Payment verification failed" });
  }
});

module.exports = router;
