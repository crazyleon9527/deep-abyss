(() => {
  const $ = (id) => document.getElementById(id);

  const RODS = [
    { id: "basic", name: "Basic", rent: 0, depth: 1 },
    { id: "fine", name: "Fine", rent: 800, depth: 2 },
    { id: "master", name: "Master", rent: 2200, depth: 3 },
  ];
  const BOATS = [
    { id: "row", name: "Rowboat", rent: 0, depth: 1 },
    { id: "motor", name: "Motorboat", rent: 1200, depth: 2 },
    { id: "sub", name: "Submarine", rent: 2800, depth: 3 },
  ];
  const BAITS = [
    { id: "hook", name: "Hook", cost: 250, attract: ["school"] },
    { id: "worm", name: "Worm", cost: 600, attract: ["angler"] },
    { id: "fish", name: "Minnow", cost: 1400, attract: ["eel"] },
    { id: "shrimp", name: "Shrimp", cost: 2800, attract: ["squid", "leviathan"] },
  ];
  const FISH = [
    { id: "school", name: "Abyss School", rarity: 1, depth: 1, gold: 220, points: 90, color: "#7ad0ff" },
    { id: "angler", name: "Lantern Angler", rarity: 2, depth: 2, gold: 820, points: 280, color: "#b6ff64" },
    { id: "eel", name: "Moray Shade", rarity: 3, depth: 2, gold: 2400, points: 820, color: "#5cffd2" },
    { id: "squid", name: "Goliath Squid", rarity: 4, depth: 3, gold: 7200, points: 2600, color: "#c9a0ff" },
    { id: "leviathan", name: "Deep Leviathan", rarity: 5, depth: 3, gold: 20000, points: 9000, color: "#ffd36a" },
  ];
  const KIND_DEPTH = { school: 1, angler: 2, eel: 2, squid: 3, leviathan: 3 };
  const BETS = [
    { amt: 100, win: 1.15 },
    { amt: 500, win: 1.55 },
    { amt: 1000, win: 2.1 },
    { amt: 2500, win: 2.9 },
    { amt: 5000, win: 4.0 },
  ];
  const SESSION = {
    gold: 80000,
    gems: 5,
    points: 0,
    level: 1,
    timeLeft: 120,
    bait: "hook",
  };

  function freshState() {
    return {
      points: SESSION.points,
      gold: SESSION.gold,
      gems: SESSION.gems,
      level: SESSION.level,
      timeLeft: SESSION.timeLeft,
      betIndex: 1,
      rod: "basic",
      boat: "row",
      bait: SESSION.bait,
      paused: false,
      ended: false,
      fishing: false,
      sessionGold: 0,
      sessionCatch: 0,
      combo: 0,
      hookY: 0,
      hookTarget: 0,
      bite: null,
      biteCreature: null,
      phase: "idle",
      phaseT: 0,
      waitFor: 0,
      fightResult: null,
      dirtyHud: true,
    };
  }

  const state = freshState();

  const canvas = $("sea");
  const ctx = canvas.getContext("2d", { alpha: true });
  let W = 0;
  let H = 0;
  let lastTick = performance.now();
  const creatures = [];
  const particles = [];

  let audio;
  function beep(freq, dur, type = "sine", gain = 0.04) {
    try {
      audio = audio || new AudioContext();
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g);
      g.connect(audio.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
      o.stop(audio.currentTime + dur);
    } catch (_) {}
  }

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
  const rodOf = () => RODS.find((r) => r.id === state.rod);
  const boatOf = () => BOATS.find((b) => b.id === state.boat);
  const baitOf = () => BAITS.find((b) => b.id === state.bait);
  const betOf = () => BETS[state.betIndex];
  const fishOf = (id) => FISH.find((f) => f.id === id);
  function gearRent() {
    return rodOf().rent + boatOf().rent;
  }
  function castCost() {
    return baitOf().cost + betOf().amt + gearRent();
  }
  function rentLabel(n) {
    return n <= 0 ? "FREE" : `租 ${fmt(n)}`;
  }

  function toast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add("hidden"), 1600);
  }

  function spawnParticle(x, y, color) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 60,
      vy: -20 - Math.random() * 50,
      life: 0.5 + Math.random() * 0.5,
      t: 0,
      color,
      r: 1.5 + Math.random() * 2.5,
    });
  }

  function resize() {
    const stage = $("stage");
    const r = stage.getBoundingClientRect();
    canvas.width = Math.floor(r.width * devicePixelRatio);
    canvas.height = Math.floor(r.height * devicePixelRatio);
    canvas.style.width = r.width + "px";
    canvas.style.height = r.height + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    W = r.width;
    H = r.height;
  }

  function makeCreature(kindSpec, fromLeft, inView) {
    const y0 = kindSpec.y0;
    const y1 = kindSpec.y1;
    const dir = fromLeft ? 1 : -1;
    let x;
    if (inView) x = 200 + Math.random() * 1200;
    else x = fromLeft ? -80 - Math.random() * 80 : 1680 + Math.random() * 80;
    return {
      kind: kindSpec.kind,
      x,
      y: (y0 + Math.random() * (y1 - y0)) * 900,
      s: kindSpec.s[0] + Math.random() * (kindSpec.s[1] - kindSpec.s[0]),
      vx: dir * (0.22 + Math.random() * 0.38),
      vy: (Math.random() - 0.5) * 0.22,
      phase: Math.random() * Math.PI * 2,
      glow: 0.4 + Math.random() * 0.6,
      y0,
      y1,
      turnT: 0.8 + Math.random() * 2.2,
      kindSpec,
    };
  }

  const KIND_SPECS = [
    { kind: "school", n: 10, y0: 0.34, y1: 0.52, s: [22, 34] },
    { kind: "angler", n: 3, y0: 0.5, y1: 0.68, s: [40, 58] },
    { kind: "eel", n: 2, y0: 0.54, y1: 0.76, s: [90, 130] },
    { kind: "squid", n: 2, y0: 0.64, y1: 0.86, s: [70, 100] },
    { kind: "jelly", n: 4, y0: 0.4, y1: 0.72, s: [22, 34] },
  ];

  function spawnCreatures() {
    creatures.length = 0;
    for (const k of KIND_SPECS) {
      for (let i = 0; i < k.n; i++) {
        creatures.push(makeCreature(k, Math.random() < 0.5, true));
      }
    }
  }

  function boatPos(now) {
    const bob = Math.sin(now * 0.0022) * 3;
    return { x: W * 0.36, y: H * 0.195 + bob + 20 };
  }

  function fisherPose(now) {
    const fighting = state.phase === "fight" || state.phase === "approach";
    const pull = fighting ? Math.sin(now * 0.018) : 0;
    return {
      rod: fighting ? -0.55 + pull * 0.35 : -0.22,
      tug: fighting ? pull * 10 : 0,
    };
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
    const pose = fisherPose(now);
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
    g.moveTo(-8, -16 + pose.tug * 0.2);
    g.lineTo(18, 4 + pose.rod * 10);
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
    return { tipX: x + 18, tipY: y - 16 + pose.rod * 10 + pose.tug * 0.2 };
  }

  function drawFish(g, c, now) {
    const y = (c.y / 900) * H + Math.sin(now * 0.001 + c.phase) * 6;
    const x = (c.x / 1600) * W;
    const dir = c.vx < 0 ? -1 : 1;
    const hooked = state.biteCreature === c;
    g.save();
    g.translate(x, y);
    g.scale(dir * (hooked ? 1.35 : 1), hooked ? 1.35 : 1);
    g.globalAlpha = hooked ? 1 : 0.92;
    if (hooked) {
      g.shadowColor = state.bite ? state.bite.color : "#7dfff2";
      g.shadowBlur = 18;
    }
    if (c.kind === "eel") {
      g.strokeStyle = `rgba(80,220,170,${0.7 + c.glow * 0.2})`;
      g.lineWidth = 6;
      g.beginPath();
      for (let i = 0; i < 8; i++) {
        const px = i * (c.s / 8);
        const py = Math.sin(now * 0.006 + c.phase + i * 0.6) * 6;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke();
    } else if (c.kind === "squid") {
      g.fillStyle = "rgba(110,80,150,0.85)";
      g.beginPath();
      g.ellipse(0, 0, c.s * 0.28, c.s * 0.4, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(190,150,255,0.7)";
      g.lineWidth = 2;
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
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(c.s * 0.2, -c.s * 0.2);
      g.quadraticCurveTo(c.s * 0.45, -c.s * 0.55, c.s * 0.55, -c.s * 0.1);
      g.stroke();
      g.fillStyle = `rgba(180,255,80,${0.7 + Math.sin(now * 0.008 + c.phase) * 0.3})`;
      g.beginPath();
      g.arc(c.s * 0.55, -c.s * 0.1, 5, 0, Math.PI * 2);
      g.fill();
    } else if (c.kind === "jelly") {
      g.fillStyle = "rgba(120,220,255,0.28)";
      g.beginPath();
      g.arc(0, 0, c.s * 0.4, Math.PI, 0);
      g.fill();
      g.strokeStyle = "rgba(160,240,255,0.45)";
      g.beginPath();
      g.moveTo(-6, 2);
      g.quadraticCurveTo(-4, 18, -8, 26);
      g.moveTo(6, 2);
      g.quadraticCurveTo(4, 18, 8, 26);
      g.stroke();
    } else {
      g.fillStyle = "rgba(90, 200, 230, 0.92)";
      g.beginPath();
      g.ellipse(0, 0, c.s * 0.55, c.s * 0.28, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(-c.s * 0.5, 0);
      g.lineTo(-c.s * 0.85, -c.s * 0.22);
      g.lineTo(-c.s * 0.85, c.s * 0.22);
      g.fill();
      g.fillStyle = "#0a2030";
      g.beginPath();
      g.arc(c.s * 0.22, -2, 2.2, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  function drawHook(g, boat, rodTip, now) {
    const bait = baitOf();
    const inWindow = state.phase === "fight";
    const x = boat.x + 16 + (state.phase === "fight" || state.phase === "approach" ? Math.sin(now * 0.04) * 8 : 0);
    let y = boat.y + 10 + state.hookY;
    if (state.phase === "idle") y = boat.y + 36 + Math.sin(now * 0.003) * 4;

    g.save();
    g.strokeStyle = inWindow ? "rgba(182, 255, 106, 0.98)" : state.phase === "fight" || state.phase === "approach" ? "rgba(255, 220, 140, 0.95)" : "rgba(220,230,240,0.75)";
    g.shadowColor = inWindow ? "#b6ff6a" : state.phase === "approach" ? "#ff8a4a" : "#9fefff";
    g.shadowBlur = inWindow ? 14 : state.phase === "approach" ? 12 : 4;
    g.lineWidth = state.phase === "fight" || state.phase === "approach" ? 2.2 : 1.4;
    g.beginPath();
    g.moveTo(rodTip.tipX, rodTip.tipY);
    if (state.phase === "fight" || state.phase === "approach") {
      g.lineTo((rodTip.tipX + x) / 2 + Math.sin(now * 0.05) * 16, (rodTip.tipY + y) / 2);
    }
    g.lineTo(x, y);
    g.stroke();
    g.restore();

    g.fillStyle = "#c0c8d0";
    g.beginPath();
    g.arc(x, y, 3.5, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#dde";
    g.beginPath();
    g.arc(x + 4, y + 5, 5, -0.2, Math.PI * 1.1);
    g.stroke();

    const showBait = !(state.bite && (state.phase === "approach" || state.phase === "fight" || state.phase === "reel") && state.fightResult !== "early" && state.fightResult !== "late");
    if (showBait) {
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
    }

    const pulse = inWindow ? 0.5 + Math.sin(now * 0.03) * 0.2 : state.phase === "approach" ? 0.4 : 0.22 + Math.sin(now * 0.01) * 0.12;
    g.fillStyle = inWindow ? `rgba(182, 255, 106, ${pulse})` : state.phase === "approach" ? `rgba(255, 140, 70, ${pulse})` : `rgba(255, 230, 120, ${pulse})`;
    g.beginPath();
    g.arc(x + 3, y + 8, inWindow ? 28 : state.phase === "approach" ? 26 : 16, 0, Math.PI * 2);
    g.fill();
    return { x, y };
  }

  function ensureLure(hook) {
    const boat = boatOf();
    const wanted = baitOf().attract.find((k) => k !== "leviathan" && (KIND_DEPTH[k] || 1) <= boat.depth);
    if (!wanted) return;
    const spec = KIND_SPECS.find((k) => k.kind === wanted);
    if (!spec) return;
    const hx = (hook.x / W) * 1600;
    const hy = (hook.y / H) * 900;
    const near = creatures.some((c) => c.kind === wanted && Math.hypot(c.x - hx, c.y - hy) < 140);
    if (near) return;
    const fromLeft = Math.random() < 0.5;
    const c = makeCreature(spec, fromLeft);
    c.x = hx + (fromLeft ? -240 : 240);
    c.y = Math.max(spec.y0 * 900, Math.min(spec.y1 * 900, hy));
    creatures.push(c);
  }

  function baitWants(kind) {
    return baitOf().attract.includes(kind);
  }

  function findBite(hook) {
    const boat = boatOf();
    const rod = rodOf();
    const bait = baitOf();
    let best = null;
    let bestScore = 1e9;
    for (const c of creatures) {
      if (c.kind === "jelly") continue;
      const depth = KIND_DEPTH[c.kind] || 1;
      if (depth > boat.depth) continue;
      const sx = (c.x / 1600) * W;
      const sy = (c.y / 900) * H;
      const dx = sx - hook.x;
      const dy = sy - hook.y;
      const dist = Math.hypot(dx, dy);
      const match = bait.attract.includes(c.kind) || (c.kind === "squid" && bait.attract.includes("leviathan"));
      const range = match ? 210 : 52;
      if (dist > range) continue;
      const score = dist / (match ? 0.55 : 1);
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    if (!best) return { fish: null, creature: null };
    let id = best.kind;
    if (
      id === "squid" &&
      bait.id === "shrimp" &&
      boat.depth >= 3 &&
      rod.depth >= 3 &&
      Math.random() < 0.22
    ) {
      id = "leviathan";
    }
    return { fish: fishOf(id), creature: best };
  }

  function startFight(fish) {
    state.fightResult = null;
    state.phase = "fight";
    state.phaseT = 0;
    $("fight-hint").textContent = "上钩了，正在收线";
    $("fight-hint").classList.remove("hidden");
    $("fight-hint").classList.add("now");
    beep(660, 0.09);
  }

  function beginReel(result) {
    state.fightResult = result;
    state.phase = "reel";
    state.phaseT = 0;
    $("fight-hint").classList.add("hidden");
    $("fight-hint").classList.remove("now");
    if (result === "success") beep(520, 0.1, "triangle");
    else beep(180, 0.09);
  }

  function payout(fish) {
    const bet = betOf();
    const comboBet = 1 + Math.min(state.combo, 8) * 0.12;
    const fishGold = fish.gold;
    const betWin = Math.round(bet.amt * bet.win * (0.65 + fish.rarity * 0.22) * comboBet);
    const gold = fishGold + betWin;
    const points = Math.round(fish.points * (1 + bet.amt / 4000));
    state.gold += gold;
    state.points += points;
    state.sessionGold += gold;
    state.sessionCatch += 1;
    const nextLv = 1 + Math.floor(state.points / 2200);
    if (nextLv > state.level) {
      const gained = nextLv - state.level;
      state.level = nextLv;
      state.gems += gained;
      toast(`升级 LVL ${state.level}，获得 ${gained} 宝石`);
      beep(880, 0.18, "triangle", 0.05);
    }
    return { gold, points };
  }

  function showCatch(fish, reward, result) {
    const el = $("catch-card");
    el.className = "catch-card";
    if (!fish) {
      state.combo = 0;
      $("streak").hidden = true;
      el.classList.add("miss");
      el.innerHTML = `<h3>EMPTY HOOK</h3><p>钩边没有对口的鱼</p>`;
      beep(140, 0.16, "sawtooth", 0.03);
    } else {
      state.combo += 1;
      $("streak").hidden = state.combo < 2;
      $("streak").textContent = `COMBO x${state.combo}`;
      el.classList.add("r" + fish.rarity);
      el.innerHTML = `<h3>${fish.name}</h3><p>+${fmt(reward.gold)} GOLD · +${fmt(reward.points)} PTS</p>`;
      beep(420 + fish.rarity * 80, 0.12, "square", 0.035);
      $("stage").classList.remove("shake");
      void $("stage").offsetWidth;
      $("stage").classList.add("shake");
    }
    el.classList.remove("hidden");
    clearTimeout(showCatch._t);
    showCatch._t = setTimeout(() => el.classList.add("hidden"), 1500);
    state.dirtyHud = true;
  }

  function renderHud() {
    $("time").textContent = timeText(state.timeLeft);
    if (!state.dirtyHud) return;
    $("points").textContent = fmt(state.points);
    $("gold").textContent = fmt(state.gold);
    $("gems").textContent = fmt(state.gems);
    $("level").textContent = String(state.level);
    $("level-right").textContent = String(state.level);
    $("bet-amt").textContent = fmt(betOf().amt);
    $("cur-rod").textContent = rodOf().name;
    $("cur-boat").textContent = boatOf().name;
    $("rent-fee").textContent = rentLabel(gearRent());
    $("cast-fee").textContent = `本竿 ${fmt(castCost())}`;
    const canCast = !state.paused && !state.ended && state.phase === "idle";
    $("btn-cast").disabled = !canCast;
    $("btn-bet").disabled = state.fishing || state.paused || state.ended;
    state.dirtyHud = false;
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
      const active = state.rod === r.id;
      return `<button class="item ${active ? "active" : ""}" data-rent="rod" data-id="${r.id}">
        <div class="icon-art">${iconSvg(r.id)}</div>
        <div class="price">${rentLabel(r.rent)}</div>
      </button>`;
    }).join("");
    $("boats").innerHTML = BOATS.map((b) => {
      const active = state.boat === b.id;
      return `<button class="item ${active ? "active" : ""}" data-rent="boat" data-id="${b.id}">
        <div class="icon-art">${iconSvg(b.id)}</div>
        <div class="price">${rentLabel(b.rent)}</div>
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

  function rent(type, id) {
    if (state.fishing) return;
    if (type === "rod") {
      state.rod = id;
      toast(`${rodOf().name}：每竿租 ${rentLabel(rodOf().rent)}，下钩时扣`);
    } else {
      state.boat = id;
      toast(`${boatOf().name}：每竿租 ${rentLabel(boatOf().rent)}，下钩时扣`);
    }
    beep(500, 0.08);
    renderShop();
    state.dirtyHud = true;
    renderHud();
  }

  function resetSession() {
    const next = freshState();
    Object.keys(next).forEach((k) => {
      state[k] = next[k];
    });
    $("streak").hidden = true;
    $("end-mask").classList.add("hidden");
    $("pause-mask").classList.add("hidden");
    $("fight-hint").classList.add("hidden");
    $("catch-card").classList.add("hidden");
    spawnCreatures();
    renderShop();
    state.dirtyHud = true;
    renderHud();
  }

  function onCastPress() {
    if (state.paused || state.ended) return;
    if (state.fishing) return;
    const need = castCost();
    if (state.gold < need) {
      toast("金币不够支付诱饵、租借和赌注");
      return;
    }
    state.gold -= need;
    state.fishing = true;
    state.phase = "drop";
    state.phaseT = 0;
    state.hookY = 18;
    state.hookTarget = H * (0.16 + (boatOf().depth - 1) * 0.14 + Math.random() * 0.06);
    state.waitFor = 2.2 + Math.random() * 0.5;
    state.bite = null;
    state.biteCreature = null;
    state.fightResult = null;
    state.dirtyHud = true;
    beep(240, 0.08, "triangle");
    renderHud();
  }

  function updateFishing(dt, hook) {
    state.phaseT += dt;
    if (state.phase === "drop") {
      state.hookY += dt * 260;
      if (state.hookY >= state.hookTarget) {
        state.hookY = state.hookTarget;
        state.phase = "wait";
        state.phaseT = 0;
        ensureLure(hook);
      }
    } else if (state.phase === "wait") {
      state.hookY += Math.sin(state.phaseT * 7) * 0.2;
      if (Math.random() < 0.35) spawnParticle(hook.x, hook.y, "rgba(125,255,242,0.7)");
      const found = state.phaseT > 0.4 ? findBite(hook) : { fish: null };
      if (found.fish) {
        state.bite = found.fish;
        state.biteCreature = found.creature;
        state.phase = "approach";
        state.phaseT = 0;
        $("fight-hint").textContent = "有鱼咬钩！";
        $("fight-hint").classList.remove("hidden", "now");
        beep(440, 0.08);
        state.dirtyHud = true;
      } else if (state.phaseT > state.waitFor) {
        state.bite = null;
        state.biteCreature = null;
        beginReel("empty");
        state.dirtyHud = true;
      }
    } else if (state.phase === "approach") {
      state.hookY += Math.sin(state.phaseT * 18) * 0.8;
      const c = state.biteCreature;
      if (c) {
        const hx = (hook.x / W) * 1600;
        const hy = (hook.y / H) * 900;
        c.x += (hx - c.x) * Math.min(1, dt * 7);
        c.y += (hy - c.y) * Math.min(1, dt * 7);
      }
      spawnParticle(hook.x + (Math.random() - 0.5) * 20, hook.y + (Math.random() - 0.5) * 20, "rgba(255,160,80,0.9)");
      if (state.phaseT > 0.7) startFight(state.bite);
      state.dirtyHud = true;
    } else if (state.phase === "fight") {
      state.hookY += Math.sin(state.phaseT * 14) * 0.55;
      if (Math.random() < 0.5) spawnParticle(hook.x, hook.y, "rgba(255,210,100,0.8)");
      if (state.phaseT > 0.55) beginReel("success");
      state.dirtyHud = true;
    } else if (state.phase === "reel") {
      state.hookY -= dt * (state.bite && state.fightResult === "success" ? 280 : 360);
      if (state.hookY <= 22) {
        state.hookY = 22;
        state.phase = "idle";
        state.fishing = false;
        const ok = state.fightResult === "success" && state.bite;
        const reward = ok ? payout(state.bite) : null;
        if (ok) {
          for (let i = 0; i < 18; i++) spawnParticle(hook.x, hook.y, state.bite.color);
        }
        showCatch(ok ? state.bite : null, reward, state.fightResult);
        $("fight-hint").classList.add("hidden");
        state.biteCreature = null;
        renderHud();
      }
    }
  }

  function updateCreatures(dt, hook) {
    const attract = state.fishing && state.phase === "wait";
    const hx = (hook.x / W) * 1600;
    const hy = (hook.y / H) * 900;
    const boat = boatOf();
    const hooked = state.fishing && state.biteCreature && (state.phase === "approach" || state.phase === "fight" || (state.phase === "reel" && state.fightResult === "success"));
    for (let i = 0; i < creatures.length; i++) {
      const c = creatures[i];
      if (hooked && c === state.biteCreature) {
        c.x = (hook.x / W) * 1600;
        c.y = (hook.y / H) * 900;
        continue;
      }
      c.turnT -= dt;
      if (c.turnT <= 0) {
        c.vy += (Math.random() - 0.5) * 0.28;
        c.vx += (Math.random() - 0.5) * 0.08;
        const spd = Math.max(0.16, Math.min(0.62, Math.abs(c.vx)));
        c.vx = Math.sign(c.vx || 1) * spd;
        c.vy = Math.max(-0.32, Math.min(0.32, c.vy));
        c.turnT = 0.7 + Math.random() * 2.4;
      }
      if (attract && c.kind !== "jelly") {
        const depth = KIND_DEPTH[c.kind] || 1;
        const dx = hx - c.x;
        const dy = hy - c.y;
        const d2 = dx * dx + dy * dy;
        const match = baitWants(c.kind) || (c.kind === "squid" && baitWants("leviathan"));
        if (depth > boat.depth) {
          c.x -= dx * dt * 0.15;
        } else if (d2 < (match ? 320 : 120) ** 2) {
          const pull = match ? 1.35 : -0.35;
          c.x += dx * dt * pull;
          c.y += dy * dt * pull;
        }
      }
      c.x += c.vx * 46 * dt;
      c.y += c.vy * 38 * dt;
      const ymin = c.y0 * 900;
      const ymax = c.y1 * 900;
      if (c.y < ymin) { c.y = ymin; c.vy = Math.abs(c.vy); }
      if (c.y > ymax) { c.y = ymax; c.vy = -Math.abs(c.vy); }
      if (c.x < -160 || c.x > 1760) {
        creatures[i] = makeCreature(c.kindSpec, c.x > 800);
      }
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.t >= p.life) particles.splice(i, 1);
    }
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - lastTick) / 1000);
    lastTick = now;
    const boat = boatPos(now);
    const hookPreview = {
      x: boat.x + 18,
      y: state.phase === "idle" ? boat.y + 36 : boat.y + 10 + state.hookY,
    };

    if (!state.paused && !state.ended) {
      if (state.phase !== "fight" && state.phase !== "approach") state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.ended = true;
        $("end-summary").textContent = `捕获 ${state.sessionCatch} 条 · 本局 +${fmt(state.sessionGold)} 金 · ${fmt(state.points)} 分`;
        $("end-mask").classList.remove("hidden");
        state.dirtyHud = true;
      }
      if (state.fishing) updateFishing(dt, hookPreview);
      updateCreatures(dt, hookPreview);
      updateParticles(dt);
    }

    ctx.clearRect(0, 0, W, H);
    drawSky(ctx);
    drawWater(ctx, now);
    drawWreck(ctx);
    for (const c of creatures) drawFish(ctx, c, now);
    for (const p of particles) {
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    const rodTip = drawBoat(ctx, now);
    drawHook(ctx, boat, rodTip, now);
    renderHud();
    requestAnimationFrame(loop);
  }

  function bindDrawer(id, tabId) {
    $(tabId).onclick = () => $(id).classList.toggle("open");
  }

  function bind() {
    bindDrawer("drawer-shop", "tab-shop");
    bindDrawer("drawer-bait", "tab-bait");
    $("btn-bet").onclick = () => {
      state.betIndex = (state.betIndex + 1) % BETS.length;
      state.dirtyHud = true;
      beep(300, 0.05);
      renderHud();
    };
    $("btn-cast").onclick = onCastPress;
    $("btn-pause").onclick = () => {
      if (state.ended) return;
      state.paused = true;
      $("pause-mask").classList.remove("hidden");
    };
    $("btn-resume").onclick = () => {
      state.paused = false;
      $("pause-mask").classList.add("hidden");
    };
    $("btn-again").onclick = resetSession;
    $("rods").onclick = (e) => {
      const b = e.target.closest("[data-rent]");
      if (b) rent(b.dataset.rent, b.dataset.id);
    };
    $("boats").onclick = (e) => {
      const b = e.target.closest("[data-rent]");
      if (b) rent(b.dataset.rent, b.dataset.id);
    };
    $("baits").onclick = (e) => {
      const b = e.target.closest("[data-bait]");
      if (!b || state.fishing) return;
      state.bait = b.dataset.bait;
      const bait = baitOf();
      toast(`${bait.name}：招 ${bait.attract.join(" / ")}，费用下钩时扣`);
      renderShop();
      state.dirtyHud = true;
      renderHud();
    };

    visualViewport?.addEventListener("resize", resize);
    window.addEventListener("orientationchange", () => setTimeout(resize, 180));
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        onCastPress();
      }
      if (e.key === "b" || e.key === "B") $("btn-bet").click();
    });
  }

  function layoutChrome() {
    const mobile = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
    $("drawer-shop").classList.toggle("open", !mobile);
    $("drawer-bait").classList.toggle("open", !mobile);
  }

  resize();
  layoutChrome();
  const orient = window.matchMedia("(orientation: portrait)");
  if (orient.addEventListener) orient.addEventListener("change", layoutChrome);
  else if (orient.addListener) orient.addListener(layoutChrome);
  spawnCreatures();
  renderShop();
  renderHud();
  bind();
  requestAnimationFrame(loop);
})();
