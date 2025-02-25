const Post = require("../models/Post");

// Create a post
exports.createPost = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("User making request:", req.user);

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized. User ID is missing." });
    }

    const newPost = await Post.create({ 
        title: req.body.title, 
        content: req.body.content, 
        author: req.user.userId
    });

    console.log("Post created:", newPost);
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(400).json({ message: "Error creating post", error: err.message });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  const posts = await Post.find().populate("author", "username");
  res.json(posts);
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "username");
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
};

// Update a post
exports.updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.author.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedPost);
};

// Delete a post
exports.deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.author.toString() !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
};