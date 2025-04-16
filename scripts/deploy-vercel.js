#!/usr/bin/env node

/**
 * This script helps deploy the application to Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying to Vercel...');

// Check if .env.production exists
if (!fs.existsSync(path.join(process.cwd(), '.env.production'))) {
  console.error('❌ .env.production file not found. Please create one based on .env.example');
  process.exit(1);
}

// Check if vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.log('📦 Installing Vercel CLI...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
}

// Deploy to Vercel
console.log('🚀 Deploying to Vercel...');
try {
  // Use environment variables from .env.production
  const envProduction = fs.readFileSync(path.join(process.cwd(), '.env.production'), 'utf8');
  const envVars = envProduction
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      return `${key.trim()}=${value.trim()}`;
    });

  // Create a temporary .vercel.env file
  fs.writeFileSync(path.join(process.cwd(), '.vercel.env'), envVars.join('\n'));

  // Deploy with environment variables
  execSync('vercel --prod --env-file .vercel.env', { stdio: 'inherit' });

  // Clean up
  fs.unlinkSync(path.join(process.cwd(), '.vercel.env'));

  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
