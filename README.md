# School Authentication API

A NestJS-based authentication and school management system with JWT authentication, user management, company management, course management, and module management.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-auth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_NAME=edusol_25

   # Application Configuration
   PORT=3000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h

   # Email Configuration (for password reset)
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_app_password
   ```

4. **Database Setup**
   - Create a MySQL database named `edusol_25` (or update the DB_NAME in .env)
   - The application will automatically create tables on startup (synchronize: true in development)

### Running the Application

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode
```bash
# Build the application
npm run build

# Start in production
npm run start:prod
```

#### Other Available Scripts
```bash
# Start with debugging
npm run start:debug

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```


## 📚 API Documentation

## 🔍 Pagination, Search & Filtering

All list endpoints (`/users`, `/course`, `/module`) now support advanced pagination, search, and filtering capabilities:

### Common Features
- **Pagination**: Default 10 items per page, configurable via `limit` parameter (max: 100)
- **Search**: Text-based search functionality
- **Filtering**: Status-based filtering (where applicable)
- **Sorting**: Results ordered by creation date (newest first)

### Response Format
All paginated endpoints return data in the following format:
```json
{
  "data": [...], // Array of items
  "meta": {
    "page": 1,           // Current page
    "limit": 10,         // Items per page
    "total": 50,         // Total items
    "totalPages": 5,     // Total pages
    "hasNext": true,     // Has next page
    "hasPrevious": false // Has previous page
  }
}
```

### Performance Considerations
- Database queries are optimized with proper indexing
- Maximum limit of 100 items per page to prevent performance issues
- Efficient pagination using `skip()` and `take()` methods
- Left joins for related data to avoid N+1 queries



### Authentication Endpoints

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "role": "user"
  }
}
```

#### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "role": "user" // optional: "user" or "admin"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "role": "user"
  }
}
```

#### POST `/auth/forgot-password`
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST `/auth/reset-password?token=<reset_token>`
Reset password with token.

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

#### POST `/auth/change-password`
Change password (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### User Management Endpoints

#### GET `/users`
Get all users with pagination, search, and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by email or username

**Example Requests:**
```
GET /users?page=1&limit=10
GET /users?search=john&page=1
GET /users?search=john@example.com&page=1&limit=5
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "company_id": 1,
      "company": { "id": 1, "name": "Tech Corp" },
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### POST `/users`
Create a new user.

**Request Body:**
```json
{
  "username": "username",
  "password": "password123",
  "email": "user@example.com",
  "role": "user", // optional: "user" or "admin"
  "company_id": 1 // optional
}
```

#### GET `/users/:id`
Get user by ID.

#### PATCH `/users/:id`
Update user by ID.

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "role": "admin"
}
```

#### DELETE `/users/:id`
Delete user by ID.

### Company Management Endpoints

#### GET `/company`
Get all companies.

#### POST `/company`
Create a new company.

**Request Body:**
```json
{
  "name": "Company Name",
  "logo": "logo_url", // optional
  "email": "company@example.com",
  "phone": "+1234567890", // optional
  "website": "https://company.com" // optional
}
```

#### GET `/company/:id`
Get company by ID.

#### PATCH `/company/:id`
Update company by ID.

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "email": "updated@example.com",
  "phone": "+9876543210"
}
```

#### DELETE `/company/:id`
Delete company by ID.

### Course Management Endpoints

#### GET `/course`
Get all courses with pagination, search, and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by course title
- `status` (optional): Filter by status (0 or 1)

**Example Requests:**
```
GET /course?page=1&limit=10
GET /course?search=javascript&page=1
GET /course?status=1&page=1&limit=5
GET /course?search=react&status=1&page=2
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "JavaScript Fundamentals",
      "description": "Learn JavaScript basics",
      "volume": 40,
      "coefficient": 0.2,
      "status": 1,
      "company_id": 1,
      "company": { "id": 1, "name": "Tech Corp" },
      "modules": [...],
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### POST `/course`
Create a new course.

**Request Body:**
```json
{
  "name": "Course Name",
  "description": "Course description",
  "duration": 120 // in minutes
}
```

#### GET `/course/:id`
Get course by ID.

#### PATCH `/course/:id`
Update course by ID.

**Request Body:**
```json
{
  "name": "Updated Course Name",
  "description": "Updated description",
  "duration": 180
}
```

#### DELETE `/course/:id`
Delete course by ID.

#### POST `/course/:id/modules/:moduleId`
Add module to course.

#### DELETE `/course/:id/modules/:moduleId`
Remove module from course.

### Module Management Endpoints

#### GET `/module`
Get all modules with pagination, search, and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by module title
- `status` (optional): Filter by status (0 or 1)

**Example Requests:**
```
GET /module?page=1&limit=10
GET /module?search=react&page=1
GET /module?status=1&page=1&limit=5
GET /module?search=node&status=1&page=2
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "React Fundamentals",
      "description": "Learn React basics",
      "volume": 30,
      "coefficient": 0.1,
      "status": 1,
      "company_id": 1,
      "company": { "id": 1, "name": "Tech Corp" },
      "courses": [...],
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### POST `/module`
Create a new module.

**Request Body:**
```json
{
  "name": "Module Name",
  "description": "Module description",
  "duration": 60 // in minutes
}
```

#### GET `/module/:id`
Get module by ID.

#### PATCH `/module/:id`
Update module by ID.

**Request Body:**
```json
{
  "name": "Updated Module Name",
  "description": "Updated description",
  "duration": 90
}
```

#### DELETE `/module/:id`
Delete module by ID.

#### POST `/module/:id/courses/:courseId`
Add course to module.

#### DELETE `/module/:id/courses/:courseId`
Remove course from module.

### General Endpoints

#### GET `/`
Get application status.

**Response:**
```json
"Hello World!"
```

#### GET `/profile`
Get user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "This is a protected route",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

## 🔐 Authentication

Most endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🛠️ Technology Stack

- **Framework:** NestJS
- **Database:** MySQL with TypeORM
- **Authentication:** JWT with Passport
- **Validation:** Class Validator
- **Email:** Nodemailer
- **Password Hashing:** bcrypt

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data Transfer Objects
│   ├── guards/          # JWT Auth Guard
│   └── strategies/      # JWT Strategy
├── company/             # Company management
├── course/              # Course management
├── module/              # Module management
├── users/               # User management
├── mail/                # Email service
├── app.module.ts        # Main application module
└── main.ts              # Application entry point
```

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_USERNAME` | Database username | root |
| `DB_PASSWORD` | Database password | (empty) |
| `DB_NAME` | Database name | edusol_25 |
| `PORT` | Application port | 3000 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRES_IN` | JWT expiration | 24h |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


