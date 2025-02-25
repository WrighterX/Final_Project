const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getUserProfile, updateUserProfile } = require("../controllers/userController");
const { validateProfileUpdate } = require("../middleware/validation");

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, validateProfileUpdate, updateUserProfile);

module.exports = router;