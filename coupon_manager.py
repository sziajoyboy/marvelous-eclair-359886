#!/usr/bin/env python
"""
Safe local coupon manager.

This script stores coupon codes that you already have. It does not contact
Foodora or any other service, does not guess codes, and does not try to bypass
coupon rules.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from datetime import date, datetime
from pathlib import Path


DATA_FILE = Path("coupons.json")
CODE_PATTERN = re.compile(r"^[A-Z0-9][A-Z0-9_-]{1,40}$", re.IGNORECASE)


@dataclass
class Coupon:
    code: str
    source: str = ""
    note: str = ""
    expires: str = ""
    used: bool = False


def load_coupons() -> list[Coupon]:
    if not DATA_FILE.exists():
        return []

    try:
        raw = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Cannot read {DATA_FILE}: invalid JSON ({exc})")

    return [Coupon(**item) for item in raw]


def save_coupons(coupons: list[Coupon]) -> None:
    data = [asdict(coupon) for coupon in coupons]
    DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def normalize_code(code: str) -> str:
    normalized = code.strip().upper()
    if not CODE_PATTERN.match(normalized):
        raise SystemExit("Invalid coupon code format. Use letters, numbers, dash, or underscore.")
    return normalized


def validate_date(value: str) -> str:
    if not value:
        return ""

    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise SystemExit("Invalid expiry date. Use YYYY-MM-DD, for example 2026-12-31.")

    return value


def add_coupon(args: argparse.Namespace) -> None:
    coupons = load_coupons()
    code = normalize_code(args.code)

    if any(coupon.code == code for coupon in coupons):
        raise SystemExit(f"{code} is already saved.")

    coupon = Coupon(
        code=code,
        source=args.source.strip(),
        note=args.note.strip(),
        expires=validate_date(args.expires.strip()),
    )
    coupons.append(coupon)
    save_coupons(coupons)
    print(f"Saved {code}.")


def list_coupons(args: argparse.Namespace) -> None:
    coupons = load_coupons()

    if args.active:
        today = date.today().isoformat()
        coupons = [
            coupon
            for coupon in coupons
            if not coupon.used and (not coupon.expires or coupon.expires >= today)
        ]

    coupons.sort(key=lambda coupon: (coupon.used, coupon.expires or "9999-99-99", coupon.code))

    if not coupons:
        print("No coupons found.")
        return

    for coupon in coupons:
        status = "used" if coupon.used else "active"
        expiry = coupon.expires or "no expiry"
        source = f" | {coupon.source}" if coupon.source else ""
        note = f" | {coupon.note}" if coupon.note else ""
        print(f"{coupon.code} | {status} | expires: {expiry}{source}{note}")


def mark_used(args: argparse.Namespace) -> None:
    coupons = load_coupons()
    code = normalize_code(args.code)

    for coupon in coupons:
        if coupon.code == code:
            coupon.used = True
            save_coupons(coupons)
            print(f"Marked {code} as used.")
            return

    raise SystemExit(f"{code} was not found.")


def remove_coupon(args: argparse.Namespace) -> None:
    coupons = load_coupons()
    code = normalize_code(args.code)
    remaining = [coupon for coupon in coupons if coupon.code != code]

    if len(remaining) == len(coupons):
        raise SystemExit(f"{code} was not found.")

    save_coupons(remaining)
    print(f"Removed {code}.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Store and manage coupon codes locally.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    add = subparsers.add_parser("add", help="Save a coupon code you already have.")
    add.add_argument("code")
    add.add_argument("--source", default="", help="Where the coupon came from.")
    add.add_argument("--note", default="", help="Optional note.")
    add.add_argument("--expires", default="", help="Expiry date as YYYY-MM-DD.")
    add.set_defaults(func=add_coupon)

    show = subparsers.add_parser("list", help="List saved coupons.")
    show.add_argument("--active", action="store_true", help="Only show unused, non-expired coupons.")
    show.set_defaults(func=list_coupons)

    used = subparsers.add_parser("used", help="Mark a coupon as used.")
    used.add_argument("code")
    used.set_defaults(func=mark_used)

    remove = subparsers.add_parser("remove", help="Remove a coupon.")
    remove.add_argument("code")
    remove.set_defaults(func=remove_coupon)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
