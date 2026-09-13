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
- **下钩按钮**：必须完整显示下竿预测（本竿花费 / 饵·租·注 / 空钩亏与命中预估），
  用户明确要求"要显示跟之前一样的信息"。做法是改成"矮而宽"的横版（约 140×52），
  两行小字 6px 单行不换行；靠把护钩挪到顶栏 `#btn-charm`（原来是 `.controls` 里的
  `.charm-btn`，已从 HTML 删除）腾出宽度。
- **护钩**：顶栏小按钮（宝石图标 + 数量，26×26），顶栏钱包里的"护钩 关"文字已去掉
  （`.hud-wallet .stat-item` 隐藏），避免和按钮重复；`charm-hud` 元素仍在，JS 继续更新。
- 跑马灯条目数 `TICKER_KEEP = 6`，动画时长按内容宽度 ÷ `TICKER_SPEED(56px/s)` 反推，
  避免条带越滚越长、速度忽快忽慢。
- **租金标在鱼竿/船只按钮上**：选中态由 `.item.active`（青色边框+光晕）表达，
  按钮标签只写价格（`FREE` / `租 80` / `租 220`），**不要再加"本竿/本船"前缀**（用户明确否掉）。
  侧栏 `.equipped` 已删掉"本竿租借"栏（`#rent-fee` 及其 JS 引用一并移除），
  "移船"提示栏也删掉了，现在只剩"咬钩"一栏。
- **字号上限别乱给**：`cast-odds`("空钩亏 118 · 深渊鲱 25% · 约 +196") 在 8px 时宽约 136px，
  给到 9px 会在 1024px 宽的平板舞台上被截断（那里 cqi 会把字号顶到上限）。
- **推送**：本会话审批被关闭，`git_commit`/`git_push` 工具会以 "user did not approve" 拒绝；
  用户授权后用 pwsh `git -c user.name=leon -c user.email=leon@example.com commit` 提交
  （仓库里**没有**配置 git 身份，历史统一是 `leon <leon@example.com>`），`git push origin main` 推送。
  注意 pwsh 里 `Out-File -Encoding utf8` 会给提交信息开头塞 BOM。
- 桌面端靠 `display: contents` 让 `.hud-stats`/`.hud-center` 透明化，顶栏仍是一条横条，
  所以**桌面外观不要动**。

### CSS 坑（踩过，别再犯）
- **`cqi` 在“容器元素自身”上不解析**：写成 `#stage { --s: clamp(0.42, calc(100cqi/1024), 1) }`
  再给后代继承，会得到非法值并使整条声明失效（宽度变 0）。必须把含 `cqi` 的长度直接写在
  **后代元素**上（`#stage` 的子/孙元素都可以）。
- **旋转元素里的百分比位移不可靠**：`translate(-50%,-50%)`、`translateX(-100%)` 会被包含块/
  自身尺寸/旋转顺序重算。宁可先由父级 flex 居中，再只写 `rotate(90deg)`。
- `#stage` 的 `margin: 0 auto` 在旋转/absolute 场景下会参与定位计算，需显式 `margin: 0`。

## 环境坑
- 沙箱（workspace-write）下 **Chrome 起不来**（crashpad `OpenProcess` + mojo 拒绝访问），
  需 `danger-full-access` 才能跑本地无头浏览器实测；每次 pwsh 调用都要重新申请。
- 内置 browser 工具**拒绝 localhost/127.0.0.1**，不能用来打开本项目。
- 仓库里没有 Playwright 浏览器；真机尺寸实测用 Chrome CDP：`--headless=new --remote-debugging-port`
  + `Emulation.setDeviceMetricsOverride` / `setTouchEmulationEnabled`（注意：被模拟页必须有
  `width=device-width` 的 viewport meta，否则布局视口会是 980px 宽，测得的数据全是错的）。
- Chrome 关闭后 `--user-data-dir` 目录会残留 crashpad 锁，删除需 `cmd /c rmdir /s /q`。
