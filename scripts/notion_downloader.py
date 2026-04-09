#!/usr/bin/env python3
"""
Notion Database Document Downloader
====================================
Downloads all file attachments from a Notion database, organised by column name.

Folder structure:
  ~/Desktop/notion_downloads/
  ├── GreenPro Certificate/
  │   ├── Air Freshener Arabian Oudh.pdf
  │   └── ...
  ├── MSDS/
  │   └── ...
  └── ...

Usage:
  export NOTION_TOKEN="secret_xxxxxxxxxxxx"
  python3 notion_downloader.py

  Or pass inline:
  NOTION_TOKEN="secret_xxx" python3 notion_downloader.py
"""

import os
import re
import sys
import time
import requests
from pathlib import Path
from urllib.parse import urlparse, unquote

# ── Config ──────────────────────────────────────────────────────────────────

NOTION_TOKEN  = os.environ.get("NOTION_TOKEN", "")
DATABASE_ID   = "ad4fe285c3204837ab514b3cebcd03ee"
OUTPUT_DIR    = Path.home() / "Desktop" / "notion_downloads"
NOTION_VERSION = "2022-06-28"

# Columns that contain downloadable file attachments
FILE_COLUMNS = [
    "GreenPro Certificate",
    "ISO 9001:2015 Certificate",
    "MSDS",
    "Coshh Sheet",
    "Product Label",
    "Product Test Report",
    "TDS",
    "WHO-GMP Certificate",
]

# Columns that are plain URLs (logged but not downloaded as files)
URL_COLUMNS = [
    "YouTube Video",
    "Notion Page URL",
]

# ── Helpers ──────────────────────────────────────────────────────────────────

def notion_headers() -> dict:
    return {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def sanitize(name: str) -> str:
    """Make a string safe for use as a filename / folder name."""
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    name = name.replace('\n', ' ').strip()
    return name or "unnamed"


def get_extension_from_url(url: str, fallback: str = ".pdf") -> str:
    path = unquote(urlparse(url).path)
    ext = os.path.splitext(path)[1]
    return ext if ext else fallback


def download_file(url: str, dest: Path) -> bool:
    """Download a file from url to dest. Returns True on success."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        resp = requests.get(url, stream=True, timeout=60)
        resp.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"    ✗ Failed to download {dest.name}: {e}")
        return False


def extract_plain_text(rich_text_array: list) -> str:
    return "".join(item.get("plain_text", "") for item in rich_text_array)


# ── Notion API ────────────────────────────────────────────────────────────────

def query_database() -> list:
    """Fetch all pages from the database (handles pagination)."""
    url = f"https://api.notion.com/v1/databases/{DATABASE_ID}/query"
    pages = []
    payload: dict = {"page_size": 100}

    while True:
        resp = requests.post(url, headers=notion_headers(), json=payload, timeout=30)
        if resp.status_code != 200:
            print(f"Error querying database: {resp.status_code} {resp.text}")
            sys.exit(1)

        data = resp.json()
        pages.extend(data.get("results", []))
        print(f"  Fetched {len(pages)} rows so far…")

        if not data.get("has_more"):
            break
        payload["start_cursor"] = data["next_cursor"]
        time.sleep(0.3)  # respect rate limits

    return pages


def get_files_from_property(prop: dict) -> list[tuple[str, str]]:
    """
    Returns a list of (url, original_filename) tuples for a Notion files property.
    Handles both Notion-hosted files and external file links.
    """
    if not prop or prop.get("type") != "files":
        return []

    results = []
    for f in prop.get("files", []):
        name = f.get("name", "file")
        if f.get("type") == "file":
            url = f["file"]["url"]
            results.append((url, name))
        elif f.get("type") == "external":
            url = f["external"]["url"]
            results.append((url, name))
    return results


def get_url_from_property(prop: dict) -> str | None:
    """Extract plain URL from a url-type Notion property."""
    if not prop:
        return None
    if prop.get("type") == "url":
        return prop.get("url")
    if prop.get("type") == "rich_text":
        text = extract_plain_text(prop.get("rich_text", []))
        return text if text.startswith("http") else None
    return None


def get_product_name(props: dict) -> str:
    prop = props.get("Product Name", {})
    if prop.get("type") == "title":
        return extract_plain_text(prop.get("title", [])) or "Unknown Product"
    return "Unknown Product"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not NOTION_TOKEN:
        print("Error: NOTION_TOKEN environment variable is not set.")
        print("  export NOTION_TOKEN='secret_xxxxxxxxxxxxxxxxxxxx'")
        sys.exit(1)

    print(f"\nNotion Database Downloader")
    print(f"Database : {DATABASE_ID}")
    print(f"Output   : {OUTPUT_DIR}\n")

    # Fetch all rows
    print("Querying database…")
    pages = query_database()
    print(f"\nTotal products: {len(pages)}\n")
    print("=" * 60)

    stats = {"downloaded": 0, "skipped": 0, "failed": 0, "url_logged": 0}
    url_log: list[str] = []

    for page in pages:
        props = page.get("properties", {})
        product_name = get_product_name(props)
        safe_product  = sanitize(product_name)

        print(f"\n→ {product_name}")

        # ── Download file columns ──────────────────────────────────────────
        for col in FILE_COLUMNS:
            prop = props.get(col)
            files = get_files_from_property(prop)

            if not files:
                continue

            col_folder = OUTPUT_DIR / sanitize(col)

            for file_url, original_name in files:
                ext = get_extension_from_url(file_url,
                                             fallback=os.path.splitext(original_name)[1] or ".pdf")
                filename = f"{safe_product}{ext}"
                dest = col_folder / filename

                # Skip if already downloaded (re-run safety)
                if dest.exists():
                    print(f"  ⏭  [{col}] already exists, skipping")
                    stats["skipped"] += 1
                    continue

                print(f"  ↓  [{col}] {filename}", end="", flush=True)
                ok = download_file(file_url, dest)
                if ok:
                    print("  ✓")
                    stats["downloaded"] += 1
                else:
                    stats["failed"] += 1

        # ── Log URL columns ────────────────────────────────────────────────
        for col in URL_COLUMNS:
            prop = props.get(col)
            url = get_url_from_property(prop)
            if url:
                url_log.append(f"{product_name}\t{col}\t{url}")
                stats["url_logged"] += 1

    # Write URL log
    if url_log:
        log_path = OUTPUT_DIR / "url_log.tsv"
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        with open(log_path, "w") as f:
            f.write("Product Name\tColumn\tURL\n")
            f.write("\n".join(url_log))
        print(f"\nURL log saved → {log_path}")

    print("\n" + "=" * 60)
    print(f"Done!")
    print(f"  Downloaded : {stats['downloaded']}")
    print(f"  Skipped    : {stats['skipped']} (already existed)")
    print(f"  Failed     : {stats['failed']}")
    print(f"  URLs logged: {stats['url_logged']}")
    print(f"\nFiles saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
