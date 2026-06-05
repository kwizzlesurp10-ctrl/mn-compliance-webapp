#!/usr/bin/env python3
"""
Example: End-to-end browser-native agent (raw human-like Playwright actions).

This is the new capability on the feature/browser-native-agent branch:
- Uses Playwright directly for click (mouse via ref/box), scroll (wheel), type (slow), press_key (keyboard combos).
- Snapshot with ref= + [box=] for precise, selector-free targeting.
- Same LLM backends.
- Strong emphasis on keyboard-first + natural mouse movements.

Run examples of the research task that motivated this:
    python examples/native_browser_agent.py --model llama3.1 --prompt "You are a research agent. Search for recent papers on 'LLM agents with browser control' using general web search first. Open the top 3 promising arxiv results and extract title, authors, year, one-sentence summary each. Use keyboard shortcuts and mouse clicks from snapshot refs/boxes."

Or interactive control.
"""

import argparse
from playwright_native_agent import NativeLLMAgent, PlaywrightNativeBrowser

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="llama3.1")
    parser.add_argument("--backend", default="ollama")
    parser.add_argument("--prompt")
    parser.add_argument("--max-turns", type=int, default=18)
    parser.add_argument("--headless", action="store_true")
    args = parser.parse_args()

    print("Starting Browser Native Agent (raw Playwright actions: click/scroll/type/press)...")
    browser = PlaywrightNativeBrowser(headless=args.headless)
    agent = NativeLLMAgent(
        model=args.model,
        backend=args.backend,
        browser=browser,
        narrate=True,
    )

    try:
        if args.prompt:
            agent.run_single_prompt(args.prompt, max_turns=args.max_turns)
        else:
            print("No --prompt given. Launching basic REPL (limited). Type 'quit' to exit.")
            # Minimal REPL for demo
            while True:
                user = input("\nYou (task or 'snapshot' or 'quit'): ").strip()
                if user.lower() in {"quit", "exit", "q"}:
                    break
                if user.lower() == "snapshot":
                    print(agent.browser.snapshot())
                    continue
                agent.run_single_prompt(user, max_turns=6)
    finally:
        browser.close()
