# Troubleshooting Guide

This guide helps you resolve common issues when setting up or running the Task Management API.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Testing Issues](#testing-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)

---

## Installation Issues

### Problem: `npm install` fails

**Symptoms:**

- Error messages during dependency installation
- Missing packages

**Solutions:**

1. **Clear npm cache**

   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version**

   ```bash
   node --version  # Should be 18.x or higher
   npm --version
   ```

3. **Use specific npm version**

   ```bash
   npm install -g npm@latest
   ```

4. **Try with legacy peer deps**
   ```bash
   npm install --legacy-peer-deps
   ```

---

## Database Issues

### Problem: Cannot connect to PostgreSQL

**Symptoms:**

- `ECONNREFUSED` error
- `Connection terminated unexpectedly`
- `password authentication failed`

**Solutions:**

1. **Check if PostgreSQL is running**

   ```bash
   # Windows
   Get-Service -Name postgresql*

   # Linux/Mac
   sudo service postgresql status
   ```

2. **Verify database credentials in .env**

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=code_inbound
   ```

3. **Check if port 5432 is available**

   ```bash
   # Windows
   netstat -an | findstr 5432

   # Linux/Mac
   lsof -i :5432
   ```

4. **Restart PostgreSQL**

   ```bash
   # Windows
   Restart-Service postgresql*

   # Linux/Mac
   sudo service postgresql restart
   ```

5. **Create database if it doesn't exist**
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE code_inbound;
   \q
   ```

### Problem: Migration errors

**Symptoms:**

- Migration fails to run
- Schema drift detected

**Solutions:**

1. **Check migration files**

   ```bash
   ls src/migrations/
   ```

2. **Reset database (DEVELOPMENT ONLY)**

   ```bash
   # Drop and recreate database using PostgreSQL client
   # Connect to PostgreSQL and run:
   # DROP DATABASE code_inbound;
   # CREATE DATABASE code_inbound;
   npm run migration:run
   ```

3. **Revert last migration**
   ```bash
   npm run migration:revert
   ```

---

## Authentication Issues

### Problem: JWT token invalid or expired

**Symptoms:**

- `401 Unauthorized` responses
- "Invalid or expired token" error

**Solutions:**

1. **Check token expiration**
   - Default expiration is 1 hour
   - Login again to get a new token

2. **Verify JWT secret in .env**

   ```env
   JWT_SECRET=your_secret_here
   JWT_EXPIRATION=1h
   ```

3. **Check Authorization header format**

   ```bash
   # Correct format
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # NOT
   Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Restart the application after changing JWT_SECRET**
   ```bash
   # Ctrl+C to stop
   npm run start:dev
   ```

### Problem: Password validation fails

**Symptoms:**

- "Password must be at least 8 characters long"
- Validation error on registration

**Solutions:**

1. **Check password requirements**
   - Minimum 8 characters
   - Use a strong password

2. **Example valid password**
   ```json
   {
     "password": "Password123!"
   }
   ```

---

## Testing Issues

### Problem: Tests fail

**Symptoms:**

- Test suite fails
- Timeout errors
- Database connection errors in tests

**Solutions:**

1. **Clear Jest cache**

   ```bash
   npm test -- --clearCache
   npm test
   ```

2. **Run specific test file**

   ```bash
   npm test -- tasks.service.spec.ts
   ```

3. **Check if test database exists (for E2E tests)**

   ```bash
   # Create test database
   createdb code_inbound_test
   ```

4. **Run tests with verbose output**

   ```bash
   npm test -- --verbose
   ```

5. **Check for port conflicts**
   - E2E tests might conflict with running dev server
   - Stop dev server before running E2E tests

### Problem: E2E tests timeout

**Symptoms:**

- Tests hang indefinitely
- Timeout after 5 seconds

**Solutions:**

1. **Increase timeout in jest-e2e.json**

   ```json
   {
     "testTimeout": 30000
   }
   ```

2. **Check if database is accessible**

   ```bash

   ```

3. **Ensure no other instance is running**

   ```bash
   # Kill any running instances on port 3000
   # Windows
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   ```

---

## Build Issues

### Problem: TypeScript compilation errors

**Symptoms:**

- `tsc` errors
- Type errors
- Module not found

**Solutions:**

1. **Check tsconfig.json**
   - Ensure it matches the provided configuration

2. **Clear dist folder**

   ```bash
   rm -rf dist
   npm run build
   ```

3. **Install missing types**

   ```bash
   npm install --save-dev @types/node @types/bcrypt @types/passport-jwt
   ```

4. **Check for syntax errors**
   ```bash
   npm run lint
   ```

### Problem: Module resolution errors

**Symptoms:**

- "Cannot find module" errors
- Import errors

**Solutions:**

1. **Check import paths**

   ```typescript
   // Correct
   import { User } from '../users/entities/user.entity';

   // Incorrect
   import { User } from '@/users/entities/user.entity';
   ```

2. **Verify paths in tsconfig.json**

3. **Reinstall dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## Runtime Issues

### Problem: Port 3000 already in use

**Symptoms:**

- `EADDRINUSE: address already in use :::3000`

**Solutions:**

1. **Change port in .env**

   ```env
   PORT=3001
   ```

2. **Kill process using port 3000**

   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F

   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   ```

### Problem: Application crashes on startup

**Symptoms:**

- App exits immediately
- Error in console

**Solutions:**

1. **Check .env file exists**

   ```bash
   ls .env
   ```

2. **Verify all required environment variables**

   ```bash
   npm run verify
   ```

3. **Check database connection**

   ```bash
   # Test database connectivity
   psql -h localhost -U postgres -d code_inbound
   ```

4. **Review error logs**
   - Check the error message in console
   - Look for missing dependencies
   - Verify database credentials

### Problem: Swagger UI not loading

**Symptoms:**

- `/api` returns 404
- Swagger page is blank

**Solutions:**

1. **Check if app is running**

   ```bash
   curl http://localhost:3000/health
   ```

2. **Verify Swagger is configured in main.ts**

3. **Try accessing different endpoints**

   ```bash
   # Should work
   http://localhost:3000/api
   http://localhost:3000/api-json
   ```

4. **Clear browser cache**
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - Try incognito mode

---

## Validation Issues

### Problem: Validation pipe rejecting valid data

**Symptoms:**

- 400 Bad Request for seemingly valid data
- "property should not exist" errors

**Solutions:**

1. **Check DTO definitions**
   - Ensure all fields are properly decorated
   - Check for typos in property names

2. **Verify request body format**

   ```json
   {
     "title": "Task Title",
     "description": "Description",
     "status": "TODO"
   }
   ```

3. **Check for extra fields**
   - ValidationPipe is configured with `forbidNonWhitelisted: true`
   - Only send fields defined in DTOs

### Problem: Enum validation fails

**Symptoms:**

- "status must be a valid enum value"

**Solutions:**

1. **Check valid enum values**

   ```typescript
   // TaskStatus enum
   TODO | IN_PROGRESS | DONE;

   // UserRole enum
   USER | ADMIN;
   ```

2. **Use exact enum values**
   ```json
   {
     "status": "TODO"
   }
   ```

---

## Getting More Help

If you still have issues:

1. **Run verification script**

   ```bash
   npm run verify
   ```

2. **Check logs**
   - Application logs in console
   - Database logs: Check PostgreSQL log files

3. **Review documentation**
   - [README.md](README.md)
   - [QUICKSTART.md](QUICKSTART.md)
   - [CONTRIBUTING.md](CONTRIBUTING.md)

4. **Check environment**

   ```bash
   node --version
   npm --version
   ```

5. **Create an issue**
   - Include error messages
   - Include steps to reproduce
   - Include environment details

---

## Quick Fixes Checklist

Before creating an issue, try these:

- [ ] Run `npm run verify` to check setup
- [ ] Clear npm cache: `npm cache clean --force`
- [ ] Reinstall dependencies: `rm -rf node_modules && npm install`
- [ ] Restart PostgreSQL service
- [ ] Check .env file exists and has correct values
- [ ] Verify database is running (check PostgreSQL service status)
- [ ] Check port availability: `netstat -an | grep 3000`
- [ ] Clear build: `rm -rf dist && npm run build`
- [ ] Review error messages carefully
- [ ] Check that Node.js version is 18+ : `node --version`

---

**Still stuck?** Open an issue on GitHub with:

- Error message
- Steps to reproduce
- Environment (OS, Node version, etc.)
- What you've tried
