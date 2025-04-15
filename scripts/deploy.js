#!/usr/bin/env node

/**
 * This script helps prepare the application for deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 AI Tutor Deployment Helper');
console.log('============================\n');

// Check if .env file exists
if (!fs.existsSync(path.join(process.cwd(), '.env'))) {
  console.error('❌ .env file not found. Please create one based on .env.example');
  process.exit(1);
}

// Check if the database is configured
const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
if (!envContent.includes('DATABASE_URL=')) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

// Run database migrations
console.log('📊 Running database migrations...');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Database migrations applied successfully');
} catch (error) {
  console.error('❌ Failed to apply database migrations');
  process.exit(1);
}

// Build the application
console.log('\n🏗️ Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully');
} catch (error) {
  console.error('❌ Failed to build the application');
  process.exit(1);
}

console.log('\n✅ Your application is ready for deployment!');
console.log('\nDeployment options:');
console.log('1. Vercel (Recommended for Next.js)');
console.log('2. Railway');
console.log('3. Netlify');
console.log('4. Render');

rl.question('\nWhich platform would you like to deploy to? (1-4): ', (answer) => {
  switch (answer) {
    case '1':
      console.log('\n📝 Vercel Deployment Instructions:');
      console.log('1. Push your code to GitHub');
      console.log('2. Go to https://vercel.com and sign up/login');
      console.log('3. Click "New Project" and import your GitHub repository');
      console.log('4. Configure the environment variables');
      console.log('5. Click "Deploy"');
      break;
    case '2':
      console.log('\n📝 Railway Deployment Instructions:');
      console.log('1. Push your code to GitHub');
      console.log('2. Go to https://railway.app and sign up/login');
      console.log('3. Create a new project and select "Deploy from GitHub repo"');
      console.log('4. Select your repository');
      console.log('5. Add a PostgreSQL database from the Railway dashboard');
      console.log('6. Configure the environment variables');
      console.log('7. Deploy your application');
      break;
    case '3':
      console.log('\n📝 Netlify Deployment Instructions:');
      console.log('1. Push your code to GitHub');
      console.log('2. Go to https://netlify.com and sign up/login');
      console.log('3. Click "New site from Git" and select your repository');
      console.log('4. Configure the build settings');
      console.log('5. Add all the environment variables');
      console.log('6. Click "Deploy site"');
      break;
    case '4':
      console.log('\n📝 Render Deployment Instructions:');
      console.log('1. Push your code to GitHub');
      console.log('2. Go to https://render.com and sign up/login');
      console.log('3. Click "New Web Service" and select your repository');
      console.log('4. Configure the build settings');
      console.log('5. Add all the environment variables');
      console.log('6. Click "Create Web Service"');
      break;
    default:
      console.log('\nPlease refer to DEPLOYMENT.md for detailed instructions.');
  }
  
  console.log('\n⚠️ Remember to set all environment variables in your deployment platform!');
  console.log('📖 For more detailed instructions, see DEPLOYMENT.md');
  
  rl.close();
});
