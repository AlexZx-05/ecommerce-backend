const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");


// CREATE PRODUCT (Admin Only later)
router.post("/create", auth, async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      image
    });

    await product.save();
    res.json({ msg: "Product Created", product });

  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});


// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});


// GET SINGLE PRODUCT BY ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if(!product) return res.status(404).json({ msg: "Product Not Found" });

    res.json(product);

  } catch {
    res.status(500).json({ msg: "Server Error" });
  }
});


module.exports = router;
