import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9440;
const OUT = "C:\\Users\\94350\\deep-abyss\\.dsh-tmp\\dbg4";
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
// 捕获所有错误，包括 console.error
await S("Page.addScriptToEvaluateOnNewDocument", { source: `
window.__errs=[];
window.addEventListener('error',e=>window.__errs.push('error: '+e.message+' @line'+e.lineno));
window.addEventListener('unhandledrejection',e=>window.__errs.push('reject: '+e.reason));
(function(){const oe=console.error;console.error=function(){window.__errs.push('console.error: '+[].map.call(arguments,String).join(' '));return oe.apply(console,arguments);};})();
` });
async function ev(e) { const r = await S("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) return { __error: r.exceptionDetails.exception?.description }; return r.result.value; }
await S("Emulation.setDeviceMetricsOverride", { width: 844, height: 390, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: "landscapePrimary", angle: 0 } });
await S("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await S("Page.navigate", { url: "file:///C:/Users/94350/deep-abyss/index.html" });
await sleep(1600);

// 直接调用 onclick 并检查前后状态；同时看 syncAutoPanel 是否被赋值
const r1 = await ev(`(() => {
  const btn = document.getElementById('btn-auto');
  const p = document.getElementById('auto-panel');
  const before = p.classList.contains('hidden');
  let err = null;
  try { btn.onclick(); } catch (e) { err = String(e) + ' | stack: ' + (e.stack||'').split('\\n').slice(0,3).join(' <- '); }
  const after = p.classList.contains('hidden');
  return { before, after, err, errs: window.__errs.slice(), display: getComputedStyle(p).display };
})()`);
console.log("直接调用 onclick():");
console.log(JSON.stringify(r1, null, 1));

// 手动模拟 openAutoPanel 的动作，看能否显示
const r2 = await ev(`(() => {
  const p = document.getElementById('auto-panel');
  p.classList.remove('hidden');
  const shown = !p.classList.contains('hidden');
  const disp = getComputedStyle(p).display;
  const b = p.getBoundingClientRect();
  return { shown, disp, w: Math.round(b.width), h: Math.round(b.height) };
})()`);
console.log("\n手动 remove('hidden') 的结果:", JSON.stringify(r2));

// 看隐藏类的定义
const r3 = await ev(`(() => {
  const p = document.getElementById('auto-panel');
  const rules = [];
  for (const sh of document.styleSheets) {
    let rr; try { rr = sh.cssRules; } catch(e) { continue; }
    for (const rule of rr) {
      if (rule.selectorText && (rule.selectorText.includes('hidden') || rule.selectorText.includes('auto-panel'))) {
        rules.push(rule.selectorText + ' { ' + rule.style.cssText.slice(0,90) + ' }');
      }
      if (rule.type === 4) { for (const sub of rule.cssRules) {
        if (sub.selectorText && (sub.selectorText.includes('hidden') || sub.selectorText.includes('auto-panel'))) {
          rules.push('@media ' + rule.conditionText + ' -> ' + sub.selectorText + ' { ' + sub.style.cssText.slice(0,80) + ' }');
        } } }
    }
  }
  return rules.slice(0, 12);
})()`);
console.log("\n涉及 hidden / auto-panel 的 CSS 规则:");
for (const x of r3) console.log("   " + x);
cdp.close(); chrome.kill();
