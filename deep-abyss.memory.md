# deep-abyss 项目记忆

## 项目性质
- 单页 HTML5 Canvas 钓鱼游戏：`index.html` + `js/game.js`（单文件约 3000 行）+ `css/game.css`。
- 设计基准分辨率 **1024×640（16:10 横屏）**，`#stage` 等比缩放；素材 `assets/scene.jpg` 也是 1024×635。
- 经典 `<script src>`（非 ES module），无构建、无运行时依赖，可直接 `file://` 打开。

## 移动端适配（2026-09 完成，CSS 级实现）
- **竖屏兜底**：`@media (orientation: portrait) and (pointer: coarse) and (max-width: 767px)` 下
  `body` 变 flex 居中容器，`#stage` 取明确像素尺寸（`min(100vh, 100vw*1.6)` × 640/1024）并
  `transform: rotate(90deg)` 绕自身中心旋转，铺满竖屏；同时显示 `#rotate-hint`“请横屏游玩”遮罩。
  平板（≥768px）竖屏不旋转，保持横屏比例居中。
- **控件缩放**：`#stage` 声明 `container-type: inline-size`，`.controls` / `.steer` 用
  `clamp(min, Ncqi, max)` 按舞台宽度等比缩放，窄舞台自动 `flex-wrap: wrap-reverse` 换行。
- **开船键不再被压住**：`.steer` 的 `bottom` 用 `clamp(...,62cqi,...) + 间距`（必要时 ×2/×3 行）
  抬到按钮区上方；`left: 4%` 避开左侧抽屉把手。这是原先"点左键却触发赌注"的根因。
- **画布尺寸**：`js/game.js` 的 `resize()` 已改用 `offsetWidth/offsetHeight`（布局尺寸），
  不能用 `getBoundingClientRect()`——竖屏旋转后它返回的是转过 90° 的视觉尺寸，画布会歪。
- 触摸目标：抽屉把手 32px 宽、暂停/回流/冲榜 ≥40px；`viewport-fit=cover` 已配
  `env(safe-area-inset-*)` 内缩（竖屏下作用于旋转后的 HUD）。

### HUD 版式（用户明确要求过，别改回去）
- **奖池与统计合并**：`.hud-top` 在触摸设备上是 `"left ticker right"` 单行三列——
  左＝信息条（`.hud-left` 竖排：`.hud-stats` 分数/目标/时间 + `.hud-center` 四级奖池），
  中间＝全服派彩跑马灯，右＝钱包 + 回流/冲榜/暂停。
  原先奖池独占中间列、顶栏横跨整舞台，竖屏旋转后会压住右下按钮区。
- **跑马灯必须与分数同一行居中**：用户明确说过"要往上移、与分数平齐，不能遮挡人物"。
  不要把它单独放一行横跨舞台。宽度 `max-width: clamp(120px, …, 260px)`，两端渐隐。
- **底部控件＝底部对齐的一横排**（2026-09 定稿，别再改回网格）：
  `.controls` 是 `display:flex; align-items:flex-end`，七个控件依次是
  `.feat-stack`（海怪+狂钩竖排）、`.sonar-stack`（护钩+探鱼竖排，中间一条亮线）、
  `.bet-btn`、`.x3-btn`、`.auto-btn`（自动玩）、`.cast-btn-wrap`（圆形 `#btn-cast` + 绝对定位的气泡）。
  尺寸变量 `--btn = clamp(34px, 6.09cqi, 38px)`，整排约 278×56。
  曾经用 3×3 网格摊成 383×158 的大方块，行间全是错落空洞，用户说"很多不对"，别回退。

### 自动玩（auto-play）
- 交互（按老虎机习惯）：没在跑点一下开 10 局；**正在跑再点就是加局**（第 1 次 +10，之后每次 +20，
  上限 200，且不超过"金币 ×0.6 ÷ 单局花费"）；**想停就点「下钩」**（手动接管），打开任何面板也会停。
  按钮上的数字 = 剩余局数，底部细条是进度，跑动中 `.on` 高亮。
- `js/game.js` 里：`autoStart / autoStop / autoSettleRound / autoTick / autoSettle`，
  状态放在 `state.auto { remaining, all, n, left, wait, spent, gold0, hit }`。
- **`autoTick` 里判断顺序不能改**：必须先 `if (state.fishing)` 再处理 `state.auto.wait`。
  因为 `wait` 只在非钓鱼时倒数，顺序反了会永远卡在等待分支、走不到结算
  （症状：每局 5 秒，而设计值 0.7 秒）。
