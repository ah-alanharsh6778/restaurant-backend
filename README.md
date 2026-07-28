# 🍽️ RestaurantOS Backend

Production-ready backend for **RestaurantOS – AI Powered Restaurant Management Platform**, built with **Node.js**, **Express.js**, **PostgreSQL**, and **Prisma ORM**. The backend provides secure REST APIs for restaurant operations including authentication, role-based access control, customer management, supplier management, AI invoice processing, inventory, orders, payments, reporting, and dashboard analytics.

---

# 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript Runtime |
| Express.js | REST API Framework |
| PostgreSQL | Relational Database |
| Prisma ORM | Database ORM |
| JWT | Authentication |
| BCrypt | Password Hashing |
| Multer | File Upload |
| Swagger | API Documentation |
| Express Validator | Request Validation |
| Morgan | Request Logging |
| Helmet | Security Headers |
| Cookie Parser | Cookie Management |
| XLSX | Excel Processing |

---

# 📁 Project Structure

```
restaurant-backend/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│
│   ├── config/
│   │   ├── database.js
│   │   ├── prisma.js
│   │   └── swagger.js
│   │
│   ├── controllers/
│   │
│   ├── middleware/
│   │
│   ├── models/
│   │
│   ├── repositories/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   ├── validations/
│   │
│   ├── utils/
│   │
│   ├── constants/
│   │
│   ├── uploads/
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

---

# 🏗️ Architecture

The backend follows a layered architecture for better scalability and maintainability.

```
Client

↓

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

Prisma ORM

↓

PostgreSQL
```

---

# ✨ Features

### Authentication

- JWT Authentication
- Secure Password Hashing
- Protected APIs
- Login & Registration

### User Management

- User CRUD
- Profile Management
- Account Status

### Role Based Access Control

- Roles
- Permissions
- Authorization Middleware

### Customer Management

- Customer CRUD
- Search
- Pagination

### Supplier Management

- Supplier CRUD
- Supplier Directory

### Expense Management

- Expense CRUD
- Expense Categories

### Restaurant Tables

- Table Management
- Occupancy Status

### Orders

- Order Creation
- Order Management
- Order Status

### AI Invoice Processing

- Invoice Upload
- OCR Processing
- AI Data Extraction
- Invoice Parsing
- Duplicate Detection
- Automatic Expense Creation

### Inventory

- Ingredients
- Stock Management

### Reports

- Dashboard Analytics
- Sales Reports
- Expense Reports

---

# 📦 Core Dependencies

- express
- prisma
- @prisma/client
- pg
- cors
- dotenv
- jsonwebtoken
- bcrypt
- multer
- helmet
- morgan
- cookie-parser
- express-validator
- xlsx

---

# 🛠️ Development Dependencies

- nodemon

---

# ⚙️ Installation

Clone the repository

```bash
git clone <repository-url>
```

Go to project directory

```bash
cd restaurant-backend
```

Install dependencies

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file.

```env
PORT=5000

NODE_ENV=development

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurantos?schema=public"

JWT_SECRET="restaurantos_super_secret_jwt_key_2026"
```

---

# 🗄️ Database Setup

Generate Prisma Client

```bash
npx prisma generate
```

Run Migrations

```bash
npx prisma migrate dev
```

---

# ▶️ Run Application

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

# 📖 API Documentation

Swagger Documentation

```
http://localhost:5000/api/docs
```

---

# 🏥 Health Check

### Endpoint

```
GET /api/health
```

### Response

```json
{
  "success": true,
  "message": "RestaurantOS Backend Running"
}
```

---

# 🔒 Security

- JWT Authentication
- Password Encryption
- Protected Routes
- Request Validation
- Security Headers
- Cookie Support

---

# 📊 Database

- PostgreSQL
- Prisma ORM
- Relational Database Design
- Migration Support

---

# 🚀 Deployment

The backend can be deployed on any Node.js-supported hosting platform.

Examples:

- Render
- Railway
- DigitalOcean
- AWS EC2
- Azure
- Docker

---

# 👨‍💻 Author

**Harsh Singh**

Java Full Stack Developer

---

# 📄 License

This project was developed as part of the **RestaurantOS – AI Powered Restaurant Management Platform** technical assessment.
