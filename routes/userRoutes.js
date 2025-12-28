const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

// Get Profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Update Profile
router.put("/update", auth, async (req, res) => {
  try {
    const { name } = req.body;
    await User.findByIdAndUpdate(req.user.id, { name });
    res.json({ msg: "Profile Updated" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
