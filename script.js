// ==================== LOGIN ====================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email =
            loginForm.querySelector('input[type="email"]').value;

        const password =
            loginForm.querySelector('input[type="password"]').value;

        if (email === "" || password === "") {

            alert("Please enter your email and password.");
            return;

        }

        try {

            const response = await fetch(
                "http://localhost:3001/api/login",
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

                alert(data.message);

            } else {

                alert(data.message);

            }

        } catch (error) {

            alert("Unable to connect to the server.");

        }

    });

}


// ==================== REGISTER ====================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name =
            registerForm.querySelector('input[type="text"]').value;

        const email =
            registerForm.querySelector('input[type="email"]').value;

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
            return;

        }


        if (password !== confirmPassword) {

            alert("Passwords do not match.");
            return;

        }


        try {

            const response = await fetch(
                "http://localhost:3001/api/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                alert(data.message);

                registerForm.reset();

                window.location.href = "login.html";

            } else {

                alert(data.message);

            }

        } catch (error) {

            alert("Unable to connect to the server.");

        }

    });

}


// ==================== CREATE BLOG ====================

const blogForm = document.getElementById("blogForm");

if (blogForm) {

    blogForm.addEventListener("submit", async function(event) {

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


        try {

            const response = await fetch(
                "http://localhost:3001/api/blogs",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        title: title,

                        content: content,

                        author: "Devi"

                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                alert(data.message);

                blogForm.reset();

                window.location.href = "dashboard.html";

            } else {

                alert(data.message);

            }

        } catch (error) {

            alert("Unable to connect to the server.");

        }

    });

}


// ==================== DASHBOARD ====================

const blogList = document.getElementById("blogList");

if (blogList) {

    async function loadBlogs() {

        try {

            const response = await fetch(
                "http://localhost:3001/api/blogs"
            );

            const blogs = await response.json();

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
                        ${blog.category || "General"}
                    </p>

                    <p>
                        <strong>Author:</strong>
                        ${blog.author}
                    </p>

                    <p>${blog.content}</p>

                `;


                blogList.appendChild(article);

            });

        } catch (error) {

            blogList.innerHTML =
                "<p>Unable to load blogs from the server.</p>";

        }

    }


    loadBlogs();

}


// ==================== VIEW BLOG ====================

const blogView = document.getElementById("blogView");

if (blogView) {

    const params =
        new URLSearchParams(window.location.search);

    const index =
        params.get("index");


    async function loadBlog() {

        try {

            const response = await fetch(
                "http://localhost:3001/api/blogs"
            );

            const blogs = await response.json();


            if (index !== null && blogs[index]) {

                const blog = blogs[index];


                blogView.innerHTML = `

                    <h2>${blog.title}</h2>

                    <p>
                        <strong>Author:</strong>
                        ${blog.author}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${blog.category || "General"}
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

        } catch (error) {

            blogView.innerHTML = `

                <h2>Error</h2>

                <p>Unable to load the blog.</p>

            `;

        }

    }


    loadBlog();

}