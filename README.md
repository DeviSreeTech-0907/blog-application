# Full Stack Blog Application

A full-stack blog application where users can register, log in securely, and create and manage their own blog posts.

## Features

* User Registration
* User Login
* JWT Authentication
* Password Hashing with bcrypt
* Protected Routes
* User-specific Dashboard
* Create Blog
* View Blog
* Edit Blog
* Delete Blog
* Search Blogs
* Category Filtering
* User Profile
* MongoDB Database
* REST API
* Responsive Design

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Security

* JSON Web Token (JWT)
* bcryptjs
* CORS
* dotenv

## Project Structure

```text
Blog-Application/
│
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── create-blog.html
├── view-blog.html
├── profile.html
├── style.css
├── script.js
├── README.md
│
└── backend/
    ├── server.js
    ├── package.json
    ├── package-lock.json
    └── .env
```

> The `.env` file contains sensitive information and must not be uploaded to GitHub.

## Authentication

The application uses JWT-based authentication.

1. A user registers with their name, email, and password.
2. The password is hashed using bcrypt.
3. The user logs in with their credentials.
4. The server generates a JWT token.
5. The token is stored in the browser.
6. Protected requests send the token in the Authorization header.
7. The backend verifies the token before allowing access.

## Blog Management

Authenticated users can:

* Create blogs
* View their blogs
* Search blogs
* Filter blogs by category
* Edit their blogs
* Delete their blogs

Each blog is connected to the user who created it.

## Database

MongoDB is used to store user and blog information.

### User Data

* Name
* Email
* Hashed Password

### Blog Data

* Title
* Category
* Content
* Author
* User ID
* Created and Updated timestamps

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/DeviSreeTech-0907/blog-application.git
```

### 2. Open the project

```bash
cd blog-application
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Create the environment file

Create a `.env` file inside the `backend` folder:

```text
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Never upload your actual `.env` file or secret values to GitHub.

### 5. Start the backend

```bash
node server.js
```

The backend runs locally on:

```text
http://localhost:3001
```

## API Endpoints

| Method | Endpoint         | Purpose          |
| ------ | ---------------- | ---------------- |
| POST   | `/api/register`  | Register a user  |
| POST   | `/api/login`     | Login            |
| GET    | `/api/profile`   | Get user profile |
| POST   | `/api/blogs`     | Create a blog    |
| GET    | `/api/blogs`     | Get user's blogs |
| GET    | `/api/blogs/:id` | Get one blog     |
| PUT    | `/api/blogs/:id` | Update a blog    |
| DELETE | `/api/blogs/:id` | Delete a blog    |

## Security

The application uses:

* bcrypt password hashing
* JWT authentication
* Protected API routes
* User-specific blog access
* Authorization checks
* Environment variables for sensitive configuration

## Responsive Design

The application is designed to work across:

* Desktop
* Tablet
* Mobile devices

## Future Improvements

* Blog image uploads
* Rich text editor
* Comments
* Likes
* Password reset
* Advanced search
* Admin dashboard
* Production deployment

## Author

**Devi Sree**

GitHub: https://github.com/DeviSreeTech-0907

## License

This project is created for learning and educational purposes.
