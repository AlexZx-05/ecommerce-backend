const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get User Cart
router.get("/", auth, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  if (!cart) cart = { items: [] };
  res.json(cart);
});


// Add to Cart
router.post("/add", auth, async (req, res) => {
  const { productId } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = new Cart({
      user: req.user.id,
      items: [{ product: productId, quantity: 1 }]
    });
  } else {
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }
  }

  await cart.save();
  res.json({ msg: "Item Added to Cart", cart });
});


// Update Quantity
router.put("/update", auth, async (req, res) => {
  const { productId, quantity } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) return res.status(400).json({ msg: "Cart not found" });

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) return res.status(404).json({ msg: "Item not found" });

  cart.items[itemIndex].quantity = quantity;

  await cart.save();
  res.json({ msg: "Cart Updated", cart });
});


// Remove Item
router.delete("/remove/:productId", auth, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) return res.status(400).json({ msg: "Cart not found" });

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();
  res.json({ msg: "Item Removed", cart });
});

module.exports = router;
