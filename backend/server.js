const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 3001;

// Allow frontend to connect to backend
app.use(cors());

// Allow server to read JSON data
app.use(express.json());

// Temporary storage for users
const users = [];

// Temporary storage for blogs
const blogs = [];

// Home route
app.get("/", function (req, res) {
    res.send("Blog Backend Server is running!");
});

// ===============================
// USER REGISTRATION API
// ===============================

app.post("/api/register", function (req, res) {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Please fill in all fields."
        });
    }

    const existingUser = users.find(function (user) {
        return user.email === email;
    });

    if (existingUser) {
        return res.status(409).json({
            message: "User already exists."
        });
    }

    const newUser = {
        name: name,
        email: email,
        password: password
    };

    users.push(newUser);

    res.status(201).json({
        message: "Registration successful!"
    });
});

// ===============================
// USER LOGIN API
// ===============================

app.post("/api/login", function (req, res) {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please enter email and password."
        });
    }

    const user = users.find(function (user) {
        return user.email === email && user.password === password;
    });

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password."
        });
    }

    res.status(200).json({
        message: "Login successful!",
        user: {
            name: user.name,
            email: user.email
        }
    });
});

// ===============================
// CREATE BLOG API
// ===============================

app.post("/api/blogs", function (req, res) {

    const { title, content, author } = req.body;

    if (!title || !content || !author) {
        return res.status(400).json({
            message: "Please fill in all blog fields."
        });
    }

    const newBlog = {
        id: Date.now(),
        title: title,
        content: content,
        author: author
    };

    blogs.push(newBlog);

    res.status(201).json({
        message: "Blog created successfully!",
        blog: newBlog
    });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, function () {
    console.log(`Blog Backend Server is running at http://localhost:${PORT}`);
});
// Get All Blogs API
app.get("/api/blogs", function (req, res) {

    res.status(200).json(blogs);

});