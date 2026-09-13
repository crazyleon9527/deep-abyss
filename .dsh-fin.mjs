import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9430;
const OUT = "C:\\Users\\94350\\deep-abyss\\.dsh-tmp\\fin";
mkdirSync(OUT, { recursive: true });
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, "--remote-allow-origins=*",
  "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--user-data-dir=" + OUT + "\\p", "about:blank"], { stdio: "ignore" });
let wsUrl = null;
for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { wsUrl = (await r.json()).webSocketDebuggerUrl; break; } } catch {} await sleep(250); }
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

for (const [name, w, h, orient, touch] of [["横屏手机", 844, 390, "landscapePrimary", true], ["竖屏手机", 390, 844, "portraitPrimary", true], ["小屏568", 568, 320, "landscapePrimary", true], ["桌面", 1440, 900, "landscapePrimary", false]]) {
  await S("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: touch ? 2 : 1, mobile: true, screenOrientation: { type: orient, angle: orient === "landscapePrimary" ? 90 : 0 } });
  await S("Emulation.setTouchEmulationEnabled", { enabled: touch, maxTouchPoints: 5 });
  await S("Page.navigate", { url: "file:///C:/Users/94350/deep-abyss/index.html" });
  await sleep(1500);
  // 关键：同时关掉"请横屏"遮罩和帮助气泡，否则会挡住点击
  const r = await ev(`(() => {
    const s = document.createElement('style');
    s.textContent = '#help-mask{display:none !important}.rotate-hint{display:none !important}';
    document.head.appendChild(s);
    const hb = document.getElementById('btn-help'); if (hb) hb.click();
    const btn = document.getElementById('btn-auto');
    const bb = btn.getBoundingClientRect();
    const hit = document.elementFromPoint(bb.left+bb.width/2, bb.top+bb.height/2);
    btn.click();
    const p = document.getElementById('auto-panel');
    const b = p.getBoundingClientRect();
    const st = document.getElementById('stage').getBoundingClientRect();
    const vis = getComputedStyle(p).display !== 'none';
    const chips = [...p.querySelectorAll('[data-auto-n]')].map(c => { const cb = c.getBoundingClientRect();
      const t = document.elementFromPoint(cb.left+cb.width/2, cb.top+cb.height/2); return { n: c.dataset.autoN, hit: !!(t && (c===t||c.contains(t))) }; });
    const go = document.getElementById('auto-go'); const gb = go.getBoundingClientRect();
    const gt = document.elementFromPoint(gb.left+gb.width/2, gb.top+gb.height/2);
    return { btnHit: !!(hit && (btn===hit||btn.contains(hit))), vis, w: Math.round(b.width), h: Math.round(b.height),
      inside: b.left >= st.left-1 && b.right <= st.right+1 && b.top >= st.top-1 && b.bottom <= st.bottom+1,
      inVp: b.left >= -1 && b.right <= innerWidth+1 && b.top >= -1 && b.bottom <= innerHeight+1,
      chips, goHit: !!(gt && (go===gt||go.contains(gt))), note: document.getElementById('auto-note').textContent };
  })()`);
  console.log(`[${name}] 自动按钮可点=${r.btnHit} | 面板可见=${r.vis} ${r.w}x${r.h} 在舞台内=${r.inside} 在视口内=${r.inVp}`);
  console.log(`         局数按钮 ${r.chips.map(c=>c.n+(c.hit?"✔":"✘")).join(" ")} | 开始可点=${r.goHit} | ${r.note}`);
}
cdp.close(); chrome.kill();
