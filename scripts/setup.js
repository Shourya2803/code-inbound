#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function setup() {
  console.log('🚀 Task Management API Setup\n');

  // Check if .env exists
  if (!fs.existsSync('.env')) {
    console.log('📝 Creating .env file...\n');

    const dbHost = (await question('Database host (default: localhost): ')) || 'localhost';
    const dbPort = (await question('Database port (default: 5432): ')) || '5432';
    const dbUsername = (await question('Database username (default: postgres): ')) || 'postgres';
    const dbPassword = await question('Database password: ');
    const dbDatabase =
      (await question('Database name (default: code_inbound): ')) || 'code_inbound';

    const envContent = `# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USERNAME=${dbUsername}
DB_PASSWORD=${dbPassword}
DB_DATABASE=${dbDatabase}

# JWT
JWT_SECRET=${generateSecret()}
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=${generateSecret()}
JWT_REFRESH_EXPIRATION=7d
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file created\n');
  } else {
    console.log('✅ .env file already exists\n');
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');

  // Start Docker containers
  const startDocker = await question('Start PostgreSQL with Docker? (y/n): ');
  if (startDocker.toLowerCase() === 'y') {
    console.log('🐳 Starting Docker containers...');
    try {
      execSync('docker-compose up -d postgres', { stdio: 'inherit' });
      console.log('✅ PostgreSQL is running\n');

      // Wait for database to be ready
      console.log('⏳ Waiting for database to be ready...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log('✅ Database is ready\n');
    } catch (error) {
      console.log('⚠️  Could not start Docker. Make sure Docker is installed and running.\n');
    }
  }

  console.log('🎉 Setup complete!\n');
  console.log('Next steps:');
  console.log('  1. Run: npm run start:dev');
  console.log('  2. Visit: http://localhost:3000/api (Swagger docs)');
  console.log('  3. Start building! 🚀\n');

  rl.close();
}

function generateSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

setup().catch((error) => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});
