# Plaud → Notion Sync Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GITHUB ACTIONS                          │
│                   (Runs every hour automatically)               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Node.js Script │
                    │  (Puppeteer +   │
                    │  Notion API)    │
                    └────┬───────┬────┘
                         │       │
            ┌────────────┘       └────────────┐
            ▼                                  ▼
    ┌───────────────┐                 ┌──────────────┐
    │  Plaud Web    │                 │   Notion API │
    │  (web.plaud.ai)│                 │              │
    │               │                 │              │
    │  • Login      │                 │  • Create    │
    │  • Scrape     │                 │    Pages     │
    │  • Extract    │────────────────▶│  • Update    │
    │    - Title    │  Send Data      │    Database  │
    │    - Date     │                 │              │
    │    - Summary  │                 │              │
    └───────────────┘                 └──────┬───────┘
                                             │
                                             ▼
                                    ┌────────────────┐
                                    │ Notion Notes   │
                                    │ Database       │
                                    │ (Ultimate Brain)│
                                    │                │
                                    │ Properties:    │
                                    │ • Name         │
                                    │ • Date         │
                                    │ • Summary      │
                                    │ • Source       │
                                    └────────────────┘
```

## Data Flow

1. **GitHub Actions** triggers on schedule (every hour)
2. **Puppeteer** launches headless Chrome browser
3. Script logs into **web.plaud.ai** with your credentials
4. **Scrapes recordings** (title, date, summary)
5. Checks **sync history** to avoid duplicates
6. **Creates Notion pages** via official API
7. **Updates sync history** in repository
8. **Commits changes** back to GitHub

## Security

- 🔐 Credentials stored as encrypted GitHub Secrets
- 🔒 All connections use HTTPS
- 🤖 Runs in isolated GitHub Actions environment
- 📝 Only recording IDs stored in sync history (no sensitive data)

## Customization Points

1. **Sync Frequency**: Edit `.github/workflows/sync.yml` cron schedule
2. **Property Mapping**: Edit `src/index.js` Notion properties section
3. **Data Extraction**: Modify `src/index.js` Puppeteer selectors if Plaud changes their UI
