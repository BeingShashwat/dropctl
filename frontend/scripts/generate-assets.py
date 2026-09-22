#!/usr/bin/env python3
"""
Generates the static social + icon assets from the dropctl brand mark.

Run from the `frontend` directory:

    python3 scripts/generate-assets.py

Produces (all into public/):
    og-image.png          1200x630  social share card
    apple-touch-icon.png   180x180  iOS home screen
    icon-192.png           192x192  PWA / Android
    icon-512.png           512x512  PWA / Android

The mark is redrawn here rather than rasterised from the SVG so the script has
no native dependencies. Geometry mirrors src/components/layout/BrandMark.tsx:
an arrow descending into the gap between two rails.
"""

from __future__ import annotations

import glob
import os
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")

# ── Palette (mirrors src/index.css tokens) ────────────────────────────────
ACCENT = (0x51, 0x45, 0xCD)
ACCENT_DEEP = (0x36, 0x2C, 0xA8)
DARK_BG_TOP = (0x15, 0x19, 0x20)
DARK_BG_BOTTOM = (0x0E, 0x11, 0x16)
FG = (0xE2, 0xE6, 0xED)
MUTED = (0x98, 0xA2, 0xB3)
FAINT = (0x5C, 0x66, 0x78)
ACCENT_LIGHT = (0xA8, 0xA3, 0xF5)
WHITE = (0xFF, 0xFF, 0xFF)

SS = 4  # supersampling factor — Pillow lines are aliased, so we draw big

SANS_CANDIDATES = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
    "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
    "/usr/share/fonts/truetype/ubuntu/Ubuntu-Bold.ttf",
]
SANS_REGULAR_CANDIDATES = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf",
]
MONO_CANDIDATES = [
    os.path.expanduser(
        "~/.local/share/fonts/JetBrainsMono/JetBrainsMonoNerdFont-Medium.ttf"
    ),
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
]


def find_font(candidates: list[str]) -> str | None:
    for path in candidates:
        if os.path.exists(path):
            return path
        matches = glob.glob(path)
        if matches:
            return matches[0]
    return None


def load_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont:
    path = find_font(candidates)
    if path is None:
        print(f"  ! no font found, using bitmap default")
        return ImageFont.load_default()
    return ImageFont.truetype(path, size)


def vertical_gradient(size: tuple[int, int], top: tuple, bottom: tuple) -> Image.Image:
    width, height = size
    strip = Image.new("RGB", (1, height))
    for y in range(height):
        t = y / max(1, height - 1)
        strip.putpixel(
            (0, y), tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        )
    return strip.resize((width, height), Image.BILINEAR)


def draw_mark(
    draw: ImageDraw.ImageDraw,
    ox: float,
    oy: float,
    box: float,
    color: tuple,
    stroke: float = 1.9,
) -> None:
    """Draw the brand mark inside a `box`-sized square starting at (ox, oy)."""
    scale = box / 24.0
    width = max(1, round(stroke * scale))

    def point(x: float, y: float) -> tuple[float, float]:
        return (ox + x * scale, oy + y * scale)

    def segment(x1: float, y1: float, x2: float, y2: float) -> None:
        p1, p2 = point(x1, y1), point(x2, y2)
        draw.line([p1, p2], fill=color, width=width)
        # Pillow has no line caps, so stamp the ends to round them off.
        radius = width / 2
        for px, py in (p1, p2):
            draw.ellipse(
                [px - radius, py - radius, px + radius, py + radius], fill=color
            )

    # the slot
    segment(3.25, 17.75, 7.75, 17.75)
    segment(16.25, 17.75, 20.75, 17.75)
    # the drop
    segment(12, 3.25, 12, 14.75)
    segment(8.4, 11.15, 12, 14.75)
    segment(12, 14.75, 15.6, 11.15)


def app_icon(px: int) -> Image.Image:
    """Full-bleed square icon — the OS applies its own masking."""
    size = px * SS
    canvas = vertical_gradient((size, size), ACCENT, ACCENT_DEEP).convert("RGBA")
    draw = ImageDraw.Draw(canvas)
    mark_box = size * 0.52
    draw_mark(draw, (size - mark_box) / 2, (size - mark_box) / 2, mark_box, WHITE)
    return canvas.resize((px, px), Image.LANCZOS)


