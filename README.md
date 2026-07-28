# RestaurantOS Backend

Production-ready initial backend project structure for **RestaurantOS** built with Node.js, Express.js, PostgreSQL, and Prisma ORM.

---

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma ORM

---

## 📁 Project Structure

```
restaurant-backend
│
├── src
│   ├── config          # Database & third-party configurations
│   ├── controllers     # Request handlers & HTTP responses
│   ├── middleware      # Custom Express middleware (auth, error handling, etc.)
│   ├── models          # Data access models
│   ├── repositories    # Database query abstraction layer
│   ├── routes          # Express API route definitions
│   ├── services        # Business logic layer
│   ├── validations     # Request validation schemas (express-validator)
│   ├── utils           # Utility functions & helpers
│   ├── constants       # Global constants & status codes
│   ├── uploads         # Local file upload storage
│   ├── app.js          # Express app configuration & middleware setup
│   └── server.js       # HTTP server initialization
│
├── prisma
│   └── schema.prisma   # Prisma schema configuration
│
├── .env                # Environment variables configuration
├── package.json        # Dependencies & NPM scripts
└── README.md           # Documentation
```

---

## 📦 Dependencies

### Core Dependencies
- `express` - Fast, unopinionated web framework for Node.js
- `cors` - Middleware to enable Cross-Origin Resource Sharing
- `dotenv` - Zero-dependency module to load environment variables
- `jsonwebtoken` - JSON Web Token implementation for authentication
- `bcrypt` - Library to hash passwords securely
- `multer` - Middleware for handling `multipart/form-data` (file uploads)
- `pg` - PostgreSQL client for Node.js
- `prisma` & `@prisma/client` - Next-generation ORM for Node.js & TypeScript
- `helmet` - Security headers middleware
- `morgan` - HTTP request logger middleware
- `cookie-parser` - Parse HTTP request cookies
- `express-validator` - String validators and sanitizers middleware
- `xlsx` - Parser and writer for spreadsheets

### Development Dependencies
- `nodemon` - Automatically restart server on code changes

---

## ⚙️ Getting Started

### 1. Installation

Install all project dependencies:

```bash
npm install
```

### 2. Environment Configuration

The project uses `.env` file for environment configurations. Adjust settings as required:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurantos?schema=public"
JWT_SECRET="restaurantos_super_secret_jwt_key_2026"
```

### 3. Running the Server

- **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```

- **Production Mode:**
  ```bash
  npm start
  ```

---

## 🏥 Health Endpoint

- **Route:** `GET /api/health`
- **Response:**
  ```json
  {
    "success": true,
    "message": "RestaurantOS Backend Running"
  }
  ```
