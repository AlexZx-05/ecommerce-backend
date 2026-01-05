const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DeliveryBoy = require("../models/DeliveryBoy");

// REGISTER DELIVERY BOY
router.post("/register", async (req, res) => {
  const { name, phone, email, password } = req.body;

  let user = await DeliveryBoy.findOne({ email });
  if (user) return res.status(400).json({ msg: "Delivery Boy Already Exists" });

  const hashed = await bcrypt.hash(password, 10);

  user = new DeliveryBoy({
    name,
    phone,
    email,
    password: hashed
  });

  await user.save();

  res.json({ msg: "Delivery Boy Registered" });
});

// LOGIN DELIVERY BOY
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await DeliveryBoy.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Delivery Boy Not Found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Invalid Credentials" });

  const token = jwt.sign(
    { id: user._id, role: "delivery" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    msg: "Delivery Login Success",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

module.exports = router;
