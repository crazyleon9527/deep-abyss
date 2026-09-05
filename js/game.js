(() => {
  const $ = (id) => document.getElementById(id);

  const RODS = [
    { id: "basic", name: "Basic Rod", cost: 5000, currency: "gold", luck: 1, depth: 1 },
    { id: "fine", name: "Fine Rod", cost: 15000, currency: "gold", luck: 1.2, depth: 2 },
    { id: "master", name: "Master Rod", cost: 50000, currency: "gold", luck: 1.45, depth: 3 },
  ];
  const BOATS = [
    { id: "row", name: "Rowboat", cost: 10000, currency: "gold", depth: 1 },
    { id: "motor", name: "Motorboat", cost: 30000, currency: "gold", depth: 2 },
    { id: "sub", name: "Submarine", cost: 100000, currency: "gems", depth: 3 },
  ];
  const BAITS = [
    { id: "hook", name: "Hook", cost: 500, lure: 0.9 },
    { id: "worm", name: "Worm", cost: 1000, lure: 1.15 },
    { id: "fish", name: "Minnow", cost: 2500, lure: 1.4 },
    { id: "shrimp", name: "Shrimp", cost: 5000, lure: 1.75 },
  ];
  const FISH = [
    { id: "school", name: "Abyss School", rarity: 1, gold: 180, points: 80, color: "#7ad0ff" },
    { id: "angler", name: "Lantern Angler", rarity: 2, gold: 720, points: 260, color: "#b6ff64" },
    { id: "eel", name: "Moray Shade", rarity: 3, gold: 2200, points: 780, color: "#5cffd2" },
    { id: "squid", name: "Goliath Squid", rarity: 4, gold: 6800, points: 2400, color: "#c9a0ff" },
    { id: "leviathan", name: "Deep Leviathan", rarity: 5, gold: 18000, points: 8000, color: "#ffd56a" },
  ];
  const BETS = [100, 500, 1000, 2500, 5000];

  const state = {
    points: 10247,
    gold: 244791,
    gems: 2,
    level: 5,
    timeLeft: 143,
    betIndex: 1,
    rod: "basic",
    boat: "row",
    bait: "worm",
    ownedRods: new Set(["basic"]),
    ownedBoats: new Set(["row"]),
    paused: false,
    ended: false,
    fishing: false,
    sessionGold: 0,
    sessionCatch: 0,
    hookY: 0,
    hookTarget: 0,
    bite: null,
    phase: "idle",
    phaseT: 0,
  };

  const canvas = $("sea");
  const ctx = canvas.getContext("2d");
  let W = 0;
  let H = 0;
  let t0 = performance.now();
  let lastTick = t0;

  const creatures = [];

  function fmt(n) {
    return Math.floor(n).toLocaleString("en-US");
  }
  function pad(n) {
    return String(n).padStart(2, "0");
  }
  function timeText(sec) {
    sec = Math.max(0, Math.floor(sec));
    return `${pad((sec / 60) | 0)}:${pad(sec % 60)}`;
  }
  function rodOf() {
    return RODS.find((r) => r.id === state.rod);
  }
  function boatOf() {
    return BOATS.find((b) => b.id === state.boat);
  }
  function baitOf() {
    return BAITS.find((b) => b.id === state.bait);
  }
  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add("hidden"), 1800);
  }

  function resize() {
    const stage = $("stage");
    const r = stage.getBoundingClientRect();
    W = canvas.width = Math.floor(r.width * devicePixelRatio);
    H = canvas.height = Math.floor(r.height * devicePixelRatio);
    canvas.style.width = r.width + "px";
    canvas.style.height = r.height + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    W = r.width;
    H = r.height;
  }

  function spawnCreatures() {
    creatures.length = 0;
    const kinds = [
      { kind: "school", n: 18, y0: 0.28, y1: 0.55, s: [10, 18] },
      { kind: "angler", n: 6, y0: 0.42, y1: 0.82, s: [28, 46] },
      { kind: "eel", n: 3, y0: 0.55, y1: 0.88, s: [70, 110] },
      { kind: "squid", n: 2, y0: 0.48, y1: 0.75, s: [80, 130] },
      { kind: "jelly", n: 5, y0: 0.35, y1: 0.7, s: [16, 28] },
    ];
    for (const k of kinds) {
      for (let i = 0; i < k.n; i++) {
        creatures.push({
          kind: k.kind,
          x: Math.random() * 1600,
          y: (k.y0 + Math.random() * (k.y1 - k.y0)) * 900,
          s: k.s[0] + Math.random() * (k.s[1] - k.s[0]),
          vx: (Math.random() * 0.35 + 0.12) * (Math.random() < 0.5 ? -1 : 1),
          phase: Math.random() * Math.PI * 2,
          glow: 0.4 + Math.random() * 0.6,
        });
      }
    }
  }

  function drawSky(g) {
    const skyH = H * 0.2;
    const grd = g.createLinearGradient(0, 0, 0, skyH);
    grd.addColorStop(0, "#141821");
    grd.addColorStop(0.55, "#2a3344");
    grd.addColorStop(1, "#4a5360");
    g.fillStyle = grd;
    g.fillRect(0, 0, W, skyH);

    g.fillStyle = "#0c1018";
    g.beginPath();
    g.moveTo(W * 0.62, skyH);
    g.lineTo(W * 0.72, H * 0.07);
    g.lineTo(W * 0.78, H * 0.09);
    g.lineTo(W * 0.86, skyH * 0.55);
    g.lineTo(W * 0.98, skyH);
    g.fill();
    g.fillRect(W * 0.74, H * 0.085, 10, 22);
    g.fillRect(W * 0.78, H * 0.1, 7, 16);
  }

  function drawWater(g, now) {
    const skyH = H * 0.2;
    const grd = g.createLinearGradient(0, skyH, 0, H);
    grd.addColorStop(0, "#1c6a88");
    grd.addColorStop(0.18, "#0d4a63");
    grd.addColorStop(0.45, "#063246");
    grd.addColorStop(0.75, "#031824");
    grd.addColorStop(1, "#01060c");
    g.fillStyle = grd;
    g.fillRect(0, skyH - 2, W, H - skyH + 2);

    g.save();
    g.globalAlpha = 0.18;
    for (let i = 0; i < 6; i++) {
      const y = skyH + 8 + i * 10;
      g.strokeStyle = i % 2 ? "#9fefff" : "#ffffff";
      g.beginPath();
      for (let x = 0; x <= W; x += 8) {
        const yy = y + Math.sin(x * 0.02 + now * 0.002 + i) * 3;
        if (x === 0) g.moveTo(x, yy);
        else g.lineTo(x, yy);
      }
      g.stroke();
    }
    g.restore();
  }

  function drawWreck(g) {
    const x = W * 0.58;
    const y = H * 0.62;
    g.save();
    g.translate(x, y);
    g.rotate(-0.18);
    g.fillStyle = "#2a1c14";
    g.fillRect(-90, -18, 210, 38);
    g.fillRect(-70, -48, 18, 36);
    g.fillRect(40, -58, 14, 46);
    g.strokeStyle = "rgba(0,0,0,0.5)";
    g.beginPath();
    g.moveTo(-70, -48);
    g.lineTo(10, -90);
    g.lineTo(40, -58);
    g.stroke();
    g.fillStyle = "#3d2a1c";
    for (let i = 0; i < 5; i++) g.fillRect(-60 + i * 38, -8, 16, 12);
    g.restore();

    g.fillStyle = "#12301c";
    g.beginPath();
    g.ellipse(W * 0.22, H * 0.86, 70, 22, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#1d4a28";
    g.beginPath();
    g.ellipse(W * 0.8, H * 0.9, 90, 26, 0.1, 0, Math.PI * 2);
    g.fill();
  }

  function drawBoat(g, now) {
    const x = W * 0.36;
    const bob = Math.sin(now * 0.0022) * 3;
    const y = H * 0.195 + bob;
    g.save();
    g.translate(x, y);
    g.fillStyle = "#3a2414";
    g.beginPath();
    g.moveTo(-48, 6);
    g.lineTo(52, 6);
    g.lineTo(40, 20);
    g.lineTo(-36, 20);
    g.closePath();
    g.fill();
    g.fillStyle = "#c9b08a";
    g.fillRect(-10, -18, 4, 26);
    g.strokeStyle = "#1a120c";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-8, -16);
    g.lineTo(14, 2);
    g.stroke();
    g.fillStyle = "#2e2218";
    g.beginPath();
    g.arc(-6, -6, 7, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#6a3a22";
    g.fillRect(-12, -2, 10, 10);
    if (state.boat === "motor") {
      g.fillStyle = "#888";
      g.fillRect(40, 8, 10, 8);
    }
    if (state.boat === "sub") {
      g.fillStyle = "#c9a227";
      g.beginPath();
      g.ellipse(90, 28, 28, 12, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
    return { x, y: y + 20 };
  }

  function drawFish(g, c, now) {
    const y = (c.y / 900) * H + Math.sin(now * 0.001 + c.phase) * 6;
    const x = (c.x / 1600) * W;
    const dir = c.vx < 0 ? -1 : 1;
    g.save();
    g.translate(x, y);
    g.scale(dir, 1);

    if (c.kind === "eel") {
      g.strokeStyle = `rgba(80,220,170,${0.55 + c.glow * 0.2})`;
      g.lineWidth = 5;
      g.beginPath();
      for (let i = 0; i < 8; i++) {
        const px = i * (c.s / 8);
        const py = Math.sin(now * 0.006 + c.phase + i * 0.6) * 6;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke();
    } else if (c.kind === "squid") {
      g.fillStyle = "rgba(90,70,120,0.55)";
      g.beginPath();
      g.ellipse(0, 0, c.s * 0.28, c.s * 0.4, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(160,120,220,0.5)";
      for (let i = 0; i < 5; i++) {
        g.beginPath();
        g.moveTo(0, c.s * 0.25);
        g.quadraticCurveTo(i * 8 - 16, c.s * 0.55, i * 10 - 20, c.s * 0.7);
        g.stroke();
      }
    } else if (c.kind === "angler") {
      g.fillStyle = "#1a2a22";
      g.beginPath();
      g.ellipse(0, 0, c.s * 0.45, c.s * 0.28, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#9fff6a";
      g.beginPath();
      g.moveTo(c.s * 0.2, -c.s * 0.2);
      g.quadraticCurveTo(c.s * 0.45, -c.s * 0.55, c.s * 0.55, -c.s * 0.1);
      g.stroke();
      g.fillStyle = `rgba(180,255,80,${0.6 + Math.sin(now * 0.008 + c.phase) * 0.3})`;
      g.beginPath();
      g.arc(c.s * 0.55, -c.s * 0.1, 4, 0, Math.PI * 2);
      g.fill();
    } else if (c.kind === "jelly") {
      g.fillStyle = "rgba(120,220,255,0.18)";
      g.beginPath();
      g.arc(0, 0, c.s * 0.4, Math.PI, 0);
      g.fill();
      g.strokeStyle = "rgba(160,240,255,0.35)";
      g.beginPath();
      g.moveTo(-6, 2);
      g.quadraticCurveTo(-4, 18, -8, 26);
      g.moveTo(6, 2);
      g.quadraticCurveTo(4, 18, 8, 26);
      g.stroke();
    } else {
      g.fillStyle = "rgba(90, 180, 210, 0.7)";
      g.beginPath();
      g.ellipse(0, 0, c.s * 0.55, c.s * 0.28, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(-c.s * 0.5, 0);
      g.lineTo(-c.s * 0.85, -c.s * 0.22);
      g.lineTo(-c.s * 0.85, c.s * 0.22);
      g.fill();
    }
    g.restore();
  }

  function drawHook(g, boat, now) {
    const bait = baitOf();
    const x = boat.x + 16;
    let y = boat.y + 10 + state.hookY;
    if (state.phase === "idle") y = boat.y + 36 + Math.sin(now * 0.003) * 4;
    g.strokeStyle = "rgba(220,230,240,0.7)";
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(boat.x + 14, boat.y - 8);
    g.lineTo(x, y);
    g.stroke();

    g.fillStyle = "#c0c8d0";
    g.beginPath();
    g.arc(x, y, 3, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#dde";
    g.beginPath();
    g.arc(x + 4, y + 5, 5, -0.2, Math.PI * 1.1);
    g.stroke();

    if (bait.id === "worm") {
      g.strokeStyle = "#c96a4a";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x - 2, y + 2);
      g.quadraticCurveTo(x + 8, y + 8, x + 2, y + 14);
      g.stroke();
    } else if (bait.id === "fish") {
      g.fillStyle = "#6ec7ff";
      g.beginPath();
      g.ellipse(x + 6, y + 8, 8, 4, 0.3, 0, Math.PI * 2);
      g.fill();
    } else if (bait.id === "shrimp") {
      g.fillStyle = "#ff8a6a";
      g.beginPath();
      g.ellipse(x + 5, y + 8, 7, 4, -0.4, 0, Math.PI * 2);
      g.fill();
    }

    g.fillStyle = `rgba(255, 230, 120, ${0.25 + Math.sin(now * 0.01) * 0.12})`;
    g.beginPath();
    g.arc(x + 3, y + 8, 16, 0, Math.PI * 2);
    g.fill();
    return { x, y };
  }

  function rollCatch() {
    const luck = rodOf().luck * baitOf().lure * (0.85 + boatOf().depth * 0.08);
    const roll = Math.random() * luck;
    if (roll < 0.18) return null;
    let idx = 0;
    if (roll > 0.35) idx = 1;
    if (roll > 0.7) idx = 2;
    if (roll > 1.15) idx = 3;
    if (roll > 1.7 && rodOf().depth >= 2 && baitOf().id !== "hook") idx = 4;
    idx = Math.min(idx, 1 + rodOf().depth);
    return FISH[Math.min(idx, FISH.length - 1)];
  }

  function payout(fish) {
    const bet = BETS[state.betIndex];
    const mult = 1 + (fish.rarity - 1) * 0.35;
    const gold = Math.round(fish.gold * mult + bet * (0.6 + fish.rarity * 0.5));
    const points = Math.round(fish.points * (1 + bet / 2000));
    state.gold += gold;
    state.points += points;
    state.sessionGold += gold;
    state.sessionCatch += 1;
    if (state.points > 12000 && state.level < 6) state.level = 6;
    if (state.points > 20000) state.level = 7;
    return { gold, points };
  }

  function showCatch(fish, reward) {
    const el = $("catch-card");
    if (!fish) {
      el.innerHTML = `<h3>EMPTY HOOK</h3><p>深渊里什么也没咬</p>`;
    } else {
      el.innerHTML = `<h3>${fish.name}</h3><p>+${fmt(reward.gold)} GOLD · +${fmt(reward.points)} PTS</p>`;
    }
    el.classList.remove("hidden");
    setTimeout(() => el.classList.add("hidden"), 1700);
  }

  function renderHud() {
    $("points").textContent = fmt(state.points);
    $("gold").textContent = fmt(state.gold);
    $("gems").textContent = fmt(state.gems);
    $("level").textContent = String(state.level);
    $("time").textContent = timeText(state.timeLeft);
    $("bet-amt").textContent = fmt(BETS[state.betIndex]);
    $("cur-rod").textContent = rodOf().name.replace(" Rod", "");
    $("cur-boat").textContent = boatOf().name;
    $("btn-cast").disabled = state.fishing || state.paused || state.ended;
    $("btn-bet").disabled = state.fishing || state.paused || state.ended;
  }

  function iconSvg(kind) {
    const map = {
      basic: `<svg viewBox="0 0 54 28"><path d="M6 22 L48 6" stroke="#d4b06a" stroke-width="3"/><path d="M44 8 q8 8 2 14" stroke="#ccc" fill="none"/></svg>`,
      fine: `<svg viewBox="0 0 54 28"><path d="M4 24 L50 4" stroke="#9ad4ff" stroke-width="3"/><circle cx="46" cy="8" r="3" fill="#7dffef"/></svg>`,
      master: `<svg viewBox="0 0 54 28"><path d="M4 24 L50 5" stroke="#ffd56a" stroke-width="3"/><path d="M42 8 l8 10" stroke="#fff" fill="none"/></svg>`,
      row: `<svg viewBox="0 0 54 28"><path d="M8 14 L46 14 L40 22 L12 22 Z" fill="#6a4428"/><circle cx="24" cy="10" r="3" fill="#2a1c14"/></svg>`,
      motor: `<svg viewBox="0 0 54 28"><path d="M6 16 L48 16 L44 23 L10 23 Z" fill="#4a5560"/><rect x="40" y="12" width="8" height="6" fill="#888"/></svg>`,
      sub: `<svg viewBox="0 0 54 28"><ellipse cx="28" cy="16" rx="18" ry="8" fill="#c9a227"/><rect x="24" y="6" width="8" height="6" fill="#e0c25a"/></svg>`,
      hook: `<svg viewBox="0 0 46 36"><path d="M22 6 v14 q0 10 10 10" stroke="#ddd" fill="none" stroke-width="3"/></svg>`,
      worm: `<svg viewBox="0 0 46 36"><path d="M12 20 q10 -12 16 0 q6 10 12 -2" stroke="#c45b3a" fill="none" stroke-width="4"/></svg>`,
      fish: `<svg viewBox="0 0 46 36"><ellipse cx="24" cy="18" rx="12" ry="6" fill="#6ec7ff"/><path d="M12 18 l-8 -5 v10 z" fill="#6ec7ff"/></svg>`,
      shrimp: `<svg viewBox="0 0 46 36"><path d="M12 22 q10 -16 22 -4 q-8 10 -18 8" fill="#ff8a6a"/></svg>`,
    };
    return map[kind];
  }

  function renderShop() {
    $("rods").innerHTML = RODS.map((r) => {
      const owned = state.ownedRods.has(r.id);
      const active = state.rod === r.id;
      return `<button class="item ${owned ? "owned" : ""} ${active ? "active" : ""}" data-buy="rod" data-id="${r.id}">
        <div class="icon-art">${iconSvg(r.id)}</div>
        <div class="price">${owned ? "OWNED" : fmt(r.cost)}</div>
      </button>`;
    }).join("");
    $("boats").innerHTML = BOATS.map((b) => {
      const owned = state.ownedBoats.has(b.id);
      const active = state.boat === b.id;
      return `<button class="item ${owned ? "owned" : ""} ${active ? "active" : ""}" data-buy="boat" data-id="${b.id}">
        <div class="icon-art">${iconSvg(b.id)}</div>
        <div class="price ${b.currency === "gems" ? "gems" : ""}">${owned ? "OWNED" : fmt(b.cost) + (b.currency === "gems" ? " ◆" : "")}</div>
      </button>`;
    }).join("");
    $("baits").innerHTML = BAITS.map((b) => {
      const active = state.bait === b.id;
      return `<button class="bait-item ${active ? "active" : ""}" data-bait="${b.id}">
        <div class="icon-art">${iconSvg(b.id)}</div>
        <div class="price">${fmt(b.cost)}</div>
      </button>`;
    }).join("");
  }

  function buy(type, id) {
    if (state.fishing) return;
    if (type === "rod") {
      const r = RODS.find((x) => x.id === id);
      if (state.ownedRods.has(id)) {
        state.rod = id;
      } else if (state.gold >= r.cost) {
        state.gold -= r.cost;
        state.ownedRods.add(id);
        state.rod = id;
        toast(`装备 ${r.name}`);
      } else toast("金币不足");
    } else {
      const b = BOATS.find((x) => x.id === id);
      if (state.ownedBoats.has(id)) {
        state.boat = id;
      } else if (state[b.currency] >= b.cost) {
        state[b.currency] -= b.cost;
        state.ownedBoats.add(id);
        state.boat = id;
        toast(`登上 ${b.name}`);
      } else toast(b.currency === "gems" ? "宝石不足" : "金币不足");
    }
    renderShop();
    renderHud();
  }

  function cast() {
    if (state.fishing || state.paused || state.ended) return;
    const bait = baitOf();
    const bet = BETS[state.betIndex];
    const need = bait.cost + bet;
    if (state.gold < need) {
      toast("金币不够支付诱饵和赌注");
      return;
    }
    state.gold -= need;
    state.fishing = true;
    state.phase = "drop";
    state.phaseT = 0;
    state.hookY = 20;
    state.hookTarget = H * (0.42 + Math.random() * 0.22 + boatOf().depth * 0.04);
    state.waitFor = 0.85 + Math.random() * 0.9;
    state.bite = null;
    renderHud();
  }

  function updateFishing(dt) {
    state.phaseT += dt;
    if (state.phase === "drop") {
      state.hookY += dt * 220;
      if (state.hookY >= state.hookTarget) {
        state.hookY = state.hookTarget;
        state.phase = "wait";
        state.phaseT = 0;
      }
    } else if (state.phase === "wait") {
      state.hookY += Math.sin(state.phaseT * 6) * 0.15;
      if (state.phaseT > state.waitFor) {
        state.bite = rollCatch();
        state.phase = "reel";
        state.phaseT = 0;
      }
    } else if (state.phase === "reel") {
      state.hookY -= dt * 320;
      if (state.hookY <= 24) {
        state.hookY = 24;
        state.phase = "idle";
        state.fishing = false;
        const reward = state.bite ? payout(state.bite) : null;
        showCatch(state.bite, reward);
        renderHud();
      }
    }
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTick) / 1000);
    lastTick = now;
    if (!state.paused && !state.ended) {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.ended = true;
        $("end-summary").textContent = `本局捕获 ${state.sessionCatch} 条，赚取 ${fmt(state.sessionGold)} 金`;
        $("end-mask").classList.remove("hidden");
      }
      if (state.fishing) updateFishing(dt);
      for (const c of creatures) {
        c.x += c.vx * 40 * dt * 60 * 0.02;
        if (c.x < -80) c.x = 1680;
        if (c.x > 1680) c.x = -80;
        if (state.fishing && state.phase === "wait") {
          const hx = 0.36 * 1600;
          if (Math.abs(c.x - hx) < 90) c.vx *= 0.98;
        }
      }
    }

    ctx.clearRect(0, 0, W, H);
    drawSky(ctx);
    drawWater(ctx, now);
    drawWreck(ctx);
    for (const c of creatures) drawFish(ctx, c, now);
    const boat = drawBoat(ctx, now);
    drawHook(ctx, boat, now);
    renderHud();
    requestAnimationFrame(loop);
  }

  function bind() {
    $("btn-bet").onclick = () => {
      state.betIndex = (state.betIndex + 1) % BETS.length;
      renderHud();
    };
    $("btn-cast").onclick = cast;
    $("btn-pause").onclick = () => {
      if (state.ended) return;
      state.paused = true;
      $("pause-mask").classList.remove("hidden");
    };
    $("btn-resume").onclick = () => {
      state.paused = false;
      $("pause-mask").classList.add("hidden");
    };
    $("btn-again").onclick = () => {
      state.timeLeft = 143;
      state.ended = false;
      state.fishing = false;
      state.phase = "idle";
      state.sessionGold = 0;
      state.sessionCatch = 0;
      $("end-mask").classList.add("hidden");
      renderHud();
    };
    $("rods").onclick = (e) => {
      const b = e.target.closest("[data-buy]");
      if (b) buy(b.dataset.buy, b.dataset.id);
    };
    $("boats").onclick = (e) => {
      const b = e.target.closest("[data-buy]");
      if (b) buy(b.dataset.buy, b.dataset.id);
    };
    $("baits").onclick = (e) => {
      const b = e.target.closest("[data-bait]");
      if (!b || state.fishing) return;
      state.bait = b.dataset.bait;
      renderShop();
    };
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        cast();
      }
      if (e.key === "b" || e.key === "B") $("btn-bet").click();
    });
  }

  resize();
  spawnCreatures();
  renderShop();
  renderHud();
  bind();
  requestAnimationFrame(loop);
})();
