# Playwright Web Browser Connector

Real browser automation connector for Grok / agents.
Replaces limited browse_page with full interactive control (click, fill, extract, CDP).

## Features
- Launch new Chromium or connect to existing Chrome debug session (CDP)
- goto, click, fill, type, extract_text/html, evaluate, screenshot, cookies
- Context manager support
- Sync API (easy for tool calling)
- Minimal deps

## Setup (run on your KUbuntu/local machine)
```bash
cd playwright-web-connector
pip install -r requirements.txt
playwright install chromium
```

## Chrome Debug Session (for /browser-like behavior)
1. Start Chrome with remote debugging:
   ```bash
   google-chrome-stable --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
   ```
2. In code:
   ```python
   conn = WebBrowserConnector(cdp_url="http://localhost:9222")
   ```

## Usage in agent / Grok
Import and call methods directly. For MCP-style: expose functions as tools.

Example script run:
```bash
python browser_connector.py https://supabase.com
```

## Integration notes
- Pair with web_search for discovery then this for actions
- Update web-connector skill to prefer this when available
- Headless=True for server/ agent use; False for visible
- Handles dynamic JS, auth flows, SPAs

Place this folder in Google Drive for persistent access across sessions.
