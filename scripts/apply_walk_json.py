#!/usr/bin/env python3
"""Copy an exported walk JSON onto the production player config."""
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "dist" / "bean-to-cup.walk.json"


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/apply_walk_json.py /path/to/bean-to-cup.walk.json")
        sys.exit(1)
    src = Path(sys.argv[1]).expanduser()
    data = json.loads(src.read_text())
    if "world" not in data or "camera" not in data:
        print("Not a walk config (need world + camera)")
        sys.exit(1)
    shutil.copy2(src, DEST)
    DEST.write_text(json.dumps(data, indent=2) + "\n")
    print("Wrote", DEST)


if __name__ == "__main__":
    main()
