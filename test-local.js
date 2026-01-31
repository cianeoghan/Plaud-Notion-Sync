#!/usr/bin/env node

/**
 * Local Testing Script
 * 
 * Use this to test the sync locally before deploying to GitHub Actions
 * 
 * Setup:
 * 1. Copy .env.example to .env
 * 2. Fill in your credentials
 * 3. Run: npm install
 * 4. Run: node test-local.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: join(__dirname, '.env') });

console.log('🧪 Testing Plaud → Notion Sync Locally\n');
console.log('═══════════════════════════════════════\n');

// Check environment variables
const requiredVars = ['PLAUD_EMAIL', 'PLAUD_PASSWORD', 'NOTION_API_KEY', 'NOTION_DATABASE_ID'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Missing environment variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.error('\n💡 Create a .env file from .env.example and fill in your credentials');
  process.exit(1);
}

console.log('✅ Environment variables loaded\n');
console.log('Configuration:');
console.log(`   PLAUD_EMAIL: ${process.env.PLAUD_EMAIL.substring(0, 3)}***`);
console.log(`   PLAUD_PASSWORD: ${'*'.repeat(10)}`);
console.log(`   NOTION_API_KEY: ${process.env.NOTION_API_KEY.substring(0, 10)}...`);
console.log(`   NOTION_DATABASE_ID: ${process.env.NOTION_DATABASE_ID}\n`);

console.log('═══════════════════════════════════════\n');
console.log('🚀 Starting sync...\n');

// Import and run the main sync
import('./src/index.js').catch(error => {
  console.error('\n❌ Sync failed:', error.message);
  process.exit(1);
});
