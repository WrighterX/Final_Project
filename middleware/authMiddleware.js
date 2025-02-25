const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized, invalid token format." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        console.log("User verified:", req.user);
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err);
        res.status(403).json({ message: "Invalid Token" });
    }
};