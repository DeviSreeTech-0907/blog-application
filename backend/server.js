const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());

// ==================== DATABASE ====================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

// ==================== USER MODEL ====================

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

// ==================== BLOG MODEL ====================

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true
        },

        author: {
            type: String,
            required: true
        },

        userId: {
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

// ==================== AUTH MIDDLEWARE ====================

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        return res.status(401).json({
            message: "Access denied. Please login."
        });

    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(403).json({
            message: "Invalid or expired token."
        });

    }
}

// ==================== REGISTER ====================

app.post("/api/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "Please fill in all fields."
            });

        }

        if (password.length < 6) {

            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });

        }

        const normalizedEmail =
            email.toLowerCase().trim();

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {

            return res.status(409).json({
                message: "User already exists."
            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = new User({

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword

        });

        await user.save();

        res.status(201).json({

            message: "Registration successful!"

        });

    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Server error during registration."

        });

    }

});

// ==================== LOGIN ====================

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Please enter email and password."

            });

        }

        const normalizedEmail =
            email.toLowerCase().trim();

        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password."

            });

        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {

            return res.status(401).json({

                message:
                    "Invalid email or password."

            });

        }

        const token =
            jwt.sign(

                {
                    userId: user._id.toString(),

                    email: user.email

                },

                JWT_SECRET,

                {
                    expiresIn: "1h"
                }

            );

        res.json({

            message: "Login successful!",

            token: token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Server error during login."

        });

    }

});

// ==================== PROFILE ====================

app.get(
    "/api/profile",
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                ).select("-password");

            if (!user) {

                return res.status(404).json({

                    message: "User not found."

                });

            }

            res.json({

                id: user._id,

                name: user.name,

                email: user.email

            });

        } catch (error) {

            console.error(
                "PROFILE ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to load profile."

            });

        }

    }
);

// ==================== CREATE BLOG ====================

app.post(
    "/api/blogs",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                title,
                category,
                content
            } = req.body;

            if (
                !title ||
                !category ||
                !content
            ) {

                return res.status(400).json({

                    message:
                        "Please fill in all blog details."

                });

            }

            const user =
                await User.findById(
                    req.user.userId
                );

            if (!user) {

                return res.status(404).json({

                    message:
                        "User not found."

                });

            }

            const blog =
                new Blog({

                    title: title.trim(),

                    category: category.trim(),

                    content: content.trim(),

                    author: user.name,

                    userId: user._id

                });

            await blog.save();

            res.status(201).json({

                message:
                    "Blog created successfully!",

                blog: blog

            });

        } catch (error) {

            console.error(
                "CREATE BLOG ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to create blog."

            });

        }

    }
);

// ==================== GET MY BLOGS ====================

app.get(
    "/api/blogs",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                search,
                category
            } = req.query;

            const query = {

                userId: req.user.userId

            };

            if (search) {

                query.$or = [

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

            if (
                category &&
                category !== "All"
            ) {

                query.category = category;

            }

            const blogs =
                await Blog.find(query)
                    .sort({
                        createdAt: -1
                    });

            res.json(blogs);

        } catch (error) {

            console.error(
                "GET BLOGS ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to load blogs."

            });

        }

    }
);

// ==================== GET ONE BLOG ====================

app.get(
    "/api/blogs/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const blog =
                await Blog.findOne({

                    _id: req.params.id,

                    userId: req.user.userId

                });

            if (!blog) {

                return res.status(404).json({

                    message:
                        "Blog not found."

                });

            }

            res.json(blog);

        } catch (error) {

            console.error(
                "GET BLOG ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to load blog."

            });

        }

    }
);

// ==================== UPDATE BLOG ====================

app.put(
    "/api/blogs/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                title,
                category,
                content
            } = req.body;

            const blog =
                await Blog.findOneAndUpdate(

                    {
                        _id: req.params.id,

                        userId: req.user.userId
                    },

                    {
                        title: title.trim(),

                        category: category.trim(),

                        content: content.trim()
                    },

                    {
                        new: true,

                        runValidators: true
                    }

                );

            if (!blog) {

                return res.status(404).json({

                    message:
                        "Blog not found or you are not the owner."

                });

            }

            res.json({

                message:
                    "Blog updated successfully!",

                blog: blog

            });

        } catch (error) {

            console.error(
                "UPDATE BLOG ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to update blog."

            });

        }

    }
);

// ==================== DELETE BLOG ====================

app.delete(
    "/api/blogs/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const blog =
                await Blog.findOneAndDelete({

                    _id: req.params.id,

                    userId: req.user.userId

                });

            if (!blog) {

                return res.status(404).json({

                    message:
                        "Blog not found or you are not the owner."

                });

            }

            res.json({

                message:
                    "Blog deleted successfully!"

            });

        } catch (error) {

            console.error(
                "DELETE BLOG ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to delete blog."

            });

        }

    }
);

// ==================== SERVER ====================

app.listen(
    PORT,
    () => {

        console.log(
            `Blog Backend Server is running at http://localhost:${PORT}`
        );

    }
);