- **自动玩走 `autoSettleRound()` 一帧结算**，不走手动那条状态机（手动一局要 3~5 秒）。
  它复用 `skipCast()` 的同一套判定（`ensureLure / findBite / forceLuckyBite / maybeLoot / payout`），
  但不设 `state.skipCut`，免得玩家中途自己点"跳过"时吃到七折。
- 奖励关（`bonusOn()`）不结算，让它自己跑完。
- 资金保护：`state.gold < castCost() * 2` 就停（"金币快见底"），别把金币耗干净。
- 实测：加速约 0.7 秒/局，10 局约 7 秒；非加速走完整动画约 5 秒/局（面板里会写明预计耗时）。
- **首次进游戏时帮助气泡是打开的**（`state.helpOpen = true`），此时
  `#btn-cast` / `#btn-auto` 都被 `blocked` 置灰、点了也没反应；必须点“知道了”才恢复。
  调查“自动玩不生效”时先确认这一点，别误判成 bug。
- **版本号必须跟着改**：改了 `js/game.js` 就要把 `index.html` 里的 `game.js?v=` 一起 +1
  （css 同理）。曾经改完 JS 忘了升版本，浏览器一直用缓存里的旧脚本，
  表现就是“按钮点了没反应”，白查了半天。
- **提交前先看 `git status`**：`git add -A` 会把工作区里的临时探针脚本（`.dsh-*.mjs`）一起提交进去，
  已经踩过一次（16 个文件误入库），`.gitignore` 里加了 `.dsh-*.mjs` / `.dsh-tmp/`。
- **下钩按钮**：圆形主按钮，下竿预测放在**它上方的小气泡**里（`#cast-total` + `#cast-odds`），
  气泡 `position:absolute; bottom:100%; pointer-events:none`（绝不能挡点击）。
  用户明确要求"要显示跟之前一样的信息"（本竿花费 / 饵·租·注 / 空钩亏与命中预估）。
- **护钩/探鱼**：一列上下两个矩形按钮，中间靠 `box-shadow: inset 0 -1px 0` 画分隔线。
  用户否掉了 45° 斜线方案。**列宽必须 `flex: 0 0 auto`**，否则 min-content 太小会被压成细条。
- **没有开船键**：用户要求删掉，改成**按住海面左/右半边持续开船**（`#steer-layer` 上
  `pointerdown/pointermove`，按 clientX 相对舞台中线判方向），`pointerup/pointercancel/blur` 停止；
  `steerUI()` 兜底避免按住 HUD/按钮误触发；收线中按下只提示一次"收线后再移船"。
- 跑马灯条目数 `TICKER_KEEP = 6`，动画时长按内容宽度 ÷ `TICKER_SPEED(56px/s)` 反推，
  避免条带越滚越长、速度忽快忽慢。
- **租金标在鱼竿/船只按钮上**：选中态由 `.item.active`（青色边框+光晕）表达，
  按钮标签只写价格（`FREE` / `租 80` / `租 220`），**不要再加"本竿/本船"前缀**（用户明确否掉）。
  侧栏 `.equipped` 已删掉"本竿租借"栏（`#rent-fee` 及其 JS 引用一并移除），
  "移船"提示栏也删掉了，现在只剩"咬钩"一栏。
- **版本标记** `#build-tag` 在信息条里（显示 `v55` 等），方便一眼确认浏览器加载的是哪一版样式；
  `index.html` 也加了 `Cache-Control: no-store` 等 meta。用户反复遇到旧缓存，别删这个。
- **推送**：本会话审批被关闭，`git_commit`/`git_push` 工具会以 "user did not approve" 拒绝；
  用户授权后用 pwsh `git -c user.name=leon -c user.email=leon@example.com commit` 提交
  （仓库里**没有**配置 git 身份，历史统一是 `leon <leon@example.com>`），`git push origin main` 推送。
  注意 pwsh 里 `Out-File -Encoding utf8` 会给提交信息开头塞 BOM。
- 桌面端靠 `display: contents` 让 `.hud-stats`/`.hud-center` 透明化，顶栏仍是一条横条，
  所以**桌面外观不要动**。

