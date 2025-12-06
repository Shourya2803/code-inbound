# Contributing to Task Management API

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Keep discussions professional

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Add upstream remote: `git remote add upstream <original-repo-url>`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Before You Start

1. Ensure you have the latest code:

   ```bash
   git checkout main
   git pull upstream main
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment:

   ```bash
   cp .env.example .env
   # Update .env with your local configuration
   ```

4. Start the database:
   - Ensure PostgreSQL is installed and running
   - Create database: `CREATE DATABASE code_inbound;`

### Making Changes

1. **Write Clean Code**
   - Follow the existing code style
   - Use meaningful variable and function names
   - Keep functions small and focused
   - Add comments for complex logic

2. **Follow TypeScript Best Practices**
   - Use proper typing (avoid `any`)
   - Leverage interfaces and types
   - Use enums for constant values

3. **Maintain Code Quality**
   - Run linting: `npm run lint`
   - Format code: `npm run format`
   - Fix lint errors before committing

### Testing Requirements

All contributions must include appropriate tests:

1. **Unit Tests** (Required)
   - Test all service methods
   - Test controller endpoints
   - Aim for >80% code coverage
   - Run tests: `npm test`

2. **E2E Tests** (Recommended)
   - Test complete user flows
   - Test error scenarios
   - Run E2E tests: `npm run test:e2e`

3. **Test Coverage**
   ```bash
   npm run test:cov
   ```

### Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(auth): add refresh token functionality
fix(tasks): resolve pagination issue with filters
docs(readme): update installation instructions
test(tasks): add unit tests for update method
```

### Pull Request Process

1. **Update your branch**

   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run all checks**

   ```bash
   npm run lint
   npm run format
   npm test
   npm run test:e2e
   ```

3. **Push your changes**

   ```bash
   git push origin your-feature-branch
   ```

4. **Create Pull Request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changed and why
   - Include screenshots for UI changes
   - List breaking changes if any

5. **PR Template**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   - [ ] Unit tests pass
   - [ ] E2E tests pass
   - [ ] Manual testing completed

   ## Checklist

   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests added/updated
   ```

## Coding Standards

### TypeScript/NestJS

1. **Module Structure**

   ```
   module/
   ├── dto/
   ├── entities/
   ├── module.controller.ts
   ├── module.service.ts
   ├── module.module.ts
   ├── module.controller.spec.ts
   └── module.service.spec.ts
   ```

2. **Naming Conventions**
   - Files: `kebab-case.ts`
   - Classes: `PascalCase`
   - Functions/Methods: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`
   - Interfaces: `PascalCase` (prefix with `I` if needed)

3. **DTOs**
   - Use class-validator decorators
   - Include Swagger decorators
   - Validate all inputs

4. **Services**
   - Keep business logic in services
   - Use dependency injection
   - Handle errors appropriately
   - Return meaningful error messages

5. **Controllers**
   - Keep controllers thin
   - Use proper HTTP methods
   - Return appropriate status codes
   - Add Swagger documentation

### Database

1. **Entities**
   - Use TypeORM decorators properly
   - Define relationships clearly
   - Use appropriate column types
   - Add indexes for performance

2. **Migrations**
   - Never modify existing migrations
   - Test migrations up and down
   - Use descriptive names
   - Include rollback logic

### Security

1. **Never commit**
   - `.env` files
   - API keys or secrets
   - Database credentials
   - Private keys

2. **Always**
   - Validate all inputs
   - Hash passwords
   - Use parameterized queries
   - Implement rate limiting (for production)

## Documentation

1. **Code Comments**
   - Explain "why" not "what"
   - Document complex algorithms
   - Add JSDoc for public APIs

2. **README Updates**
   - Update for new features
   - Keep examples current
   - Update API documentation

3. **Swagger/OpenAPI**
   - Document all endpoints
   - Include request/response examples
   - Describe error responses

## Common Issues

### TypeScript Errors

```bash
# Clear build cache
rm -rf dist

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

```bash
# Check if PostgreSQL service is running
# Windows: Get-Service -Name postgresql*
# Linux/Mac: sudo service postgresql status

# Restart database service
# Windows: Restart-Service postgresql*
# Linux/Mac: sudo service postgresql restart
```

### Test Failures

```bash
# Run specific test file
npm test -- tasks.service.spec.ts

# Run tests in watch mode
npm run test:watch

# Clear Jest cache
npm test -- --clearCache
```

## Questions?

- Check existing issues and PRs
- Read the documentation
- Ask in pull request comments
- Open a discussion for general questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
