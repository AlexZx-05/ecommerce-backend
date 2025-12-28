const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Address = require("../models/Address");


// Add Address
router.post("/add", auth, async (req, res) => {
  try {
    const address = new Address({
      user: req.user.id,
      ...req.body
    });

    await address.save();
    res.json({ msg: "Address Added", address });

  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});


// Get My Addresses
router.get("/", auth, async (req, res) => {
  const addresses = await Address.find({ user: req.user.id });
  res.json(addresses);
});


// Delete Address
router.delete("/:id", auth, async (req, res) => {
  await Address.findByIdAndDelete(req.params.id);
  res.json({ msg: "Address Deleted" });
});

module.exports = router;
