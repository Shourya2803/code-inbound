# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-05

### Added

- Initial release
- JWT authentication with bcrypt password hashing
- User registration and login endpoints
- Role-based authorization (USER, ADMIN)
- Task CRUD operations with ownership-based access control
- Pagination and filtering for task listings
- Search functionality for tasks
- Soft delete for tasks
- Global validation pipe with class-validator
- Custom exception filter for standardized error responses
- Swagger/OpenAPI documentation
- Unit tests for services and controllers
- E2E tests for auth and CRUD operations
- PostgreSQL database with TypeORM
- Comprehensive README with setup instructions
- Contributing guidelines
- Health check endpoint
- Database migrations support
- ESLint and Prettier configuration
- GitHub Actions CI/CD workflow

### Security

- Passwords hashed with bcrypt
- JWT token-based authentication
- Input validation on all endpoints
- SQL injection prevention via TypeORM
- CORS enabled (configure for production)

### Documentation

- Complete API documentation via Swagger
- Detailed README with examples
- Contributing guidelines
- Code comments for complex logic
- JSDoc for public methods
