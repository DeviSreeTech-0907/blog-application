// ==================== LOGIN ====================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            loginForm.querySelector('input[type="email"]').value.trim();

        const password =
            loginForm.querySelector('input[type="password"]').value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        try {

            const response = await fetch(
                    "https://blog-application-8sc6.onrender.com/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem("token", data.token);

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                alert(data.message);

                window.location.href = "dashboard.html";

            } else {

                alert(
                    data.message ||
                    "Login failed."
                );
            }

        } catch (error) {

            console.error("LOGIN ERROR:", error);

            alert(
                "Unable to connect to the server."
            );
        }

    });

}


// ==================== REGISTER ====================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById("name").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;


            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                alert("Please fill in all fields.");
                return;
            }


            if (password !== confirmPassword) {

                alert("Passwords do not match.");
                return;
            }


            if (password.length < 6) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;
            }


            try {

                const response = await fetch(
                    "http://localhost:3001/api/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name: name,
                            email: email,
                            password: password
                        })
                    }
                );


                const data =
                    await response.json();


                if (response.ok) {

                    alert(
                        data.message ||
                        "Registration successful!"
                    );

                    registerForm.reset();

                    window.location.href =
                        "login.html";

                } else {

                    alert(
                        data.message ||
                        "Registration failed."
                    );
                }


            } catch (error) {

                console.error(
                    "REGISTER ERROR:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );
            }

        }
    );
}


// ==================== CREATE BLOG ====================

const blogForm =
    document.getElementById("blogForm");

if (blogForm) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert("Please login first.");

        window.location.href =
            "login.html";

    } else {

        blogForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const title =
                    blogForm
                        .querySelector(
                            'input[type="text"]'
                        )
                        .value
                        .trim();


                const category =
                    blogForm
                        .querySelector("select")
                        .value
                        .trim();


                const content =
                    blogForm
                        .querySelector("textarea")
                        .value
                        .trim();


                if (
                    !title ||
                    !category ||
                    category === "Select Category" ||
                    !content
                ) {

                    alert(
                        "Please fill in all blog details."
                    );

                    return;
                }


                try {

                    const response =
                        await fetch(
                            "http://localhost:3001/api/blogs",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                },

                                body: JSON.stringify({
                                    title: title,
                                    category: category,
                                    content: content
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        alert(
                            data.message ||
                            "Blog created successfully!"
                        );

                        blogForm.reset();

                        window.location.href =
                            "dashboard.html";

                    } else {

                        alert(
                            data.message ||
                            "Unable to create blog."
                        );
                    }


                } catch (error) {

                    console.error(
                        "CREATE BLOG ERROR:",
                        error
                    );

                    alert(
                        "Unable to connect to the server."
                    );
                }

            }
        );
    }
}


// ==================== DASHBOARD ====================

const blogList =
    document.getElementById("blogList");

if (blogList) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert("Please login first.");

        window.location.href =
            "login.html";

    } else {

        async function loadBlogs() {

            try {

                const response =
                    await fetch(
                        "http://localhost:3001/api/blogs",
                        {
                            method: "GET",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );


                const blogs =
                    await response.json();


                if (!response.ok) {

                    alert(
                        blogs.message ||
                        "Unable to load blogs."
                    );

                    return;
                }


                blogList.innerHTML = "";


                if (
                    !Array.isArray(blogs) ||
                    blogs.length === 0
                ) {

                    blogList.innerHTML =
                        "<p>No blogs created yet.</p>";

                    return;
                }


                blogs.forEach(function (blog) {

                    const article =
                        document.createElement(
                            "article"
                        );


                    article.innerHTML = `

                        <h3>
                            <a href="view-blog.html?id=${blog._id}">
                                ${blog.title}
                            </a>
                        </h3>

                        <p>
                            <strong>Category:</strong>
                            ${blog.category || "General"}
                        </p>

                        <p>
                            <strong>Author:</strong>
                            ${blog.author}
                        </p>

                        <p>
                            ${blog.content}
                        </p>

                        <div>

                            <button
                                type="button"
                                onclick="editBlog('${blog._id}')">
                                Edit
                            </button>

                            <button
                                type="button"
                                onclick="deleteBlog('${blog._id}')">
                                Delete
                            </button>

                        </div>

                        <hr>

                    `;


                    blogList.appendChild(
                        article
                    );

                });


            } catch (error) {

                console.error(
                    "LOAD BLOGS ERROR:",
                    error
                );

                blogList.innerHTML =
                    "<p>Unable to load blogs from the server.</p>";
            }
        }


        loadBlogs();
    }
}


