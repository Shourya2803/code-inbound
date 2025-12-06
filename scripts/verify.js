#!/usr/bin/env node

/**
 * Verification script to check if the application is properly configured
 * Run with: node scripts/verify.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, colors.green);
    return true;
  } else {
    log(`❌ ${description}`, colors.red);
    return false;
  }
}

function checkEnvVariable(variable, description) {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    log(`❌ .env file not found`, colors.red);
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const regex = new RegExp(`^${variable}=.+`, 'm');

  if (regex.test(envContent)) {
    log(`✅ ${description}`, colors.green);
    return true;
  } else {
    log(`❌ ${description}`, colors.red);
    return false;
  }
}

function runCommand(command, description) {
  try {
    execSync(command, { stdio: 'ignore' });
    log(`✅ ${description}`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${description}`, colors.red);
    return false;
  }
}

async function verify() {
  log('\n🔍 Verifying Task Management API Setup\n', colors.blue);

  let checks = 0;
  let passed = 0;

  // Check required files
  log('📁 Checking Required Files:', colors.yellow);
  checks += 4;
  if (checkFile('package.json', 'package.json exists')) passed++;
  if (checkFile('tsconfig.json', 'tsconfig.json exists')) passed++;
  if (checkFile('nest-cli.json', 'nest-cli.json exists')) passed++;
  if (checkFile('.env', '.env file exists')) passed++;

  // Check source files
  log('\n📦 Checking Source Files:', colors.yellow);
  checks += 5;
  if (checkFile('src/main.ts', 'main.ts exists')) passed++;
  if (checkFile('src/app.module.ts', 'app.module.ts exists')) passed++;
  if (checkFile('src/auth/auth.module.ts', 'AuthModule exists')) passed++;
  if (checkFile('src/tasks/tasks.module.ts', 'TasksModule exists')) passed++;
  if (checkFile('src/health/health.module.ts', 'HealthModule exists')) passed++;

  // Check environment variables
  log('\n⚙️  Checking Environment Variables:', colors.yellow);
  checks += 6;
  if (checkEnvVariable('DB_HOST', 'DB_HOST is configured')) passed++;
  if (checkEnvVariable('DB_PORT', 'DB_PORT is configured')) passed++;
  if (checkEnvVariable('DB_USERNAME', 'DB_USERNAME is configured')) passed++;
  if (checkEnvVariable('DB_PASSWORD', 'DB_PASSWORD is configured')) passed++;
  if (checkEnvVariable('DB_DATABASE', 'DB_DATABASE is configured')) passed++;
  if (checkEnvVariable('JWT_SECRET', 'JWT_SECRET is configured')) passed++;

  // Check node_modules
  log('\n📚 Checking Dependencies:', colors.yellow);
  checks += 1;
  if (checkFile('node_modules', 'Dependencies installed')) passed++;

  // Check if TypeScript compiles
  log('\n🔨 Checking Build:', colors.yellow);
  checks += 1;
  if (runCommand('npm run build', 'TypeScript compiles successfully')) passed++;

  // Check if tests exist
  log('\n🧪 Checking Tests:', colors.yellow);
  checks += 2;
  if (checkFile('src/tasks/tasks.service.spec.ts', 'Unit tests exist')) passed++;
  if (checkFile('test/app.e2e-spec.ts', 'E2E tests exist')) passed++;

  // Check documentation
  log('\n📖 Checking Documentation:', colors.yellow);
  checks += 5;
  if (checkFile('README.md', 'README.md exists')) passed++;
  if (checkFile('QUICKSTART.md', 'QUICKSTART.md exists')) passed++;
  if (checkFile('CONTRIBUTING.md', 'CONTRIBUTING.md exists')) passed++;
  if (checkFile('PROJECT_SUMMARY.md', 'PROJECT_SUMMARY.md exists')) passed++;
  if (checkFile('postman_collection.json', 'Postman collection exists')) passed++;

  // Summary
  log('\n' + '='.repeat(50), colors.blue);
  log(`\n📊 Verification Results: ${passed}/${checks} checks passed\n`, colors.blue);

  if (passed === checks) {
    log('🎉 All checks passed! Your setup is complete.', colors.green);
    log('\n✨ Next steps:', colors.yellow);
    log('   1. Start the app: npm run start:dev');
    log('   2. Visit Swagger: http://localhost:3000/api');
    log('   3. Run tests: npm test');
    log('');
    process.exit(0);
  } else {
    log('⚠️  Some checks failed. Please review the errors above.', colors.red);
    log('\n💡 Suggestions:', colors.yellow);
    if (!fs.existsSync('.env')) {
      log('   - Run: npm run setup (to create .env file)');
    }
    if (!fs.existsSync('node_modules')) {
      log('   - Run: npm install (to install dependencies)');
    }
    log('   - Check README.md for setup instructions');
    log('   - Check QUICKSTART.md for quick setup guide');
    log('');
    process.exit(1);
  }
}

verify().catch((error) => {
  console.error('Error during verification:', error);
  process.exit(1);
});
