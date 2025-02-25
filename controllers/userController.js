const User = require("../models/User");

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, email } = req.body;
    user.username = username || user.username;
    user.email = email || user.email;
    await user.save();

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};