// ======================================================
// FULL STACK BLOG APPLICATION - FRONTEND SCRIPT
// ======================================================

// ==================== API CONFIGURATION ====================

const API_URL = "https://blog-application-8sc6.onrender.com/api";

// ==================== COMMON HELPERS ====================

function getToken() {
    return localStorage.getItem("token");
}

function getUser() {
    const user = localStorage.getItem("user");

    try {
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("USER DATA ERROR:", error);
        return null;
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}

function requireLogin() {
    const token = getToken();

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return false;
    }

    return true;
}

async function getResponseData(response) {
    try {
        return await response.json();
    } catch (error) {
        return {};
    }
}


// ======================================================
// LOGIN
// ======================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const emailInput =
            loginForm.querySelector('input[type="email"]');

        const passwordInput =
            loginForm.querySelector('input[type="password"]');

        const email = emailInput
            ? emailInput.value.trim()
            : "";

        const password = passwordInput
            ? passwordInput.value
            : "";

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/login`,
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

            const data = await getResponseData(response);

            if (response.ok) {

                // Store JWT
                localStorage.setItem(
                    "token",
                    data.token
                );

                // Store user information
                if (data.user) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                }

                alert(
                    data.message ||
                    "Login successful!"
                );

                window.location.href =
                    "dashboard.html";

            } else {

                alert(
                    data.message ||
                    "Login failed."
                );
            }

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            alert(
                "Unable to connect to the server."
            );
        }

    });
}


// ======================================================
// REGISTER
// ======================================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const nameElement =
                document.getElementById("name");

            const emailElement =
                document.getElementById("email");

            const passwordElement =
                document.getElementById("password");

            const confirmPasswordElement =
                document.getElementById("confirmPassword");

            const name =
                nameElement
                    ? nameElement.value.trim()
                    : "";

            const email =
                emailElement
                    ? emailElement.value.trim()
                    : "";

            const password =
                passwordElement
                    ? passwordElement.value
                    : "";

            const confirmPassword =
                confirmPasswordElement
                    ? confirmPasswordElement.value
                    : "";


            // Validation
            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                alert(
                    "Please fill in all fields."
                );

                return;
            }


            if (password !== confirmPassword) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            if (password.length < 6) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/register`,
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
                    await getResponseData(response);


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


// ======================================================
// CREATE BLOG
// ======================================================

const blogForm =
    document.getElementById("blogForm");

