#!/usr/bin/env python3
"""Crop UI and creature sprites from scene.jpg using documented 1024x640 coords."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path("/Users/admin/Desktop/deep-abyss-demo")
SCENE = ROOT / "assets" / "scene.jpg"
OUT = ROOT / "assets" / "sprites"
CAT = ROOT / "assets" / "catalog.html"

OUT.mkdir(parents=True, exist_ok=True)
src = Image.open(SCENE).convert("RGBA")
assert src.size == (1024, 640), src.size


def crop(box):
    return src.crop(box)


def circle_mask(im):
    m = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(m)
    d.ellipse((1, 1, im.size[0] - 2, im.size[1] - 2), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(0.8))
    out = im.copy()
    out.putalpha(m)
    return out


def rounded_mask(im, r=10):
    m = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle((1, 1, im.size[0] - 2, im.size[1] - 2), radius=r, fill=255)
    out = im.copy()
    out.putalpha(Image.composite(m, Image.new("L", im.size, 0), m))
    a = out.split()[-1]
    out.putalpha(a.filter(ImageFilter.GaussianBlur(0.4)))
    return out


# (filename, box, kind) kind: raw | circle | rounded
ATLAS = [
    ("hud_points.png", (4, 2, 252, 72), "raw", "左上 POINTS 框"),
    ("hud_lvl.png", (20, 70, 114, 118), "raw", "左上 LVL 盾"),
    ("hud_time.png", (110, 70, 252, 118), "raw", "左上 TIME"),
    ("hud_gear.png", (786, 4, 870, 82), "raw", "右上 LVL 齿轮"),
    ("hud_pause.png", (956, 4, 1022, 54), "raw", "暂停按钮"),
    ("hud_gold.png", (820, 52, 1010, 92), "raw", "金币条"),
    ("hud_gems.png", (848, 86, 1016, 130), "raw", "宝石条"),
    ("panel_shop.png", (2, 88, 224, 548), "raw", "左侧商店整板"),
    ("title_equip.png", (28, 178, 196, 214), "raw", "EQUIPMENT 标题"),
    ("title_boats.png", (28, 328, 196, 364), "raw", "BOATS 标题"),
    ("rod_basic.png", (30, 218, 102, 290), "circle", "基础竿圆槽"),
    ("rod_fine.png", (110, 218, 182, 290), "circle", "进阶竿圆槽"),
    ("rod_master.png", (186, 218, 236, 290), "raw", "大师竿（靠右被裁）"),
    ("boat_row.png", (30, 368, 102, 440), "circle", "小船圆槽"),
    ("boat_motor.png", (110, 368, 182, 440), "circle", "摩托艇圆槽"),
    ("boat_sub.png", (186, 368, 236, 440), "raw", "潜艇（靠右被裁）"),
    ("current_rod.png", (18, 500, 114, 546), "raw", "Current Rod"),
    ("current_boat.png", (122, 500, 218, 546), "raw", "Current Boat"),
    ("panel_bait.png", (896, 108, 1022, 492), "raw", "右侧鱼饵整板"),
    ("bait_hook.png", (918, 178, 1004, 258), "rounded", "钩+乌贼 500"),
    ("bait_worm.png", (918, 258, 1004, 338), "rounded", "虫 1000"),
    ("bait_fish.png", (918, 338, 1004, 418), "rounded", "刺鱼 2500"),
    ("bait_shrimp.png", (918, 418, 1004, 492), "rounded", "虾 5000"),
    ("btn_bet.png", (732, 472, 850, 548), "circle", "BET 圆钮（避开下方标题条）"),
    ("btn_cast.png", (890, 494, 1018, 546), "rounded", "CAST 钮（避开下方标题条）"),
    ("banner.png", (268, 548, 800, 638), "raw", "底部羊皮纸标题"),
    ("fisher_boat.png", (300, 118, 470, 210), "raw", "渔船 THE SEA DEVIL"),
    ("hook_worm.png", (470, 300, 545, 385), "raw", "水中钩+虫"),
    ("fish_angler.png", (520, 210, 700, 390), "raw", "中间鮟鱇"),
    ("fish_angler_sm.png", (700, 250, 790, 340), "raw", "右侧小鮟鱇"),
    ("fish_school.png", (390, 360, 560, 470), "raw", "银鱼群"),
    ("fish_eel.png", (620, 160, 780, 250), "raw", "鳗"),
    ("fish_squid.png", (300, 280, 430, 420), "raw", "乌贼剪影"),
    ("fish_jelly.png", (780, 140, 870, 240), "raw", "水母一带"),
]

saved = []
for name, box, kind, note in ATLAS:
    im = crop(box)
    if kind == "circle":
        im = circle_mask(im)
    elif kind == "rounded":
        im = rounded_mask(im, r=12)
    path = OUT / name
    im.save(path)
    saved.append((name, im.size, kind, note, box))
    print(f"{name:20} {im.size} {box} {note}")

cards = []
for name, size, kind, note, box in saved:
    w, h = size
    cards.append(
        f"""<figure>
  <div class="board"><img src="../sprites/{name}" alt="{name}"></div>
  <figcaption>
    <b>{name}</b>
    <span>{w}×{h} · {kind}</span>
    <span>scene {box}</span>
    <i>{note}</i>
  </figcaption>
</figure>"""
    )

html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<title>Deep Abyss 切图目录</title>
<style>
  body {{ margin: 0; background: #12141a; color: #eee; font-family: ui-sans-serif, system-ui, sans-serif; }}
  header {{ padding: 18px 24px; background: #1c2028; border-bottom: 1px solid #333; }}
  h1 {{ margin: 0 0 6px; font-size: 20px; }}
  p {{ margin: 0; color: #aaa; font-size: 13px; }}
  main {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; padding: 20px; }}
  figure {{ margin: 0; background: #1a1e26; border: 1px solid #2c3340; border-radius: 10px; overflow: hidden; }}
  .board {{
    min-height: 140px; display: flex; align-items: center; justify-content: center; padding: 12px;
    background:
      linear-gradient(45deg, #2a2f38 25%, transparent 25%) 0 0 / 16px 16px,
      linear-gradient(45deg, transparent 75%, #2a2f38 75%) 0 0 / 16px 16px,
      linear-gradient(45deg, transparent 75%, #2a2f38 75%) 8px 8px / 16px 16px,
      linear-gradient(45deg, #2a2f38 25%, transparent 25%) 8px 8px / 16px 16px,
      #22262e;
  }}
  img {{ max-width: 100%; max-height: 180px; image-rendering: auto; }}
  figcaption {{ padding: 10px 12px 12px; font-size: 12px; display: grid; gap: 3px; }}
  figcaption b {{ font-size: 13px; }}
  figcaption span {{ color: #9aa3b2; }}
  figcaption i {{ color: #d7c39a; font-style: normal; }}
</style>
</head>
<body>
<header>
  <h1>切图目录 · assets/sprites</h1>
  <p>源图 1024×640 scene.jpg · 共 {len(saved)} 张 · 棋盘格方便看透明边</p>
</header>
<main>
{"".join(cards)}
</main>
</body>
</html>
"""
CAT.write_text(html, encoding="utf-8")
print("catalog", CAT)
