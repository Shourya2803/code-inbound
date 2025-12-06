# Task Management API

A production-ready REST API built with NestJS, TypeORM, PostgreSQL, and JWT authentication. This application demonstrates best practices for building scalable backend services with comprehensive CRUD operations, role-based authorization, and extensive test coverage.

## 🚀 Tech Stack

- **Framework**: NestJS (latest stable)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator + class-transformer
- **Testing**: Jest (unit and E2E tests)
- **Documentation**: Swagger/OpenAPI
- **Version Control**: Git

## 📋 Features

### Authentication & Authorization

- ✅ JWT-based authentication with bcrypt password hashing
- ✅ User registration and login endpoints
- ✅ Role-based access control (USER, ADMIN)
- ✅ Ownership-based authorization for resources
- ✅ Protected routes using guards and decorators

### Task Management (CRUD)

- ✅ Create tasks with validation
- ✅ List tasks with pagination and filtering
- ✅ Get individual task details
- ✅ Update tasks (partial updates supported)
- ✅ Soft delete tasks
- ✅ Search functionality
- ✅ Status filtering (TODO, IN_PROGRESS, DONE)

### Data Validation & Error Handling

- ✅ Global validation pipe with strict rules
- ✅ Custom exception filter for standardized error responses
- ✅ Comprehensive DTO validation
- ✅ Meaningful HTTP status codes (201, 200, 204, 400, 401, 403, 404, 409, 500)

### Code Quality

- ✅ Modular architecture with clear separation of concerns
- ✅ Service layer for business logic
- ✅ Repository pattern via TypeORM
- ✅ ESLint and Prettier configuration
- ✅ TypeScript strict mode

## 🏗️ Project Structure

```
code-inbound/
├── src/
│   ├── auth/                      # Authentication module
│   │   ├── decorators/            # Custom decorators (@GetUser, @Roles)
│   │   ├── dto/                   # Auth DTOs (register, login)
│   │   ├── guards/                # Auth guards (JWT, Roles)
│   │   ├── strategies/            # Passport strategies (JWT)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── tasks/                     # Tasks module (main CRUD resource)
│   │   ├── dto/                   # Task DTOs (create, update, filter)
│   │   ├── entities/              # Task entity
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   ├── tasks.module.ts
│   │   ├── tasks.controller.spec.ts
│   │   └── tasks.service.spec.ts
│   ├── users/                     # Users module
│   │   └── entities/              # User entity
│   ├── common/                    # Shared resources
│   │   ├── enums/                 # Enums (UserRole, TaskStatus)
│   │   └── filters/               # Exception filters
│   ├── config/                    # Configuration files
│   │   └── typeorm.config.ts      # TypeORM CLI configuration
│   ├── migrations/                # Database migrations
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Application entry point
├── test/
│   ├── app.e2e-spec.ts           # E2E tests
│   └── jest-e2e.json             # E2E test configuration
├── .env.example                   # Environment variables template
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Git

## 📦 Installation

### Quick Start (Recommended)

Run the automated setup script:

```bash
npm run setup
```

This will:

- Create your `.env` file with prompts
- Install all dependencies
- Generate secure JWT secrets

### Manual Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd code-inbound
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file and update with your values:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   NODE_ENV=development
   PORT=3000

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password_here
   DB_DATABASE=code_inbound

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRATION=1h
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
   JWT_REFRESH_EXPIRATION=7d
   ```

4. **Set up the database**

   Create a PostgreSQL database:

   ```bash
   createdb code_inbound
   ```

   Or using SQL:

   ```sql
   CREATE DATABASE code_inbound;
   ```

5. **Run database migrations** (Optional - synchronize is enabled in dev mode)

   Generate migration:

   ```bash
   npm run migration:generate -- src/migrations/InitialMigration
   ```

   Run migrations:

   ```bash
   npm run migration:run
   ```

## 🚀 Running the Application

### Development Mode

```bash
npm run start:dev
```

The application will start on `http://localhost:3000`

Access Swagger documentation at: `http://localhost:3000/api`

### Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Run Unit Tests with Coverage

