const API_URL = "http://localhost:3000";  // Update if deployed

// Fetch all posts (Public)
async function fetchPosts() {
    console.log("🔍 Fetching posts...");

    const container = document.getElementById("posts-container");
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/posts`);
        const posts = await res.json();

        container.innerHTML = posts.map(post => `
            <div>
                <h2><a href="post.html?id=${post._id}">${post.title}</a></h2>
                <p>${post.content.substring(0, 100)}...</p> 
                <small>By: ${post.author?.username || "Unknown"}</small>
            </div>
        `).join("");

    } catch (err) {
        console.error("❌ Error fetching posts:", err);
    }
}

async function fetchUserPosts() {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "login.html");

    try {
        const res = await fetch(`${API_URL}/posts/user`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const posts = await res.json();
        const container = document.getElementById("user-posts");
        if (!container) return;

        container.innerHTML = posts.map(post => `
            <div>
                <h2><a href="post.html?id=${post._id}">${post.title}</a></h2>
                <p>${post.content.substring(0, 100)}...</p>
                <button onclick="deletePost('${post._id}')">Delete</button>
                <button onclick="editPost('${post._id}')">Edit</button>
            </div>
        `).join("");
    } catch (err) {
        console.error("❌ Error fetching user posts:", err);
    }
}

// Register User
async function registerUser(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("📤 Sending data:", { username, email, password }); // 🔍 Debugging

    const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password }) // ✅ Convert to JSON
    });

    const data = await res.json();
    console.log("🔹 Register Response:", data);

    if (res.ok) {
        alert("Registration successful!");
        window.location.href = "login.html";
    } else {
        alert(`Error: ${data.message}`);
    }
}

// Login user
async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
    } else {
        alert("Login failed.");
    }
}

// Logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

// Create a new post
async function createPost(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "login.html");

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
    });

    if (res.ok) {
        document.getElementById("title").value = "";
        document.getElementById("content").value = "";
        
        // Reload the page after post creation
        window.location.reload();
    } else {
        const errorData = await res.json();
        console.error("❌ Error creating post:", errorData);
        alert(`Error: ${errorData.message}`);
    }
}

// Delete post
async function deletePost(id) {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    fetchUserPosts();
}

// Edit a post
async function editPost(id) {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "login.html");

    // Fetch existing post details
    const res = await fetch(`${API_URL}/posts/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
        alert("Failed to fetch post data.");
        return;
    }

    const post = await res.json();
    const newTitle = prompt("Edit title:", post.title);
    const newContent = prompt("Edit content:", post.content);

    if (!newTitle || !newContent) {
        alert("Title and content cannot be empty.");
        return;
    }

    // Send update request
    const updateRes = await fetch(`${API_URL}/posts/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle, content: newContent })
    });

    if (updateRes.ok) {
        alert("Post updated successfully!");
        fetchUserPosts(); // Refresh user posts
    } else {
        alert("Error updating post.");
    }
}

async function fetchPostDetails() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");

    if (!postId) {
        document.getElementById("post-container").innerHTML = "<p>Post not found.</p>";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/posts/${postId}`);
        if (!res.ok) throw new Error("Post not found");

        const post = await res.json();
        document.getElementById("post-title").innerText = post.title;
        document.getElementById("post-content").innerText = post.content;
        document.getElementById("post-author").innerText = `By: ${post.author?.username || "Unknown"}`;

    } catch (err) {
        console.error("❌ Error fetching post:", err);
        document.getElementById("post-container").innerHTML = "<p>Error loading post.</p>";
    }
}

async function updateUsername(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to update your username.");
        return (window.location.href = "login.html");
    }

    const newUsername = document.getElementById("new-username").value;
    if (!newUsername) {
        alert("Please enter a new username.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/users/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ username: newUsername })
        });

        const data = await res.json();
        if (res.ok) {
            alert("Username updated successfully!");
            document.getElementById("new-username").value = "";
            fetchUserProfile(); // Refresh the displayed username
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (err) {
        console.error("❌ Error updating username:", err);
        alert("Error updating username. Check console for details.");
    }
}

// Fetch user profile and display username
async function fetchUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/users/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch user profile");

        const user = await res.json();
        console.log("👤 User profile:", user);

        document.getElementById("current-username").innerText = user.username || "Unknown";
    } catch (err) {
        console.error("❌ Error fetching user profile:", err);
    }
}