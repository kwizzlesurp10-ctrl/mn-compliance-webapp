#!/usr/bin/env python3
"""
Browser Native Agent — End-to-end browser-native agent using raw human-like Playwright actions.

Inspired by "BrowserAgent: Building Web Agents with Human-Inspired Web Browsing Actions" and
the project's goal of reliable LLM-driven browser control.

Core idea:
- Perception: Structured accessibility + bounding box snapshot (ref=eN + [box=x,y,w,h]) — no hallucinated CSS.
- Actions: Raw Playwright human-like primitives:
  - keyboard: press_key (supports "Control+L", "Enter", "ArrowDown", combos)
  - type_text (slow, human-like with per-char delay + occasional pauses)
  - mouse: move + click at precise (x, y) computed from snapshot boxes (with small random jitter for realism)
  - scroll (wheel or evaluate)
  - goto, wait, screenshot
- Always prefer keyboard shortcuts + natural mouse movements over brittle high-level fill/click(selectors).
- Persistent context for logged-in state (cookies, sessions).
- Same LLM backends as llm_chat.py (Ollama default).
- Vision support via screenshots.
- English-friendly narration option for observability (like the llm-browser screen sessions).

Run:
    python playwright_native_agent.py --model llama3.1 --prompt "You are a research agent. ..."
    python playwright_native_agent.py   # interactive REPL

Requirements:
    pip install -r requirements.txt
    playwright install chromium   # if not already

The agent outputs JSON actions, receives rich observations (snapshot tree + url/title), loops until final answer.
"""

import argparse
import base64
import json
import os
import random
import time
from typing import Any, Dict, List, Optional, Tuple

import requests
from playwright.sync_api import sync_playwright, BrowserContext, Page, Error as PlaywrightError


