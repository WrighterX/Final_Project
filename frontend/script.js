const API_URL = "http://localhost:3000";  // Update if deployed

// Fetch all posts (Public)
async function fetchPosts() {
    console.log("🔍 Fetching posts...");

    // Ensure the element exists before continuing
    const container = document.getElementById("posts-container");
    if (!container) {
        console.warn("⚠️ posts-container not found. Skipping fetchPosts().");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/posts`);

        // Check if the response is actually JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("❌ Response is not JSON:", await res.text());
            return;
        }

        const posts = await res.json(); // Parse JSON
        console.log("✅ Parsed posts:", posts);

        container.innerHTML = posts.map(post => `
            <div>
                <h2>${post.title}</h2>
                <p>${post.content}</p>
                <small>By: ${post.author?.username || "Unknown"}</small>
            </div>
        `).join(""); // Ensure proper HTML rendering

    } catch (err) {
        console.error("❌ Error fetching posts:", err);
        alert("Error loading posts. Check console for details.");
    }
}

// Register user
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

// Fetch user posts
async function fetchUserPosts() {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "login.html");

    try {
        const res = await fetch(`${API_URL}/posts/user`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch user posts");
        }

        const posts = await res.json();
        console.log("🔹 User posts fetched:", posts);

        const container = document.getElementById("user-posts");
        if (!container) {
            console.warn("⚠️ user-posts container not found.");
            return;
        }

        container.innerHTML = posts.map(post => `
            <div>
                <h2>${post.title}</h2>
                <p>${post.content}</p>
                <button onclick="deletePost('${post._id}')">Delete</button>
            </div>
        `).join("");
    } catch (err) {
        console.error("❌ Error fetching user posts:", err);
    }
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