# Quick Setup Checklist

Use this checklist to set up your Plaud → Notion sync in under 10 minutes!

## ✅ Pre-Setup Checklist

- [ ] You have a Plaud.ai account with Private Cloud Sync enabled
- [ ] You have a Notion workspace where you're an admin/owner
- [ ] You have a GitHub account

---

## 📋 Setup Steps

### 1️⃣ Notion Integration (3 minutes)

- [ ] Go to https://www.notion.so/my-integrations
- [ ] Click "+ New integration"
- [ ] Name it "Plaud Sync" and submit
- [ ] Copy the integration token (starts with `secret_`)
- [ ] Open your "Notes" database in Notion
- [ ] Click "•••" → "+ Add connections" → select "Plaud Sync"

### 2️⃣ Get Database ID (1 minute)

- [ ] Open your "Notes" database in Notion
- [ ] Copy the database ID from the URL (32-character string)
  - URL format: `notion.so/[workspace]/[DATABASE_ID]?v=...`

### 3️⃣ Update Database Schema (2 minutes)

Ensure your database has these properties:
- [ ] `Name` (Title) - Already exists
- [ ] `Date` (Date) - Add if needed
- [ ] `Summary` (Text) - Add if needed  
- [ ] `Source` (Select) - Add if needed, with "Plaud" option

### 4️⃣ Fork & Configure Repository (4 minutes)

- [ ] Fork this repository to your GitHub account
- [ ] Go to Settings → Secrets and variables → Actions
- [ ] Add these 4 secrets:
  - [ ] `PLAUD_EMAIL` = your Plaud login email
  - [ ] `PLAUD_PASSWORD` = your Plaud password
  - [ ] `NOTION_API_KEY` = your integration token from step 1
  - [ ] `NOTION_DATABASE_ID` = database ID from step 2

### 5️⃣ Enable & Test (2 minutes)

- [ ] Go to the "Actions" tab in your forked repository
- [ ] Enable workflows
- [ ] Click "Sync Plaud to Notion" → "Run workflow"
- [ ] Wait ~2 minutes and check your Notion database!

---

## 🎉 You're Done!

Your Plaud recordings will now automatically sync to Notion every hour.

### What's Next?

- Check the Actions tab to see sync logs
- Adjust the sync frequency in `.github/workflows/sync.yml` if needed
- Customize property mappings in `src/index.js` if needed

---

## 🐛 Common Issues

**"No recordings found"**
- Make sure Private Cloud Sync is enabled in your Plaud app
- Check that recordings are visible at https://web.plaud.ai

**"Notion API error"**  
- Verify the integration is connected to your database
- Double-check the database ID is correct

**"Login failed"**
- Confirm your Plaud credentials work at https://web.plaud.ai
- Check that the secrets are added correctly in GitHub
