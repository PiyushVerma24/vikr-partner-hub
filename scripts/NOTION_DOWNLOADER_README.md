# Notion Database Downloader

Downloads all document attachments from the Partner Hub Notion database, organised into folders by column name.

## Output structure

```
~/Desktop/notion_downloads/
├── GreenPro Certificate/
│   ├── Air Freshener Arabian Oudh.pdf
│   └── ...
├── ISO 9001:2015 Certificate/
├── MSDS/
├── Coshh Sheet/
├── Product Label/
├── Product Test Report/
├── TDS/
├── WHO-GMP Certificate/
└── url_log.tsv          ← YouTube + Notion page links
```

## Setup (one-time)

### 1. Create a Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Name it (e.g. "Partner Hub Downloader"), select your workspace
4. Click **Submit** → copy the **Internal Integration Secret** (`secret_xxx...`)

### 2. Share the database with your integration

1. Open the database in Notion
2. Click **"..."** (top-right) → **Connections** → find your integration → click **Confirm**

### 3. Install Python dependencies

```bash
pip3 install requests
```

## Running the script

```bash
cd /path/to/project/scripts

# Set your token
export NOTION_TOKEN="secret_xxxxxxxxxxxxxxxxxxxx"

# Run
python3 notion_downloader.py
```

Or in one line:
```bash
NOTION_TOKEN="secret_xxx" python3 notion_downloader.py
```

## Notes

- **Re-run safe**: files already downloaded are skipped automatically
- **Pagination**: handles databases with 100+ products
- **Notion-hosted files**: URLs expire after ~1 hour — the script downloads immediately after fetching, so this is handled automatically
- **YouTube / Notion Page URLs**: these are logged to `url_log.tsv` (tab-separated) rather than downloaded
