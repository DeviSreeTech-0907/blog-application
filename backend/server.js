const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

// =========================
// Middleware
// =========================

app.use(cors());
app.use(express.json());

// =========================
// Environment Variables
// =========================

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Check required environment variables
if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing in .env");
}

if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET is missing in .env");
}

// =========================
// MongoDB Connection
// =========================

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
    })
    .catch((error) => {
        console.error("❌ MongoDB connection error:", error);
    });

// =========================
// User Schema
// =========================

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

// =========================
// Blog Schema
// =========================

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true
        },

        category: {
            type: String,
            default: "General",
            trim: true
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Blog = mongoose.model("Blog", blogSchema);

// =========================
// JWT Authentication
// =========================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Invalid token."
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token."
        });
    }
};

// =========================
// Test Route
// =========================

app.get("/", (req, res) => {
    res.json({
        message: "Blog API is running successfully 🚀"
    });
});

// =========================
// REGISTER
// =========================

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email and password."
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Registration successful."
        });
    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            message: "Server error during registration."
        });
    }
});

// =========================
// LOGIN
// =========================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password."
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                name: user.name,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error during login."
        });
    }
});

// =========================
// GET CURRENT USER PROFILE
// =========================

app.get("/api/profile", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select(
            "-password"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json(user);
    } catch (error) {
        console.error("Profile error:", error);

        res.status(500).json({
            message: "Server error."
        });
    }
});

// =========================
// GET ALL BLOGS
// =========================

app.get("/api/blogs", async (req, res) => {
    try {
        const { search, category } = req.query;

        let filter = {};

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

        if (category && category !== "All") {
            filter.category = category;
        }

        const blogs = await Blog.find(filter)
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.json(blogs);
    } catch (error) {
        console.error("Get blogs error:", error);

        res.status(500).json({
            message: "Server error while fetching blogs."
        });
    }
});

// =========================
// GET SINGLE BLOG
// =========================

app.get("/api/blogs/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate(
            "author",
            "name email"
        );

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found."
            });
        }

        res.json(blog);
    } catch (error) {
        console.error("Get blog error:", error);

        res.status(500).json({
            message: "Invalid blog ID or server error."
        });
    }
});

// =========================
// CREATE BLOG
// =========================

app.post("/api/blogs", authenticateToken, async (req, res) => {
    try {
        const { title, content, category } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required."
            });
        }

        const blog = new Blog({
            title,
            content,
            category: category || "General",
            author: req.user.userId
        });

        await blog.save();

        const populatedBlog = await Blog.findById(blog._id).populate(
            "author",
            "name email"
        );

        res.status(201).json({
            message: "Blog created successfully.",
            blog: populatedBlog
        });
    } catch (error) {
        console.error("Create blog error:", error);

        res.status(500).json({
            message: "Server error while creating blog."
        });
    }
});

// =========================
// UPDATE BLOG
// =========================

app.put("/api/blogs/:id", authenticateToken, async (req, res) => {
    try {
        const { title, content, category } = req.body;

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found."
            });
        }

        if (blog.author.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only edit your own blogs."
            });
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;
        blog.category = category || blog.category;

        await blog.save();

        const updatedBlog = await Blog.findById(blog._id).populate(
            "author",
            "name email"
        );

        res.json({
            message: "Blog updated successfully.",
            blog: updatedBlog
        });
    } catch (error) {
        console.error("Update blog error:", error);

        res.status(500).json({
            message: "Server error while updating blog."
        });
    }
});

// =========================
// DELETE BLOG
// =========================

app.delete("/api/blogs/:id", authenticateToken, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found."
            });
        }

        if (blog.author.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only delete your own blogs."
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.json({
            message: "Blog deleted successfully."
        });
    } catch (error) {
        console.error("Delete blog error:", error);

        res.status(500).json({
            message: "Server error while deleting blog."
        });
    }
});

// =========================
// GET LOGGED-IN USER BLOGS
// =========================

app.get("/api/my-blogs", authenticateToken, async (req, res) => {
    try {
        const blogs = await Blog.find({
            author: req.user.userId
        })
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.json(blogs);
    } catch (error) {
        console.error("My blogs error:", error);

        res.status(500).json({
            message: "Server error while fetching your blogs."
        });
    }
});

// =========================
// 404 ROUTE
// =========================

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});