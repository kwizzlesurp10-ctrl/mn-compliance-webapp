# Automation Builder

**Use an LLM chat to execute web navigation commands and actions** through your real logged-in browser.

> Powered by **CDP-connected Playwright** (your real logged-in Chrome), **visual observability** (glowing panda), **keyboard-level control**, and **swarm-style agent patterns** inspired by [browser-assistant-swarm](https://github.com/kwizzlesurp10-ctrl/browser-assistant-swarm).

**Core repo concept**: Chat naturally with an LLM. The model translates your intent into precise, observable browser actions using the full Automation Builder toolkit.

This is the flagship experience of the project.

## The Vision

Talk to your browser like a human:

- "Go to GitHub, create a new public repo called my-agent-experiments with Python gitignore and MIT license"
- "Open Linear, create a bug report about the panda animation, and assign it to me"
- "Search Hugging Face for the latest Qwen2.5 GGUF models and open the top result"

The LLM uses the rich, discoverable, keyboard-friendly surface (`list_keyboard_shortcuts()`, `select_option`, keyboard shortcuts, etc.) while you watch the glowing panda do the work.

## Flagship Feature: LLM Chat

The main way to use the project is `llm_chat.py` — a conversational interface where an LLM directly controls your real browser.

```bash
# Ollama (recommended)
python llm_chat.py --model llama3.1

# OpenAI-compatible (vLLM, LM Studio, OpenRouter, etc.)
python llm_chat.py --backend openai --base-url http://localhost:8000/v1 --model Qwen2.5-32B
```

**Current capabilities:**
- Clean JSON action format (highly reliable)
- Multi-backend support (Ollama + any OpenAI-compatible server)
- **Real vision support** — screenshots are sent as images to vision models (gpt-4o, llava, etc.)
- Automatic glowing panda during execution
- Strong self-discovery (`list_keyboard_shortcuts`)
- Full toolkit access (`select_option`, keyboard control, etc.)

The LLM receives rich observations after every action and can perform complex, multi-step automations.

## New: End-to-End Browser-Native Agent (raw human-like Playwright actions)

On the `feature/browser-native-agent` branch we added a first-class **browser-native agent** that drives the browser using low-level Playwright primitives directly:

- **Raw actions**: `press_key` (all keyboard shortcuts + combos), `type_text` (slow + jitter for human feel), `mouse_click` (via `ref=` from snapshot boxes or explicit x/y + micro jitter), `scroll` (wheel in natural chunks), `mouse_move`.
- **Perception**: Built-in `snapshot()` that returns a clean tree of `role [ref=e42] [box=x,y,w,h] "visible text"` — the same excellent ref+box approach praised in MCP usage. No more guessing CSS selectors.
- **Keyboard-first + human-like**: The system prompt strongly encourages `press_key` for navigation/focus/submit and natural mouse targeting from boxes.
- Same LLM backends, vision (screenshots), and narration support as `llm_chat.py`.
- Persistent context (separate `~/.grok-playwright-profile` for logins).

```bash
# Basic usage (new on this branch)
python playwright_native_agent.py --model llama3.1 --prompt "You are a research agent. ..."

# Or the example wrapper
python examples/native_browser_agent.py --prompt "Search for recent papers on 'LLM agents with browser control' using web search first. Then open top arxiv results and extract metadata using snapshot refs for clicks."
```

This complements the original CDP `llm_chat.py` + glowing panda. Use the native agent when you want maximum Playwright-native control, coordinate-accurate clicking, and wheel/keyboard fidelity (great for complex UIs, anti-bot resistance via variance, and matching papers like BrowserAgent).

See `playwright_native_agent.py` for the full implementation and supported JSON action schema.

## Why This Works So Well

- Real logged-in Chrome = all your cookies, 2FA sessions, extensions
- Glowing panda = perfect visual feedback for both you and the LLM
- Strong self-discovery tools (`list_keyboard_shortcuts`, `get_tabs`, etc.)
- Robust `select_option` for the dropdowns and menus that usually break automation
- JSON-friendly + observable results that LLMs can reason over

## Quick Start

```bash
# 1. Launch persistent Chrome (with your real logins)
python browser_connector.py launch-browser

# 2. Make sure Ollama is running with a good model
ollama run llama3.1

# 3. Start chatting
python llm_chat.py
```

Then just describe what you want done on the web. The agent will drive the browser for you.

## Core Features

- **CDP Real Browser** — Persistent profile with all your logins, extensions, and cookies
- **Glowing Panda** — Configurable visual indicator (auto-triggers on navigation, clicks, selects, etc.)
- **Powerful Selection** — `select_option()` + CLI `select` for reliable dropdown/menu interaction
- **Full Keyboard Control** — Dozens of shortcuts + `list_keyboard_shortcuts()` for agents
- **Tab Intelligence** — Smart reuse, management, and discovery
- **Rich Scripting** — `execute_script`, `wait_for_navigation`, robust locators
- **CLI + Library** — Works from terminal or as tools for LLMs
- **Examples** — See `examples/` for ready patterns

## Quick Start

```bash
# One-time: launch persistent debug Chrome
python browser_connector.py launch-browser

# Then control it
python browser_connector.py --cdp goto https://github.com
python browser_connector.py --cdp select "MIT License" --container "Add license"
python browser_connector.py --cdp list-shortcuts --json
```

See `python browser_connector.py --help` for the full command set.

## Examples

```python
from browser_connector import WebBrowserConnector

conn = WebBrowserConnector(cdp_url="http://localhost:9222", auto_indicator=True)
conn.goto("https://github.com/new")
conn.select_option("Python", container="Add .gitignore")
conn.select_option("MIT License", container="Add license")
```

See the `examples/` directory for runnable demonstrations:
- `examples/llm_browser_agent.py` — General LLM agent
- `examples/github_repo_creator_agent.py` — Complex multi-step form automation
- `examples/error_handling_agent.py` — Robust error recovery (retries + LLM-guided fallback when actions fail)

Vision-capable models (gpt-4o, llava, etc.) automatically receive screenshots when the agent calls the `screenshot` action.

## Repository Name

The project is called **Automation Builder** and lives at:
https://github.com/kwizzlesurp10-ctrl/automation-builder

(The original creation used the temporary name `huggingface-local-models` during bootstrapping.)

## Browser Assistant Swarm Connection

This project is heavily inspired by [browser-assistant-swarm](https://github.com/kwizzlesurp10-ctrl/browser-assistant-swarm) / OpenComet ideas:

- Real browser as a first-class agent tool
- Strong observability and structured action surface
- Designed for multi-step, long-horizon automation
- Excellent backend for local LLM + LangGraph browser agents

## ForgeAI Governance

This repository is governed by **ForgeAI v2.1**. See [AGENTS.md](./AGENTS.md).

## Installation

```bash
pip install playwright
playwright install chromium
```

## License

MIT

---

**Built with real logged-in browser automation, the glowing panda, and production UI debugging.**

## Real Logged-in Browser (Recommended for Agents)

The most powerful way to use this tool is to let the agent control **your real browser** with all your existing logins.

### One-time Setup (Best Experience)

```bash
# 1. Launch a dedicated debug Chrome with a persistent profile
python browser_connector.py launch-browser

# 2. In the Chrome window that opens, log into the sites you want the agent to use
#    (Gmail, GitHub, Linear, Notion, Supabase, etc.)

# 3. Keep that Chrome window running.
```

From now on, **you no longer need to pass `--cdp`**:

```bash
python browser_connector.py goto https://github.com/pulls
python browser_connector.py --json tabs
python browser_connector.py click "text=New pull request"
```

The CLI will automatically detect the running debug session and control your real logged-in browser.

### Manual Launch (if you prefer)

```bash
google-chrome-stable \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.grok-browser-profile"
```

Then use:
```bash
python browser_connector.py --cdp ...
# or just let it auto-detect
```

### Why This Is Powerful

- The agent sees and acts inside your actual authenticated sessions.
- No more fighting with login flows or 2FA in automation.
- Full visual browser + all your extensions and cookies.

## Usage in agent / Grok
Import and call methods directly. For MCP-style: expose functions as tools.

**Recommended for agents**: Use CDP mode with a persistent Chrome debug session so the agent can see and control your real browser.

Example:
```python
from browser_connector import WebBrowserConnector

# Live browser (after starting Chrome with --remote-debugging-port=9222)
conn = WebBrowserConnector(cdp_url="http://localhost:9222")

print(conn.get_tabs())                    # List all open tabs
conn.new_tab("https://supabase.com")      # Open in a new tab
print(conn.get_title())
print(conn.get_links()[:5])               # First few links
conn.screenshot("supabase.png")

conn.switch_to_tab(0)                     # Go back to first tab
conn.close_tab()                          # Close current tab

# After clicking something that navigates:
conn.click("button#submit")
conn.wait_for_navigation("**/dashboard", timeout=10000)

# Execute custom JavaScript
result = conn.execute_script("return document.readyState")
conn.execute_script("window.scrollTo(0, 500)")
```

### CLI for Commanding Web Navigation

The CLI is designed so agents (or Grok) can control the browser via simple shell commands.

#### Best Workflow (Real Logged-in Browser)

```bash
# One time
python browser_connector.py launch-browser

# Then just use the CLI normally — it will auto-attach to your real browser
python browser_connector.py goto https://github.com
python browser_connector.py --json tabs
python browser_connector.py click "text=New"
python browser_connector.py execute-script "return document.title" --json
```

#### Other Useful Commands

```bash
python browser_connector.py status                    # Check if real browser is attached
python browser_connector.py launch-browser            # Start the persistent debug Chrome
python browser_connector.py --json tabs
python browser_connector.py wait-for-navigation "**/dashboard"

# Visual indicator (shows when Grok is actively using the browser)
python browser_connector.py show-indicator --label "🐼 Grok Searching..."
python browser_connector.py hide-indicator

# Searching animation variant (faster pulse + animated dots)
python browser_connector.py show-indicator --label "🐼 Searching the web..."

# Auto mode: searching panda automatically shows during navigation actions
python browser_connector.py --auto-indicator goto https://github.com
python browser_connector.py --auto-indicator --indicator-label "🐼 Searching..." new-tab https://google.com

# Fully configurable - choose exactly which actions show the indicator
python browser_connector.py --auto-indicator --indicator-actions "goto,wait_for_navigation" ...

# Best way to experience the full feature:
python browser_connector.py demo
python browser_connector.py demo --label "🐼 Grok" --actions "goto,wait_for_navigation"
```

### Keyboard Shortcuts for Browser Navigation

Grok can now use natural keyboard shortcuts for efficient browser control:

```bash
python browser_connector.py shortcut "Control+L"           # Focus address bar
python browser_connector.py back
python browser_connector.py forward
python browser_connector.py devtools
python browser_connector.py console
python browser_connector.py history
python browser_connector.py bookmarks
python browser_connector.py zoom-in
python browser_connector.py list-shortcuts     # ← Ask Grok to run this first!
```

From Python (highly recommended for agents):
```python
shortcuts = conn.list_keyboard_shortcuts()   # Discover everything available
conn.keyboard_shortcut("Control+Shift+T")
conn.focus_address_bar()
conn.open_devtools_shortcut()
```

See the `web_navigation_example()` function (in `browser_connector.py`) for a complete realistic example of web navigation with the configurable searching panda.

**Key flags:**
- `--json` → Machine-readable output (perfect for tool calling / Grok)
- `--cdp` → Force CDP mode (usually not needed due to auto-detection)

Simple one-shot usage still works:
```bash
python browser_connector.py https://example.com
```

## Integration notes
- Pair with web_search for discovery then this for actions
- Update web-connector skill to prefer this when available
- Headless=True for server/ agent use; False for visible

## Google Drive Chat Interface

For conversational control of Google Drive, use the included chat:

```bash
python drive_chat.py
```

Then talk naturally:
- "list my files"
- "create folder Projects"
- "search for Q3 budget"
- "go to my drive"

The glowing panda will automatically appear while the tool is controlling Drive.

**Requirements**: Your Chrome debug session must be running and logged into Google.
- Handles dynamic JS, auth flows, SPAs

Place this folder in Google Drive for persistent access across sessions.
