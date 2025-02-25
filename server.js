require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

app.use(express.static(path.join(__dirname, "frontend")));

// Catch-all route to serve index.html for any unmatched route
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.use("/posts", (req, res, next) => {
    console.log("🔍 API /posts hit!"); 
    next();
}, require("./routes/postRoutes"));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));