if (blogForm) {

    if (!requireLogin()) {

        // Stop execution if user isn't logged in

    } else {

        blogForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const token =
                    getToken();


                const titleElement =
                    blogForm.querySelector(
                        'input[type="text"]'
                    );

                const categoryElement =
                    blogForm.querySelector(
                        "select"
                    );

                const contentElement =
                    blogForm.querySelector(
                        "textarea"
                    );


                const title =
                    titleElement
                        ? titleElement.value.trim()
                        : "";

                const category =
                    categoryElement
                        ? categoryElement.value.trim()
                        : "";

                const content =
                    contentElement
                        ? contentElement.value.trim()
                        : "";


                if (
                    !title ||
                    !content
                ) {

                    alert(
                        "Please enter the blog title and content."
                    );

                    return;
                }


                if (
                    !category ||
                    category === "Select Category"
                ) {

                    alert(
                        "Please select a category."
                    );

                    return;
                }


                try {

                    const response =
                        await fetch(
                            `${API_URL}/blogs`,
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
                        await getResponseData(response);


                    if (response.ok) {

                        alert(
                            data.message ||
                            "Blog created successfully!"
                        );

                        blogForm.reset();

                        window.location.href =
                            "dashboard.html";

                    } else {

                        if (
                            response.status === 401 ||
                            response.status === 403
                        ) {

                            alert(
                                "Your session has expired. Please login again."
                            );

                            logout();

                            return;
                        }


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


// ======================================================
// DASHBOARD
// ======================================================

const blogList =
    document.getElementById("blogList");

if (blogList) {

    if (!requireLogin()) {

        // Stop if user isn't logged in

    } else {

        loadMyBlogs();
    }
}


// ======================================================
// LOAD ONLY LOGGED-IN USER'S BLOGS
// ======================================================

async function loadMyBlogs() {

    const token =
        getToken();

    if (!token) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/my-blogs`,
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
            await getResponseData(response);


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "Your session has expired. Please login again."
            );

            logout();

            return;
        }


        if (!response.ok) {

            blogList.innerHTML =
                `<p>${blogs.message || "Unable to load your blogs."}</p>`;

            return;
        }


        blogList.innerHTML = "";


        if (
            !Array.isArray(blogs) ||
            blogs.length === 0
        ) {

            blogList.innerHTML = `
                <div class="empty-state">
                    <h3>No blogs yet</h3>
                    <p>You haven't created any blogs.</p>
                    <a href="create-blog.html">
                        Create Your First Blog
                    </a>
                </div>
            `;

            return;
        }


        blogs.forEach(function (blog) {

            const article =
                document.createElement("article");


            const authorName =
                blog.author && blog.author.name
                    ? blog.author.name
                    : "Unknown";


            const createdDate =
                blog.createdAt
                    ? new Date(
                        blog.createdAt
                    ).toLocaleDateString()
                    : "";


            article.className =
                "blog-card";


            article.innerHTML = `

                <h3>
                    <a href="view-blog.html?id=${blog._id}">
                        ${escapeHTML(blog.title)}
                    </a>
                </h3>

                <p>
                    <strong>Category:</strong>
                    ${escapeHTML(
                        blog.category || "General"
                    )}
                </p>

                <p>
                    <strong>Author:</strong>
                    ${escapeHTML(authorName)}
                </p>

                ${
                    createdDate
                        ? `
                        <p>
                            <strong>Date:</strong>
                            ${createdDate}
                        </p>
                        `
                        : ""
                }

                <p>
                    ${escapeHTML(
                        truncateText(
                            blog.content,
                            200
                        )
                    )}
                </p>

                <div class="blog-actions">

                    <a
                        href="view-blog.html?id=${blog._id}"
                    >
                        View
                    </a>

                    <button
                        type="button"
                        onclick="editBlog('${blog._id}')"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onclick="deleteBlog('${blog._id}')"
                    >
                        Delete
                    </button>

                </div>

            `;


            blogList.appendChild(article);

        });

    } catch (error) {

        console.error(
            "LOAD MY BLOGS ERROR:",
            error
        );

        blogList.innerHTML = `
            <p>
                Unable to load your blogs.
                Please check your internet connection.
            </p>
        `;
    }
}


// ======================================================
// EDIT BLOG
// ======================================================

async function editBlog(id) {

    const token =
        getToken();


    if (!token) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;
    }


    try {

        // Get blog
        const response =
            await fetch(
                `${API_URL}/blogs/${id}`,
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
            await getResponseData(response);


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "Your session has expired. Please login again."
            );

            logout();

            return;
        }


        if (!response.ok) {

            alert(
                blog.message ||
                "Unable to load blog."
            );

            return;
        }


        // Check ownership
        const currentUser =
            getUser();


        if (
            currentUser &&
            blog.author &&
            blog.author._id &&
            currentUser.id &&
            blog.author._id !== currentUser.id
        ) {

            alert(
                "You can only edit your own blogs."
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
                blog.category || "General"
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


        // Update blog
        const updateResponse =
            await fetch(
                `${API_URL}/blogs/${id}`,
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
            await getResponseData(
                updateResponse
            );


        if (
            updateResponse.status === 401 ||
            updateResponse.status === 403
        ) {

            alert(
                data.message ||
                "You are not authorized to edit this blog."
            );

            return;
        }


        if (updateResponse.ok) {

            alert(
                data.message ||
                "Blog updated successfully!"
            );

            window.location.reload();

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


// ======================================================
// DELETE BLOG
// ======================================================

async function deleteBlog(id) {

    const token =
        getToken();


    if (!token) {

        alert(
            "Please login first."
        );

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
                `${API_URL}/blogs/${id}`,
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
            await getResponseData(
                response
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                data.message ||
                "You are not authorized to delete this blog."
            );

            return;
        }


        if (response.ok) {

            alert(
                data.message ||
                "Blog deleted successfully!"
            );

            window.location.reload();

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


// ======================================================
// VIEW SINGLE BLOG
// ======================================================

const blogView =
    document.getElementById("blogView");

if (blogView) {

    if (!requireLogin()) {

        // Stop execution

    } else {

        loadSingleBlog();
    }
}


async function loadSingleBlog() {

    const token =
        getToken();


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (!id) {

        blogView.innerHTML = `
            <h2>Blog not found</h2>
            <p>No blog ID was provided.</p>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/blogs/${id}`,
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
            await getResponseData(response);


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "Your session has expired. Please login again."
            );

            logout();

            return;
        }


        if (!response.ok) {

            blogView.innerHTML = `
                <h2>Blog not found</h2>

                <p>
                    ${escapeHTML(
                        blog.message ||
                        "Unable to load blog."
                    )}
                </p>
            `;

            return;
        }


        const authorName =
            blog.author && blog.author.name
                ? blog.author.name
                : "Unknown";


        const currentUser =
            getUser();


        const isOwner =
            currentUser &&
            blog.author &&
            blog.author._id &&
            currentUser.id &&
            blog.author._id === currentUser.id;


        blogView.innerHTML = `

            <article class="single-blog">

                <h2>
                    ${escapeHTML(blog.title)}
                </h2>

                <p>
                    <strong>Author:</strong>
                    ${escapeHTML(authorName)}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${escapeHTML(
                        blog.category ||
                        "General"
                    )}
                </p>

                <hr>

                <div class="blog-content">
                    ${escapeHTML(blog.content)}
                </div>

                <br>

                ${
                    isOwner
                        ? `
                        <button
                            type="button"
                            onclick="editBlog('${blog._id}')"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            onclick="deleteBlog('${blog._id}')"
                        >
                            Delete
                        </button>

                        <br><br>
                        `
                        : ""
                }

                <a href="dashboard.html">
                    ← Back to Dashboard
                </a>

            </article>

        `;

    } catch (error) {

        console.error(
            "VIEW BLOG ERROR:",
            error
        );

        blogView.innerHTML = `
            <h2>Error</h2>
            <p>Unable to load the blog.</p>
        `;
    }
}


// ======================================================
// PROFILE
// ======================================================

const profileElement =
    document.getElementById("profile");

if (profileElement) {

    if (!requireLogin()) {

        // Stop execution

    } else {

        loadProfile();
    }
}


async function loadProfile() {

    const token =
        getToken();


    try {

        const response =
            await fetch(
                `${API_URL}/profile`,
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
            await getResponseData(
                response
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "Your session has expired. Please login again."
            );

            logout();

            return;
        }


        if (!response.ok) {

            profileElement.innerHTML = `
                <p>
                    ${escapeHTML(
                        user.message ||
                        "Unable to load profile."
                    )}
                </p>
            `;

            return;
        }


        profileElement.innerHTML = `

            <h2>My Profile</h2>

            <p>
                <strong>Name:</strong>
                ${escapeHTML(user.name)}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(user.email)}
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


// ======================================================
// LOGOUT BUTTONS
// ======================================================

const logoutButtons =
    document.querySelectorAll(
        "#logoutBtn, .logout-btn, [data-logout]"
    );


logoutButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            logout();
        }
    );

});


// ======================================================
// DISPLAY USER NAME
// ======================================================

const userNameElements =
    document.querySelectorAll(
        "#userName, .user-name, [data-user-name]"
    );


const loggedInUser =
    getUser();


if (loggedInUser) {

    userNameElements.forEach(
        function (element) {

            element.textContent =
                loggedInUser.name || "";

        }
    );
}


// ======================================================
// SEARCH BLOGS
// ======================================================

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const categoryFilter =
    document.getElementById("categoryFilter");


if (
    searchButton ||
    searchInput ||
    categoryFilter
) {

    async function searchBlogs() {

        const search =
            searchInput
                ? searchInput.value.trim()
                : "";

        const category =
            categoryFilter
                ? categoryFilter.value
                : "";


        let url =
            `${API_URL}/blogs`;


        const params =
            new URLSearchParams();


        if (search) {
            params.append(
                "search",
                search
            );
        }


        if (
            category &&
            category !== "All"
        ) {

            params.append(
                "category",
                category
            );
        }


        if (params.toString()) {

            url +=
                "?" +
                params.toString();
        }


        try {

            const response =
                await fetch(url);


            const blogs =
                await getResponseData(
                    response
                );


            if (!response.ok) {

                alert(
                    blogs.message ||
                    "Unable to search blogs."
                );

                return;
            }


            if (!blogList) {
                return;
            }


            blogList.innerHTML = "";


            if (
                !Array.isArray(blogs) ||
                blogs.length === 0
            ) {

                blogList.innerHTML =
                    "<p>No blogs found.</p>";

                return;
            }


            blogs.forEach(
                function (blog) {

                    const article =
                        document.createElement(
                            "article"
                        );


                    const authorName =
                        blog.author &&
                        blog.author.name
                            ? blog.author.name
                            : "Unknown";


                    article.className =
                        "blog-card";


                    article.innerHTML = `

                        <h3>
                            <a
                                href="view-blog.html?id=${blog._id}"
                            >
                                ${escapeHTML(
                                    blog.title
                                )}
                            </a>
                        </h3>

                        <p>
                            <strong>Category:</strong>
                            ${escapeHTML(
                                blog.category ||
                                "General"
                            )}
                        </p>

                        <p>
                            <strong>Author:</strong>
                            ${escapeHTML(
                                authorName
                            )}
                        </p>

                        <p>
                            ${escapeHTML(
                                truncateText(
                                    blog.content,
                                    200
                                )
                            )}
                        </p>

                    `;


                    blogList.appendChild(
                        article
                    );
                }
            );


        } catch (error) {

            console.error(
                "SEARCH ERROR:",
                error
            );

            if (blogList) {

                blogList.innerHTML =
                    "<p>Unable to search blogs.</p>";
            }
        }
    }


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            searchBlogs
        );
    }


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    searchBlogs();
                }

            }
        );
    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            searchBlogs
        );
    }
}


// ======================================================
// HTML SECURITY HELPER
// ======================================================

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// TEXT TRUNCATION
// ======================================================

function truncateText(
    text,
    maxLength
) {

    if (!text) {
        return "";
    }


    if (
        text.length <= maxLength
    ) {

        return text;
    }


    return (
        text.substring(
            0,
            maxLength
        ) +
        "..."
    );
}


// ======================================================
// PAGE LOAD
// ======================================================

console.log(
    "✅ Blog Application script loaded successfully."
);