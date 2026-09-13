import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9490;
const OUT = "C:\\Users\\94350\\deep-abyss\\.dsh-tmp\\ok";
mkdirSync(OUT, { recursive: true });
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + PORT, "--remote-allow-origins=*",
  "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--user-data-dir=" + OUT + "\\p", "about:blank"], { stdio: "ignore" });
let wsUrl = null;
for (let i = 0; i < 60; i++) { try { const r = await fetch("http://127.0.0.1:" + PORT + "/json/version"); if (r.ok) { wsUrl = (await r.json()).webSocketDebuggerUrl; break; } } catch {} await sleep(250); }
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
await S("Page.addScriptToEvaluateOnNewDocument", { source: `window.__errs=[];window.addEventListener('error',e=>window.__errs.push(e.message+' @'+e.lineno));` });
async function ev(e) { const r = await S("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) return { __error: r.exceptionDetails.exception?.description }; return r.result.value; }
await S("Emulation.setDeviceMetricsOverride", { width: 844, height: 390, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: "landscapePrimary", angle: 0 } });
await S("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await S("Page.navigate", { url: "file:///C:/Users/94350/deep-abyss/index.html" });
await sleep(1700);

console.log("① 进游戏（帮助气泡开着）—— 自动按钮应为禁用");
console.log("   ", JSON.stringify(await ev(`({ helpVisible: !document.getElementById('help-mask').classList.contains('hidden'),
  autoDisabled: document.getElementById('btn-auto').disabled, castDisabled: document.getElementById('btn-cast').disabled })`)));

console.log("\n② 点「知道了」关闭帮助");
await ev(`document.getElementById('btn-help').click()`);
await sleep(300);
console.log("   ", JSON.stringify(await ev(`({ helpHidden: document.getElementById('help-mask').classList.contains('hidden'),
  autoDisabled: document.getElementById('btn-auto').disabled })`)));

console.log("\n③ 点「自动」应弹出面板");
await ev(`document.getElementById('btn-auto').click()`);
await sleep(300);
const p1 = await ev(`(() => { const p = document.getElementById('auto-panel'); const b = p.getBoundingClientRect();
  const st = document.getElementById('stage').getBoundingClientRect();
  return { open: !p.classList.contains('hidden'), w: Math.round(b.width), h: Math.round(b.height),
    inside: b.left >= st.left-1 && b.right <= st.right+1 && b.top >= st.top-1 && b.bottom <= st.bottom+1,
    note: document.getElementById('auto-note').textContent, go: document.getElementById('auto-go').textContent,
    chips: [...p.querySelectorAll('[data-auto-n]')].map(c => c.dataset.autoN + (c.classList.contains('active') ? '✔' : '') + (c.classList.contains('over') ? '(不够)' : '')) }; })()`);
console.log("   ", JSON.stringify(p1));
writeFileSync(OUT + "\\1_panel.png", Buffer.from((await S("Page.captureScreenshot", { format: "png" })).data, "base64"));

console.log("\n④ 选 20 局 + 关加速 + 开始");
await ev(`document.querySelector('[data-auto-n="20"]').click()`); await sleep(200);
await ev(`document.getElementById('auto-fast').click()`); await sleep(200);
console.log("   面板: ", JSON.stringify(await ev(`({ note: document.getElementById('auto-note').textContent, go: document.getElementById('auto-go').textContent, fast: document.getElementById('auto-fast').classList.contains('on') })`)));
await ev(`document.getElementById('auto-go').click()`);
await sleep(400);
console.log("   开始后: ", JSON.stringify(await ev(`({ panelClosed: document.getElementById('auto-panel').classList.contains('hidden'),
  btn: document.getElementById('btn-auto').textContent.replace(/\\s+/g,' ').trim(), on: document.getElementById('btn-auto').classList.contains('on') })`)));

console.log("\n⑤ 跑 12 秒（非加速，每局约 5 秒）—— 局数应递减");
const t0 = Date.now();
for (let i = 0; i < 6; i++) {
  await sleep(2000);
  console.log(`   +${((Date.now()-t0)/1000).toFixed(0)}s ` + JSON.stringify(await ev(`({ btn: document.getElementById('btn-auto').textContent.replace(/\\s+/g,' ').trim(),
    prog: document.getElementById('btn-auto').style.getPropertyValue('--auto-p'), cast: document.querySelector('.cast-label').textContent,
    hint: document.getElementById('fight-hint').classList.contains('hidden') ? '' : document.getElementById('fight-hint').textContent, gold: document.getElementById('gold').textContent })`)));
}
writeFileSync(OUT + "\\2_running.png", Buffer.from((await S("Page.captureScreenshot", { format: "png" })).data, "base64"));

console.log("\n⑥ 点「下钩」手动接管，应停止");
await ev(`document.getElementById('btn-cast').click()`);
await sleep(400);
console.log("   ", JSON.stringify(await ev(`({ on: document.getElementById('btn-auto').classList.contains('on'), btn: document.getElementById('btn-auto').textContent.replace(/\\s+/g,' ').trim() })`)));
console.log("\nJS 错误:", JSON.stringify(await ev(`window.__errs`)));
cdp.close(); chrome.kill();
