const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashPassword,
      role
    });

    await user.save();

    res.json({ msg: "User Registered Successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login Success",
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
