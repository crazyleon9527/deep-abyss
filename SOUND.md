# Deep Abyss 音效清单

> 全部来自 **CC0（公有领域）** 资源，可商用、**无需署名**。
> 来源：[Kenney](https://kenney.nl/assets/category:Audio)（Interface / Impact / Digital / UI Audio）、
> [OpenGameArt "40 CC0 water / splash / slime SFX"](https://opengameart.org/content/40-cc0-water-splash-slime-sfx)、
> [OpenGameArt "100 CC0 SFX" #1](https://opengameart.org/content/100-cc0-sfx) /
> [#2](https://opengameart.org/content/100-cc0-sfx-2)。

## 一、下钩流程（核心手感）

| # | 触发时机 | 音效需求 | 文件 |
|---|---|---|---|
| 1 | `beginCast()` 抛竿 | 甩竿/渔线出线的"唰" | `sfx/interface/scratch_00X.ogg` |
| 2 | 钩子落底入水 | **入水水花**（按船深度加大） | `sfx/water/splash_0X.ogg` |
| 3 | 等待咬钩期间 | 水面轻拍/细碎水声（稀疏随机） | `sfx/water/splash_09.ogg`（轻声） |
| 4 | 咬钩瞬间 | 竿尖一顿 + 浮漂下沉 | `sfx/interface/drop_00X.ogg` |
| 5 | 鱼拉扯（fight） | **鱼挣扎 / 渔线张力** | `sfx/water/slime_XX.ogg`（拍水挣扎） |
| 6 | 收线（reel） | **卷线器棘轮**循环 | `sfx/interface/scroll_00X.ogg` 循环 |
| 7 | 入舱（钓上来） | 鱼尾拍水 + 甲板扑腾 | `sfx/water/splash_0X.ogg` + `slime_XX` |
| 8 | 脱钩 / 差点就中 | 线一松、下沉 | `sfx/interface/back_00X.ogg` |
| 9 | 空钩 | 空洞低沉 | `sfx/interface/minimize_00X.ogg` |

## 二、钓获结果（按品质分层）

| # | 触发时机 | 音效需求 | 文件 |
|---|---|---|---|
| 10 | 杂物（垃圾） | 闷响 | `sfx/impact/footstep_concrete_00X.ogg` |
| 11 | 普通鱼 | 清脆"叮"，音高随稀有度 | `sfx/interface/confirmation_00X.ogg` |
| 12 | 稀有（≥3 级） | 上行琶音/泛音 | `sfx/interface/bong_001.ogg` + `maximize_00X.ogg` |
| 13 | 传说级 | 华丽琶音 | `sfx/digital/pepSoundX.ogg` 组合 |

## 三、奖励与系统事件

| # | 触发时机 | 音效需求 | 文件 |
|---|---|---|---|
| 14 | 奖池命中 `hitJackpot()` | 金币 + 铜钟余韵 | `sfx/interface/bong_001.ogg` + 金币声 |
| 15 | 派彩 `flashWin()` | 金币入袋（按倍数） | `sfx/interface/confirmation_00X.ogg` |
| 16 | 声呐 `buySonar()` | 扫频/雷达 | `sfx/digital/phaserUpX.ogg` |
| 17 | 购买鱼竿/船只 | 铜钱/确认 | `sfx/interface/select_00X.ogg` |
| 18 | 购买鱼饵 | 轻快点击 | `sfx/interface/click_00X.ogg` |
| 19 | 海怪/狂钩直购 | 重磅确认 | `sfx/impact/impactMining_00X.ogg` |
| 20 | 护钩生效 | 上滑提示 | `sfx/digital/highUp.ogg` |
| 21 | 签到/通行证/宝箱 | 升级琶音 | `sfx/digital/pepSoundX.ogg` |
| 22 | 操作被拒（金币不足等） | 错误音 | `sfx/interface/error_00X.ogg` |
| 23 | 最后 10 秒倒计时 | 滴答催促 | `sfx/interface/click_002.ogg` |
| 24 | 本局结束 | 结算音 | `sfx/interface/confirmation_00X.ogg` |

## 四、UI 交互

| # | 触发时机 | 音效需求 | 文件 |
|---|---|---|---|
| 25 | 任意按钮按下 | 轻点击 | `sfx/interface/click_001.ogg` |
| 26 | 开关打开 / 关闭 | 切换音 | `sfx/interface/select_00X.ogg` / `minimize_00X.ogg` |
| 27 | 打开面板 / 抽屉 | 展开 | `sfx/interface/open_00X.ogg` |
| 28 | 关闭面板 | 收起 | `sfx/interface/close_00X.ogg` |
| 29 | 自动玩启动 | 起跑提示 | `sfx/digital/powerUpX.ogg` |
| 30 | 下注切换 / x1-x3 | 档位切换 | `sfx/interface/select_00X.ogg` |

## 五、环境层（天气 / 异象，循环播放）

| # | 条件 | 音效需求 | 文件 |
|---|---|---|---|
| 31 | 基底（所有天气） | **海浪涌动**循环 | `sfx/water/loop_water_01.ogg` |
| 32 | 晴 | 海面细碎浪花 | `sfx/water/loop_water_02.ogg` |
| 33 | 阴 / 疾风 | **风声**循环 | `sfx/water/loop_water_03.ogg`（低频当作风底） |
| 34 | 雨 | **雨声**循环 | `sfx/water/loop_rain.ogg` |
| 35 | 雾 / 磷光海 / 金潮 | 深海低频氛围 | `sfx/water/loop_bubbles_1.ogg` |
| 36 | 水下（钩子深度） | 气泡 | `sfx/water/loop_bubbles_02.ogg` |
| 37 | 青蛙雨异象 | 蛙鸣/水面骚动 | `sfx/water/loop_bubbles_02.ogg`（变调） |

## 六、音轨总览

- 事件音效：**30 个**
- 环境循环：**7 层**（可叠加）
- 总计约 **37 条音频**，全部 OGG（Chrome/Safari/Firefox 都支持），总体积控制在 ~1.5MB

## 七、实现要点

- 用 `fetch` + `decodeAudioData` 预加载为 `AudioBuffer`，播放走 `BufferSource`，
  避免每次 `new Audio()` 造成的延迟和抖动。
- 首次用户手势时 `resume()` AudioContext（iOS 必须，否则整局无声）。
- **保留合成引擎作为兜底**：文件加载失败时回退到 `sfx.*` 合成音，游戏不会变哑。
- 环境层用 `crossfade`（1.2s）随天气切换，不突兀。
- 提供总音量与静音开关。
