#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import struct
from pathlib import Path

PNG_SIGNATURE = bytes([137, 80, 78, 71, 13, 10, 26, 10])


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--png", required=True)
    parser.add_argument("--request", required=True)
    args = parser.parse_args()

    png_path = Path(args.png)
    request_path = Path(args.request)
    raw = png_path.read_bytes()
    request = json.loads(request_path.read_text(encoding="utf-8"))
    preview = request["preview"]

    if len(raw) < 24 or raw[:8] != PNG_SIGNATURE:
        raise SystemExit("preview validation FAIL: invalid PNG signature")

    width, height = struct.unpack(">II", raw[16:24])
    expected_width = int(preview["width"])
    expected_height = int(preview["height"])
    max_bytes = int(preview["maxPngBytes"])

    if width != expected_width or height != expected_height:
        raise SystemExit(
            f"preview validation FAIL: unexpected dimensions {width}x{height}; "
            f"expected {expected_width}x{expected_height}"
        )
    if len(raw) > max_bytes:
        raise SystemExit(f"preview validation FAIL: {len(raw)} bytes exceeds {max_bytes}")

    print(f"preview validation PASS: {width}x{height} {len(raw)}B")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