```bash
npm run test:cov
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## 📚 API Documentation

### Interactive Documentation

Access Swagger UI at `http://localhost:3000/api` for interactive API testing.

### Postman Collection

Import the `postman_collection.json` file into Postman for pre-configured API requests:

1. Open Postman
2. Click Import
3. Select `postman_collection.json`
4. Start testing!

The collection includes:

- Automatic token management
- All API endpoints
- Example request bodies
- Environment variables

### Authentication Endpoints

#### Register a New User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "Password123!"
}

Response: 201 Created
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "USER",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Task Endpoints (Protected)

All task endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

#### Create a Task

```http
POST /tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "TODO"
}

Response: 201 Created
```

#### Get All Tasks (with pagination and filtering)

```http
GET /tasks?page=1&limit=10&status=TODO&search=documentation
Authorization: Bearer <token>

Response: 200 OK
{
  "data": [...],
  "total": 25
}
```

#### Get a Single Task

```http
GET /tasks/:id
Authorization: Bearer <token>

Response: 200 OK
```

#### Update a Task (Partial)

```http
PATCH /tasks/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "IN_PROGRESS"
}

Response: 200 OK
```

#### Delete a Task (Soft Delete)

```http
DELETE /tasks/:id
Authorization: Bearer <token>

Response: 204 No Content
```

## 🔐 Authentication & Authorization Model

### User Roles

- **USER**: Default role for registered users
  - Can create, read, update, and delete their own tasks
  - Cannot access other users' tasks
- **ADMIN**: Administrative role
  - Can access and manage all tasks
  - Full system access

### Ownership-Based Authorization

- Regular users can only access their own tasks
- Attempting to access another user's task returns `403 Forbidden`
- Admins bypass ownership checks

### Password Security

- Passwords are hashed using bcrypt with salt
- Minimum password length: 8 characters
- Only hashed passwords are stored in the database

## 🗄️ Database Schema

### Users Table

```sql
- id (UUID, Primary Key)
- email (VARCHAR, Unique)
- username (VARCHAR)
- password (VARCHAR, Hashed)
- role (ENUM: USER, ADMIN)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Tasks Table

```sql
- id (UUID, Primary Key)
- title (VARCHAR)
- description (TEXT, Nullable)
- status (ENUM: TODO, IN_PROGRESS, DONE)
- ownerId (UUID, Foreign Key -> Users)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- deletedAt (TIMESTAMP, Nullable) -- Soft delete
```

### Relationships

- User **1:N** Task (One user can have many tasks)

## 🛡️ Security Considerations

1. **Environment Variables**: Never commit `.env` files. Use `.env.example` as a template.
2. **JWT Secret**: Use a strong, random secret in production (min 32 characters).
3. **Password Hashing**: Bcrypt with automatic salt generation.
4. **SQL Injection**: TypeORM parameterized queries prevent SQL injection.
5. **Input Validation**: All inputs validated using class-validator.
6. **CORS**: Enabled but should be configured for specific origins in production.

## 📝 Validation Rules

### Register DTO

- `email`: Must be a valid email format
- `username`: Required string
- `password`: Minimum 8 characters

### Task DTOs

- `title`: Required, non-empty string
- `description`: Optional string
- `status`: Must be one of: TODO, IN_PROGRESS, DONE

### Filter DTO

- `search`: Optional string (searches title and description)
- `status`: Optional enum value
- `page`: Optional integer, minimum 1, default 1
- `limit`: Optional integer, minimum 1, default 10

## 🐛 Error Response Format

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "BadRequestException",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/tasks"
}
```

## 🧹 Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## 📦 Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Disable `synchronize` in TypeORM configuration (already configured)
3. Use migrations for schema changes
4. Set strong JWT secrets
5. Configure CORS for specific origins
6. Use environment-specific configuration
7. Enable database connection pooling
8. Set up logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## 🙏 Acknowledgments

- NestJS for the amazing framework
- TypeORM for the powerful ORM
- The open-source community

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This is a demo application showcasing best practices for NestJS development. Before deploying to production, ensure you have proper security measures, monitoring, and infrastructure in place.
