const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.registerUser = async (req, res) => {
    try {
        console.log("📥 Request Body:", req.body); // 🔍 Debugging step

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        const newUser = new User({ username, email, password });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(501).json({ message: "Server error." });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email." });
        }

        // ✅ Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password." });
        }

        // ✅ Ensure JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error("❌ Missing JWT_SECRET in environment variables!");
            return res.status(500).json({ message: "Server misconfiguration." });
        }

        // ✅ Generate JWT token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, username: user.username });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
};