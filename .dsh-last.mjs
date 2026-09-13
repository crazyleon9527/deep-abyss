import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9420;
const OUT = "C:\\Users\\94350\\deep-abyss\\.dsh-tmp\\last";
mkdirSync(OUT, { recursive: true });
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, "--remote-allow-origins=*",
  "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--user-data-dir=" + OUT + "\\prof", "about:blank"], { stdio: "ignore" });
let wsUrl = null;
for (let i = 0; i < 80; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { wsUrl = (await r.json()).webSocketDebuggerUrl; break; } } catch {} await sleep(300); }
if (!wsUrl) { console.log("FATAL"); chrome.kill(); process.exit(1); }
function connect(url) { return new Promise((res, rej) => { const ws = new WebSocket(url); let id = 0; const pending = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error("e")) : p.res(m.result); } };
  ws.onerror = () => rej(new Error("ws"));
  ws.onopen = () => res({ send: (m, p = {}, sid) => new Promise((rs, rj) => { const i = ++id; pending.set(i, { res: rs, rej: rj }); ws.send(JSON.stringify({ id: i, method: m, params: p, ...(sid ? { sessionId: sid } : {}) })); }), close: () => ws.close() }); }); }
const cdp = await connect(wsUrl);
const { targetInfos } = await cdp.send("Target.getTargets");
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId: targetInfos.find((t) => t.type === "page").targetId, flatten: true });
const S = (m, p) => cdp.send(m, p, sessionId);
await S("Page.enable"); await S("Runtime.enable");
async function ev(e) { const r = await S("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) return { __error: r.exceptionDetails.exception?.description }; return r.result.value; }
const V = `(() => {
  const s = document.createElement('style'); s.textContent='#help-mask{display:none !important}.rotate-hint{display:none !important}'; document.head.appendChild(s);
  const b = document.getElementById('btn-help'); if (b) b.click();
  return { css: [...document.styleSheets].map(x=>x.href).join(','), js: [...document.scripts].map(x=>x.src).join(','), tag: document.getElementById('build-tag').textContent };
})()`;

for (const [name, w, h, orient] of [["横屏844", 844, 390, "landscapePrimary"], ["竖屏390", 390, 844, "portraitPrimary"], ["小屏568", 568, 320, "landscapePrimary"], ["桌面", 1440, 900, "landscapePrimary"]]) {
  const touch = name !== "桌面";
  await S("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: touch ? 2 : 1, mobile: true, screenOrientation: { type: orient, angle: orient === "landscapePrimary" ? 90 : 0 } });
  await S("Emulation.setTouchEmulationEnabled", { enabled: touch, maxTouchPoints: 5 });
  await S("Page.navigate", { url: "file:///C:/Users/94350/deep-abyss/index.html" });
  await sleep(1700);
  const info = await ev(V);
  if (name === "横屏844") console.log("资源:", info.css, "|", info.js, "| 版本标记:", info.tag);

  // 打开面板，量位置与可点性
  const r = await ev(`(() => {
    document.getElementById('btn-auto').click();
    const p = document.getElementById('auto-panel'); const b = p.getBoundingClientRect();
    const st = document.getElementById('stage').getBoundingClientRect();
    const vis = getComputedStyle(p).display !== 'none';
    const chips = [...p.querySelectorAll('[data-auto-n]')].map(c => { const cb = c.getBoundingClientRect();
      const t = document.elementFromPoint(cb.left+cb.width/2, cb.top+cb.height/2); return { n: c.dataset.autoN, hit: !!(t && (c===t||c.contains(t))) }; });
    const go = document.getElementById('auto-go'); const gb = go.getBoundingClientRect();
    const gt = document.elementFromPoint(gb.left+gb.width/2, gb.top+gb.height/2);
    const cs = getComputedStyle(document.getElementById('auto-panel'));
    return { vis, w: Math.round(b.width), h: Math.round(b.height),
      inside: b.left >= st.left-1 && b.right <= st.right+1 && b.top >= st.top-1 && b.bottom <= st.bottom+1,
      inVp: b.left >= -1 && b.right <= innerWidth+1 && b.top >= -1 && b.bottom <= innerHeight+1,
      chips, goHit: !!(gt && (go===gt||go.contains(gt))), note: document.getElementById('auto-note').textContent,
      fontSize: cs.fontSize, errs: 0 };
  })()`);
  console.log(`\n[${name}] 面板 ${r.w}x${r.h} 可见=${r.vis} 在舞台内=${r.inside} 在视口内=${r.inVp}`);
  console.log(`   局数按钮: ${r.chips.map(c => c.n + (c.hit ? "✔" : "✘")).join(" ")}  开始按钮可点=${r.goHit}`);
  console.log(`   提示文字: ${r.note}`);
  writeFileSync(`${OUT}\\${name}.png`, Buffer.from((await S("Page.captureScreenshot", { format: "png" })).data, "base64"));
}
cdp.close(); chrome.kill();