def og_image() -> Image.Image:
    W, H = 1200, 630
    Ws, Hs = W * 2, H * 2  # 2x is plenty here; keeps the file small

    bg = vertical_gradient((Ws, Hs), DARK_BG_TOP, DARK_BG_BOTTOM).convert("RGBA")

    # Soft accent glow in the upper-left, so the card is not a flat rectangle.
    glow = Image.new("RGBA", (Ws, Hs), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(
        [-Ws * 0.18, -Hs * 0.55, Ws * 0.55, Hs * 0.42], fill=ACCENT_LIGHT + (78,)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(Ws * 0.09))
    bg = Image.alpha_composite(bg, glow)

    draw = ImageDraw.Draw(bg)
    pad = int(Ws * 0.075)

    # ── brand lockup ──
    lock = int(Ws * 0.052)
    lock_y = int(Hs * 0.145)
    tile = Image.new("RGBA", (lock, lock), (0, 0, 0, 0))
    tile.paste(
        vertical_gradient((lock, lock), ACCENT, ACCENT_DEEP), (0, 0)
    )
    mask = Image.new("L", (lock, lock), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, lock - 1, lock - 1], radius=int(lock * 0.24), fill=255
    )
    bg.paste(tile, (pad, lock_y), mask)
    draw = ImageDraw.Draw(bg)
    mark_box = lock * 0.54
    draw_mark(
        draw,
        pad + (lock - mark_box) / 2,
        lock_y + (lock - mark_box) / 2,
        mark_box,
        WHITE,
        stroke=2.15,
    )

    sans_bold = load_font(SANS_CANDIDATES, int(Hs * 0.058))
    sans_reg = load_font(SANS_REGULAR_CANDIDATES, int(Hs * 0.045))
    mono = load_font(MONO_CANDIDATES, int(Hs * 0.030))

    word_x = pad + lock + int(Ws * 0.022)
    draw.text((word_x, lock_y + lock * 0.16), "dropctl", font=sans_bold, fill=FG)

    # ── headline ──
    head_y = int(Hs * 0.36)
    draw.text(
        (pad, head_y),
        "Send a file",
        font=load_font(SANS_CANDIDATES, int(Hs * 0.088)),
        fill=FG,
    )
    draw.text(
        (pad, head_y + int(Hs * 0.105)),
        "that deletes itself.",
        font=load_font(SANS_CANDIDATES, int(Hs * 0.088)),
        fill=ACCENT_LIGHT,
    )

    # ── supporting line ──
    draw.text(
        (pad, int(Hs * 0.665)),
        "Upload once, share a short link and QR code, and pick exactly how long it lives.",
        font=sans_reg,
        fill=MUTED,
    )

    # ── spec strip ──
    chips = ["1h → 7d", "10 MB max", "AES-256 at rest", "auto-deleted"]
    cx = pad
    chip_y = int(Hs * 0.80)
    for chip in chips:
        width = draw.textlength(chip, font=mono)
        draw.rounded_rectangle(
            [cx, chip_y, cx + width + int(Ws * 0.022), chip_y + int(Hs * 0.062)],
            radius=int(Hs * 0.031),
            outline=FAINT,
            width=2,
        )
        draw.text(
            (cx + int(Ws * 0.011), chip_y + int(Hs * 0.016)),
            chip,
            font=mono,
            fill=MUTED,
        )
        cx += width + int(Ws * 0.022) + int(Ws * 0.014)

    return bg.convert("RGB").resize((W, H), Image.LANCZOS)


def main() -> int:
    out = os.path.normpath(PUBLIC_DIR)
    os.makedirs(out, exist_ok=True)

    print("Generating brand assets…")

    print("  og-image.png")
    og_image().save(os.path.join(out, "og-image.png"), optimize=True)

    print("  apple-touch-icon.png")
    app_icon(180).save(os.path.join(out, "apple-touch-icon.png"), optimize=True)

    for px in (192, 512):
        print(f"  icon-{px}.png")
        app_icon(px).save(os.path.join(out, f"icon-{px}.png"), optimize=True)

    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
