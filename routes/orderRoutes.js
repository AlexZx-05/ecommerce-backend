const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Create Order
router.post("/create", auth, async (req, res) => {
  try {
    const { addressId } = req.body;

    // 1️⃣ Get Cart
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ msg: "Cart is empty" });

    // 2️⃣ Calculate Total
    let total = 0;
    let orderItems = [];

    cart.items.forEach(item => {
      total += item.product.price * item.quantity;

      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      });
    });

    // 3️⃣ Reduce Stock
    for (let item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product.stock < item.quantity)
        return res.status(400).json({ msg: `${product.name} out of stock` });

      product.stock -= item.quantity;
      await product.save();
    }

    // 4️⃣ Create Order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      address: addressId,
      totalAmount: total
    });

    await order.save();

    // 5️⃣ Clear Cart
    cart.items = [];
    await cart.save();

    res.json({ msg: "Order Placed", order });

  } catch (err) {
    res.status(500).json({ msg: "Server Error", err });
  }
});


// Get My Orders
router.get("/my", auth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate("items.product")
    .populate("address")
    .sort({ createdAt: -1 });

  res.json(orders);
});


// Order Details
router.get("/:id", auth, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product")
    .populate("address");

  res.json(order);
});
// ================================
// UPDATE ORDER ADDRESS (for ETA & Maps)
// ================================

router.put("/update-address/:id", auth, async (req, res) => {
  try {
    const { addressId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    order.address = addressId;
    await order.save();

    res.json({ msg: "Order address updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to update address" });
  }
});
module.exports = router;
