# Quick Start Guide

This guide will help you get the Task Management API up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed
- Git installed

## Setup Steps

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd code-inbound

# Run automated setup
npm run setup
```

The setup script will:

- Create your `.env` file
- Install dependencies

- Generate secure JWT secrets

### 2. Start the Application

```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000`

Swagger docs: `http://localhost:3000/api`

### 3. Test the API

#### Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!"
  }'
```

You'll receive an access token in the response.

#### Create a Task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Task",
    "description": "This is a test task",
    "status": "TODO"
  }'
```

#### Get All Tasks

```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Using Swagger UI

1. Open browser to `http://localhost:3000/api`
2. Click "Authorize" button
3. Enter your JWT token: `Bearer YOUR_TOKEN_HERE`
4. Now you can test all endpoints interactively!

## Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## Common Issues

### Database Connection Failed

**Problem**: Cannot connect to PostgreSQL

**Solutions**:

```bash
# Check if port 5432 is available
netstat -an | grep 5432

# Verify .env file has correct database credentials
cat .env
```

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**: Change the port in `.env`

```env
PORT=3001
```

### JWT Token Invalid

**Problem**: Getting 401 Unauthorized errors

**Solutions**:

1. Check if token is expired (default: 1 hour)
2. Login again to get a new token
3. Verify you're using the format: `Bearer YOUR_TOKEN`

## Next Steps

- Explore the [API Documentation](http://localhost:3000/api)
- Read the full [README.md](README.md)
- Check out [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Review the code in `src/` folder

## Get Help

- Check the [README](README.md) for detailed documentation
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub for bugs or questions

Happy coding! 🚀
