# Deployment Guide

This guide provides instructions for deploying the Task Management API to production environments.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Deployment Options](#deployment-options)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests pass (`npm test` and `npm run test:e2e`)
- [ ] Code is linted and formatted (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables are configured
- [ ] Database migrations are ready
- [ ] Security review completed
- [ ] Dependencies are up to date (`npm audit`)
- [ ] Documentation is current

---

## Environment Configuration

### Production Environment Variables

Create a production `.env` file with secure values:

```env
# Application
NODE_ENV=production
PORT=3000

# Database (use your production database)
DB_HOST=your-production-db-host.com
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-db-password
DB_DATABASE=code_inbound_prod

# JWT (GENERATE NEW SECRETS - DO NOT USE DEFAULTS)
JWT_SECRET=use-a-long-random-string-at-least-32-characters-for-production
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=another-long-random-string-different-from-jwt-secret
JWT_REFRESH_EXPIRATION=7d

# Optional: Logging
LOG_LEVEL=error
```

### Generate Secure Secrets

```bash
# Generate random secrets (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

### Important Security Notes

1. **Never commit production .env files**
2. **Use different secrets for each environment**
3. **Rotate secrets periodically**
4. **Use environment variable management services** (AWS Secrets Manager, Azure Key Vault, etc.)

---

## Database Setup

### 1. Create Production Database

```sql
-- Connect to PostgreSQL
psql -U postgres -h your-db-host

-- Create database
CREATE DATABASE code_inbound_prod;

-- Create user (if needed)
CREATE USER app_user WITH ENCRYPTED PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE code_inbound_prod TO app_user;
```

### 2. Run Migrations

**IMPORTANT**: Never use `synchronize: true` in production!

```bash
# Set production environment variables
export NODE_ENV=production
export DB_HOST=your-production-db-host
# ... other DB variables

# Run migrations
npm run migration:run
```

### 3. Verify Database Schema

```bash
# Connect to database
psql -U app_user -h your-db-host -d code_inbound_prod

# List tables
\dt

# Verify schema
\d users
\d tasks
```

---

## Deployment Options

### Option 1: Traditional Server (VPS)

**Requirements:**

- Ubuntu 20.04+ or similar
- Node.js 18+
- PostgreSQL 12+
- Nginx (for reverse proxy)
- PM2 (for process management)

**Steps:**

1. **Setup server**

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2
   ```

2. **Deploy application**

   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd code-inbound

   # Install dependencies
   npm ci --production

   # Build application
   npm run build

   # Create .env file
   nano .env  # Add production values
   ```

3. **Start with PM2**

   ```bash
   # Start application
   pm2 start dist/main.js --name task-api

   # Save PM2 configuration
   pm2 save

   # Setup PM2 to start on boot
   pm2 startup
   ```

4. **Setup Nginx reverse proxy**

   ```nginx
   # /etc/nginx/sites-available/task-api
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/task-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Database Migration in Production

FROM node:20-alpine

WORKDIR /app
COPY package\*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]

````

## Database Migration in Production

Before deploying, always run migrations:

```bash
npm install -g heroku
````

2. **Create Heroku app**

   ```bash
   heroku create your-app-name
   ```

3. **Add PostgreSQL**

   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Set environment variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-here
   heroku config:set JWT_EXPIRATION=1h
   ```

5. **Deploy**

   ```bash
   git push heroku main
   ```

6. **Run migrations**
   ```bash
   heroku run npm run migration:run
   ```

#### AWS Elastic Beanstalk

1. **Install EB CLI**

   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**

   ```bash
   eb init
   ```

3. **Create environment**

   ```bash
   eb create production-env
   ```

4. **Set environment variables**

   ```bash
   eb setenv NODE_ENV=production JWT_SECRET=xxx ...
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

#### Azure App Service

1. **Create App Service**

   ```bash
   az webapp create --resource-group myResourceGroup \
     --plan myAppServicePlan --name myTaskAPI \
     --runtime "NODE|20-lts"
   ```

2. **Configure environment**

   ```bash
   az webapp config appsettings set --resource-group myResourceGroup \
     --name myTaskAPI --settings NODE_ENV=production JWT_SECRET=xxx
   ```

3. **Deploy**
   ```bash
   az webapp deployment source config-zip \
     --resource-group myResourceGroup --name myTaskAPI \
     --src dist.zip
   ```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health endpoint
curl https://your-domain.com/health

# Test authentication
curl -X POST https://your-domain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"Test123!"}'
```

### 2. Setup SSL/TLS

**Using Let's Encrypt (Certbot)**:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo systemctl reload nginx
```

### 3. Configure CORS

Update `main.ts` for production:

```typescript
app.enableCors({
  origin: ['https://your-frontend.com'],
  credentials: true,
});
```

### 4. Enable Rate Limiting

Install and configure:

```bash
npm install @nestjs/throttler
```

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10,
}),
```

---

## Monitoring

### Application Monitoring

1. **PM2 Monitoring**

   ```bash
   pm2 monit
   pm2 logs
   ```

2. **Health Checks**
   - Monitor `/health` endpoint
   - Set up uptime monitoring (UptimeRobot, Pingdom)

3. **Error Tracking**
   - Integrate Sentry or similar
   - Monitor error logs

### Database Monitoring

```bash
# Check database connections
psql -U app_user -h db-host -d code_inbound_prod -c "SELECT count(*) FROM pg_stat_activity;"

# Check database size
psql -U app_user -h db-host -d code_inbound_prod -c "SELECT pg_size_pretty(pg_database_size('code_inbound_prod'));"
```

### Performance Monitoring

- Use APM tools (New Relic, DataDog)
- Monitor response times
- Track memory usage
- Monitor CPU usage

---

## Backup Strategy

### Database Backups

```bash
# Manual backup
pg_dump -U app_user -h db-host code_inbound_prod > backup_$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * pg_dump -U app_user -h db-host code_inbound_prod > /backups/backup_$(date +\%Y\%m\%d).sql
```

### Application Backups

- Use version control (Git)
- Tag releases
- Keep deployment artifacts

---

## Rollback Plan

### Quick Rollback

```bash
# Using PM2
pm2 stop task-api
cd /path/to/previous/version
npm ci --production
npm run build
pm2 restart task-api
```

### Database Rollback

```bash
# Revert last migration
npm run migration:revert
```

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] Helmet.js configured
- [ ] Dependencies audited (`npm audit`)
- [ ] Logging configured (no sensitive data)
- [ ] Firewall configured
- [ ] Regular security updates scheduled

---

## Troubleshooting Production Issues

### Application won't start

1. Check environment variables
2. Verify database connectivity
3. Check application logs
4. Verify Node.js version

### Performance issues

1. Enable connection pooling
2. Add database indexes
3. Implement caching (Redis)
4. Optimize queries

### Memory leaks

1. Monitor with PM2
2. Use Node.js profiler
3. Check for unclosed connections
4. Review event listeners

---

## Additional Resources

- [NestJS Production Best Practices](https://docs.nestjs.com/)
- [Node.js Production Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)

---

**Remember**: Always test deployment in staging environment before production!
