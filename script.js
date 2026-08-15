// ==================== LOGIN ====================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        if (email === "" || password === "") {

            alert("Please enter your email and password.");

        } else {

            alert("Login successful!");

        }

    });

}


// ==================== REGISTER ====================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = registerForm.querySelector('input[type="text"]').value;
        const email = registerForm.querySelector('input[type="email"]').value;

        const passwords =
            registerForm.querySelectorAll('input[type="password"]');

        const password = passwords[0].value;
        const confirmPassword = passwords[1].value;

        if (
            name === "" ||
            email === "" ||
            password === "" ||
            confirmPassword === ""
        ) {

            alert("Please fill in all fields.");

        } else if (password !== confirmPassword) {

            alert("Passwords do not match.");

        } else {

            alert("Registration successful!");

        }

    });

}


// ==================== CREATE / EDIT BLOG ====================

const blogForm = document.getElementById("blogForm");

const editIndex = localStorage.getItem("editIndex");

if (blogForm) {

    // If editing an existing blog
    if (editIndex !== null) {

        const blogs = JSON.parse(localStorage.getItem("blogs")) || [];
        const blog = blogs[editIndex];

        if (blog) {

            blogForm.querySelector('input[type="text"]').value =
                blog.title;

            blogForm.querySelector("select").value =
                blog.category;

            blogForm.querySelector("textarea").value =
                blog.content;

        }

    }


    // One submit event for both Create and Edit
    blogForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const title =
            blogForm.querySelector('input[type="text"]').value;

        const category =
            blogForm.querySelector("select").value;

        const content =
            blogForm.querySelector("textarea").value;


        if (
            title === "" ||
            category === "Select Category" ||
            content === ""
        ) {

            alert("Please fill in all blog details.");

            return;

        }


        let blogs =
            JSON.parse(localStorage.getItem("blogs")) || [];


        // EDIT BLOG
        if (editIndex !== null) {

            blogs[editIndex] = {

                title: title,
                category: category,
                content: content

            };

            localStorage.setItem(
                "blogs",
                JSON.stringify(blogs)
            );

            localStorage.removeItem("editIndex");

            alert("Blog updated successfully!");

            window.location.href = "dashboard.html";

        }


        // CREATE NEW BLOG
        else {

            const blog = {

                title: title,
                category: category,
                content: content

            };

            blogs.push(blog);

            localStorage.setItem(
                "blogs",
                JSON.stringify(blogs)
            );

            alert("Blog published successfully!");

            blogForm.reset();

        }

    });

}


// ==================== DASHBOARD ====================

const blogList = document.getElementById("blogList");

if (blogList) {

    let blogs =
        JSON.parse(localStorage.getItem("blogs")) || [];


    function displayBlogs() {

        blogList.innerHTML = "";


        if (blogs.length === 0) {

            blogList.innerHTML =
                "<p>No blogs created yet.</p>";

            return;

        }


        blogs.forEach(function(blog, index) {

            const article =
                document.createElement("article");


            article.innerHTML = `

                <h3>
                    <a href="view-blog.html?index=${index}">
                        ${blog.title}
                    </a>
                </h3>

                <p>
                    <strong>Category:</strong>
                    ${blog.category}
                </p>

                <p>${blog.content}</p>

                <button onclick="editBlog(${index})">
                    Edit
                </button>

                <button onclick="deleteBlog(${index})">
                    Delete
                </button>

            `;


            blogList.appendChild(article);

        });

    }


    displayBlogs();


    // DELETE BLOG

    window.deleteBlog = function(index) {

        blogs.splice(index, 1);

        localStorage.setItem(
            "blogs",
            JSON.stringify(blogs)
        );

        displayBlogs();

    };


    // EDIT BLOG

    window.editBlog = function(index) {

        localStorage.setItem(
            "editIndex",
            index
        );

        window.location.href =
            "create-blog.html";

    };

}


// ==================== VIEW BLOG ====================

const blogView = document.getElementById("blogView");

if (blogView) {

    const params =
        new URLSearchParams(window.location.search);

    const index =
        params.get("index");


    const blogs =
        JSON.parse(localStorage.getItem("blogs")) || [];


    if (index !== null && blogs[index]) {

        const blog = blogs[index];


        blogView.innerHTML = `

            <h2>${blog.title}</h2>

            <p>
                <strong>Category:</strong>
                ${blog.category}
            </p>

            <hr>

            <p>${blog.content}</p>

        `;

    } else {

        blogView.innerHTML = `

            <h2>Blog not found</h2>

            <p>This blog does not exist.</p>

        `;

    }

}