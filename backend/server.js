const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = 3001;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(function () {
        console.log("MongoDB connected successfully!");
    })
    .catch(function (error) {
        console.log("MongoDB connection failed:", error);
    });

// ===============================
// USER MODEL
// ===============================

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

// ===============================
// BLOG MODEL
// ===============================

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        content: {
            type: String,
            required: true
        },

        author: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Blog = mongoose.model("Blog", blogSchema);

// ===============================
// HOME ROUTE
// ===============================

app.get("/", function (req, res) {
    res.send("Blog Backend Server is running!");
});

// ===============================
// REGISTER
// ===============================

app.post("/api/register", async function (req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        const existingUser = await User.findOne({
            email: email
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists."
            });
        }

        const newUser = new User({
            name: name,
            email: email,
            password: password
        });

        await newUser.save();

        res.status(201).json({
            message: "Registration successful!"
        });

    } catch (error) {
        console.log("REGISTER ERROR:", error);

        res.status(500).json({
            message: "Server error during registration."
        });
    }
});

// ===============================
// LOGIN
// ===============================

app.post("/api/login", async function (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password."
            });
        }

        const user = await User.findOne({
            email: email,
            password: password
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

    } catch (error) {
        console.log("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server error during login."
        });
    }
});

// ==================================================
// CREATE BLOG
// ==================================================

app.post("/api/blogs", async function (req, res) {
    try {
        console.log("Blog data received:", req.body);

        const {
            title,
            category,
            content,
            author
        } = req.body;

        if (!title || !category || !content || !author) {
            return res.status(400).json({
                message: "Please fill in all blog fields."
            });
        }

        const newBlog = new Blog({
            title: title,
            category: category,
            content: content,
            author: author
        });

        await newBlog.save();

        console.log("Blog saved successfully!");

        res.status(201).json({
            message: "Blog created successfully!",
            blog: newBlog
        });

    } catch (error) {
        console.log("CREATE BLOG ERROR:", error);

        res.status(500).json({
            message: "Server error while creating blog."
        });
    }
});


// ==================================================
// READ - GET ALL BLOGS
// WITH SEARCH AND CATEGORY FILTER
// ==================================================

app.get("/api/blogs", async function (req, res) {
    try {
        const { search, category } = req.query;

        let filter = {};

        // Search by title or content
        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    content: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        // Filter by category
        if (category) {
            filter.category = {
                $regex: `^${category}$`,
                $options: "i"
            };
        }

        const blogs = await Blog.find(filter).sort({
            createdAt: -1
        });

        console.log("Blogs found:", blogs);

        res.status(200).json(blogs);

    } catch (error) {
        console.error("GET BLOGS ERROR:", error);

        res.status(500).json({
            message: "Server error while retrieving blogs.",
            error: error.message
        });
    }
});
// ==================================================
// READ - GET ONE BLOG
// ==================================================

app.get("/api/blogs/:id", async function (req, res) {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found."
            });
        }

        res.status(200).json(blog);

    } catch (error) {
        console.log("GET ONE BLOG ERROR:", error);

        res.status(500).json({
            message: "Server error while retrieving blog.",
            error: error.message
        });
    }
});
// ==================================================
// UPDATE BLOG
// ==================================================

app.put("/api/blogs/:id", async function (req, res) {
    try {
        const {
            title,
            category,
            content,
            author
        } = req.body;

        if (!title || !category || !content || !author) {
            return res.status(400).json({
                message: "Please fill in all blog fields."
            });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                title: title,
                category: category,
                content: content,
                author: author
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedBlog) {
            return res.status(404).json({
                message: "Blog not found."
            });
        }

        res.status(200).json({
            message: "Blog updated successfully!",
            blog: updatedBlog
        });

    } catch (error) {
        console.log("UPDATE BLOG ERROR:", error);

        res.status(500).json({
            message: "Server error while updating blog."
        });
    }
});

// ==================================================
// DELETE BLOG
// ==================================================

app.delete("/api/blogs/:id", async function (req, res) {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(
            req.params.id
        );

        if (!deletedBlog) {
            return res.status(404).json({
                message: "Blog not found."
            });
        }

        res.status(200).json({
            message: "Blog deleted successfully!"
        });

    } catch (error) {
        console.log("DELETE BLOG ERROR:", error);

        res.status(500).json({
            message: "Server error while deleting blog."
        });
    }
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, function () {
    console.log(
        `Blog Backend Server is running at http://localhost:${PORT}`
    );
});