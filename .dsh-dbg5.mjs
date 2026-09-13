import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9445;
const OUT = "C:\\Users\\94350\\deep-abyss\\.dsh-tmp\\dbg5";
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
await S("Emulation.setDeviceMetricsOverride", { width: 844, height: 390, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: "landscapePrimary", angle: 0 } });
await S("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await S("Page.navigate", { url: "file:///C:/Users/94350/deep-abyss/index.html" });
await sleep(1600);

// ① 什么都不点，直接点自动
const a = await ev(`(() => {
  const helpMask = document.getElementById('help-mask');
  const helpVisible = !helpMask.classList.contains('hidden');
  document.getElementById('btn-auto').click();
  return { helpMaskVisible: helpVisible, panelOpen: !document.getElementById('auto-panel').classList.contains('hidden') };
})()`);
console.log("① 刚进游戏（帮助气泡还开着）点自动:", JSON.stringify(a));

// ② 点"知道了"关掉帮助，再点自动
const b = await ev(`(() => {
  document.getElementById('btn-help').click();
  const helpVisible = !document.getElementById('help-mask').classList.contains('hidden');
  document.getElementById('btn-auto').click();
  const p = document.getElementById('auto-panel');
  const r = p.getBoundingClientRect();
  return { helpMaskVisible: helpVisible, panelOpen: !p.classList.contains('hidden'), w: Math.round(r.width), h: Math.round(r.height) };
})()`);
console.log("② 点「知道了」后再点自动:", JSON.stringify(b));

// ③ 关掉面板，正常流程再验一次
const c = await ev(`(() => {
  document.getElementById('auto-close').click();
  document.getElementById('btn-auto').click();
  const p = document.getElementById('auto-panel');
  return { panelOpen: !p.classList.contains('hidden'), note: document.getElementById('auto-note').textContent };
})()`);
console.log("③ 取消后再打开:", JSON.stringify(c));
cdp.close(); chrome.kill();
