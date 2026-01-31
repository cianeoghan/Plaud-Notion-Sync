# Plaud → Notion Sync

Automatically sync your Plaud.ai recordings to your Notion "Notes" database in Ultimate Brain.

## Features

- 🔄 Automatically syncs new Plaud recordings to Notion every hour
- 📝 Transfers: Recording Title, Date/Time, and AI Summary
- 🚫 Avoids duplicates by tracking synced recordings
- 🤖 Runs via GitHub Actions (no server needed!)
- ⚡ Can be manually triggered anytime

---

## Setup Instructions

### Step 1: Create Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Fill in the details:
   - **Name**: "Plaud Sync" (or whatever you prefer)
   - **Associated workspace**: Select your workspace
   - **Capabilities**: Enable these:
     - ✅ Read content
     - ✅ Update content
     - ✅ Insert content
4. Click **"Submit"**
5. On the next page, under **"Secrets"** tab, copy your **Internal Integration Token**
   - It starts with `secret_`
   - Save this somewhere safe - you'll need it in Step 3

### Step 2: Share Your Notion Database with the Integration

1. Open your **Ultimate Brain** workspace in Notion
2. Navigate to your **"Notes"** database
3. Click the **"•••"** (three dots) at the top right
4. Click **"+ Add connections"**
5. Search for and select your integration (e.g., "Plaud Sync")
6. Click **"Invite"**

### Step 3: Get Your Notion Database ID

1. Open your **"Notes"** database in Notion
2. Look at the URL in your browser. It will look like:
   ```
   https://www.notion.so/[workspace]/[DATABASE_ID]?v=...
   ```
3. Copy the `DATABASE_ID` part (it's a 32-character string without dashes)
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Step 4: Update Your Notion Database Schema

Make sure your "Notes" database has these properties:

| Property Name | Type | Description |
|--------------|------|-------------|
| `Name` | Title | Recording title |
| `Date` | Date | Recording date/time |
| `Summary` | Text | AI-generated summary |
| `Source` | Select | Tag to identify Plaud recordings (optional) |

**To add the "Source" property:**
1. Open your database
2. Click **"+"** to add a new property
3. Name it **"Source"**
4. Type: **"Select"**
5. Add an option called **"Plaud"**

### Step 5: Fork This Repository

1. Click the **"Fork"** button at the top right of this repository
2. This creates your own copy where the sync will run

### Step 6: Add GitHub Secrets

1. Go to your forked repository
2. Click **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Click **"New repository secret"** and add each of these:

   | Name | Value | Where to get it |
   |------|-------|----------------|
   | `PLAUD_EMAIL` | Your Plaud email | Your Plaud account login |
   | `PLAUD_PASSWORD` | Your Plaud password | Your Plaud account login |
   | `NOTION_API_KEY` | Your integration token | From Step 1 (starts with `secret_`) |
   | `NOTION_DATABASE_ID` | Your database ID | From Step 3 (32-character string) |

### Step 7: Enable GitHub Actions

1. In your forked repository, go to the **"Actions"** tab
2. Click **"I understand my workflows, go ahead and enable them"**
3. The sync will now run automatically every hour!

---

## Usage

### Automatic Sync
- The sync runs automatically **every hour** via GitHub Actions
- New recordings from Plaud will appear in your Notion database

### Manual Sync
To trigger a sync immediately:
1. Go to the **"Actions"** tab in your repository
2. Click **"Sync Plaud to Notion"** in the left sidebar
3. Click **"Run workflow"** → **"Run workflow"**

### Check Sync Status
1. Go to the **"Actions"** tab
2. Click on the most recent workflow run to see logs

---

## Notion Property Mapping

The script maps Plaud data to your Notion database like this:

```
Plaud Recording → Notion Page
├─ Title        → Name (Title property)
├─ Date         → Date (Date property)
├─ Summary      → Summary (Text property)
└─ [Auto-added] → Source = "Plaud" (Select property)
```

---

## Customization

### Change Sync Frequency

Edit `.github/workflows/sync.yml` and change the cron schedule:

```yaml
schedule:
  # Run every hour
  - cron: '0 * * * *'
  
  # Other options:
  # Every 30 minutes: '*/30 * * * *'
  # Every 6 hours: '0 */6 * * *'
  # Once a day at 9am: '0 9 * * *'
```

### Adjust Property Names

If your Notion database uses different property names, edit `src/index.js`:

```javascript
properties: {
  'Name': { ... },      // Change to your title property name
  'Date': { ... },      // Change to your date property name
  'Summary': { ... },   // Change to your summary property name
  'Source': { ... },    // Change or remove if not needed
}
```

---

## Troubleshooting

### "Missing required environment variables"
- Check that all 4 secrets are added in GitHub Settings → Secrets

### "Notion API error"
- Verify your database is shared with the integration (Step 2)
- Check that your database ID is correct (Step 3)
- Ensure property names match your database schema

### "Login failed to Plaud"
- Verify your Plaud email and password are correct
- Try logging into https://web.plaud.ai manually first
- Make sure Private Cloud Sync is enabled in your Plaud app

### No recordings appearing
- Check the GitHub Actions logs for errors
- Verify that recordings are visible at https://web.plaud.ai
- Make sure you have Private Cloud Sync enabled in the Plaud app

---

## Privacy & Security

- Your Plaud credentials are stored as encrypted GitHub secrets
- The script runs in an isolated GitHub Actions environment
- Sync history is stored in the repository (recording IDs only, no content)
- All data transfer happens over HTTPS

---

## Technical Details

**How it works:**
1. GitHub Actions runs the script on schedule
2. Puppeteer (headless browser) logs into web.plaud.ai
3. Scrapes recording titles, dates, and summaries
4. Compares against local sync history to avoid duplicates
5. Creates new Notion pages via the official Notion API
6. Commits updated sync history back to the repository

**Tech Stack:**
- Node.js 20
- Puppeteer (web scraping)
- @notionhq/client (Notion API)
- GitHub Actions (automation)

---

## Need Help?

If you run into issues:
1. Check the **Actions** tab for error logs
2. Open an issue in this repository
3. Include the error message from the Actions log

---

## License

MIT License - feel free to modify and use as needed!
