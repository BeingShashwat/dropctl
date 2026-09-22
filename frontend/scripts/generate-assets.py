#!/usr/bin/env python3
"""
Generates the static social + icon assets from the dropctl brand lockups.

Run from the `frontend` directory:

    python3 scripts/generate-assets.py

Source artwork (user-provided, in brand/):
    logo-without-background.png   full lockup on transparency
    logo-with-background.png      same lockup on white

Produces:
    src/assets/logo-mark-light.png   mark crop, original blue+navy (light UI)
    src/assets/logo-mark-dark.png    mark crop, navy remapped to light (dark UI)
    public/favicon.png               48x48 white-tile icon
    public/apple-touch-icon.png      180x180 white-tile icon
    public/icon-192.png              192x192 white-tile icon
    public/icon-512.png              512x512 white-tile icon
    public/og-image.png              1200x630 social card

The transparent lockup is one square canvas holding the drop-arrow mark on top
and the full "dropctl" wordmark (flanked by two rails) below. The mark occupies
roughly the top three quarters of the content height.
"""

from __future__ import annotations

import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.normpath(os.path.join(ROOT, "..", "public"))
BRAND_DIR = os.path.normpath(os.path.join(ROOT, "..", "brand"))
ASSETS_DIR = os.path.normpath(os.path.join(ROOT, "..", "src", "assets"))

SRC_TRANSPARENT = os.path.join(BRAND_DIR, "logo-without-background.png")
SRC_WHITE = os.path.join(BRAND_DIR, "logo-with-background.png")

# ── Palette (mirrors src/index.css) ───────────────────────────────────────
FG_DARK_UI = (0xE2, 0xE6, 0xED)  # --fg in dark mode; replaces navy there
WHITE = (255, 255, 255)

DARK_BG_TOP = (0x15, 0x19, 0x20)
DARK_BG_BOTTOM = (0x0E, 0x11, 0x16)
FG = (0xE2, 0xE6, 0xED)
MUTED = (0x98, 0xA2, 0xB3)
FAINT = (0x5C, 0x66, 0x78)
GLOW_BLUE = (0x00, 0x46, 0xA8)
ACCENT_BLUE = (0x00, 0x69, 0xFC)  # the logo's own blue, used on dark slate

SANS_BOLD_CANDIDATES = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf",
]
SANS_REGULAR_CANDIDATES = [
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]
MONO_CANDIDATES = [
    "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
]

# ══════════════════════════════════════════════════════════════════════════


def find_font(candidates: list[str]) -> str | None:
    for path in candidates:
        if os.path.exists(path):
            return path
    return None


def load_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont:
    path = find_font(candidates)
    if path is None:
        print("  ! no font found, using bitmap default")
        return ImageFont.load_default()
    return ImageFont.truetype(path, size)


def content_bbox(im: Image.Image) -> tuple[int, int, int, int]:
    """Tight crop to alpha content."""
    return im.split()[3].getbbox()


def load_transparent() -> Image.Image:
    return Image.open(SRC_TRANSPARENT).convert("RGBA")


def load_white() -> Image.Image:
    return Image.open(SRC_WHITE).convert("RGBA")


def remap_dark(im: Image.Image) -> Image.Image:
    """
    Return a copy where navy artwork pixels are replaced with the dark-UI
    foreground tone. Blue pixels and alpha are untouched. A pixel counts as
    navy when it is a saturated dark blue: b > r + 40, g < 120, lum < 120.
    """
    out = im.copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0 and b > r + 40 and g < 120 and (r + g + b) / 3 < 120:
                px[x, y] = (*FG_DARK_UI, a)
    return out


def mark_crop(im: Image.Image) -> Image.Image:
    """
    Crop to the drop-arrow mark: the top portion of the content area, then
    re-trim to the mark's own bbox (the wordmark is wider than the mark, so
    the lockup bbox would pad the mark off-centre).
    """
    x0, y0, x1, y1 = content_bbox(im)
    cut = y0 + int((y1 - y0) * 0.75)
    mark = im.crop((x0, y0, x1, cut))
    return mark.crop(mark.split()[3].getbbox())


