const Post = require("../models/Post");

// Create a post
const createPost = async (req, res) => { 
    try {
        console.log("Request body:", req.body);
        console.log("User making request:", req.user);

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized. User ID is missing." });
        }

        const newPost = await Post.create({ 
            title: req.body.title, 
            content: req.body.content, 
            author: req.user._id
        });

        console.log("Post created:", newPost);
        res.status(201).json(newPost);
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(400).json({ message: "Error creating post", error: err.message });
    }
};

// Fetch all posts (public)
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "username");
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ✅ Fetch only the logged-in user's posts
const getUserPosts = async (req, res) => {
    try {
        const userId = req.user._id; // ✅ Ensure it matches authMiddleware
        console.log("Fetching posts for user ID:", userId);

        const posts = await Post.find({ author: userId }).populate("author", "username");
        console.log("Fetched posts:", posts);

        res.json(posts);
    } catch (err) {
        console.error("Error fetching user posts:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "username");
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Update a post
const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Only update title and content
        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;
        await post.save();

        res.json(post);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// Delete a post
const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.author.toString() !== req.user._id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
};

module.exports = { createPost, getAllPosts, getUserPosts, getPostById, updatePost, deletePost };