const API_URL = "http://localhost:3000";  // Update if deployed

// Fetch all posts (Public)
async function fetchPosts() {
    const res = await fetch(`${API_URL}/posts`);
    const posts = await res.json();
    document.getElementById("posts-container").innerHTML = posts.map(post => `
        <div>
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <small>By: ${post.author.username}</small>
        </div>
    `).join("");
}

// Register user
async function registerUser(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const username = document.getElementById("username").value;

    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username })
    });

    if (res.ok) {
        alert("Registration successful! Please login.");
        window.location.href = "login.html";
    } else {
        alert("Registration failed.");
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

    const res = await fetch(`${API_URL}/posts`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const posts = await res.json();
    document.getElementById("user-posts").innerHTML = posts.map(post => `
        <div>
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <button onclick="deletePost('${post._id}')">Delete</button>
        </div>
    `).join("");
}

// Create a new post
async function createPost(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("No token found. Redirecting to login...");
        return (window.location.href = "login.html");
    }

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    console.log("Submitting Post:", { title, content });

    const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
    });

    const data = await res.json();
    console.log("Response:", data);

    if (res.ok) {
        alert("Post created successfully!");
        fetchUserPosts();
    } else {
        alert(`Error: ${data.message}`);
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