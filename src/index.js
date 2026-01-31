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
    
    // Take a screenshot to debug
    await page.screenshot({ path: '/tmp/plaud-login.png' });
    console.log('Login page loaded, taking screenshot...');
    
    // Wait for login form - try multiple selectors
    console.log('Waiting for email input...');
    await page.waitForSelector('input[type="email"], input[type="text"], input[name="email"], input[placeholder*="email" i]', { timeout: 10000 });
    
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
  // Try to find button by text content using XPath
  console.log('Trying to find button by text...');
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await page.evaluate(el => el.textContent, button);
    if (text && (text.toLowerCase().includes('sign in') || 
                 text.toLowerCase().includes('log in') || 
                 text.toLowerCase().includes('login') ||
                 text.toLowerCase().includes('submit'))) {
      submitButton = button;
      break;
    }
  }
}

if (!submitButton) {
  // If we can't find the button, try pressing Enter on the password field
  console.log('Submit button not found, pressing Enter...');
  await passwordInput.press('Enter');
} else {
  console.log('Clicking submit button...');
  await submitButton.click();
}
    
    // Wait for navigation after login
    console.log('Waiting for login...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take screenshot after login
    await page.screenshot({ path: '/tmp/plaud-after-login.png' });
    console.log('Login successful, waiting for recordings...');
    
    // Wait for recordings to load
    await page.waitForTimeout(5000);
    
    // Extract recordings data
    console.log('Extracting recordings...');
    const recordings = await page.evaluate(() => {
      const recordingElements = document.querySelectorAll('[data-recording], .recording-item, .file-item, .note-item, [class*="recording"], [class*="file"]');
      const results = [];
      
      recordingElements.forEach((element) => {
        try {
          // Try to extract title
          const titleElement = element.querySelector('.title, .recording-title, h3, h4, .name, [class*="title"]');
          const title = titleElement ? titleElement.innerText.trim() : 'Untitled Recording';
          
          // Try to extract date
          const dateElement = element.querySelector('.date, .time, .timestamp, time, [class*="date"], [class*="time"]');
          const dateText = dateElement ? dateElement.innerText.trim() : new Date().toISOString();
          
          // Try to extract summary/transcription
          const summaryElement = element.querySelector('.summary, .description, .content, .transcript, [class*="summary"], [class*="description"]');
          const summary = summaryElement ? summaryElement.innerText.trim() : '';
          
          // Generate a unique ID
          const id = element.getAttribute('data-id') || 
                     element.getAttribute('id') || 
                     `${title}-${dateText}`.replace(/[^a-zA-Z0-9]/g, '-');
          
          if (title && title !== 'Untitled Recording') {
            results.push({
              id,
              title,
              date: dateText,
              summary: summary || 'No summary available'
            });
          }
        } catch (err) {
          console.error('Error extracting recording:', err);
        }
      });
      
      return results;
    });
    
    console.log(`Found ${recordings.length} recordings`);
    return recordings;
    
  } catch (error) {
    console.error('Error scraping Plaud:', error);
    throw error;
  } finally {
    await browser.close();
  }
}
/**
 * Create a Notion page for a recording
 */
async function createNotionPage(recording) {
  try {
    // Parse the date (adjust format based on what Plaud provides)
    let recordingDate;
    try {
      recordingDate = new Date(recording.date).toISOString();
    } catch {
      recordingDate = new Date().toISOString();
    }
    
    const response = await notion.pages.create({
      parent: {
        database_id: NOTION_DATABASE_ID,
      },
      properties: {
        // Adjust these property names to match your Notion database schema
        'Name': {
          title: [
            {
              text: {
                content: recording.title,
              },
            },
          ],
        },
        'Date': {
          date: {
            start: recordingDate,
          },
        },
        'Summary': {
          rich_text: [
            {
              text: {
                content: recording.summary.substring(0, 2000), // Notion has a 2000 char limit per text block
              },
            },
          ],
        },
        // Optional: Add a tag to identify Plaud recordings
        'Source': {
          select: {
            name: 'Plaud',
          },
        },
      },
    });
    
    console.log(`✅ Created Notion page: ${recording.title}`);
    return response;
  } catch (error) {
    console.error(`❌ Error creating Notion page for "${recording.title}":`, error.message);
    throw error;
  }
}

/**
 * Main sync function
 */
async function syncPlaudToNotion() {
  console.log('🚀 Starting Plaud → Notion sync...\n');
  
  // Validate environment variables
  if (!PLAUD_EMAIL || !PLAUD_PASSWORD || !NOTION_API_KEY || !NOTION_DATABASE_ID) {
    throw new Error('Missing required environment variables. Please check your .env file or GitHub secrets.');
  }
  
  // Load sync history
  const history = loadSyncHistory();
  console.log(`📝 Previously synced: ${history.syncedIds.length} recordings\n`);
  
  // Get recordings from Plaud
  const recordings = await getPlaudRecordings();
  
  // Filter out already synced recordings
  const newRecordings = recordings.filter(r => !history.syncedIds.includes(r.id));
  console.log(`\n📊 Found ${newRecordings.length} new recordings to sync\n`);
  
  if (newRecordings.length === 0) {
    console.log('✨ No new recordings to sync!');
    return;
  }
  
  // Sync each new recording
  let successCount = 0;
  for (const recording of newRecordings) {
    try {
      await createNotionPage(recording);
      history.syncedIds.push(recording.id);
      successCount++;
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to sync recording: ${recording.title}`);
    }
  }
  
  // Save updated history
  saveSyncHistory(history);
  
  console.log(`\n✅ Sync complete! Successfully synced ${successCount}/${newRecordings.length} recordings`);
}

// Run the sync
syncPlaudToNotion().catch((error) => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});