class PlaywrightNativeBrowser:
    """Low-level Playwright controller emphasizing raw human-like actions (keyboard, mouse, scroll, type)."""

    def __init__(
        self,
        user_data_dir: str = "~/.grok-playwright-profile",
        headless: bool = False,
        viewport: Tuple[int, int] = (1280, 720),
        slow_mo: int = 50,  # ms delay for human-likeness in some actions
    ):
        self.user_data_dir = os.path.expanduser(user_data_dir)
        os.makedirs(self.user_data_dir, exist_ok=True)

        self.playwright = sync_playwright().start()
        self.context: BrowserContext = self.playwright.chromium.launch_persistent_context(
            user_data_dir=self.user_data_dir,
            headless=headless,
            viewport={"width": viewport[0], "height": viewport[1]},
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
            ],
            slow_mo=slow_mo if slow_mo > 0 else None,
        )
        self.page: Page = self.context.pages[0] if self.context.pages else self.context.new_page()
        self._ref_to_box: Dict[str, List[int]] = {}  # last snapshot ref -> [x, y, w, h]
        self._last_snapshot_text: str = ""

        print(f"Playwright native browser ready. Profile: {self.user_data_dir}")
        print(f"Current: {self.get_title()} — {self.get_url()}")

    def close(self):
        try:
            self.context.close()
        except Exception:
            pass
        try:
            self.playwright.stop()
        except Exception:
            pass

    def get_url(self) -> str:
        return self.page.url

    def get_title(self) -> str:
        try:
            return self.page.title()
        except Exception:
            return "untitled"

    def goto(self, url: str) -> None:
        self.page.goto(url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(0.4)  # human-like settle

    def press_key(self, key: str) -> None:
        """Raw keyboard press. Supports combos like 'Control+L', 'Enter', 'ArrowDown', 'Shift+Tab' etc."""
        # Normalize some common ones for Playwright
        key = key.replace("Control+", "Control+").replace("Meta+", "Meta+")
        self.page.keyboard.press(key)
        time.sleep(0.15 + random.uniform(0, 0.1))

    def type_text(self, text: str, slowly: bool = True) -> None:
        """Human-like typing. Optional per-character delay + micro pauses."""
        delay = 35 if slowly else 0
        for i, ch in enumerate(text):
            self.page.keyboard.type(ch, delay=delay)
            if slowly and random.random() < 0.08:  # occasional think pause
                time.sleep(random.uniform(0.15, 0.45))
            if i % 12 == 0 and slowly:
                time.sleep(0.03)
        time.sleep(0.1)

    def mouse_move_to_ref(self, ref: str, jitter: bool = True) -> Optional[Tuple[int, int]]:
        """Move mouse to center of a snapshot ref (with optional human jitter)."""
        box = self._ref_to_box.get(ref)
        if not box:
            return None
        x, y, w, h = box
        cx, cy = x + w // 2, y + h // 2
        if jitter:
            cx += random.randint(-4, 4)
            cy += random.randint(-3, 3)
        self.page.mouse.move(cx, cy)
        time.sleep(0.08 + random.uniform(0, 0.06))
        return cx, cy

    def mouse_click(self, ref: Optional[str] = None, x: Optional[int] = None, y: Optional[int] = None,
                    button: str = "left", double: bool = False) -> None:
        """Raw mouse click. Prefer ref (looks up box) or explicit x/y."""
        if ref:
            pos = self.mouse_move_to_ref(ref)
            if pos:
                x, y = pos
        if x is None or y is None:
            # Fallback: click center of viewport-ish
            x, y = 640, 360
        if double:
            self.page.mouse.dblclick(x, y, button=button)
        else:
            self.page.mouse.click(x, y, button=button)
        time.sleep(0.2 + random.uniform(0, 0.15))

    def scroll(self, dy: int = 400, dx: int = 0) -> None:
        """Natural scroll using mouse wheel (human-like)."""
        # Small randomized chunks feel more human
        remaining = dy
        direction = 1 if dy > 0 else -1
        while abs(remaining) > 0:
            chunk = min(abs(remaining), random.randint(180, 320)) * direction
            self.page.mouse.wheel(dx, chunk)
            remaining -= chunk
            time.sleep(random.uniform(0.03, 0.09))
        time.sleep(0.15)

    def wait_for(self, timeout: float = 1.0) -> None:
        time.sleep(timeout)

    def screenshot(self, path: str = "/tmp/native_agent_screenshot.png") -> str:
        self.page.screenshot(path=path, full_page=False)
        return path

    def _build_snapshot_tree(self, max_depth: int = 6) -> Dict[str, Any]:
        """Build a ref + box snapshot using JS (similar spirit to MCP browser_snapshot)."""
        js = """
        (maxDepth) => {
            let id = 0;
            const getText = (el) => {
                let t = (el.innerText || el.value || el.placeholder || el.alt || '').trim();
                return t.length > 120 ? t.slice(0, 117) + '...' : t;
            };
            const isVisible = (rect) => rect.width > 2 && rect.height > 2 && rect.top < window.innerHeight + 100 && rect.left < window.innerWidth + 100;
            function walk(node, depth) {
                if (!node || depth > maxDepth || node.nodeType !== 1) return null;
                const rect = node.getBoundingClientRect();
                if (!isVisible(rect)) return null;
                const role = node.getAttribute('role') || node.tagName.toLowerCase();
                const text = getText(node);
                const ref = 'e' + (id++);
                const box = [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)];
                const children = [];
                for (const child of node.children || []) {
                    const c = walk(child, depth + 1);
                    if (c) children.push(c);
                }
                const important = ['a','button','input','textarea','select','img','h1','h2','h3','li','label','[role="button"]'];
                if (children.length === 0 && !text && !important.some(x => role.includes(x) || role === x)) {
                    return null;
                }
                return { ref, role, text, box, children: children.length ? children : undefined };
            }
            const root = walk(document.body || document.documentElement, 0) || {ref:'e0', role:'body', text:'', box:[0,0,1280,720], children:[]};
            return root;
        }
        """
        try:
            tree = self.page.evaluate(js, max_depth)
            return tree
        except Exception as e:
            return {"ref": "e0", "role": "body", "text": f"Snapshot error: {e}", "box": [0, 0, 1280, 720], "children": []}

    def snapshot(self, depth: int = 5) -> str:
        """Return human + LLM readable snapshot with refs and boxes. Updates internal ref->box map."""
        tree = self._build_snapshot_tree(depth)
        self._ref_to_box.clear()

        def fmt(node, indent=0):
            ref = node.get("ref", "?")
            box = node.get("box", [0,0,0,0])
            self._ref_to_box[ref] = box
            role = node.get("role", "")
            text = node.get("text", "")
            line = "  " * indent + f"- {role} [ref={ref}] [box={box[0]},{box[1]},{box[2]},{box[3]}]"
            if text:
                line += f' "{text}"'
            lines = [line]
            for c in node.get("children", []) or []:
                lines.extend(fmt(c, indent + 1))
            return lines

        lines = [f"URL: {self.get_url()}", f"Title: {self.get_title()}", "Snapshot (use ref= or box center for mouse/click actions):"]
        lines.extend(fmt(tree))
        self._last_snapshot_text = "\n".join(lines)
        return self._last_snapshot_text

    def get_last_snapshot(self) -> str:
        return self._last_snapshot_text or self.snapshot()

    def execute_action(self, action: Dict[str, Any]) -> Dict[str, str]:
        """Execute a single raw action. Returns observation dict."""
        act = (action.get("action") or "").lower().strip()
        result = {"action": act, "status": "ok"}

        try:
            if act == "goto":
                url = action.get("url") or action.get("target") or ""
                if url:
                    self.goto(url)
                    result["observation"] = f"Navigated to {self.get_url()}. Title: {self.get_title()}"
                else:
                    result["status"] = "missing url"

            elif act in ("press_key", "keyboard_shortcut", "press"):
                key = action.get("key") or action.get("keys") or ""
                if key:
                    self.press_key(key)
                    result["observation"] = f"Pressed '{key}'. Current URL: {self.get_url()}"
                else:
                    result["status"] = "missing key"

            elif act in ("type", "type_text", "fill"):
                text = action.get("text") or action.get("value") or action.get("content") or ""
                slowly = action.get("slowly", True)
                if text:
                    self.type_text(str(text), slowly=slowly)
                    result["observation"] = f"Typed {len(text)} chars (slowly={slowly})."
                else:
                    result["status"] = "missing text"

            elif act in ("click", "mouse_click"):
                ref = action.get("ref") or action.get("target")
                x = action.get("x")
                y = action.get("y")
                dbl = bool(action.get("double") or action.get("doubleClick"))
                self.mouse_click(ref=ref, x=x, y=y, double=dbl)
                result["observation"] = f"Clicked (ref={ref or 'direct'}, x={x}, y={y})."

            elif act in ("mouse_move", "move"):
                ref = action.get("ref")
                if ref:
                    self.mouse_move_to_ref(ref)
                    result["observation"] = f"Moved mouse to ref={ref}."

            elif act in ("scroll", "scroll_down", "scroll_up"):
                dy = action.get("dy") or action.get("delta") or (300 if "down" in act or act == "scroll" else -300)
                self.scroll(int(dy))
                result["observation"] = f"Scrolled dy={dy}."

            elif act == "snapshot":
                snap = self.snapshot(depth=action.get("depth", 5))
                result["observation"] = snap[:2000] + ("..." if len(snap) > 2000 else "")

            elif act == "screenshot":
                path = action.get("path", "/tmp/native_agent_screenshot.png")
                self.screenshot(path)
                result["observation"] = f"Screenshot saved to {path}."

            elif act == "wait":
                secs = float(action.get("seconds") or action.get("timeout") or 1.0)
                self.wait_for(secs)
                result["observation"] = f"Waited {secs}s."

            elif act == "list_actions":
                result["observation"] = json.dumps([
                    "goto", "press_key / keyboard_shortcut", "type_text / type / fill",
                    "click / mouse_click (by ref or x,y)", "mouse_move", "scroll",
                    "snapshot", "screenshot", "wait"
                ])

            else:
                # Generic fallback via evaluate if user passes raw
                if "js" in action or "evaluate" in action:
                    fn = action.get("js") or action.get("evaluate")
                    out = self.page.evaluate(fn)
                    result["observation"] = str(out)[:500]
                else:
                    result["status"] = f"unknown action: {act}"

        except PlaywrightError as e:
            result["status"] = "playwright_error"
            result["observation"] = str(e)[:300]
        except Exception as e:
            result["status"] = "error"
            result["observation"] = str(e)[:300]

        return result


class NativeLLMAgent:
    """LLM-powered end-to-end agent that reasons and drives the raw Playwright actions."""

    def __init__(
        self,
        model: str = "llama3.1",
        backend: str = "ollama",
        base_url: Optional[str] = None,
        browser: Optional[PlaywrightNativeBrowser] = None,
        narrate: bool = True,  # English narration like the requested screen sessions
    ):
        self.model = model
        self.backend = backend.lower()
        self.base_url = base_url or ("http://localhost:11434" if backend == "ollama" else "http://localhost:8000/v1")
        self.narrate = narrate

        self.browser = browser or PlaywrightNativeBrowser()

        self.conversation: List[Dict[str, Any]] = []
        self.system_prompt = self._build_system_prompt()

    def _build_system_prompt(self) -> str:
        narration = ""
        if self.narrate:
            narration = """
NARRATION: Before every JSON action block, output 1-3 sentences of clear English describing:
- What you see in the latest observation/snapshot (key elements, refs, layout).
- Your current plan and why (e.g. "I'll use Control+L then type the URL because keyboard is more reliable").
- The exact next action(s).
This makes the run (e.g. when watched via logs or screen) understandable in plain English.
"""

        return f"""You are a skilled end-to-end browser-native agent. You control a real browser instance using ONLY raw human-like Playwright actions for maximum reliability and realism.

Available actions (output clean JSON, one or more per turn):
{{"action": "goto", "url": "https://..."}}
{{"action": "press_key", "key": "Control+L"}}
{{"action": "press_key", "key": "Enter"}}
{{"action": "type_text", "text": "search query here", "slowly": true}}
{{"action": "mouse_click", "ref": "e42"}}   # preferred — use ref from snapshot boxes
{{"action": "mouse_click", "x": 420, "y": 180}}
{{"action": "scroll", "dy": 350}}
{{"action": "snapshot"}}
{{"action": "screenshot"}}
{{"action": "wait", "seconds": 0.8}}
{{"action": "list_actions"}}

CRITICAL RULES — Human-like + Keyboard First:
1. ALWAYS start with keyboard shortcuts when possible (press_key "Control+L" for address bar, "Tab", "Enter", arrows, "Escape").
2. For clicking visible things: call "snapshot" first, then use "mouse_click" with a "ref" from the snapshot (the ref gives you accurate [box] so you can target precisely without brittle selectors).
3. Type naturally (type_text with slowly=true). Use press_key for single keys and modifiers.
4. Scroll with "scroll" (positive dy = down). Use small-to-medium chunks.
5. After important actions, call "snapshot" (or it is auto-provided) and analyze the refs + boxes + text before deciding the next move.
6. {narration}
7. When the user task is fully complete, stop emitting actions and output a clear natural-language final summary instead of JSON.

You receive observations after each action: current URL/title + the snapshot tree (with ref= and [box=...]).

Example flow for research:
1. press_key Control+L
2. type_text "LLM agents with browser control arxiv" , slowly true
3. press_key Enter
4. snapshot
5. mouse_click ref=... (on a promising paper link from the tree)
... continue until you have the papers, then give final answer.
"""

    def _call_llm(self, messages: List[Dict[str, Any]]) -> str:
        if self.backend == "ollama":
            url = f"{self.base_url}/api/chat"
            payload = {
                "model": self.model,
                "messages": messages,
                "stream": False,
                "options": {"temperature": 0.15},
            }
            resp = requests.post(url, json=payload, timeout=180)
            resp.raise_for_status()
            return resp.json()["message"]["content"]
        else:
            url = f"{self.base_url}/chat/completions"
            payload = {"model": self.model, "messages": messages, "temperature": 0.15}
            headers = {"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY', 'ollama')}"}
            resp = requests.post(url, json=payload, headers=headers, timeout=180)
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]

    def _parse_actions(self, text: str) -> List[Dict[str, Any]]:
        actions = []
        for line in text.strip().splitlines():
            line = line.strip()
            if line.startswith("{") and "action" in line:
                try:
                    act = json.loads(line)
                    if isinstance(act, dict) and "action" in act:
                        actions.append(act)
                except Exception:
                    pass
        return actions

    def _narrate(self, text: str):
        if self.narrate:
            # Print English parts nicely; the LLM is instructed to put narration before JSON
            print(f"\n[Agent] {text.strip()}\n")

    def run_single_prompt(self, prompt: str, max_turns: int = 15):
        print("=== Playwright Native Agent (raw human-like actions) ===")
        print(f"Model: {self.model} | Backend: {self.backend} | Narrate: {self.narrate}")
        print(f"Prompt:\n{prompt}\n")

        self.conversation = [{"role": "system", "content": self.system_prompt}]
        initial_obs = f"Initial state:\nURL: {self.browser.get_url()}\nTitle: {self.browser.get_title()}\n{self.browser.snapshot()}"
        self.conversation.append({"role": "user", "content": f"{prompt}\n\n{initial_obs}"})

        for turn in range(1, max_turns + 1):
            print(f"\n--- Turn {turn} ---")
            print("Agent thinking...")

            response = self._call_llm(self.conversation)
            print("Agent response:")
            print(response[:1500] + ("..." if len(response) > 1500 else ""))
            self.conversation.append({"role": "assistant", "content": response})

            actions = self._parse_actions(response)
            if not actions:
                # Probably the final natural language answer
                print("\n=== Final Answer (no more actions) ===")
                print(response)
                break

            for action in actions:
                if self.narrate:
                    # The LLM should have narrated in the response; we can echo context
                    pass
                obs = self.browser.execute_action(action)
                obs_text = obs.get("observation", str(obs))
                if len(obs_text) > 1800:
                    obs_text = obs_text[:1800] + "... [truncated]"

                self.conversation.append({
                    "role": "user",
                    "content": f"Observation after {action['action']}: {obs_text}"
                })
                print(f"  → {action['action']}: {obs.get('status', 'ok')} | {obs_text[:300]}...")

            # Auto snapshot after actions for the next LLM turn (rich observation)
            snap = self.browser.snapshot()
            self.conversation.append({
                "role": "user",
                "content": f"Updated snapshot (use the refs and boxes):\n{snap[:2200]}"
            })

        print("\n=== Native agent run finished ===")

    def run(self):
        print("Interactive mode not fully fleshed in this starter — use --prompt for now.")
        # Could add input loop similar to llm_chat.py if desired.


def main():
    parser = argparse.ArgumentParser(description="End-to-end browser-native Playwright agent using raw human-like actions.")
    parser.add_argument("--model", default="llama3.1")
    parser.add_argument("--backend", default="ollama", choices=["ollama", "openai"])
    parser.add_argument("--base-url")
    parser.add_argument("--prompt", help="Single prompt mode (recommended for complex tasks)")
    parser.add_argument("--max-turns", type=int, default=15)
    parser.add_argument("--no-narrate", action="store_true", help="Disable English narration in output")
    parser.add_argument("--headless", action="store_true")
    parser.add_argument("--profile", default="~/.grok-playwright-profile")
    args = parser.parse_args()

    browser = PlaywrightNativeBrowser(
        user_data_dir=args.profile,
        headless=args.headless,
    )

    agent = NativeLLMAgent(
        model=args.model,
        backend=args.backend,
        base_url=args.base_url,
        browser=browser,
        narrate=not args.no_narrate,
    )

    try:
        if args.prompt:
            agent.run_single_prompt(args.prompt, max_turns=args.max_turns)
        else:
            agent.run()
    finally:
        browser.close()


if __name__ == "__main__":
    main()
