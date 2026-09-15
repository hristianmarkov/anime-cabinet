#!/usr/bin/env python3
"""CLI bridge to seo_mcp.services (same package as Cursor dataseo MCP)."""
from __future__ import annotations

import json
import sys


def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: dataseo_bridge.py <action> [json-args]"}))
        sys.exit(1)

    action = sys.argv[1]
    args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}

    try:
        from seo_mcp.services import keyword_difficulty, keyword_generator
    except ImportError as exc:
        print(json.dumps({"error": f"seo_mcp not importable: {exc}"}))
        sys.exit(1)

    try:
        if action == "keyword_generator":
            result = keyword_generator(
                keyword=args["keyword"],
                country=args.get("country", "us"),
                search_engine=args.get("search_engine", "Google"),
            )
            print(json.dumps({"ok": True, "data": result}))
            return

        if action == "keyword_difficulty":
            result = keyword_difficulty(
                keyword=args["keyword"],
                country=args.get("country", "us"),
            )
            print(json.dumps({"ok": True, "data": result}))
            return

        print(json.dumps({"error": f"Unknown action: {action}"}))
        sys.exit(1)
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
