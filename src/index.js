import { Client } from '@notionhq/client';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from environment variables
const PLAUD_EMAIL = process.env.PLAUD_EMAIL;
const PLAUD_PASSWORD = process.env.PLAUD_PASSWORD;
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// File to track synced recordings
const SYNC_HISTORY_FILE = path.join(__dirname, '../synced-recordings.json');

// Initialize Notion client
const notion = new Client({ auth: NOTION_API_KEY });

/**
 * Load sync history to avoid duplicates
 */
function loadSyncHistory() {
  try {
    if (fs.existsSync(SYNC_HISTORY_FILE)) {
      const data = fs.readFileSync(SYNC_HISTORY_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('No sync history found, starting fresh');
  }
  return { syncedIds: [] };
}

/**
 * Save sync history
 */
function saveSyncHistory(history) {
  fs.writeFileSync(SYNC_HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * Login to Plaud and scrape recordings
 */
async function getPlaudRecordings() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to Plaud login
    console.log('Navigating to Plaud login...');
    await page.goto('https://web.plaud.ai/login', { waitUntil: 'networkidle2' });
    
    console.log('Login page loaded');
    
    // Wait for login form
    console.log('Waiting for email input...');
    await page.waitForSelector('input[type="email"], input[type="text"], input[name="email"]', { timeout: 10000 });
    
    // Enter email
    console.log('Entering email...');
    const emailInput = await page.$('input[type="email"], input[type="text"], input[name="email"]');
    await emailInput.type(PLAUD_EMAIL);
    
    // Enter password
    console.log('Entering password...');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    await passwordInput.type(PLAUD_PASSWORD);
    
    // Try to find and click submit button
    console.log('Looking for submit button...');
    let submitButton = await page.$('button[type="submit"]');

    if (!submitButton) {
      // Try to find button by text