### CSS 坑（踩过，别再犯）
- **引用已删除的 CSS 变量会让整条声明失效**：写过 `.controls .sonar-stack { width: var(--stack) }`
  而 `--stack` 已被删掉 → 宽度退回 auto，加上 flex 默认 `flex-shrink:1`、列内只有图标+数字
  （min-content 很小），那一列被压成 **17px 细条**，用户反复说"布局不对"就是这个。
  改完 CSS 后**一定要扫一遍 `var(--x)` 有没有未定义的**。
- **定位这类问题不要靠猜**：用 CDP 的 `CSS.getMatchedStylesForNode` 直接问浏览器
  "这条元素命中了哪些 width/flex 规则"，比反复调数值快得多。
- **`cqi` 在“容器元素自身”上不解析**：写成 `#stage { --s: clamp(0.42, calc(100cqi/1024), 1) }`
  再给后代继承，会得到非法值并使整条声明失效（宽度变 0）。必须把含 `cqi` 的长度直接写在
  **后代元素**上（`#stage` 的子/孙元素都可以）。
- **旋转元素里的百分比位移不可靠**：`translate(-50%,-50%)`、`translateX(-100%)` 会被包含块/
  自身尺寸/旋转顺序重算。宁可先由父级 flex 居中，再只写 `rotate(90deg)`。
- `#stage` 的 `margin: 0 auto` 在旋转/absolute 场景下会参与定位计算，需显式 `margin: 0`。
- 量竖屏布局时**必须先在 `#stage` 上把 `transform` 清掉**，否则 `getBoundingClientRect()`
  返回的是转过 90° 的坐标，读出来的数全是错的（会误判成"重叠/出界"）。

### 音效（全程序合成，无音频文件）
- 全部用 WebAudio 现场合成：`ac()` 建上下文与主输出 `masterGain`，环境层走 `ambGain`；
  `tone()` 是振荡器+包络，`noiseHit()` 是噪声+滤波，`noise()` 生成 2 秒布朗噪声缓冲复用。
  **不要引入 mp3/wav**：项目是 file:// 直开的零依赖页面，音频文件会拖慢首屏。
- **移动端必须解锁**：`bind()` 里注册了 `pointerdown/keydown/touchstart` 的 once 监听调
  `unlockAudio()`（`resume()` suspended 的 AudioContext）。iOS Safari 不在用户手势里
  创建/恢复就一直没声音——这是最容易复发的问题，别删那段。
- 音效清单在 `sfx` 对象里：cast / splash / idleWater / bite / tug / reel / land / slip /
  junk / reward / fanfare / sonar / coin / jackpot / levelup / click / toggleOn / toggleOff /
  tick / open / close / deny / autoStart。
- 挂接点：`beginCast()`→cast；`updateLine()` 落底→splash；`applyBite()`→bite；
  `loop()` 里按 `line.phase` 打 reel / tug / idleWater；`showCatch()`→land+reward/fanfare/junk/slip；
  `flashWin()` 与 `hitJackpot()`→coin/jackpot；`buySonar()`→sonar；`renderHud()` 最后 10 秒→tick。
- **环境音**：`setAmbient(key, ambForWeather(key))` 在 `loop()` 里调，key = 异象或天气 id；
  变了才重建（内部比对 `ambKey`），海浪是基底，晴/阴/疾风/雨/雾/酷热/青蛙雨/磷光/金潮各有叠加层。
- HUD 右上角 `#btn-sound` 是静音开关（♪ / ✕），切到关时把 `masterGain.gain` 置 0。
- 旧的 `beep(freq,dur,type,gain)` 保留为 `tone()` 的薄封装，历史调用不会坏。

## 环境坑
- 沙箱（workspace-write）下 **Chrome 起不来**（crashpad `OpenProcess` + mojo 拒绝访问），
  需 `danger-full-access` 才能跑本地无头浏览器实测；每次 pwsh 调用都要重新申请。
- 内置 browser 工具**拒绝 localhost/127.0.0.1**，不能用来打开本项目。
- 仓库里没有 Playwright 浏览器；真机尺寸实测用 Chrome CDP：`--headless=new --remote-debugging-port`
  + `Emulation.setDeviceMetricsOverride` / `setTouchEmulationEnabled`（注意：被模拟页必须有
  `width=device-width` 的 viewport meta，否则布局视口会是 980px 宽，测得的数据全是错的）。
- Chrome 关闭后 `--user-data-dir` 目录会残留 crashpad 锁，删除需 `cmd /c rmdir /s /q`。