def squarify(im: Image.Image, fill: float = 0.84) -> Image.Image:
    """Pad to a square on transparency so the artwork fills `fill` of the tile."""
    w, h = im.size
    side = round(max(w, h) / fill)
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    out.paste(im, ((side - w) // 2, (side - h) // 2))
    return out


def white_tile_icon(px_size: int) -> Image.Image:
    """
    Icon built from the with-background lockup: the artwork already sits on
    white, so a white square with the art at ~84% is correct. White tiles
    survive every OS mask and every browser-tab theme.
    """
    src = load_white()
    # The white version is fully opaque; take the artwork bbox from the
    # transparent version, which carries the same art.
    x0, y0, x1, y1 = content_bbox(load_transparent())
    art = src.crop((x0, y0, x1, y1))
    sq = squarify(art, fill=0.84)
    canvas = Image.new("RGBA", sq.size, WHITE + (255,))
    canvas.alpha_composite(sq)
    return canvas.resize((px_size, px_size), Image.LANCZOS)


def vertical_gradient(size: tuple[int, int], top: tuple, bottom: tuple) -> Image.Image:
    width, height = size
    strip = Image.new("RGB", (1, height))
    for y in range(height):
        t = y / max(1, height - 1)
        strip.putpixel(
            (0, y), tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        )
    return strip.resize((width, height), Image.BILINEAR)


def og_image() -> Image.Image:
    W, H = 1200, 630
    Ws, Hs = W * 2, H * 2

    canvas = vertical_gradient((Ws, Hs), DARK_BG_TOP, DARK_BG_BOTTOM).convert("RGBA")

    # Soft blue glow upper-left so the card is not a flat rectangle.
    glow = Image.new("RGBA", (Ws, Hs), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(
        [-Ws * 0.15, -Hs * 0.55, Ws * 0.55, Hs * 0.40], fill=GLOW_BLUE + (70,)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(Ws * 0.10))
    canvas = Image.alpha_composite(canvas, glow)

    draw = ImageDraw.Draw(canvas)
    pad = int(Ws * 0.065)

    # ── brand lockup, recoloured for the dark background ──
    lock = remap_dark(load_transparent())
    lb = content_bbox(lock)
    lock = lock.crop(lb)
    lock_h = int(Hs * 0.42)
    lock_w = round(lock.width * lock_h / lock.height)
    lock = lock.resize((lock_w, lock_h), Image.LANCZOS)
    lock_y = int(Hs * 0.14)
    canvas.alpha_composite(lock, (pad, lock_y))

    # ── headline, right of the lockup ──
    head_x = pad + lock_w + int(Ws * 0.045)
    draw = ImageDraw.Draw(canvas)
    headline = load_font(SANS_BOLD_CANDIDATES, int(Hs * 0.085))
    draw.text((head_x, lock_y + int(Hs * 0.015)), "Send a file", font=headline, fill=FG)
    draw.text(
        (head_x, lock_y + int(Hs * 0.125)),
        "that deletes itself.",
        font=headline,
        fill=ACCENT_BLUE,
    )

    # ── supporting line ──
    draw.text(
        (pad, int(Hs * 0.655)),
        "Upload once, share a short link and QR code, and pick exactly how long it lives.",
        font=load_font(SANS_REGULAR_CANDIDATES, int(Hs * 0.045)),
        fill=MUTED,
    )

    # ── spec strip ──
    mono = load_font(MONO_CANDIDATES, int(Hs * 0.030))
    chips = ["1h → 7d", "10 MB max", "AES-256 at rest", "auto-deleted"]
    cx = pad
    chip_y = int(Hs * 0.79)
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

    return canvas.convert("RGB").resize((W, H), Image.LANCZOS)


def main() -> int:
    out_pub = os.path.normpath(PUBLIC_DIR)
    os.makedirs(out_pub, exist_ok=True)
    os.makedirs(ASSETS_DIR, exist_ok=True)

    print("Generating brand assets from brand/ lockups…")

    # In-app marks (light + dark variants)
    mark = mark_crop(load_transparent())
    sq = squarify(mark, fill=0.84)
    light = sq.resize((320, 320), Image.LANCZOS)
    dark_mark = remap_dark(mark)
    dark = squarify(dark_mark, fill=0.84).resize((320, 320), Image.LANCZOS)

    print("  src/assets/logo-mark-light.png")
    light.save(os.path.join(ASSETS_DIR, "logo-mark-light.png"), optimize=True)
    print("  src/assets/logo-mark-dark.png")
    dark.save(os.path.join(ASSETS_DIR, "logo-mark-dark.png"), optimize=True)

    # White-tile icons (favicon, iOS, PWA)
    for name, px in (
        ("favicon.png", 48),
        ("apple-touch-icon.png", 180),
        ("icon-192.png", 192),
        ("icon-512.png", 512),
    ):
        print(f"  public/{name}")
        white_tile_icon(px).save(os.path.join(out_pub, name), optimize=True)

    print("  public/og-image.png")
    og_image().save(os.path.join(out_pub, "og-image.png"), optimize=True)

    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
