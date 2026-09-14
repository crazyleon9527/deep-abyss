# 背景音乐来源与许可

本目录下 9 首背景音乐**全部来自 [OpenGameArt.org](https://opengameart.org)，许可均为 CC0
（公有领域）**，可商用、**署名非强制**。这里列出出处仅为尊重作者。

| 文件 | 用在哪 | 曲名 | 作者 / 出处 |
|---|---|---|---|
| `clear.ogg` | 晴 | Calm and simple title music | [opengameart.org/content/calm-and-simple-title-music](https://opengameart.org/content/calm-and-simple-title-music) |
| `overcast.mp3` | 阴 | Calm Loop（Relaxing） | [opengameart.org/content/calm-loop](https://opengameart.org/content/calm-loop) |
| `wind.mp3` | 疾风 | Eye of the Storm | [opengameart.org/content/eye-of-the-storm](https://opengameart.org/content/eye-of-the-storm) |
| `rain.ogg` | 雨 | Dark Rainy Night (ambience) | [opengameart.org/content/rain-and-thunders](https://opengameart.org/content/rain-and-thunders) |
| `heat.mp3` | 酷热 | lifeWave2k | [opengameart.org/content/calm-ambient-3-lifewave-2k](https://opengameart.org/content/calm-ambient-3-lifewave-2k) |
| `fog.mp3` | 雾 | Deep Sea | [opengameart.org/content/deep-sea](https://opengameart.org/content/deep-sea) |
| `frog.mp3` | 青蛙雨（异象） | forgotten path | [opengameart.org/content/forgotten-path](https://opengameart.org/content/forgotten-path) |
| `glow.mp3` | 磷光海（异象） | Mystical Enigmatic Background Music | [opengameart.org/content/mystical-enigmatic-background-music](https://opengameart.org/content/mystical-enigmatic-background-music) |
| `gold.ogg` | 金潮（异象） | Underwater Theme（2nd variation） | [opengameart.org/content/underwater-theme-1](https://opengameart.org/content/underwater-theme-1) |

## 关于音效

音效（`assets/sfx/`）同样全部是 CC0，来源见项目根目录的 `SOUND.md`。

## 播放方式

- 交叉淡入淡出：切换天气时旧曲 1.3 秒淡出、新曲 1.3 秒淡入（`playMusic()`）。
- 音量：背景音乐压到 `MUSIC_VOL = 0.34`，避免盖过音效；HUD 右上角 `♫` 可单独开关。
- 载入策略：用 `<audio>` 元素流式播放而**不解码进内存**（几 MB 的曲子解码成 AudioBuffer
  会白占几十 MB 内存），`file://` 与 http(s) 都适用。
