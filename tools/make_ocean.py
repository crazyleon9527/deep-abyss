#!/usr/bin/env python3
"""World-only background: crop the ocean/boat from the mock, drop HUD/sidebars."""
from pathlib import Path
from PIL import Image

ROOT = Path("/Users/admin/Desktop/deep-abyss-demo")
src = Image.open(ROOT / "assets" / "scene.jpg").convert("RGB")
# Keep sky + boat + water; drop shop, bait, HUD corners, parchment banner.
world = src.crop((270, 0, 718, 458))
world.save(ROOT / "assets" / "ocean.jpg", quality=93)
print("wrote", world.size)
