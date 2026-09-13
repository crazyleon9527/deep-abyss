import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9480;
const OUT = "C:\\Users\\94350\\deep-abyss\\.dsh-tmp\\dbg12";
mkdirSync(OUT, { recursive: true });
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, "--remote-allow-origins=*",
  "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--user-data-dir=" + OUT + "\\p", "about:blank"], { stdio: "ignore" });
let wsUrl = null;
for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { wsUrl = (await r.json()).webSocketDebuggerUrl; break; } } catch {} await sleep(250); }
if (!wsUrl) { console.log("FATAL"); chrome.kill(); process.exit(1); }
function connect(url) { return new Promise((res, rej) => { const ws = new WebSocket(url); let id = 0; const pending = new Map(); const events = [];
  ws.onmessage = (e) => { const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    else if (m.method) events.push(m); };
  ws.onerror = () => rej(new Error("ws"));
  ws.onopen = () => res({ send: (m, p = {}, sid) => new Promise((rs, rj) => { const i = ++id; pending.set(i, { res: rs, rej: rj }); ws.send(JSON.stringify({ id: i, method: m, params: p, ...(sid ? { sessionId: sid } : {}) })); }), events, close: () => ws.close() }); }); }
const cdp = await connect(wsUrl);
const { targetInfos } = await cdp.send("Target.getTargets");
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId: targetInfos.find((t) => t.type === "page").targetId, flatten: true });
const S = (m, p) => cdp.send(m, p, sessionId);
await S("Page.enable"); await S("Runtime.enable"); await S("Log.enable"); await S("Network.enable");
async function ev(e) { const r = await S("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) return { __error: r.exceptionDetails.exception?.description }; return r.result.value; }
await S("Emulation.setDeviceMetricsOverride", { width: 844, height: 390, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: "landscapePrimary", angle: 0 } });
await S("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await S("Page.navigate", { url: "file:///C:/Users/94350/deep-abyss/index.html" });
await sleep(2000);

const st = await ev(`(() => ({
  canvasInited: (() => { const c = document.getElementById('sea'); return c.width + 'x' + c.height; })(),
  jsLoaded: [...document.scripts].map(s => s.src),
  errCount: 0,
}))()`);
console.log("页面状态:", JSON.stringify(st));

// 控制台里的错误
const errs = cdp.events.filter(e => e.method === "Log.entryAdded").map(e => e.params.entry.level + ": " + e.params.entry.text);
console.log("\n控制台日志:");
for (const x of errs.slice(0, 10)) console.log("   " + x);
// 网络失败
const failed = cdp.events.filter(e => e.method === "Network.loadingFailed").map(e => e.params.errorText + " " + (e.params.requestId||""));
console.log("\n加载失败:", failed.length ? failed : "无");
// JS 异常
const exc = cdp.events.filter(e => e.method === "Runtime.exceptionThrown").map(e => (e.params.exceptionDetails.exception && e.params.exceptionDetails.exception.description) || e.params.exceptionDetails.text);
console.log("\n运行时异常:");
for (const x of exc.slice(0, 8)) console.log("   " + String(x).split("\n").slice(0,3).join(" | "));
cdp.close(); chrome.kill();