// ==================== EDIT BLOG ====================

async function editBlog(id) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:3001/api/blogs/${id}`,
                {
                    method: "GET",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const blog =
            await response.json();


        if (!response.ok) {

            alert(
                blog.message ||
                "Unable to load blog."
            );

            return;
        }


        const newTitle =
            prompt(
                "Enter new title:",
                blog.title
            );


        if (newTitle === null) {
            return;
        }


        const newCategory =
            prompt(
                "Enter new category:",
                blog.category
            );


        if (newCategory === null) {
            return;
        }


        const newContent =
            prompt(
                "Enter new content:",
                blog.content
            );


        if (newContent === null) {
            return;
        }


        if (
            !newTitle.trim() ||
            !newCategory.trim() ||
            !newContent.trim()
        ) {

            alert(
                "All blog fields are required."
            );

            return;
        }


        const updateResponse =
            await fetch(
                `http://localhost:3001/api/blogs/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        title:
                            newTitle.trim(),

                        category:
                            newCategory.trim(),

                        content:
                            newContent.trim()
                    })
                }
            );


        const data =
            await updateResponse.json();


        if (updateResponse.ok) {

            alert(
                data.message ||
                "Blog updated successfully!"
            );

            location.reload();

        } else {

            alert(
                data.message ||
                "Unable to update blog."
            );
        }


    } catch (error) {

        console.error(
            "EDIT BLOG ERROR:",
            error
        );

        alert(
            "Unable to update the blog."
        );
    }
}


// ==================== DELETE BLOG ====================

async function deleteBlog(id) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this blog?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:3001/api/blogs/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (response.ok) {

            alert(
                data.message ||
                "Blog deleted successfully!"
            );

            location.reload();

        } else {

            alert(
                data.message ||
                "Unable to delete blog."
            );
        }


    } catch (error) {

        console.error(
            "DELETE BLOG ERROR:",
            error
        );

        alert(
            "Unable to delete the blog."
        );
    }
}


// ==================== VIEW BLOG ====================

const blogView =
    document.getElementById("blogView");

if (blogView) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert("Please login first.");

        window.location.href =
            "login.html";

    } else {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const id =
            params.get("id");


        async function loadBlog() {

            try {

                if (!id) {

                    blogView.innerHTML = `

                        <h2>Blog not found</h2>

                        <p>
                            No blog ID was provided.
                        </p>

                    `;

                    return;
                }


                const response =
                    await fetch(
                        `http://localhost:3001/api/blogs/${id}`,
                        {
                            method: "GET",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );


                const blog =
                    await response.json();


                if (!response.ok) {

                    blogView.innerHTML = `

                        <h2>Blog not found</h2>

                        <p>
                            ${blog.message ||
                            "Unable to load blog."}
                        </p>

                    `;

                    return;
                }


                blogView.innerHTML = `

                    <h2>
                        ${blog.title}
                    </h2>

                    <p>
                        <strong>Author:</strong>
                        ${blog.author}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${blog.category ||
                        "General"}
                    </p>

                    <hr>

                    <p>
                        ${blog.content}
                    </p>

                    <br>

                    <button
                        type="button"
                        onclick="editBlog('${blog._id}')">
                        Edit
                    </button>

                    <button
                        type="button"
                        onclick="deleteBlog('${blog._id}')">
                        Delete
                    </button>

                    <br><br>

                    <a href="dashboard.html">
                        ← Back to Dashboard
                    </a>

                `;


            } catch (error) {

                console.error(
                    "VIEW BLOG ERROR:",
                    error
                );

                blogView.innerHTML = `

                    <h2>Error</h2>

                    <p>
                        Unable to load the blog.
                    </p>

                `;
            }
        }


        loadBlog();
    }
}


// ==================== PROFILE ====================

const profileElement =
    document.getElementById("profile");

if (profileElement) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert("Please login first.");

        window.location.href =
            "login.html";

    } else {

        async function loadProfile() {

            try {

                const response =
                    await fetch(
                        "http://localhost:3001/api/profile",
                        {
                            method: "GET",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );


                const user =
                    await response.json();


                if (!response.ok) {

                    alert(
                        user.message ||
                        "Unable to load profile."
                    );

                    return;
                }


                profileElement.innerHTML = `

                    <h2>My Profile</h2>

                    <p>
                        <strong>Name:</strong>
                        ${user.name}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${user.email}
                    </p>

                `;


            } catch (error) {

                console.error(
                    "PROFILE ERROR:",
                    error
                );

                profileElement.innerHTML =
                    "<p>Unable to load profile.</p>";
            }
        }


        loadProfile();
    }
}