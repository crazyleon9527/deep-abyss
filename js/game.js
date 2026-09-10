(() => {
  const $ = (id) => document.getElementById(id);

  const RODS = [
    { id: "basic", name: "稳竿", rent: 0, wait: 1, lure: 1, reel: 1, blurb: "常鱼稳咬", biteR: { 1: 1.28, 2: 0.95, 3: 0.68, 4: 0.48, 5: 0.32 } },
    { id: "fine", name: "快竿", rent: 80, wait: 0.62, lure: 1.4, reel: 1.35, blurb: "中层快咬", biteR: { 1: 0.92, 2: 1.22, 3: 1.18, 4: 0.88, 5: 0.55 } },
    { id: "master", name: "金竿", rent: 220, wait: 0.42, lure: 1.75, reel: 1.7, blurb: "稀有深咬", biteR: { 1: 0.68, 2: 0.95, 3: 1.18, 4: 1.32, 5: 1.42 } },
  ];
  const BOATS = [
    { id: "row", name: "小艇", rent: 0, depth: 1, speed: 0.16, blurb: "浅群鱼", biteD: { 1: 1.32, 2: 0.62, 3: 0.32 }, fav: { herring: 1.2, tetra: 1.15, moon: 1.1 } },
    { id: "motor", name: "快艇", rent: 120, depth: 2, speed: 0.62, blurb: "中层巡航", biteD: { 1: 0.82, 2: 1.28, 3: 0.78 }, fav: { angler: 1.15, ray: 1.22, eel: 1.18, viper: 1.12 } },
    { id: "sub", name: "潜艇", rent: 280, depth: 3, speed: 0.26, blurb: "深海巨口", biteD: { 1: 0.48, 2: 0.88, 3: 1.38 }, fav: { squid: 1.18, shark: 1.22, gulper: 1.2, leviathan: 1.35 } },
  ];
  const BAITS = [
    { id: "hook", name: "空钩", cost: 18, attract: ["herring", "tetra", "moon"], depth: 1, blurb: "浅·群鱼" },
    { id: "worm", name: "蚯蚓", cost: 45, attract: ["angler", "ray"], depth: 2, blurb: "中·鮟鱇/鳐" },
    { id: "fish", name: "小鱼", cost: 90, attract: ["eel", "viper"], depth: 2, blurb: "中·鳗/蝰" },
    { id: "shrimp", name: "虾", cost: 180, attract: ["squid", "shark", "gulper", "leviathan"], depth: 3, blurb: "深·鱿鲨" },
  ];
  const LOOT = [
    { id: "boot", name: "破靴", gold: 2, points: 4, color: "#6a4428", kind: "trash", rarity: 0, depth: 1, w: [34, 18, 10] },
    { id: "can", name: "锈罐", gold: 8, points: 6, color: "#8a8a68", kind: "trash", rarity: 0, depth: 1, w: [22, 14, 8] },
    { id: "bottle", name: "海瓶", gold: 24, points: 12, color: "#7ec8a0", kind: "trash", rarity: 0, depth: 1, w: [14, 16, 10] },
    { id: "coin", name: "歪币", gold: 60, points: 28, color: "#c9a05a", kind: "antique", rarity: 1, depth: 1, w: [10, 16, 12] },
    { id: "vase", name: "海陶", gold: 240, points: 80, color: "#c45a4a", kind: "antique", rarity: 2, depth: 2, w: [4, 14, 14] },
    { id: "idol", name: "神像残片", gold: 520, points: 160, color: "#d4b06a", kind: "antique", rarity: 3, depth: 2, w: [2, 10, 16] },
    { id: "ring", name: "金戒", gold: 360, points: 70, color: "#ffd36a", kind: "jewel", rarity: 2, depth: 1, w: [6, 12, 14] },
    { id: "chain", name: "金链", gold: 780, points: 150, color: "#ffe08a", kind: "jewel", rarity: 3, depth: 2, w: [2, 8, 14] },
    { id: "crown", name: "沉没王冠", gold: 2100, points: 480, color: "#fff3c4", kind: "jewel", rarity: 4, depth: 3, w: [1, 4, 12] },
  ];
  const FISH = [
    { id: "herring", name: "深渊鲱", rarity: 1, depth: 1, gold: 70, points: 40, color: "#7ad0ff" },
    { id: "tetra", name: "灯鱼", rarity: 1, depth: 1, gold: 90, points: 55, color: "#9cffd0" },
    { id: "moon", name: "圆月鱼", rarity: 2, depth: 1, gold: 160, points: 95, color: "#e8f0ff" },
    { id: "angler", name: "灯笼鮟鱇", rarity: 2, depth: 2, gold: 260, points: 160, color: "#b6ff64" },
    { id: "ray", name: "影鳐", rarity: 2, depth: 2, gold: 320, points: 190, color: "#6a8cff" },
    { id: "eel", name: "暗鳗", rarity: 3, depth: 2, gold: 480, points: 320, color: "#5cffd2" },
    { id: "viper", name: "蝰鱼", rarity: 3, depth: 2, gold: 540, points: 360, color: "#ff8ad4" },
    { id: "squid", name: "巨鱿", rarity: 4, depth: 3, gold: 900, points: 520, color: "#c9a0ff" },
    { id: "shark", name: "灯鲨", rarity: 4, depth: 3, gold: 1100, points: 620, color: "#8ab4ff" },
    { id: "gulper", name: "巨口鱼", rarity: 4, depth: 3, gold: 1600, points: 780, color: "#ff9a6a" },
    { id: "leviathan", name: "利维坦", rarity: 5, depth: 3, gold: 5000, points: 2200, color: "#ffd36a" },
  ];
  const KIND_DEPTH = {
    herring: 1, tetra: 1, moon: 1,
    angler: 2, ray: 2, eel: 2, viper: 2,
    squid: 3, shark: 3, gulper: 3, leviathan: 3,
  };
  const BETS = [
    { amt: 50, win: 1.15 },
    { amt: 100, win: 1.45 },
    { amt: 200, win: 1.9 },
    { amt: 400, win: 2.5 },
    { amt: 800, win: 3.4 },
  ];
  const WORLD = 4800;
  const VIEW = 1600;
  const DEPTH_NAME = { 1: "浅", 2: "中", 3: "深" };
  const GOAL_POINTS = 1800;
  const SKIP_PAY = 0.7;
  const SLIP_WORDS = ["差一点！", "线松了", "它还在附近", "钩滑了", "再来一竿"];
  const WEATHERS = [
    { id: "clear", name: "晴", bite: 1.08, fav: { herring: 1.15, tetra: 1.12, moon: 1.1 } },
    { id: "overcast", name: "阴", bite: 1.0, fav: { moon: 1.12, angler: 1.08 } },
    { id: "wind", name: "疾风", bite: 0.82, fav: { ray: 1.25, shark: 1.18, moon: 0.75 } },
    { id: "rain", name: "雨", bite: 1.18, fav: { eel: 1.28, viper: 1.22, herring: 1.1 } },
    { id: "heat", name: "酷热", bite: 0.68, fav: { tetra: 0.7, squid: 1.12 } },
    { id: "fog", name: "雾", bite: 0.72, fav: { angler: 1.35, gulper: 1.22, leviathan: 1.2 } },
  ];
  const OMENS = {
    frog: { id: "frog", name: "青蛙雨", bite: 2.2, sure: true, school: 10, big: 1.55, dur: 14, fav: { moon: 1.2, eel: 1.25, ray: 1.2, shark: 1.3, gulper: 1.25, leviathan: 1.15 } },
    glow: { id: "glow", name: "磷光海", bite: 1.4, lureDeep: true, dur: 12, fav: { angler: 1.3, squid: 1.25, shark: 1.2, gulper: 1.25, leviathan: 1.35 } },
    gold: { id: "gold", name: "金潮", bite: 0.95, lootBoost: true, dur: 12, fav: {} },
  };
  const WX_LOOK = {
    clear: {
      sky: ["#152038", "#3a5168", "#8a9aaa"], hill: "#0a1018",
      water: ["#3aa8c4", "#0d5a72", "#083044", "#021018"],
      wave: "#c8f4ff", waveA: 0.22, chop: 3, rain: 0, fog: 0, wind: 0.15, heat: 0, glow: 0, gold: 0, frog: 0, flash: 0, stars: 1, sun: 0,
    },
    overcast: {
      sky: ["#14181e", "#2a323c", "#4a5660"], hill: "#0c1214",
      water: ["#3a6a78", "#1a3a48", "#0c2430", "#02080e"],
      wave: "#9eb8c0", waveA: 0.12, chop: 4, rain: 0, fog: 0.12, wind: 0.25, heat: 0, glow: 0, gold: 0, frog: 0, flash: 0, stars: 0, sun: 0,
    },
    wind: {
      sky: ["#1a2838", "#3a6080", "#6a88a0"], hill: "#0a141c",
      water: ["#4ab0d0", "#1a6080", "#0a3048", "#020c14"],
      wave: "#e8ffff", waveA: 0.38, chop: 9, rain: 0, fog: 0, wind: 1, heat: 0, glow: 0, gold: 0, frog: 0, flash: 0, stars: 0.4, sun: 0,
    },
    rain: {
      sky: ["#0a0c12", "#161820", "#2a3040"], hill: "#05080c",
      water: ["#1a4a5c", "#0a3040", "#061820", "#010408"],
      wave: "#8ab0c0", waveA: 0.16, chop: 7, rain: 1, fog: 0.08, wind: 0.45, heat: 0, glow: 0, gold: 0, frog: 0, flash: 1, stars: 0, sun: 0,
    },
    heat: {
      sky: ["#2a1408", "#8a3a10", "#e8a050"], hill: "#1a0c08",
      water: ["#c87840", "#5a3818", "#1a180c", "#080604"],
      wave: "#ffd090", waveA: 0.1, chop: 2, rain: 0, fog: 0, wind: 0, heat: 1, glow: 0, gold: 0, frog: 0, flash: 0, stars: 0, sun: 1,
    },
    fog: {
      sky: ["#2a343c", "#5a646c", "#8a949c"], hill: "#2a383c",
      water: ["#6a8a94", "#3a545c", "#1a3038", "#0c1418"],
      wave: "#d0e0e4", waveA: 0.08, chop: 2, rain: 0, fog: 1, wind: 0, heat: 0, glow: 0, gold: 0, frog: 0, flash: 0, stars: 0, sun: 0,
    },
    frog: {
      sky: ["#0c1808", "#1a3a14", "#3a6a28"], hill: "#081208",
      water: ["#2a8a48", "#145030", "#0a2818", "#040c06"],
      wave: "#b6ff8a", waveA: 0.2, chop: 5, rain: 0.6, fog: 0.1, wind: 0.2, heat: 0, glow: 0, gold: 0, frog: 1, flash: 0, stars: 0, sun: 0,
    },
    glow: {
      sky: ["#020810", "#042028", "#0a4a48"], hill: "#021014",
      water: ["#1affc8", "#0a5a68", "#042030", "#01080c"],
      wave: "#7dfff2", waveA: 0.18, chop: 3, rain: 0, fog: 0.06, wind: 0, heat: 0, glow: 1, gold: 0, frog: 0, flash: 0, stars: 0.6, sun: 0,
    },
    gold: {
      sky: ["#1a1004", "#5a3008", "#c48820"], hill: "#140c04",
      water: ["#d4a040", "#6a4810", "#2a2408", "#0c0a04"],
      wave: "#ffe08a", waveA: 0.16, chop: 3, rain: 0, fog: 0.05, wind: 0, heat: 0, glow: 0.2, gold: 1, frog: 0, flash: 0, stars: 0.3, sun: 0.4,
    },
  };
  const WX_ITEMS = [
    { id: "frog", name: "蛙雨瓶", wx: "frog", gems: 1, gold: 0, blurb: "大鱼群·必咬" },
    { id: "glow", name: "磷光芯", wx: "glow", gems: 0, gold: 220, blurb: "深鱼上浮" },
    { id: "gold", name: "金潮符", wx: "gold", gems: 0, gold: 160, blurb: "沉物变多" },
    { id: "clear", name: "晴空符", wx: "clear", gems: 0, gold: 80, blurb: "立刻转晴" },
  ];
  const TIDES = [
    { id: "low", name: "低潮", d: { 1: 1.22, 2: 0.82, 3: 0.62 } },
    { id: "mid", name: "平潮", d: { 1: 1, 2: 1, 3: 1 } },
    { id: "high", name: "高潮", d: { 1: 0.78, 2: 1.12, 3: 1.28 } },
  ];
  const CATALOG_N = FISH.length + LOOT.length;
  const MARKS = [
    { x: 500, label: "藻" },
    { x: 1180, label: "拱" },
    { x: 2460, label: "沉船" },
    { x: 3400, label: "珊瑚" },
    { x: 4100, label: "泉" },
    { x: 4520, label: "洞" },
  ];
  const SESSION = {
    gold: 4500,
    gems: 4,
    points: 0,
    timeLeft: 120,
    bait: "hook",
  };
  const META_KEY = "abyss-meta-v1";
  const JACKS = [
    { id: "mini", seed: 12840, idle: 16, rate: 0.045, odds: 0.03, name: "MINI 小奖", fx: 12 },
    { id: "minor", seed: 86200, idle: 58, rate: 0.07, odds: 0.01, name: "MINOR 中奖", fx: 60 },
    { id: "major", seed: 428600, idle: 190, rate: 0.1, odds: 0.0035, name: "MAJOR 大奖", fx: 220 },
    { id: "grand", seed: 1864200, idle: 920, rate: 0.15, odds: 0.001, name: "GRAND 巨奖", fx: 1200 },
  ];
  const JP_SEED = Object.fromEntries(JACKS.map((j) => [j.id, j.seed]));
  const CHEST = { chest4: { ms: 4 * 3600 * 1000, gold: 90, gems: 0, bait: 2, msg: "4 小时箱：金币和免费饵" }, chest8: { ms: 8 * 3600 * 1000, gold: 220, gems: 1, bait: 3, msg: "8 小时箱：金、宝石、免费饵" } };
  const CHECK_REW = [
    { gold: 80, bait: 0, gems: 0 },
    { gold: 0, bait: 2, gems: 1 },
    { gold: 160, bait: 0, gems: 0 },
    { gold: 0, bait: 0, gems: 2 },
    { gold: 280, bait: 2, gems: 0 },
    { gold: 120, bait: 0, gems: 2 },
    { gold: 600, bait: 3, gems: 1 },
  ];
  const QUESTS = [
    { id: "eel", need: 30, xp: 25, gold: 180, label: "今日钓起 30 条电鳗（暗鳗）" },
    { id: "master", need: 3, xp: 18, gold: 120, label: "单局使用 3 次金竿（机械钩）" },
    { id: "casts", need: 15, xp: 12, gold: 80, label: "今日下钩 15 次" },
    { id: "big", need: 1, xp: 20, gold: 150, label: "今日打出一次 10x 派彩" },
  ];
  const BP = [
    { xp: 0, gold: 60, label: "饵金" },
    { xp: 20, gem: 1, label: "宝石" },
    { xp: 45, gold: 140, skin: "cyan", label: "磷光线" },
    { xp: 80, gold: 200, label: "200金" },
    { xp: 130, gem: 1, skin: "gold", label: "金钩皮" },
    { xp: 190, gold: 360, label: "360金" },
    { xp: 260, gem: 2, label: "2宝石" },
    { xp: 340, gold: 520, label: "500金" },
  ];
  const SHARE_X = 500;
  const TOURNEY_MS = 8 * 60 * 1000;
  const TOURNEY_PRIZE = [5000, 1800, 700];
  const TICKER_NAMES = ["玩家***8", "阿***龙", "深***9", "V***88", "海***K", "金***7", "夜***钩", "湾***3"];
  const TICKER_FISH = ["远古巨鲨", "利维坦", "巨口鱼", "灯鲨", "巨鱿", "灯笼鮟鱇"];
  const TICKER_ROD = ["黄金鱼竿", "金竿", "快竿", "稳竿"];
  const TOURNEY_BOTS = [
    { id: "b0", name: "龙***7" },
    { id: "b1", name: "海***K" },
    { id: "b2", name: "夜***9" },
    { id: "b3", name: "湾***3" },
    { id: "b4", name: "金***钩" },
    { id: "b5", name: "雾***8" },
    { id: "b6", name: "潮***V" },
    { id: "b7", name: "渊***1" },
  ];

  function freshState() {
    return {
      points: SESSION.points,
      gold: SESSION.gold,
      gems: SESSION.gems,
      timeLeft: SESSION.timeLeft,
      betIndex: 1,
      rod: "basic",
      boat: "row",
      bait: SESSION.bait,
      multi: 1,
      wx: 0,
      tide: 1,
      wxT: 0,
      tideT: 0,
      omenId: null,
      omenT: 0,
      wxFrom: "clear",
      wxSeen: "clear",
      wxBlend: 1,
      wxFlash: 0,
      paused: false,
      ended: false,
      fishing: false,
      sessionGold: 0,
      sessionCatch: 0,
      combo: 0,
      luckyHook: false,
      sonar: 0,
      sonarPow: 0,
      critArmed: false,
      critSpent: false,
      bonus: null,
      skipCut: false,
      slipBoost: 0,
      castBoost: 0,
      lines: [],
      helpOpen: false,
      seen: {},
      lootCounts: { trash: 0, antique: 0, jewel: 0 },
      bestCatch: null,
      gotRare: false,
      hookY: 0,
      hookTarget: 0,
      bite: null,
      biteCreature: null,
      phase: "idle",
      phaseT: 0,
      waitFor: 0,
      fightResult: null,
      boatX: 720,
      camX: 144,
      camY: 0,
      steerTarget: null,
      wake: 0,
      boatFacing: 1,
      swapFlash: 0,
      dirtyHud: true,
      sessionMaster: 0,
      modal: null,
    };
  }

  const state = freshState();
  let sawHelp = false;
  const jpShow = { mini: JP_SEED.mini, minor: JP_SEED.minor, major: JP_SEED.major, grand: JP_SEED.grand };

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function yesterdayKey() {
    const d = new Date(Date.now() - 86400000);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function defaultMeta() {
    return {
      jp: { ...JP_SEED },
      day: todayKey(),
      checkDay: "",
      streak: 0,
      chest4: 0,
      chest8: 0,
      freeBait: 0,
      q: { eel: 0, casts: 0, big: 0 },
      claimed: {},
      bpXp: 0,
      bpGot: {},
      skin: "",
      tourneySlot: -1,
      tourneyStake: 0,
      tourneyMult: 0,
      tourneyClaimed: false,
    };
  }
  function loadMeta() {
    try {
      const raw = JSON.parse(localStorage.getItem(META_KEY) || "null");
      const base = defaultMeta();
      if (!raw || typeof raw !== "object") return base;
      return {
        ...base,
        ...raw,
        jp: { ...JP_SEED, ...(raw.jp || {}) },
        q: { eel: 0, casts: 0, big: 0, ...(raw.q || {}) },
        claimed: { ...(raw.claimed || {}) },
        bpGot: { ...(raw.bpGot || {}) },
      };
    } catch (_) {
      return defaultMeta();
    }
  }
  const meta = loadMeta();
  jpShow.mini = meta.jp.mini;
  jpShow.minor = meta.jp.minor;
  jpShow.major = meta.jp.major;
  jpShow.grand = meta.jp.grand;
  let saveMetaAt = 0;
  function saveMeta() {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch (_) {}
  }
  function rollDay() {
    const day = todayKey();
    if (meta.day !== day) {
      meta.day = day;
      meta.q = { eel: 0, casts: 0, big: 0 };
      meta.claimed = {};
      saveMeta();
    }
  }
  rollDay();
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const modalOn = (id) => state.modal === id;
  function setModal(id) {
    state.modal = id;
    state.paused = !!id;
    ["hub", "rank", "share"].forEach((m) => $(`${m}-mask`).classList.toggle("hidden", id !== m));
    $("pause-mask").classList.add("hidden");
    if (id === "hub") renderHub();
    if (id === "rank") renderRank();
  }
  function closeModal() {
    setModal(null);
  }
  function openPanel(id, busyMsg) {
    if (state.fishing && !state.ended) {
      toast(busyMsg);
      return;
    }
    if (state.helpOpen || state.ended) return;
    if (id === "hub") rollDay();
    setModal(id);
  }
  function questVal(id) {
    return id === "master" ? state.sessionMaster : (meta.q[id] || 0);
  }
  function canCheckin() {
    return meta.checkDay !== todayKey();
  }
  function chestReady(id) {
    return Date.now() >= (meta[id] || 0);
  }
  function waitText(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const h = (s / 3600) | 0;
    const m = ((s % 3600) / 60) | 0;
    const sec = s % 60;
    return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  }
  function hubClaimable() {
    return canCheckin() || chestReady("chest4") || chestReady("chest8")
      || QUESTS.some((q) => questVal(q.id) >= q.need && !meta.claimed[q.id])
      || BP.some((t, i) => meta.bpXp >= t.xp && !meta.bpGot[i]);
  }
  function afterClaim(msg) {
    if (msg) toast(msg);
    saveMeta();
    if (modalOn("hub")) renderHub();
    renderHud();
  }
  function addBp(n) {
    meta.bpXp += n;
  }
  function feedJackpot(stake) {
    const n = Math.max(0, stake);
    JACKS.forEach((j) => { meta.jp[j.id] += n * j.rate; });
  }
  function tickJackpots(dt) {
    JACKS.forEach((j) => {
      meta.jp[j.id] += j.idle * dt;
      jpShow[j.id] += (meta.jp[j.id] - jpShow[j.id]) * Math.min(1, dt * 6);
      const el = $("jp-" + j.id);
      if (!el) return;
      const txt = fmt(jpShow[j.id]);
      if (el._v !== txt) {
        el._v = txt;
        el.textContent = txt;
      }
    });
  }
  function hitJackpot(j) {
    const prize = Math.floor(meta.jp[j.id]);
    meta.jp[j.id] = j.seed * (0.28 + Math.random() * 0.2);
    jpShow[j.id] = meta.jp[j.id];
    state.gold += prize;
    state.sessionGold += prize;
    saveMeta();
    toast(`${j.name} +${fmt(prize)}`);
    pushLive(maskYou(), rodOf().name, j.name, prize);
    flashWin(Math.max(betOf().amt * j.fx, prize * 0.01));
    maybeShare(prize, j.name);
    const box = $("jackpots");
    if (box) {
      box.classList.remove("hit");
      void box.offsetWidth;
      box.classList.add("hit");
    }
    state.dirtyHud = true;
  }
  function rollJackpot() {
    const luck = 0.7 + Math.min(1, betOf().amt / 800) * 0.45;
    for (let i = JACKS.length - 1; i >= 0; i--) {
      const j = JACKS[i];
      if (Math.random() < j.odds * luck) {
        hitJackpot(j);
        return;
      }
    }
  }
  function bumpQuest(id, n) {
    rollDay();
    if (id === "master") state.sessionMaster += n;
    else meta.q[id] = (meta.q[id] || 0) + n;
    saveMeta();
    if (modalOn("hub")) renderHub();
    syncHubBtn();
  }
  function grant(gold, gems, bait) {
    if (gold) {
      state.gold += gold;
      state.sessionGold += gold;
    }
    if (gems) state.gems += gems;
    if (bait) meta.freeBait += bait;
    state.dirtyHud = true;
  }
  function claimCheckin() {
    if (!canCheckin()) return toast("今天已经签过了");
    const yest = yesterdayKey();
    meta.streak = meta.checkDay === yest ? Math.min(7, meta.streak + 1) : 1;
    meta.checkDay = todayKey();
    const rew = CHECK_REW[meta.streak - 1] || CHECK_REW[0];
    grant(rew.gold, rew.gems, rew.bait);
    addBp(8);
    afterClaim(`签到第 ${meta.streak} 天`);
  }
  function claimChest(id) {
    const spec = CHEST[id];
    if (!spec || !chestReady(id)) return toast("还在冷却");
    meta[id] = Date.now() + spec.ms;
    grant(spec.gold, spec.gems, spec.bait);
    addBp(6);
    afterClaim(spec.msg);
  }
  function claimQuest(id) {
    const q = QUESTS.find((x) => x.id === id);
    if (!q || meta.claimed[id] || questVal(id) < q.need) return;
    meta.claimed[id] = true;
    grant(q.gold, 0, 0);
    addBp(q.xp);
    afterClaim(`任务完成 · 通行证 +${q.xp}`);
  }
  function claimBp(i) {
    const t = BP[i];
    if (!t || meta.bpGot[i] || meta.bpXp < t.xp) return;
    meta.bpGot[i] = true;
    grant(t.gold || 0, t.gem || 0, 0);
    if (t.skin) meta.skin = t.skin;
    afterClaim(`通行证：${t.label}`);
  }
  function renderHub() {
    const row = $("check-row");
    if (!row) return;
    row.innerHTML = CHECK_REW.map((r, i) => {
      const day = i + 1;
      const on = meta.streak >= day && meta.checkDay === todayKey() ? "on" : "";
      const now = canCheckin() && (meta.checkDay === yesterdayKey() ? meta.streak + 1 : 1) === day ? "now" : "";
      return `<div class="check-day ${on} ${now}">${day}<br>${r.gold ? r.gold + "金" : r.gems ? r.gems + "钻" : "饵"}</div>`;
    }).join("");
    $("btn-checkin").disabled = !canCheckin() || state.ended;
    Object.keys(CHEST).forEach((id) => {
      const ready = chestReady(id);
      $(`btn-${id}`).disabled = !ready;
      $(`${id}-txt`).textContent = ready ? "可领" : waitText((meta[id] || 0) - Date.now());
    });
    $("quest-list").innerHTML = QUESTS.map((q) => {
      const v = Math.min(q.need, questVal(q.id));
      const done = meta.claimed[q.id];
      const ready = !done && v >= q.need;
      return `<div class="quest-item"><span>${q.label}<br>${v}/${q.need}</span><button data-q="${q.id}" ${done || !ready ? "disabled" : ""}>${done ? "已领" : ready ? "领取" : "进行中"}</button></div>`;
    }).join("");
    const next = BP.find((t) => meta.bpXp < t.xp) || BP[BP.length - 1];
    const prevXp = [...BP].reverse().find((t) => meta.bpXp >= t.xp)?.xp || 0;
    const span = Math.max(1, next.xp - prevXp);
    $("bp-lv").textContent = `${Math.max(1, BP.filter((t) => meta.bpXp >= t.xp).length)} 级`;
    $("bp-xp").textContent = `${meta.bpXp} XP`;
    const fill = $("bp-fill");
    if (fill) fill.style.width = `${Math.min(100, ((meta.bpXp - prevXp) / span) * 100)}%`;
    $("bp-tiers").innerHTML = BP.map((t, i) => {
      const got = meta.bpGot[i];
      const ready = !got && meta.bpXp >= t.xp;
      return `<button class="bp-tier ${got ? "got" : ready ? "ready" : ""}" data-bp="${i}" type="button">${i + 1} ${t.label}</button>`;
    }).join("");
    syncHubBtn();
  }
  function syncHubBtn() {
    const btn = $("btn-hub");
    if (btn) btn.classList.toggle("pulse", hubClaimable());
  }

  let tickerLines = [];
  let tickerAcc = 0;
  let lastShare = null;
  const maskYou = () => "你***渊";
  function liveLine(who, rod, fish, gold) {
    return `${who} · ${fish} +${fmt(gold)}`;
  }
  function fakeLive() {
    const gold = 1800 + ((Math.random() * 42000) | 0);
    return { text: liveLine(pick(TICKER_NAMES), pick(TICKER_ROD), pick(TICKER_FISH), gold), hot: gold > 12000 };
  }
  function renderTicker() {
    const track = $("ticker-track");
    if (!track) return;
    const bits = tickerLines.map((t) => `<span class="${t.hot ? "hot" : ""}">${t.text}</span>`).join("");
    track.innerHTML = bits + bits;
  }
  function pushLive(who, rod, fish, gold) {
    tickerLines = [{ text: liveLine(who, rod, fish, gold), hot: gold >= 8000 }, ...tickerLines].slice(0, 10);
    renderTicker();
  }
  function seedTicker() {
    tickerLines = Array.from({ length: 8 }, fakeLive);
    renderTicker();
  }
  function tickLive(dt) {
    tickerAcc += dt;
    if (tickerAcc < 3.2) return;
    tickerAcc = 0;
    tickerLines = tickerLines.concat(fakeLive()).slice(-10);
    renderTicker();
  }
  const tourneySlot = () => Math.floor(Date.now() / TOURNEY_MS);
  const tourneyLeft = () => TOURNEY_MS - (Date.now() % TOURNEY_MS);
  function botStake(slot, i, t) {
    return Math.floor(6200 + i * 2800 + ((slot * 19 + i * 73) % 9000) + (t || 0) * (28 + i * 9));
  }
  function rankBoard() {
    ensureTourney();
    const slot = meta.tourneySlot;
    const t = (Date.now() % TOURNEY_MS) / 1000;
    const rows = TOURNEY_BOTS.map((b, i) => ({ name: b.name, stake: botStake(slot, i, t), mult: 18 + ((slot * 5 + i * 17) % 220), you: false }));
    rows.push({ name: maskYou(), stake: meta.tourneyStake || 0, mult: Math.round(meta.tourneyMult || 0), you: true });
    rows.sort((a, b) => b.stake - a.stake || b.mult - a.mult);
    return rows;
  }
  function ensureTourney() {
    const slot = tourneySlot();
    if (meta.tourneySlot === slot) return;
    if (meta.tourneySlot >= 0 && !meta.tourneyClaimed) {
      const old = meta.tourneyStake || 0;
      const place = TOURNEY_BOTS.filter((_, i) => botStake(meta.tourneySlot, i, 480) > old).length + 1;
      if (old > 0 && place <= 3) {
        grant(TOURNEY_PRIZE[place - 1], place === 1 ? 2 : 0, 0);
        toast(`上轮捕鱼王第${place}名 +${fmt(TOURNEY_PRIZE[place - 1])}`);
      }
    }
    meta.tourneySlot = slot;
    meta.tourneyStake = 0;
    meta.tourneyMult = 0;
    meta.tourneyClaimed = false;
    saveMeta();
  }
  function addTourneyStake(n) {
    ensureTourney();
    meta.tourneyStake = (meta.tourneyStake || 0) + Math.max(0, n);
    saveMeta();
    if (modalOn("rank")) renderRank();
  }
  function noteTourneyMult(x) {
    if (x > (meta.tourneyMult || 0)) {
      meta.tourneyMult = x;
      saveMeta();
    }
  }
  function renderRank() {
    const list = $("rank-list");
    if (!list) return;
    const rows = rankBoard();
    const you = rows.find((r) => r.you);
    const pool = 22000 + Math.floor(rows.reduce((s, r) => s + r.stake, 0) * 0.012);
    $("rank-left").textContent = waitText(tourneyLeft());
    $("rank-pool").textContent = fmt(pool);
    $("rank-you").textContent = fmt(you ? you.stake : 0);
    $("rank-mult").textContent = `${Math.round((you && you.mult) || 0)}x`;
    list.innerHTML = rows.map((r, i) => `<div class="rank-row ${r.you ? "you" : ""}"><span>${i + 1}</span><span>${r.name}${r.you ? "（你）" : ""}</span><b>${fmt(r.stake)}</b><span>${Math.round(r.mult)}x</span></div>`).join("");
  }
  function shareText(info) {
    return `我在 Deep Abyss 用${info.rod || "鱼竿"}捕获${info.fish || "深海巨物"}，打出 ${Math.round(info.x)}x，赢了 ${fmt(info.gold)} 筹码！`;
  }
  function paintShare(info) {
    const art = $("share-art");
    if (!art) return;
    const g = art.getContext("2d");
    g.fillStyle = "#041018";
    g.fillRect(0, 0, 640, 360);
    try {
      const sea = $("sea");
      if (sea && sea.width) g.drawImage(sea, 0, 0, 640, 360);
    } catch (_) {}
    g.fillStyle = "rgba(4, 10, 18, 0.48)";
    g.fillRect(0, 0, 640, 360);
    g.save();
    g.translate(320, 180);
    g.rotate(-0.32);
    g.fillStyle = "rgba(255, 230, 180, 0.12)";
    g.font = "700 42px Palatino, serif";
    g.textAlign = "center";
    g.fillText("DEEP ABYSS", 0, 0);
    g.restore();
    g.fillStyle = "#ffe08a";
    g.font = "700 22px Palatino, serif";
    g.fillText("DEEP ABYSS  ·  深海挑战", 28, 42);
    g.fillStyle = "#fff";
    g.font = "700 54px Palatino, serif";
    g.fillText(`${Math.round(info.x)}x`, 28, 118);
    g.fillStyle = "#7dfff2";
    g.font = "18px Palatino, serif";
    g.fillText(`${info.fish || "深海巨物"}  ·  ${info.rod || rodOf().name}`, 28, 158);
    g.fillStyle = "#ffd36a";
    g.font = "700 28px Palatino, serif";
    g.fillText(`+${fmt(info.gold)} 筹码`, 28, 210);
    g.fillStyle = "rgba(255,255,255,0.55)";
    g.font = "14px Palatino, serif";
    g.fillText("高光回放  ·  非官方宣传  ·  深渊还在涨", 28, 330);
  }
  function wireShareLinks(info) {
    const text = shareText(info);
    const url = location.href.split("#")[0];
    $("share-tg").href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    $("share-wa").href = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`;
    $("share-caption").textContent = `${Math.round(info.x)}x  ·  ${fmt(info.gold)} 筹码`;
    lastShare = { ...info, text, url };
  }
  function showShareCard(info) {
    paintShare(info);
    wireShareLinks(info);
    setModal("share");
  }
  function maybeShare(gold, fishName) {
    const x = gold / Math.max(1, betOf().amt);
    noteTourneyMult(x);
    if (x >= SHARE_X) showShareCard({ gold, x, fish: fishName, rod: rodOf().name });
  }

  const canvas = $("sea");
  const ctx = canvas.getContext("2d", { alpha: true });
  let W = 0;
  let H = 0;
  let lastTick = performance.now();
  const creatures = [];
  const particles = [];
  const keys = { left: false, right: false };

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
  const weatherOf = () => (state.omenId && state.omenT > 0 && OMENS[state.omenId]) || WEATHERS[state.wx] || WEATHERS[0];
  function hexLerp(a, b, t) {
    const n = (h) => parseInt(h.replace("#", ""), 16);
    const pa = n(a);
    const pb = n(b);
    const m = (s) => Math.round((((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t));
    return `#${((m(16) << 16) | (m(8) << 8) | m(0)).toString(16).padStart(6, "0")}`;
  }
  function lookOf(id) {
    return WX_LOOK[id] || WX_LOOK.clear;
  }
  function mixedLook() {
    const t = Math.min(1, state.wxBlend == null ? 1 : state.wxBlend);
    const a = lookOf(state.wxFrom || "clear");
    const b = lookOf((weatherOf() && weatherOf().id) || "clear");
    if (t >= 0.999) return b;
    const num = (k) => a[k] + (b[k] - a[k]) * t;
    return {
      sky: [hexLerp(a.sky[0], b.sky[0], t), hexLerp(a.sky[1], b.sky[1], t), hexLerp(a.sky[2], b.sky[2], t)],
      hill: hexLerp(a.hill, b.hill, t),
      water: a.water.map((c, i) => hexLerp(c, b.water[i], t)),
      wave: hexLerp(a.wave, b.wave, t),
      waveA: num("waveA"), chop: num("chop"), rain: num("rain"), fog: num("fog"), wind: num("wind"),
      heat: num("heat"), glow: num("glow"), gold: num("gold"), frog: num("frog"), flash: num("flash"),
      stars: num("stars"), sun: num("sun"),
    };
  }
  function syncWeatherLook() {
    const id = weatherOf().id;
    if (id !== state.wxSeen) {
      state.wxFrom = state.wxSeen || "clear";
      state.wxSeen = id;
      state.wxBlend = 0;
    }
    const stage = $("stage");
    if (stage) stage.dataset.wx = id;
  }
  const tideOf = () => TIDES[state.tide] || TIDES[1];
  function bonusOn() {
    return !!(state.bonus && state.bonus.left > 0);
  }
  function featureCost(kind) {
    return betOf().amt * (kind === "frenzy" ? 100 : 50);
  }
  function lineCount() {
    if (bonusOn() && state.bonus.kind === "frenzy") return 5;
    return state.multi === 3 ? 3 : 1;
  }
  function biteDepthCap() {
    const boat = boatOf().depth;
    return weatherOf().lureDeep ? Math.min(3, boat + 1) : boat;
  }
  function biteChance(kind) {
    const fish = fishOf(kind);
    if (!fish) return 0;
    if (fish.depth > biteDepthCap()) return 0;
    const match = baitWants(kind) ? 1 : 0.16;
    const boatD = boatOf().biteD[fish.depth] || 0.5;
    const boatF = (boatOf().fav && boatOf().fav[kind]) || 1;
    const rodR = rodOf().biteR[fish.rarity] || 1;
    const wx = weatherOf();
    const wxF = wx.bite * (wx.fav[kind] || 1);
    const tide = tideOf().d[fish.depth] || 1;
    const luck = 1 + (state.fishing ? state.castBoost : state.slipBoost || 0);
    if (wx.sure || bonusOn()) return Math.min(1, 0.92 * match + 0.35);
    return Math.max(0.01, Math.min(0.5, 0.1 * match * boatD * boatF * rodR * wxF * tide * luck));
  }
  function biteMul() {
    const fish = typicalFish();
    if (!fish) return 0.4;
    return biteChance(fish.id) / 0.1;
  }
  function slipChance(fish) {
    const rare = fish && !fish.loot ? fish.rarity : 1;
    const id = weatherOf().id;
    const wx = id === "wind" || id === "fog" || id === "heat" ? 1.15 : id === "frog" ? 0.7 : 1;
    return Math.max(0.06, (0.18 + rare * 0.035 - (rodOf().reel - 1) * 0.08) * wx);
  }
  function wxLine() {
    const wx = weatherOf();
    const left = state.omenT > 0 ? ` ${Math.ceil(state.omenT)}秒` : "";
    return `${wx.name}${left} · ${tideOf().name}`;
  }
  function biteHudText() {
    const wx = weatherOf();
    const luck = state.fishing ? state.castBoost : state.slipBoost;
    if (bonusOn()) {
      const name = state.bonus.kind === "kraken" ? "海怪袭击" : "狂暴多钩";
      return `${name} · 高爆奖励关`;
    }
    if (wx.sure) return `必定咬钩 · ${wxLine()}${luck ? ` · 运+${Math.round(luck * 100)}%` : ""}`;
    const fish = typicalFish();
    const p = fish ? Math.round(biteChance(fish.id) * 100) : 0;
    return `对口约 ${p}% · ${wxLine()}${luck ? ` · 运+${Math.round(luck * 100)}%` : ""}`;
  }
  function makeLine(i, n) {
    const ox = (i - (n - 1) / 2) * 22;
    return {
      ox,
      hookY: 18,
      hookTarget: 0,
      phase: "drop",
      phaseT: 0,
      waitFor: bonusOn() ? 0.42 : (2.4 + Math.random() * 0.8) * rodOf().wait,
      bite: null,
      biteCreature: null,
      fightResult: null,
      checkT: 0,
      done: false,
      outcome: null,
      nearMiss: false,
      nearTried: false,
    };
  }
  function hookedCreatureOf(c) {
    return state.lines.find((l) => l.biteCreature === c && (l.phase === "approach" || l.phase === "fight" || (l.phase === "reel" && l.fightResult === "success")));
  }
  function anyLinePhase(...names) {
    return state.lines.some((l) => names.includes(l.phase));
  }
  function deepestHookY() {
    let y = 0;
    for (const l of state.lines) {
      if (!l.done) y = Math.max(y, l.hookY);
    }
    return y;
  }
  function castCost() {
    const n = Math.max(1, lineCount());
    const bait = meta.freeBait > 0 ? 0 : baitOf().cost * n;
    return bait + betOf().amt * n + gearRent();
  }
  function rentLabel(n) {
    return n <= 0 ? "FREE" : `租 ${fmt(n)}`;
  }
  function typicalFish() {
    const boat = boatOf();
    const bait = baitOf();
    if (bait.depth > boat.depth) return null;
    const id = bait.attract.find((k) => k !== "leviathan" && (KIND_DEPTH[k] || 1) <= biteDepthCap() && fishOf(k));
    return id ? fishOf(id) : null;
  }
  function hitEstimate() {
    const fish = typicalFish();
    if (!fish) return 0;
    const bet = betOf();
    return fish.gold + Math.round(bet.amt * bet.win * (0.65 + fish.rarity * 0.22));
  }
  function baitReady() {
    return baitOf().depth <= boatOf().depth;
  }
  function goalLine() {
    const rare = state.gotRare ? "✓" : "○";
    const pts = `${Math.min(state.points, GOAL_POINTS)}/${GOAL_POINTS}`;
    return `本局：稀有鱼 ${rare}  ·  ${pts} 分`;
  }
  function goalBonus() {
    const pts = state.points >= GOAL_POINTS;
    if (state.gotRare && pts) return 1800;
    if (state.gotRare || pts) return 700;
    return 0;
  }
  function oddsText() {
    const spend = castCost();
    if (!baitReady()) {
      return `船太浅，饵够不到${DEPTH_NAME[baitOf().depth]}层`;
    }
    const n = lineCount();
    if (bonusOn()) {
      const name = state.bonus.kind === "kraken" ? "海怪袭击" : "狂暴多钩";
      return `${name}已预付 · ${n}线直进奖励关`;
    }
    if (weatherOf().sure) {
      return `${n > 1 ? `${n}线 · ` : ""}${weatherOf().name}：必定咬钩 · 空钩亏 ${fmt(spend)}`;
    }
    const fish = typicalFish();
    const p = fish ? Math.round(biteChance(fish.id) * 100) : 0;
    return `${n > 1 ? `${n}线 · ` : ""}空钩亏 ${fmt(spend)} · ${fish ? fish.name : "对口"} ${p}% · 约 +${fmt(hitEstimate() * n)}`;
  }
  function renderCost() {
    const n = lineCount();
    const bait = baitOf().cost;
    const rent = gearRent();
    const bet = betOf().amt;
    const total = castCost();
    $("bet-amt").textContent = fmt(bet);
    $("cast-total").textContent = n > 1 ? `${n}线 ${fmt(total)}` : `本竿 ${fmt(total)}`;
    $("cast-parts").textContent = `饵 ${meta.freeBait > 0 ? `赠×${meta.freeBait}` : fmt(bait)}${n > 1 && meta.freeBait <= 0 ? `×${n}` : ""} · 租 ${rent <= 0 ? "0" : fmt(rent)} · 注 ${fmt(bet)}${n > 1 ? `×${n}` : ""}`;
    $("cast-odds").textContent = oddsText();
    const k = featureCost("kraken");
    const f = featureCost("frenzy");
    const kc = $("kraken-cost");
    const fc = $("frenzy-cost");
    if (kc) kc.textContent = fmt(k);
    if (fc) fc.textContent = fmt(f);
  }

  function addSonar(n) {
    if (state.critArmed) return;
    state.sonarPow = Math.min(100, state.sonarPow + n);
    if (state.sonarPow >= 100) {
      state.critArmed = true;
      toast("声呐已满：下一竿必中暴击");
    }
    state.dirtyHud = true;
  }

  function flashWin(gold) {
    const bet = Math.max(1, betOf().amt);
    const x = gold / bet;
    let tier = 0;
    let label = "";
    if (x >= 1000) {
      tier = 4;
      label = "千倍深渊";
    } else if (x >= 200) {
      tier = 3;
      label = "史诗派彩";
    } else if (x >= 50) {
      tier = 2;
      label = "大胜";
    } else if (x >= 10) {
      tier = 1;
      label = `${Math.round(x)}x`;
    }
    if (x >= 10) bumpQuest("big", 1);
    if (!tier) return;
    const stage = $("stage");
    stage.classList.remove("shake", "shake-2", "shake-3", "shake-4");
    void stage.offsetWidth;
    stage.classList.add(tier === 1 ? "shake" : `shake-${tier}`);
    const fx = $("win-fx");
    if (fx) {
      fx.className = `win-fx t${tier}`;
      $("win-label").textContent = label;
      clearTimeout(flashWin._t);
      flashWin._t = setTimeout(() => fx.classList.add("hidden"), 900);
    }
    const cx = W * 0.5;
    const cy = H * 0.42;
    const n = 10 + tier * 12;
    for (let i = 0; i < n; i++) spawnParticle(cx + (Math.random() - 0.5) * 80, cy, i % 2 ? "#ffd36a" : "#fff3c0");
    beep(280 + tier * 140, 0.16, tier >= 3 ? "sawtooth" : "square", 0.05);
    if (tier >= 3) setTimeout(() => beep(520, 0.18, "triangle", 0.05), 90);
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
    let r = stage.getBoundingClientRect();
    if (r.width < 80 || r.height < 80) {
      const vw = window.innerWidth || 1024;
      const vh = window.innerHeight || 640;
      const w = Math.min(vw, vh * 1024 / 640);
      const h = Math.min(vh, vw * 640 / 1024);
      stage.style.width = `${w}px`;
      stage.style.height = `${h}px`;
      r = stage.getBoundingClientRect();
    }
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const w = Math.max(80, r.width);
    const h = Math.max(80, r.height);
    canvas.width = Math.floor(w * devicePixelRatio);
    canvas.height = Math.floor(h * devicePixelRatio);
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    W = w;
    H = h;
  }

  function makeCreature(kindSpec, fromLeft, inView) {
    const y0 = kindSpec.y0;
    const y1 = kindSpec.y1;
    const dir = fromLeft ? 1 : -1;
    const a = kindSpec.x0 ?? 80;
    const b = kindSpec.x1 ?? WORLD - 80;
    let x;
    if (inView) x = a + Math.random() * Math.max(40, b - a);
    else x = fromLeft ? state.camX - 90 : state.camX + VIEW + 90;
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
    { kind: "herring", n: 12, y0: 0.32, y1: 0.48, s: [20, 30], x0: 80, x1: 1900 },
    { kind: "tetra", n: 8, y0: 0.34, y1: 0.5, s: [14, 22], x0: 400, x1: 2300 },
    { kind: "moon", n: 4, y0: 0.36, y1: 0.52, s: [28, 40], x0: 700, x1: 2500 },
    { kind: "angler", n: 3, y0: 0.5, y1: 0.68, s: [40, 58], x0: 1500, x1: 3300 },
    { kind: "ray", n: 3, y0: 0.52, y1: 0.7, s: [50, 72], x0: 1700, x1: 3600 },
    { kind: "eel", n: 3, y0: 0.54, y1: 0.76, s: [90, 130], x0: 2000, x1: 3800 },
    { kind: "viper", n: 3, y0: 0.56, y1: 0.74, s: [48, 68], x0: 2200, x1: 4000 },
    { kind: "squid", n: 3, y0: 0.64, y1: 0.86, s: [70, 100], x0: 3000, x1: 4700 },
    { kind: "shark", n: 2, y0: 0.62, y1: 0.84, s: [80, 110], x0: 3200, x1: 4700 },
    { kind: "gulper", n: 2, y0: 0.68, y1: 0.88, s: [70, 96], x0: 3600, x1: 4780 },
    { kind: "jelly", n: 6, y0: 0.4, y1: 0.72, s: [22, 34], x0: 80, x1: 4700 },
  ];

  function spawnCreatures() {
    creatures.length = 0;
    for (const k of KIND_SPECS) {
      for (let i = 0; i < k.n; i++) {
        creatures.push(makeCreature(k, Math.random() < 0.5, true));
      }
    }
  }

  function clearOmenFish() {
    for (let i = creatures.length - 1; i >= 0; i--) {
      if (creatures[i].omen) creatures.splice(i, 1);
    }
  }

  function spawnOmenSchool() {
    const wx = weatherOf();
    const n = wx.school || (wx.lureDeep ? 6 : 0);
    if (!n) return;
    const cap = biteDepthCap();
    const specs = KIND_SPECS.filter((k) => k.kind !== "jelly" && (KIND_DEPTH[k.kind] || 1) <= cap)
      .sort((a, b) => b.s[1] - a.s[1]);
    if (!specs.length) return;
    for (let i = 0; i < n; i++) {
      const spec = specs[i % Math.min(4, specs.length)];
      const c = makeCreature(spec, Math.random() < 0.5, true);
      c.x = state.boatX + (Math.random() - 0.5) * 380;
      c.s *= wx.big || 1.35;
      c.omen = true;
      creatures.push(c);
    }
  }

  function toScreenX(wx) {
    return ((wx - state.camX) / VIEW) * W;
  }
  function toWorldX(sx) {
    return state.camX + (sx / W) * VIEW;
  }
  function boatDeckY(now) {
    const bob = Math.sin((now || 0) * 0.0022) * (state.boat === "sub" ? 1.6 : 3.2);
    const base = state.boat === "sub" ? 0.34 : state.boat === "motor" ? 0.182 : 0.195;
    return H * base + bob;
  }
  function boatPos(now) {
    const y = boatDeckY(now);
    return { x: toScreenX(state.boatX), y: y + (state.boat === "sub" ? 10 : 20) };
  }
  function updateCamera(dt) {
    const target = Math.max(0, Math.min(WORLD - VIEW, state.boatX - VIEW * 0.36));
    state.camX += (target - state.camX) * Math.min(1, dt * 5.5);
    let look = 0;
    if (state.fishing && state.phase !== "idle" && state.phase !== "swing") {
      look = Math.max(0, Math.min(H * 0.4, deepestHookY() * 0.62));
    }
    state.camY += (look - state.camY) * Math.min(1, dt * 4);
  }
  function updateBoat(dt) {
    if (state.paused || state.ended || state.fishing) return;
    const speed = (boatOf().speed || 0.22) * VIEW;
    let dir = 0;
    if (keys.left) dir -= 1;
    if (keys.right) dir += 1;
    if (dir !== 0) {
      state.steerTarget = null;
      state.boatFacing = dir;
    } else if (state.steerTarget != null) {
      const dx = state.steerTarget - state.boatX;
      if (Math.abs(dx) < 12) {
        state.boatX = state.steerTarget;
        state.steerTarget = null;
        return;
      }
      dir = Math.sign(dx);
    }
    if (!dir) return;
    state.boatFacing = dir;
    state.boatX = Math.max(140, Math.min(WORLD - 140, state.boatX + dir * speed * dt));
  }

  function fisherPose(now) {
    if (state.phase === "swing") {
      const t = Math.min(1, state.phaseT / 0.55);
      const wind = t < 0.42 ? t / 0.42 : 1 - (t - 0.42) / 0.58;
      return { rod: -0.12 - wind * 1.15, tug: 0 };
    }
    const fighting = anyLinePhase("fight", "approach");
    const pull = fighting ? Math.sin(now * 0.018) : 0;
    return {
      rod: fighting ? -0.55 + pull * 0.35 : -0.22,
      tug: fighting ? pull * 10 : 0,
    };
  }

  function drawSky(g, now) {
    const L = mixedLook();
    const skyH = H * 0.22;
    const grd = g.createLinearGradient(0, 0, 0, skyH);
    grd.addColorStop(0, L.sky[0]);
    grd.addColorStop(0.55, L.sky[1]);
    grd.addColorStop(1, L.sky[2]);
    g.fillStyle = grd;
    g.fillRect(0, 0, W, skyH);

    if (L.stars > 0.05) {
      g.fillStyle = `rgba(255,255,255,${0.35 * L.stars})`;
      for (let i = 0; i < 28; i++) {
        const x = (i * 97 + state.camX * 0.04) % W;
        const y = 6 + (i * 13) % (skyH * 0.55);
        g.fillRect(x, y, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
      }
    }
    if (L.sun > 0.05) {
      const sx = W * 0.78;
      const sy = skyH * 0.38;
      const rg = g.createRadialGradient(sx, sy, 4, sx, sy, 48);
      rg.addColorStop(0, `rgba(255, 230, 140, ${0.95 * L.sun})`);
      rg.addColorStop(1, "rgba(255, 140, 40, 0)");
      g.fillStyle = rg;
      g.beginPath();
      g.arc(sx, sy, 48, 0, Math.PI * 2);
      g.fill();
    } else if (L.stars > 0.3) {
      g.fillStyle = `rgba(230, 235, 245, ${0.7 * L.stars})`;
      g.beginPath();
      g.arc(W * 0.82, skyH * 0.32, 11, 0, Math.PI * 2);
      g.fill();
    }

    const par = state.camX * 0.28;
    g.fillStyle = L.hill;
    [520, 1400, 2300, 3400, 4300].forEach((wx, i) => {
      const x = toScreenX(wx) - par * 0.002 * W;
      g.beginPath();
      g.moveTo(x - 90, skyH);
      g.lineTo(x, skyH * (0.28 + (i % 3) * 0.08));
      g.lineTo(x + 70, skyH * 0.55);
      g.lineTo(x + 130, skyH);
      g.fill();
      if (i % 2 === 0) g.fillRect(x + 8, H * 0.08, 8, 18);
    });

    const cloudA = 0.18 + L.fog * 0.25 + (1 - L.sun) * 0.12;
    g.fillStyle = L.sky[2];
    g.globalAlpha = cloudA;
    for (let i = 0; i < 5; i++) {
      const x = ((now * (0.01 + L.wind * 0.04) + i * 220) % (W + 160)) - 80;
      const y = 8 + i * 7;
      g.beginPath();
      g.ellipse(x, y, 46 + i * 8, 10 + i * 2, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }

  function drawWater(g, now) {
    const L = mixedLook();
    const skyH = H * 0.22;
    const grd = g.createLinearGradient(0, skyH, 0, H);
    grd.addColorStop(0, L.water[0]);
    grd.addColorStop(0.22, L.water[1]);
    grd.addColorStop(0.55, L.water[2]);
    grd.addColorStop(1, L.water[3]);
    g.fillStyle = grd;
    g.fillRect(0, skyH - 4, W, H - skyH + 8 + (state.camY || 0) + 90);

    if (L.glow > 0.05) {
      g.save();
      g.globalAlpha = 0.12 * L.glow;
      for (let i = 0; i < 4; i++) {
        const x = W * (0.18 + i * 0.22);
        const beam = g.createLinearGradient(x, skyH, x, H);
        beam.addColorStop(0, "#7dfff2");
        beam.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = beam;
        g.fillRect(x - 18, skyH, 36, H * 0.7);
      }
      g.restore();
    }

    g.save();
    g.globalAlpha = L.waveA;
    g.strokeStyle = L.wave;
    const chop = L.chop;
    const n = L.wind > 0.5 ? 8 : 6;
    for (let i = 0; i < n; i++) {
      const y = skyH + 6 + i * (8 + L.wind * 4);
      g.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const yy = y + Math.sin((x + state.camX * (0.4 + L.wind)) * 0.02 + now * (0.002 + L.wind * 0.006) + i) * chop;
        if (x === 0) g.moveTo(x, yy);
        else g.lineTo(x, yy);
      }
      g.stroke();
    }
    g.restore();
  }

  function drawWeatherOverlay(g, now) {
    const L = mixedLook();
    const tilt = L.wind * 14;

    if (L.rain > 0.04) {
      const n = Math.floor(70 * L.rain + L.frog * 20);
      g.strokeStyle = L.frog > 0.4 ? `rgba(140,255,150,${0.28 + L.rain * 0.25})` : `rgba(180,210,255,${0.22 + L.rain * 0.3})`;
      g.lineWidth = L.frog > 0.4 ? 1.6 : 1.1;
      for (let i = 0; i < n; i++) {
        const speed = 0.55 + L.rain * 0.35;
        const x = ((now * speed + i * 47) % (W + 40)) - 20;
        const y = ((now * (0.7 + L.rain) + i * 33) % (H + 30)) - 10;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + 5 + tilt, y + 16 + L.rain * 8);
        g.stroke();
      }
    }

    if (L.frog > 0.1) {
      g.fillStyle = `rgba(70, 160, 80, ${0.55 * L.frog})`;
      for (let i = 0; i < 12; i++) {
        const x = ((now * 0.11 + i * 73) % W);
        const y = ((now * 0.16 + i * 41) % H);
        g.beginPath();
        g.ellipse(x, y, 6, 4, 0.5, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.arc(x + 7, y - 3, 2.4, 0, Math.PI * 2);
        g.fill();
      }
    }

    if (L.fog > 0.05) {
      for (let i = 0; i < 4; i++) {
        const y = H * (0.12 + i * 0.18) + Math.sin(now * 0.0008 + i) * 10;
        g.fillStyle = `rgba(200, 210, 220, ${0.08 * L.fog + i * 0.03 * L.fog})`;
        g.beginPath();
        g.ellipse(W * 0.5 + Math.sin(now * 0.0004 + i) * 40, y, W * 0.7, 28 + i * 8, 0, 0, Math.PI * 2);
        g.fill();
      }
    }

    if (L.heat > 0.1) {
      g.strokeStyle = `rgba(255, 180, 80, ${0.12 * L.heat})`;
      g.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const x = (i / 10) * W;
        g.beginPath();
        for (let y = 0; y < H * 0.45; y += 8) {
          const xx = x + Math.sin(y * 0.05 + now * 0.008 + i) * 6 * L.heat;
          if (y === 0) g.moveTo(xx, y);
          else g.lineTo(xx, y);
        }
        g.stroke();
      }
    }

    if (L.gold > 0.1) {
      g.fillStyle = `rgba(255, 210, 90, ${0.55 * L.gold})`;
      for (let i = 0; i < 22; i++) {
        const x = ((now * 0.08 + i * 51) % W);
        const y = ((now * 0.12 + i * 37) % H);
        g.beginPath();
        g.arc(x, y, 1.6 + (i % 3), 0, Math.PI * 2);
        g.fill();
      }
    }

    if (L.glow > 0.15) {
      g.fillStyle = `rgba(80, 255, 210, ${0.04 * L.glow})`;
      g.fillRect(0, 0, W, H);
      g.fillStyle = `rgba(160, 255, 230, ${0.45 * L.glow})`;
      for (let i = 0; i < 16; i++) {
        const x = ((now * 0.03 + i * 80) % W);
        const y = H * 0.25 + ((now * 0.02 + i * 17) % (H * 0.6));
        g.fillRect(x, y, 2, 2);
      }
    }

    if (state.wxFlash > 0.04) {
      g.fillStyle = `rgba(230, 240, 255, ${0.35 * state.wxFlash})`;
      g.fillRect(0, 0, W, H);
    }
  }
  function drawWorld(g) {
    const kelp = (wx, h) => {
      const x = toScreenX(wx);
      if (x < -40 || x > W + 40) return;
      g.strokeStyle = "#1a5a32";
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(x, H * 0.92);
      g.quadraticCurveTo(x + 18, H * 0.92 - h * 0.5, x + 4, H * 0.92 - h);
      g.stroke();
    };
    for (let i = 0; i < 14; i++) kelp(280 + i * 55, 70 + (i % 4) * 22);

    const archX = toScreenX(1180);
    if (archX > -120 && archX < W + 120) {
      g.strokeStyle = "#3a3a48";
      g.lineWidth = 14;
      g.beginPath();
      g.arc(archX, H * 0.78, 70, Math.PI, 0);
      g.stroke();
    }

    const wreckX = toScreenX(2460);
    if (wreckX > -220 && wreckX < W + 220) {
      g.save();
      g.translate(wreckX, H * 0.62);
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
    }

    for (let i = 0; i < 8; i++) {
      const x = toScreenX(3180 + i * 48);
      if (x < -30 || x > W + 30) continue;
      g.fillStyle = i % 2 ? "#6a3a48" : "#c45a4a";
      g.beginPath();
      g.moveTo(x, H * 0.88);
      g.lineTo(x + 10, H * 0.74 - (i % 3) * 10);
      g.lineTo(x + 20, H * 0.88);
      g.fill();
    }

    for (let i = 0; i < 5; i++) {
      const x = toScreenX(4020 + i * 70);
      if (x < -40 || x > W + 40) continue;
      g.fillStyle = "rgba(255,140,70,0.35)";
      g.beginPath();
      g.ellipse(x, H * 0.84, 16, 28, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,210,120,0.2)";
      g.beginPath();
      g.ellipse(x, H * 0.72, 10, 40, 0, 0, Math.PI * 2);
      g.fill();
    }

    const caveX = toScreenX(4520);
    if (caveX > -160 && caveX < W + 160) {
      g.fillStyle = "#02060c";
      g.beginPath();
      g.moveTo(caveX - 80, H);
      g.lineTo(caveX - 40, H * 0.62);
      g.lineTo(caveX + 90, H * 0.58);
      g.lineTo(caveX + 140, H);
      g.fill();
      g.fillStyle = "#0a1020";
      g.beginPath();
      g.ellipse(caveX + 20, H * 0.78, 40, 28, 0, 0, Math.PI * 2);
      g.fill();
    }

    for (let i = 0; i < 18; i++) {
      const wx = 160 + i * 260;
      const x = toScreenX(wx);
      if (x < -80 || x > W + 80) continue;
      g.fillStyle = i % 3 === 0 ? "#12301c" : "#1d4a28";
      g.beginPath();
      g.ellipse(x, H * (0.86 + (i % 2) * 0.04), 50 + (i % 4) * 12, 18, 0.08, 0, Math.PI * 2);
      g.fill();
    }
  }

  function rodLook() {
    const id = rodOf().id;
    if (id === "master") {
      const gold = meta.skin === "gold" || meta.skin === "cyan";
      return { color: meta.skin === "cyan" ? "#7dfff2" : "#ffd56a", glow: meta.skin === "cyan" ? "rgba(125,255,242,0.95)" : "rgba(255,211,106,0.95)", w: 3.4, tx: 52, ty: -16, pole: gold ? "#e8c86a" : "#e8c86a" };
    }
    if (meta.skin === "gold") {
      return { color: "#ffd56a", glow: "rgba(255,211,106,0.7)", w: 2.4, tx: 38, ty: -8, pole: "#e8c86a" };
    }
    if (meta.skin === "cyan") {
      return { color: "#7dfff2", glow: "rgba(125,255,242,0.9)", w: 2.3, tx: 36, ty: -8, pole: "#7ecfff" };
    }
    if (id === "fine") {
      return { color: "#7ecfff", glow: "rgba(125,255,242,0.85)", w: 2.4, tx: 38, ty: -8, pole: "#9ad4ff" };
    }
    return { color: "#c4a06a", glow: null, w: 2.1, tx: 22, ty: 4, pole: "#c9b08a" };
  }

  function drawFisherRod(g, pose, hx, hy) {
    const r = rodLook();
    g.fillStyle = r.pole;
    g.fillRect(hx - 2, hy - 2, 4, 24);
    if (r.glow) {
      g.shadowColor = r.glow;
      g.shadowBlur = 12;
    }
    g.strokeStyle = r.color;
    g.lineWidth = r.w;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(hx, hy + pose.tug * 0.2);
    g.lineTo(hx + r.tx, hy + r.ty + pose.rod * 10);
    g.stroke();
    g.shadowBlur = 0;
    const id = rodOf().id;
    if (id === "master") {
      g.fillStyle = "#fff6d0";
      [0.28, 0.52, 0.76].forEach((t) => {
        g.beginPath();
        g.arc(hx + r.tx * t, hy + (r.ty + pose.rod * 10) * t, 2.2, 0, Math.PI * 2);
        g.fill();
      });
    }
    if (id === "fine") {
      g.fillStyle = "#7dffef";
      g.beginPath();
      g.arc(hx + r.tx, hy + r.ty + pose.rod * 10, 3.2, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#2e2218";
    g.beginPath();
    g.arc(hx + 2, hy + 10, 7, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = id === "master" ? "#8a5a18" : id === "fine" ? "#3a6a80" : "#6a3a22";
    g.fillRect(hx - 4, hy + 14, 10, 10);
    return { lx: hx + r.tx, ly: hy + r.ty + pose.rod * 10 + pose.tug * 0.2 };
  }

  function drawBoat(g, now) {
    const pose = fisherPose(now);
    const x = toScreenX(state.boatX);
    const y = boatDeckY(now);
    const kind = state.boat;
    const face = state.boatFacing || 1;
    g.save();
    g.translate(x, y);
    g.scale(face, 1);

    if (state.swapFlash > 0) {
      g.strokeStyle = `rgba(255, 211, 106, ${state.swapFlash})`;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(0, 8, 40 + (1 - state.swapFlash) * 50, 0, Math.PI * 2);
      g.stroke();
    }

    if (kind === "motor" && state.wake > 0.05) {
      g.fillStyle = `rgba(180, 230, 255, ${0.18 * state.wake})`;
      g.beginPath();
      g.moveTo(-20, 18);
      g.lineTo(-70 - state.wake * 40, 28);
      g.lineTo(-20, 26);
      g.fill();
    }

    if (kind === "sub") {
      g.fillStyle = "rgba(80, 200, 255, 0.14)";
      g.beginPath();
      g.moveTo(8, 18);
      g.lineTo(90, 210);
      g.lineTo(-70, 210);
      g.closePath();
      g.fill();
      g.fillStyle = "#c9a227";
      g.beginPath();
      g.ellipse(4, 22, 58, 18, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#e0c25a";
      g.fillRect(-8, -8, 18, 28);
      g.fillStyle = "#8a7018";
      g.fillRect(-2, -22, 6, 16);
      g.fillStyle = "#7dffef";
      g.beginPath();
      g.arc(-18, 20, 4, 0, Math.PI * 2);
      g.arc(8, 18, 4, 0, Math.PI * 2);
      g.arc(28, 20, 4, 0, Math.PI * 2);
      g.fill();
      const tip = drawFisherRod(g, pose, -8, -18);
      g.restore();
      return { tipX: x + face * tip.lx, tipY: y + tip.ly };
    }

    if (kind === "motor") {
      g.fillStyle = "#d8dde4";
      g.beginPath();
      g.moveTo(-62, 6);
      g.lineTo(70, 8);
      g.lineTo(58, 22);
      g.lineTo(-48, 22);
      g.closePath();
      g.fill();
      g.fillStyle = "#2a4a58";
      g.fillRect(-8, -10, 36, 16);
      g.fillStyle = "#9ad4ff";
      g.fillRect(-4, -8, 16, 8);
      g.fillStyle = "#333";
      g.fillRect(52, 10, 16, 12);
      g.fillStyle = "#ff8a4a";
      g.fillRect(64, 12, 6, 8);
      if (state.wake > 0.2) {
        g.fillStyle = `rgba(255, 210, 120, ${0.45 * state.wake})`;
        g.fillRect(70, 14, 10, 5);
      }
      const tip = drawFisherRod(g, pose, -16, -18);
      g.restore();
      return { tipX: x + face * tip.lx, tipY: y + tip.ly };
    }

    g.fillStyle = "#3a2414";
    g.beginPath();
    g.moveTo(-48, 6);
    g.lineTo(52, 6);
    g.lineTo(40, 20);
    g.lineTo(-36, 20);
    g.closePath();
    g.fill();
    const oar = Math.sin(now * 0.012) * state.wake * 18;
    g.strokeStyle = "#5a3820";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(-6, 10);
    g.lineTo(-28, 22 + oar);
    g.moveTo(10, 10);
    g.lineTo(8, 24 - oar);
    g.stroke();
    const tip = drawFisherRod(g, pose, -8, -16);
    g.restore();
    return { tipX: x + face * tip.lx, tipY: y + tip.ly };
  }

  function drawFish(g, c, now) {
    const y = (c.y / 900) * H + Math.sin(now * 0.001 + c.phase) * 6;
    const x = toScreenX(c.x);
    if (x < -80 || x > W + 80) return;
    const dir = c.vx < 0 ? -1 : 1;
    const hooked = !!hookedCreatureOf(c);
    g.save();
    g.translate(x, y);
    g.scale(dir * (hooked ? 1.35 : 1), hooked ? 1.35 : 1);
    g.globalAlpha = hooked ? 1 : (c.kind !== "jelly" && (KIND_DEPTH[c.kind] || 1) > biteDepthCap()) ? 0.14 : 0.92;
    if (hooked) {
      g.shadowColor = (hookedCreatureOf(c) && hookedCreatureOf(c).bite && hookedCreatureOf(c).bite.color) || "#7dfff2";
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
    } else if (c.kind === "ray") {
      g.fillStyle = "rgba(80,110,200,0.88)";
      g.beginPath();
      g.moveTo(c.s * 0.5, 0);
      g.lineTo(0, -c.s * 0.42);
      g.lineTo(-c.s * 0.45, 0);
      g.lineTo(0, c.s * 0.42);
      g.closePath();
      g.fill();
    } else if (c.kind === "viper") {
      g.fillStyle = "#3a1028";
      g.beginPath();
      g.ellipse(0, 0, c.s * 0.55, c.s * 0.16, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#ff8ad4";
      g.beginPath();
      g.arc(c.s * 0.35, -2, 2, 0, Math.PI * 2);
      g.fill();
    } else if (c.kind === "shark") {
      g.fillStyle = "rgba(90, 140, 190, 0.92)";
      g.beginPath();
      g.ellipse(0, 0, c.s * 0.6, c.s * 0.22, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(0, -c.s * 0.18);
      g.lineTo(8, -c.s * 0.48);
      g.lineTo(14, -c.s * 0.12);
      g.fill();
      g.beginPath();
      g.moveTo(-c.s * 0.5, 0);
      g.lineTo(-c.s * 0.9, -c.s * 0.18);
      g.lineTo(-c.s * 0.9, c.s * 0.18);
      g.fill();
    } else if (c.kind === "gulper") {
      g.fillStyle = "#4a2818";
      g.beginPath();
      g.ellipse(-c.s * 0.1, 0, c.s * 0.42, c.s * 0.34, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#1a1010";
      g.beginPath();
      g.ellipse(c.s * 0.22, 0, c.s * 0.28, c.s * 0.3, 0, 0, Math.PI * 2);
      g.fill();
    } else if (c.kind === "moon") {
      g.fillStyle = "rgba(220, 230, 255, 0.9)";
      g.beginPath();
      g.ellipse(0, 0, c.s * 0.42, c.s * 0.4, 0, 0, Math.PI * 2);
      g.fill();
    } else if (c.kind === "tetra") {
      g.fillStyle = "rgba(120, 255, 200, 0.92)";
      g.beginPath();
      g.ellipse(0, 0, c.s * 0.5, c.s * 0.26, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(-c.s * 0.45, 0);
      g.lineTo(-c.s * 0.8, -c.s * 0.2);
      g.lineTo(-c.s * 0.8, c.s * 0.2);
      g.fill();
    } else {
      const col = (fishOf(c.kind) && fishOf(c.kind).color) || "rgba(90, 200, 230, 0.92)";
      g.fillStyle = col;
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
    if (state.sonar > 0 && baitWants(c.kind)) {
      g.strokeStyle = `rgba(125,255,242,${0.55 + Math.sin(now * 0.012) * 0.25})`;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(0, 0, c.s * 0.72 + Math.sin(now * 0.01 + c.phase) * 4, 0, Math.PI * 2);
      g.stroke();
    }
    g.restore();
  }

  function hookPosFor(line, now = performance.now()) {
    const boat = boatPos(now);
    const face = state.boatFacing || 1;
    const x0 = boat.x + 16 + (line ? line.ox : 0) * face;
    if (!state.fishing || state.phase === "idle") {
      return { x: x0, y: boat.y + 36 + Math.sin(now * 0.003) * 4 };
    }
    if (state.phase === "swing") {
      const t = Math.min(1, state.phaseT / 0.55);
      if (t < 0.4) return { x: x0 + face * 8, y: boat.y + 28 };
      const u = (t - 0.4) / 0.6;
      const fly = Math.sin(u * Math.PI);
      return {
        x: x0 + face * (18 - u * 10),
        y: boat.y + 20 + u * 28 - fly * 36,
      };
    }
    const phase = line.phase;
    const tugAmp = line && line.nearMiss ? 22 : 8;
    const tugHz = line && line.nearMiss ? 0.09 : 0.04;
    const tug = phase === "fight" || phase === "approach" ? Math.sin(now * tugHz) * tugAmp : 0;
    const y = boat.y + 10 + line.hookY;
    return { x: x0 + tug, y };
  }

  function drawHooks(g, boat, rodTip, now) {
    const pack = state.fishing && state.lines.length ? state.lines : [{ ox: 0, hookY: 22, phase: "idle", bite: null, fightResult: null }];
    pack.forEach((line) => drawHook(g, boat, rodTip, now, line));
  }

  function drawHook(g, boat, rodTip, now, line) {
    const bait = baitOf();
    const phase = state.phase === "swing" ? "swing" : line.phase;
    const inWindow = phase === "fight";
    const pos = hookPosFor(line, now);
    const x = pos.x;
    const y = pos.y;
    const tipX = rodTip.tipX + (line.ox || 0) * 0.35;
    const rs = rodLook();
    g.save();
    g.strokeStyle = inWindow ? "rgba(182, 255, 106, 0.98)" : phase === "fight" || phase === "approach" ? "rgba(255, 220, 140, 0.95)" : rs.color;
    g.shadowColor = inWindow ? "#b6ff6a" : phase === "approach" ? "#ff8a4a" : (rs.glow ? rs.color : "#9fefff");
    g.shadowBlur = inWindow ? 14 : phase === "approach" ? 12 : rodOf().id === "basic" ? 3 : 8;
    g.lineWidth = line.nearMiss ? 3.1 : phase === "fight" || phase === "approach" ? 2.2 : rs.w * 0.7;
    g.beginPath();
    g.moveTo(tipX, rodTip.tipY);
    if (phase === "fight" || phase === "approach") {
      const wiggle = line.nearMiss ? 36 : 16;
      g.lineTo((tipX + x) / 2 + Math.sin(now * (line.nearMiss ? 0.12 : 0.05)) * wiggle, (rodTip.tipY + y) / 2);
    } else if (phase === "swing") {
      g.quadraticCurveTo((tipX + x) / 2, rodTip.tipY - 40, x, y);
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

    const hookedBait = line.bite && (phase === "approach" || phase === "fight" || phase === "reel") && line.fightResult !== "slip";
    const showBait = !hookedBait;
    if (line.bite && line.bite.loot && (phase === "fight" || phase === "reel" || phase === "approach")) {
      drawLootOnHook(g, line.bite, x, y);
    } else if (showBait) {
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

    const pulse = inWindow ? 0.5 + Math.sin(now * 0.03) * 0.2 : phase === "approach" ? 0.4 : 0.22 + Math.sin(now * 0.01) * 0.12;
    g.fillStyle = inWindow ? `rgba(182, 255, 106, ${pulse})` : phase === "approach" ? `rgba(255, 140, 70, ${pulse})` : `rgba(255, 230, 120, ${pulse})`;
    g.beginPath();
    g.arc(x + 3, y + 8, inWindow ? 28 : phase === "approach" ? 26 : 16, 0, Math.PI * 2);
    g.fill();
    return { x, y };
  }

  function ensureLure(hook) {
    const boat = boatOf();
    const wantedPool = baitOf().attract.filter((k) => k !== "leviathan" && (KIND_DEPTH[k] || 1) <= boat.depth);
    const wanted = wantedPool[Math.floor(Math.random() * wantedPool.length)];
    if (!wanted) return;
    const spec = KIND_SPECS.find((k) => k.kind === wanted);
    if (!spec) return;
    const hx = toWorldX(hook.x);
    const hy = (hook.y / H) * 900;
    const near = creatures.some((c) => c.kind === wanted && Math.hypot(c.x - hx, c.y - hy) < 140 * rodOf().lure);
    if (near) return;
    const fromLeft = Math.random() < 0.5;
    const dist = 320 / rodOf().lure;
    const c = makeCreature(spec, fromLeft);
    c.x = hx + (fromLeft ? -dist : dist);
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
      if (hookedCreatureOf(c)) continue;
      const depth = KIND_DEPTH[c.kind] || 1;
      if (depth > biteDepthCap()) continue;
      const sx = toScreenX(c.x);
      const sy = (c.y / 900) * H;
      const dx = sx - hook.x;
      const dy = sy - hook.y;
      const dist = Math.hypot(dx, dy);
      const match = bait.attract.includes(c.kind);
      const sure = weatherOf().sure || bonusOn();
      const range = (match ? (sure ? 170 : 92) : (sure ? 80 : 30)) * rod.lure;
      if (dist > range) continue;
      const score = dist / (match ? 0.45 : 1) / (c.s || 20);
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    const force = weatherOf().sure || bonusOn();
    if (bonusOn() && state.bonus.kind === "kraken") {
      const cap = biteDepthCap();
      const deep = FISH.filter((f) => f.depth <= cap).sort((a, b) => b.rarity - a.rarity);
      let fish = deep[0] || typicalFish();
      if (cap >= 3 && Math.random() < 0.34) fish = fishOf("leviathan");
      else if (best && fishOf(best.kind) && fishOf(best.kind).rarity >= 3) fish = fishOf(best.kind);
      return { fish, creature: best };
    }
    if (!best) return { fish: null, creature: null };
    if (!force) {
      const p = biteChance(best.kind);
      if (Math.random() > p) return { fish: null, creature: null };
    }
    let id = best.kind;
    if (
      (id === "squid" || id === "shark" || id === "gulper") &&
      bait.id === "shrimp" &&
      boat.depth >= 3 &&
      rod.id === "master" &&
      Math.random() < 0.18
    ) {
      id = "leviathan";
    }
    if (!force && Math.random() < (weatherOf().lootBoost ? 0.22 : 0.07)) return { fish: rollLoot(), creature: null };
    return { fish: fishOf(id), creature: best };
  }

  function rollLoot() {
    const d = boatOf().depth;
    const pool = LOOT.filter((l) => l.depth <= d);
    let sum = 0;
    const weights = pool.map((l) => {
      const w = l.w[d - 1] || 1;
      sum += w;
      return w;
    });
    let n = Math.random() * sum;
    for (let i = 0; i < pool.length; i++) {
      n -= weights[i];
      if (n <= 0) return { ...pool[i], loot: true };
    }
    return { ...pool[0], loot: true };
  }

  function maybeLoot(preferFish) {
    const gold = weatherOf().lootBoost ? 2.4 : 1;
    if (preferFish && Math.random() < 0.08 * gold) return { fish: rollLoot(), creature: null };
    if (!preferFish && Math.random() < 0.28 * gold) return { fish: rollLoot(), creature: null };
    return { fish: null, creature: null };
  }

  function startFight(line, fish) {
    line.fightResult = null;
    line.phase = "fight";
    line.phaseT = 0;
    $("fight-hint").textContent = fish && fish.loot ? "捞到沉物，正在收线" : "上钩了，正在收线";
    $("fight-hint").classList.remove("hidden");
    $("fight-hint").classList.add("now");
    beep(660, 0.09);
  }

  function beginReel(line, result) {
    line.fightResult = result;
    line.phase = "reel";
    line.phaseT = 0;
    if (!anyLinePhase("fight", "approach")) {
      $("fight-hint").classList.add("hidden");
      $("fight-hint").classList.remove("now");
    }
    if (result === "success") beep(520, 0.1, "triangle");
    else beep(180, 0.09);
  }

  function slipLine(line, near) {
    const word = near ? `${line.bite ? line.bite.name : "大鱼"}脱钩了！` : SLIP_WORDS[Math.floor(Math.random() * SLIP_WORDS.length)];
    state.slipBoost = Math.min(0.6, state.slipBoost + (near ? 0.28 : 0.2));
    toast(near ? `差一点就中 · 下一竿咬钩+${Math.round(state.slipBoost * 100)}%` : `${word}  下一竿咬钩+${Math.round(state.slipBoost * 100)}%`);
    $("fight-hint").textContent = word;
    $("fight-hint").classList.remove("hidden", "now");
    line.fightResult = near ? "near" : "slip";
    line.biteCreature = null;
    line.bite = null;
    beginReel(line, near ? "near" : "slip");
  }

  function noteCatch(item) {
    if (!item) return;
    state.seen[item.id] = true;
    if (item.loot) {
      state.lootCounts[item.kind] = (state.lootCounts[item.kind] || 0) + 1;
    }
    if (!state.bestCatch || item.gold > state.bestCatch.gold) {
      state.bestCatch = { name: item.name, gold: item.gold };
    }
  }

  function drawLootOnHook(g, item, x, y) {
    const id = item.id;
    g.fillStyle = item.color;
    g.strokeStyle = item.color;
    if (id === "boot") {
      g.fillRect(x, y + 6, 12, 7);
      g.fillRect(x + 7, y + 4, 6, 10);
    } else if (id === "can") {
      g.fillRect(x + 2, y + 4, 8, 11);
      g.fillStyle = "rgba(0,0,0,0.25)";
      g.fillRect(x + 3, y + 6, 6, 2);
    } else if (id === "bottle") {
      g.fillRect(x + 4, y + 3, 4, 5);
      g.fillRect(x + 2, y + 8, 8, 10);
    } else if (id === "ring") {
      g.lineWidth = 2.2;
      g.beginPath();
      g.arc(x + 6, y + 10, 5, 0, Math.PI * 2);
      g.stroke();
    } else if (id === "chain") {
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x + 2, y + 4);
      g.lineTo(x + 8, y + 10);
      g.lineTo(x + 2, y + 16);
      g.stroke();
    } else if (id === "crown") {
      g.beginPath();
      g.moveTo(x, y + 14);
      g.lineTo(x + 4, y + 4);
      g.lineTo(x + 7, y + 10);
      g.lineTo(x + 12, y + 4);
      g.lineTo(x + 12, y + 14);
      g.fill();
    } else if (id === "coin") {
      g.beginPath();
      g.arc(x + 6, y + 10, 6, 0, Math.PI * 2);
      g.fill();
    } else if (item.kind === "jewel") {
      g.beginPath();
      g.moveTo(x + 6, y + 4);
      g.lineTo(x + 12, y + 10);
      g.lineTo(x + 6, y + 16);
      g.lineTo(x, y + 10);
      g.fill();
    } else if (item.kind === "antique") {
      g.fillRect(x + 1, y + 6, 10, 8);
      g.fillRect(x + 3, y + 3, 6, 4);
    } else {
      g.fillRect(x, y + 6, 11, 7);
    }
  }

  function drawMinimap(g) {
    const mw = Math.min(132, W * 0.3);
    const mh = 16;
    const x = (W - mw) / 2;
    const y = H - 20;
    g.save();
    g.globalAlpha = 0.78;
    g.fillStyle = "rgba(4,12,20,0.72)";
    g.fillRect(x, y, mw, mh);
    g.strokeStyle = "rgba(255,230,180,0.32)";
    g.strokeRect(x + 0.5, y + 0.5, mw, mh);
    MARKS.forEach((m) => {
      const mx = x + (m.x / WORLD) * mw;
      g.fillStyle = "rgba(255,220,140,0.8)";
      g.fillRect(mx - 1, y + 3, 2, mh - 6);
    });
    const bx = x + (state.boatX / WORLD) * mw;
    g.fillStyle = "#7dfff2";
    g.beginPath();
    g.arc(bx, y + mh / 2, 3, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  function payout(fish) {
    let gold;
    let points;
    if (fish.loot) {
      gold = fish.gold;
      points = fish.points;
    } else {
      const bet = betOf();
      const comboBet = 1 + Math.min(state.combo, 8) * 0.12;
      const betWin = Math.round(bet.amt * bet.win * (0.65 + fish.rarity * 0.22) * comboBet);
      gold = fish.gold + betWin;
      points = Math.round(fish.points * (1 + bet.amt / 4000));
      state.sessionCatch += 1;
      if (fish.rarity >= 2) state.gotRare = true;
    }
    if (state.skipCut) {
      gold = Math.round(gold * SKIP_PAY);
      points = Math.round(points * SKIP_PAY);
    }
    if (bonusOn()) {
      const mul = state.bonus.kind === "kraken" ? 2.35 : 1.45;
      gold = Math.round(gold * mul);
      points = Math.round(points * (state.bonus.kind === "kraken" ? 1.6 : 1.25));
    }
    if (state.critArmed && !fish.loot && !state.critSpent) {
      gold = Math.round(gold * 2.5) + 80 + betOf().amt * 2;
      points = Math.round(points * 2);
      state.critSpent = true;
      state.critArmed = false;
      state.sonarPow = 0;
      toast("声呐暴击 · 全屏清场");
      for (let i = 0; i < 30; i++) spawnParticle(W * 0.5 + (Math.random() - 0.5) * 90, H * 0.38, "#7dffef");
    }
    state.gold += gold;
    state.points += points;
    state.sessionGold += gold;
    noteCatch(fish);
    if (!fish.loot && fish.id === "eel") bumpQuest("eel", 1);
    if (!fish.loot) {
      rollJackpot();
      pushLive(maskYou(), rodOf().name, fish.name, gold);
      maybeShare(gold, fish.name);
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
      if (result === "near") {
        el.innerHTML = `<h3>差一点就中</h3><p>已经咬上了，线在最后一秒松了</p>`;
      } else if (result === "slip") {
        el.innerHTML = `<h3>脱钩</h3><p>下一竿更好咬</p>`;
      } else {
        el.innerHTML = `<h3>空钩</h3><p>钩边没有对口的鱼</p>`;
      }
      beep(140, 0.16, "sawtooth", 0.03);
    } else if (fish.loot) {
      if (fish.kind === "trash") {
        state.combo = 0;
        $("streak").hidden = true;
        el.classList.add("miss");
      } else {
        state.combo += 1;
        $("streak").hidden = state.combo < 2;
        $("streak").textContent = `COMBO x${state.combo}`;
        el.classList.add("r" + Math.max(1, fish.rarity));
      }
      const tag = fish.kind === "jewel" ? "金饰" : fish.kind === "antique" ? "古董" : "垃圾";
      const cut = state.skipCut ? " · 七成" : "";
      el.innerHTML = `<h3>${fish.name}</h3><p>${tag} · +${fmt(reward.gold)} 金 · +${fmt(reward.points)} 分${cut}</p>`;
      beep(fish.kind === "trash" ? 180 : 480 + fish.rarity * 60, 0.12, "square", 0.035);
    } else {
      state.combo += 1;
      $("streak").hidden = state.combo < 2;
      $("streak").textContent = `COMBO x${state.combo}`;
      el.classList.add("r" + fish.rarity);
      const cut = state.skipCut ? " · 七成" : "";
      el.innerHTML = `<h3>${fish.name}</h3><p>+${fmt(reward.gold)} 金 · +${fmt(reward.points)} 分${cut}</p>`;
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
    $("wx-hud").textContent = wxLine();
    $("btn-cast").textContent = state.fishing
      ? (state.phase === "swing" ? "抛竿…" : bonusOn() ? "奖励中" : "跳过·七折")
      : bonusOn() ? "奖励关" : "下钩";
    const blocked = state.paused || state.ended || state.helpOpen;
    const canPress = !blocked && (state.fishing ? !bonusOn() : (bonusOn() || (state.gold >= castCost() && baitReady())));
    $("btn-cast").disabled = !canPress;
    $("btn-charm").disabled = blocked || state.fishing || state.luckyHook || state.gems < 1;
    $("btn-sonar").disabled = blocked || state.fishing || state.sonar > 0 || state.gems < 1;
    const sonarStrong = $("btn-sonar").querySelector("strong");
    if (sonarStrong) sonarStrong.textContent = state.sonar > 0 ? `${Math.ceil(state.sonar)}秒` : "1 宝石";
    $("btn-bet").disabled = blocked || state.fishing || bonusOn();
    $("btn-x3").disabled = blocked || state.fishing || bonusOn();
    const kNeed = featureCost("kraken");
    const fNeed = featureCost("frenzy");
    const featOff = blocked || state.fishing || bonusOn();
    if ($("btn-kraken")) $("btn-kraken").disabled = featOff || state.gold < kNeed;
    if ($("btn-frenzy")) $("btn-frenzy").disabled = featOff || state.gold < fNeed;
    $("btn-x3").classList.toggle("on", state.multi === 3);
    $("btn-x3").querySelector("strong").textContent = state.multi === 3 ? "x3" : "x1";
    if (!state.dirtyHud) return;
    $("points").textContent = fmt(state.points);
    $("gold").textContent = fmt(state.gold);
    $("gems").textContent = fmt(state.gems);
    $("goal-hud").textContent = `${state.gotRare ? "✓" : "○"} ${Math.min(state.points, GOAL_POINTS)}`;
    $("charm-hud").textContent = state.luckyHook ? "开" : "关";
    const fill = $("sonar-fill");
    if (fill) fill.style.width = `${Math.round(state.sonarPow)}%`;
    if ($("sonar-txt")) $("sonar-txt").textContent = state.critArmed ? "暴击" : `${Math.round(state.sonarPow)}%`;
    const meter = fill && fill.closest(".sonar-meter");
    if (meter) meter.classList.toggle("ready", state.critArmed);
    $("cur-rod").textContent = `${rodOf().name} · ${rodOf().blurb}`;
    $("cur-boat").textContent = `${boatOf().name} · ${DEPTH_NAME[boatOf().depth]}层`;
    $("wx-hud").textContent = wxLine();
    $("bite-hud").textContent = biteHudText();
    $("rent-fee").textContent = rentLabel(gearRent());
    renderCost();
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
        <div class="blurb">${r.blurb}</div>
      </button>`;
    }).join("");
    $("boats").innerHTML = BOATS.map((b) => {
      const active = state.boat === b.id;
      return `<button class="item ${active ? "active" : ""}" data-rent="boat" data-id="${b.id}">
        <div class="icon-art">${iconSvg(b.id)}</div>
        <div class="price">${rentLabel(b.rent)}</div>
        <div class="blurb">${b.blurb}</div>
      </button>`;
    }).join("");
    $("baits").innerHTML = BAITS.map((b) => {
      const active = state.bait === b.id;
      return `<button class="bait-item ${active ? "active" : ""}" data-bait="${b.id}">
        <div class="icon-art">${iconSvg(b.id)}</div>
        <div class="price">${fmt(b.cost)}</div>
        <div class="blurb">${b.blurb}</div>
      </button>`;
    }).join("");
    $("wx-items").innerHTML = WX_ITEMS.map((w) => {
      const on = state.omenId === w.wx && state.omenT > 0;
      const price = w.gems ? `${w.gems}宝石` : fmt(w.gold);
      return `<button class="bait-item omen ${on ? "active" : ""}" data-wx="${w.id}">
        <div class="price">${price}</div>
        <div class="blurb">${w.name}</div>
        <div class="blurb">${w.blurb}</div>
      </button>`;
    }).join("");
  }

  function useWxItem(id) {
    if (state.paused || state.ended || state.helpOpen) return;
    const item = WX_ITEMS.find((w) => w.id === id);
    if (!item) return;
    if (item.gems && state.gems < item.gems) {
      toast(`需要 ${item.gems} 宝石`);
      return;
    }
    if (item.gold && state.gold < item.gold) {
      toast("金币不够买天气道具");
      return;
    }
    if (item.gems) state.gems -= item.gems;
    if (item.gold) state.gold -= item.gold;
    clearOmenFish();
    if (item.wx === "clear") {
      state.omenId = null;
      state.omenT = 0;
      state.wx = 0;
      state.wxT = 0;
      toast("晴空符：海面放晴");
    } else {
      state.omenId = item.wx;
      state.omenT = OMENS[item.wx].dur;
      spawnOmenSchool();
      const omen = OMENS[item.wx];
      toast(`${item.name}：${omen.name}${omen.sure ? " · 必定咬钩" : ""}`);
    }
    beep(500, 0.1, "triangle");
    renderShop();
    state.dirtyHud = true;
    renderHud();
  }

  function rent(type, id) {
    if (state.fishing) return;
    if (type === "rod") {
      state.rod = id;
      toast(`${rodOf().name}：${rodOf().blurb} · ${rodOf().id === "basic" ? "短木竿" : rodOf().id === "fine" ? "长银竿，咬得更快" : "金长竿，收线极速"}`);
      state.swapFlash = 1;
    } else {
      state.boat = id;
      toast(`${boatOf().name}：钩到${DEPTH_NAME[boatOf().depth]}层 · ${boatOf().blurb}`);
      state.swapFlash = 1;
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

  function forceLuckyBite(line) {
    const fish = typicalFish();
    if (!fish) return false;
    state.luckyHook = false;
    line.bite = fish;
    line.biteCreature = null;
    toast("护钩生效");
    return true;
  }

  function finishLine(line) {
    const hook = hookPosFor(line);
    const ok = line.fightResult === "success" && line.bite;
    const reward = ok ? payout(line.bite) : null;
    if (ok) {
      for (let i = 0; i < 14; i++) spawnParticle(hook.x, hook.y, line.bite.color);
    }
    line.outcome = { fish: ok ? line.bite : null, reward, result: line.fightResult };
    line.done = true;
    line.biteCreature = null;
    line.phase = "idle";
  }

  function applyBite(line, found) {
    line.bite = found.fish;
    line.biteCreature = found.creature;
    if (found.fish.loot) startFight(line, found.fish);
    else {
      line.phase = "approach";
      line.phaseT = 0;
      $("fight-hint").textContent = "有鱼咬钩！";
      $("fight-hint").classList.remove("hidden", "now");
      beep(440, 0.08);
    }
  }

  function settleAll() {
    const results = state.lines.map((l) => l.outcome).filter(Boolean);
    const hits = results.filter((r) => r.fish);
    if (hits.length === 1) {
      showCatch(hits[0].fish, hits[0].reward, hits[0].result);
      flashWin(hits[0].reward.gold);
    } else if (hits.length > 1) {
      const gold = hits.reduce((s, r) => s + r.reward.gold, 0);
      const pts = hits.reduce((s, r) => s + r.reward.points, 0);
      const names = hits.map((r) => r.fish.name).join(" · ");
      const el = $("catch-card");
      el.className = "catch-card";
      el.innerHTML = `<h3>多线收成</h3><p>${names}<br>+${fmt(gold)} 金 · +${fmt(pts)} 分${state.skipCut ? " · 七成" : ""}</p>`;
      el.classList.remove("hidden");
      clearTimeout(showCatch._t);
      showCatch._t = setTimeout(() => el.classList.add("hidden"), 1800);
      flashWin(gold);
    } else {
      const near = results.some((r) => r.result === "near");
      const slipped = results.some((r) => r.result === "slip");
      showCatch(null, null, near ? "near" : slipped ? "slip" : "empty");
    }
    results.forEach((r) => {
      if (r.fish) addSonar(r.fish.loot ? (r.fish.kind === "trash" ? 4 : 10) : 6 + (r.fish.rarity || 1) * 6);
      else if (r.result === "near") addSonar(16);
      else if (r.result === "slip") addSonar(12);
      else addSonar(8);
    });
    if (state.bonus) {
      state.bonus.left -= 1;
      if (state.bonus.left <= 0) {
        toast("奖励关结束");
        state.bonus = null;
      }
    }
    state.critSpent = false;
    $("fight-hint").classList.add("hidden");
    state.lines = [];
    state.phase = "idle";
    state.fishing = false;
    state.skipCut = false;
    state.dirtyHud = true;
    renderHud();
  }

  function settleCast() {
    state.lines.forEach((l) => {
      if (!l.done) finishLine(l);
    });
    settleAll();
  }

  function skipCast() {
    if (!state.fishing || state.paused || state.ended || state.helpOpen) return;
    if (bonusOn()) {
      toast("奖励关不跳过");
      return;
    }
    state.skipCut = true;
    if (state.phase === "swing") {
      state.phase = "busy";
      state.lines.forEach((l) => {
        l.phase = "wait";
        l.hookY = l.hookTarget;
      });
    }
    state.lines.forEach((line) => {
      if (line.done) return;
      const hook = hookPosFor(line);
      if (line.phase === "drop" || line.phase === "wait") {
        ensureLure(hook);
        const found = findBite(hook);
        if (found.fish) {
          line.bite = found.fish;
          line.biteCreature = found.creature;
          line.fightResult = "success";
        } else if (state.luckyHook && forceLuckyBite(line)) {
          line.fightResult = "success";
        } else {
          const salvage = maybeLoot(false);
          if (salvage.fish) {
            line.bite = salvage.fish;
            line.fightResult = "success";
          } else {
            line.bite = null;
            line.fightResult = "empty";
          }
        }
      } else if (line.bite && line.fightResult !== "empty" && line.fightResult !== "slip") {
        line.fightResult = "success";
      } else {
        line.fightResult = line.fightResult || "empty";
      }
      finishLine(line);
    });
    settleAll();
  }

  function buySonar() {
    if (state.fishing || state.paused || state.ended || state.helpOpen) return;
    if (state.sonar > 0) {
      toast("探鱼还在亮");
      return;
    }
    if (state.gems < 1) {
      toast("需要 1 宝石");
      return;
    }
    state.gems -= 1;
    state.sonar = 8;
    toast("探鱼：对口鱼会发亮约 8 秒");
    beep(720, 0.1, "triangle");
    state.dirtyHud = true;
    renderHud();
  }

  function buyCharm() {
    if (state.fishing || state.paused || state.ended || state.helpOpen) return;
    if (state.luckyHook) {
      toast("护钩已就绪");
      return;
    }
    if (state.gems < 1) {
      toast("需要 1 宝石");
      return;
    }
    state.gems -= 1;
    state.luckyHook = true;
    toast("护钩：下一竿空等会变成对口咬钩");
    beep(640, 0.1, "triangle");
    state.dirtyHud = true;
    renderHud();
  }

  function fillEnd() {
    const bonus = goalBonus();
    const seenN = Object.keys(state.seen).length;
    const best = state.bestCatch ? `${state.bestCatch.name} ${fmt(state.bestCatch.gold)}金` : "无";
    $("end-summary").textContent = `鱼 ${state.sessionCatch} 条 · 本局 +${fmt(state.sessionGold)} 金 · ${fmt(state.points)} 分\n${goalLine()}${bonus ? `\n目标奖励 +${fmt(bonus)}` : ""}`;
    $("end-log").textContent = `最贵：${best}\n沉物：垃圾 ${state.lootCounts.trash} · 古董 ${state.lootCounts.antique} · 金饰 ${state.lootCounts.jewel}\n图鉴 ${seenN}/${CATALOG_N}`;
  }

  function beginCast() {
    state.castBoost = state.slipBoost;
    state.slipBoost = 0;
    const n = lineCount();
    state.lines = Array.from({ length: n }, (_, i) => {
      const line = makeLine(i, n);
      line.hookTarget = H * (0.2 + (boatOf().depth - 1) * 0.26 + Math.random() * 0.05);
      return line;
    });
    state.fishing = true;
    state.phase = "swing";
    state.phaseT = 0;
    state.skipCut = false;
    addSonar(5);
    feedJackpot(betOf().amt * n);
    addTourneyStake(betOf().amt * n);
    if (meta.freeBait > 0) {
      meta.freeBait -= 1;
      saveMeta();
    }
    bumpQuest("casts", 1);
    if (rodOf().id === "master") bumpQuest("master", 1);
    state.dirtyHud = true;
    beep(280, 0.12, "triangle");
    renderHud();
  }

  function buyFeature(kind) {
    if (state.paused || state.ended || state.helpOpen || state.fishing) return;
    if (bonusOn()) {
      toast("奖励关进行中");
      return;
    }
    if (!baitReady()) {
      toast(`换${DEPTH_NAME[baitOf().depth]}层船，或改用浅饵`);
      return;
    }
    const need = featureCost(kind);
    if (state.gold < need) {
      toast(kind === "frenzy" ? "狂钩要 100 倍注额" : "海怪要 50 倍注额，先降注或赢几竿");
      return;
    }
    state.gold -= need;
    feedJackpot(need);
    addTourneyStake(need);
    state.bonus = { kind, left: 1 };
    toast(kind === "kraken" ? "深海海怪袭击 · 直进高爆关" : "狂暴多钩拉网 · 五线齐下");
    beginCast();
  }

  function onCastPress() {
    if (state.paused || state.ended || state.helpOpen) return;
    if (state.fishing) {
      skipCast();
      return;
    }
    if (!baitReady()) {
      toast(`换${DEPTH_NAME[baitOf().depth]}层船，或改用浅饵`);
      return;
    }
    if (bonusOn()) {
      beginCast();
      return;
    }
    const need = castCost();
    if (state.gold < need) {
      toast("金币不够支付诱饵、租借和赌注");
      return;
    }
    state.gold -= need;
    beginCast();
  }

  function updateLine(dt, line) {
    line.phaseT += dt;
    const hook = hookPosFor(line);
    if (line.phase === "drop") {
      line.hookY += dt * (200 + boatOf().depth * 90);
      if (line.hookY >= line.hookTarget) {
        line.hookY = line.hookTarget;
        line.phase = "wait";
        line.phaseT = 0;
        ensureLure(hook);
      }
    } else if (line.phase === "wait") {
      line.hookY += Math.sin(line.phaseT * 7) * 0.2;
      if (Math.random() < 0.18) spawnParticle(hook.x, hook.y, "rgba(125,255,242,0.7)");
      line.checkT += dt;
      if (line.phaseT > 0.5 && line.checkT >= 0.42) {
        line.checkT = 0;
        const found = findBite(hook);
        if (found.fish) {
          applyBite(line, found);
          state.dirtyHud = true;
          return;
        }
      }
      if (line.phaseT > line.waitFor) {
        if (weatherOf().sure || bonusOn()) {
          const found = findBite(hook);
          const fish = (found && found.fish) || typicalFish();
          if (found && found.fish) {
            applyBite(line, found);
          } else if (fish) {
            line.bite = fish;
            line.biteCreature = null;
            line.phase = "approach";
            line.phaseT = 0;
            $("fight-hint").textContent = "异象咬上了！";
            $("fight-hint").classList.remove("hidden", "now");
            beep(520, 0.1, "triangle");
          }
          state.dirtyHud = true;
          return;
        }
        if (state.luckyHook && forceLuckyBite(line)) {
          line.phase = "approach";
          line.phaseT = 0;
          $("fight-hint").textContent = "护钩咬上了！";
          $("fight-hint").classList.remove("hidden", "now");
          beep(520, 0.1, "triangle");
        } else {
          const salvage = maybeLoot(false);
          if (salvage.fish) {
            line.bite = salvage.fish;
            line.biteCreature = null;
            startFight(line, salvage.fish);
          } else {
            line.bite = null;
            line.biteCreature = null;
            beginReel(line, "empty");
          }
        }
        state.dirtyHud = true;
      }
    } else if (line.phase === "approach") {
      if (line.bite && !line.bite.loot && !line.nearTried && !bonusOn() && !weatherOf().sure) {
        line.nearTried = true;
        const jack = line.bite.rarity >= 3 || line.bite.id === "angler" || line.bite.id === "gulper";
        if (jack && Math.random() < 0.22) {
          line.nearMiss = true;
          $("fight-hint").textContent = `${line.bite.name}在死命拉扯！`;
          $("fight-hint").classList.remove("hidden", "now");
          beep(180, 0.14, "sawtooth", 0.045);
        }
      }
      if (line.nearMiss) {
        line.hookY += Math.sin(line.phaseT * 42) * 1.8;
        spawnParticle(hook.x + (Math.random() - 0.5) * 28, hook.y + (Math.random() - 0.5) * 24, "rgba(255,90,70,0.95)");
        if (line.phaseT > 1.12) slipLine(line, true);
        state.dirtyHud = true;
        return;
      }
      line.hookY += Math.sin(line.phaseT * 18) * 0.8;
      const c = line.biteCreature;
      if (c) {
        const hx = toWorldX(hook.x);
        const hy = (hook.y / H) * 900;
        c.x += (hx - c.x) * Math.min(1, dt * 7 * rodOf().lure);
        c.y += (hy - c.y) * Math.min(1, dt * 7 * rodOf().lure);
      }
      spawnParticle(hook.x + (Math.random() - 0.5) * 20, hook.y + (Math.random() - 0.5) * 20, "rgba(255,160,80,0.9)");
      if (line.phaseT > 0.7 / rodOf().lure) {
        if (line.bite && !line.bite.loot && !bonusOn() && Math.random() < slipChance(line.bite)) slipLine(line);
        else startFight(line, line.bite);
      }
      state.dirtyHud = true;
    } else if (line.phase === "fight") {
      line.hookY += Math.sin(line.phaseT * 14) * 0.55;
      if (Math.random() < 0.5) spawnParticle(hook.x, hook.y, "rgba(255,210,100,0.8)");
      if (line.phaseT > 0.55 / rodOf().reel) {
        if (line.bite && !line.bite.loot && !bonusOn() && Math.random() < slipChance(line.bite) * 0.45) slipLine(line);
        else beginReel(line, "success");
      }
      state.dirtyHud = true;
    } else if (line.phase === "reel") {
      line.hookY -= dt * (line.bite && line.fightResult === "success" ? 280 : 360) * rodOf().reel;
      if (line.hookY <= 22) finishLine(line);
    }
  }

  function updateFishing(dt) {
    if (state.phase === "swing") {
      state.phaseT += dt;
      if (state.phaseT >= 0.55) {
        state.phase = "busy";
        state.lines.forEach((l) => {
          l.phase = "drop";
          l.phaseT = 0;
        });
      }
      return;
    }
    for (const line of state.lines) {
      if (!line.done) updateLine(dt, line);
    }
    if (state.lines.length && state.lines.every((l) => l.done)) settleAll();
  }

  function updateCreatures(dt, hook) {
    const attract = state.fishing && anyLinePhase("wait");
    const hx = toWorldX(hook.x);
    const hy = (hook.y / H) * 900;
    const boat = boatOf();
    for (let i = 0; i < creatures.length; i++) {
      const c = creatures[i];
      const holder = hookedCreatureOf(c);
      if (holder) {
        const hp = hookPosFor(holder);
        c.x = toWorldX(hp.x);
        c.y = (hp.y / H) * 900;
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
        const match = baitWants(c.kind);
        if (depth > boat.depth) {
          c.x -= dx * dt * 0.15;
        } else if (d2 < ((match ? 180 : 80) * rodOf().lure) ** 2) {
          const pull = match ? 0.85 : -0.35;
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
      if (c.x < -80 || c.x > WORLD + 80) {
        creatures[i] = makeCreature(c.kindSpec, c.x > WORLD / 2, true);
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
    const lead = state.lines.find((l) => !l.done) || state.lines[0];
    const hookPreview = hookPosFor(lead || { ox: 0, hookY: 22, phase: "idle" }, now);

    const moving = !state.paused && !state.ended && !state.fishing && (keys.left || keys.right || state.steerTarget != null);
    state.wake = moving ? Math.min(1, state.wake + dt * 4) : Math.max(0, state.wake - dt * 2.2);
    if (state.swapFlash > 0) state.swapFlash = Math.max(0, state.swapFlash - dt * 1.6);

    if (!state.paused && !state.ended && !state.helpOpen) {
      updateBoat(dt);
      if (state.omenT > 0) {
        state.omenT = Math.max(0, state.omenT - dt);
        if (state.omenT <= 0) {
          state.omenId = null;
          clearOmenFish();
          toast("异象散了，海况回到日常");
          state.dirtyHud = true;
        }
      } else {
        state.wxT += dt;
        if (state.wxT > 22) {
          state.wxT = 0;
          state.wx = (state.wx + 1) % WEATHERS.length;
          toast(`天气转${WEATHERS[state.wx].name}`);
          state.dirtyHud = true;
        }
      }
      state.tideT += dt;
      if (state.tideT > 28) {
        state.tideT = 0;
        state.tide = (state.tide + 1) % TIDES.length;
        toast(`${tideOf().name}：${tideOf().id === "high" ? "深水更好咬" : tideOf().id === "low" ? "浅水更好咬" : "各层平稳"}`);
        state.dirtyHud = true;
      }
      if (state.sonar > 0) state.sonar = Math.max(0, state.sonar - dt);
      if (!anyLinePhase("fight", "approach")) state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.ended = true;
        const bonus = goalBonus();
        if (bonus) {
          state.gold += bonus;
          state.sessionGold += bonus;
        }
        fillEnd();
        $("end-mask").classList.remove("hidden");
        state.dirtyHud = true;
      }
      if (state.fishing) updateFishing(dt);
      updateCreatures(dt, hookPreview);
      updateParticles(dt);
    }
    updateCamera(dt);
    if (H < 80 || W < 80) resize();
    syncWeatherLook();
    state.wxBlend = Math.min(1, (state.wxBlend || 0) + dt * 1.35);
    if (mixedLook().flash > 0.5 && !state.paused && Math.random() < 0.012) state.wxFlash = 1;
    if (state.wxFlash > 0) state.wxFlash = Math.max(0, state.wxFlash - dt * 5);

    ctx.clearRect(0, 0, W, H);
    drawSky(ctx, now);
    ctx.save();
    ctx.translate(0, -state.camY);
    drawWater(ctx, now);
    drawWorld(ctx);
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
    drawHooks(ctx, boat, rodTip, now);
    ctx.restore();
    drawWeatherOverlay(ctx, now);
    drawMinimap(ctx);
    tickJackpots(dt);
    tickLive(dt);
    const pulse = (now / 400) | 0;
    if (loop._pulse !== pulse) {
      loop._pulse = pulse;
      if (modalOn("rank")) renderRank();
      else ensureTourney();
      if (modalOn("hub")) {
        Object.keys(CHEST).forEach((id) => {
          $(`${id}-txt`).textContent = chestReady(id) ? "可领" : waitText((meta[id] || 0) - Date.now());
        });
      }
    }
    if (now - saveMetaAt > 2000) {
      saveMetaAt = now;
      saveMeta();
    }
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
    $("btn-x3").onclick = () => {
      if (state.fishing || state.paused || state.ended || state.helpOpen) return;
      state.multi = state.multi === 3 ? 1 : 3;
      toast(state.multi === 3 ? "x3：三杆同时下，饵和注都×3" : "单杆下钩");
      state.dirtyHud = true;
      beep(360, 0.06);
      renderHud();
    };
    $("btn-cast").onclick = onCastPress;
    if ($("btn-kraken")) $("btn-kraken").onclick = () => buyFeature("kraken");
    if ($("btn-frenzy")) $("btn-frenzy").onclick = () => buyFeature("frenzy");
    $("btn-charm").onclick = buyCharm;
    $("btn-sonar").onclick = buySonar;
    $("btn-help").onclick = () => {
      sawHelp = true;
      state.helpOpen = false;
      $("help-mask").classList.add("hidden");
    };
    $("btn-hub").onclick = () => (modalOn("hub") ? closeModal() : openPanel("hub", "收线后再打开回流"));
    $("btn-rank").onclick = () => (modalOn("rank") ? closeModal() : openPanel("rank", "收线后再看冲榜"));
    $("btn-rank-close").onclick = closeModal;
    $("btn-share-close").onclick = closeModal;
    $("share-copy").onclick = async () => {
      if (!lastShare) return;
      try {
        await navigator.clipboard.writeText(`${lastShare.text} ${lastShare.url || ""}`);
        toast("已复制分享文案");
      } catch (_) {
        toast("复制失败，请长按文案");
      }
    };
    $("share-dl").onclick = () => {
      const art = $("share-art");
      if (!art) return;
      const a = document.createElement("a");
      a.href = art.toDataURL("image/png");
      a.download = "deep-abyss-highlight.png";
      a.click();
    };
    $("share-sys").onclick = async () => {
      if (!lastShare) return;
      if (navigator.share) {
        try { await navigator.share({ title: "Deep Abyss", text: lastShare.text, url: lastShare.url }); } catch (_) {}
      } else toast("请用 Telegram / WhatsApp 按钮");
    };
    $("btn-hub-close").onclick = closeModal;
    $("btn-checkin").onclick = claimCheckin;
    $("btn-chest4").onclick = () => claimChest("chest4");
    $("btn-chest8").onclick = () => claimChest("chest8");
    $("quest-list").onclick = (e) => {
      const b = e.target.closest("[data-q]");
      if (b) claimQuest(b.dataset.q);
    };
    $("bp-tiers").onclick = (e) => {
      const b = e.target.closest("[data-bp]");
      if (b) claimBp(+b.dataset.bp);
    };
    $("btn-pause").onclick = () => {
      if (state.ended || state.helpOpen || state.modal) return;
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
      toast(`${bait.name}：${bait.blurb} · 需${DEPTH_NAME[bait.depth]}层船`);
      renderShop();
      state.dirtyHud = true;
      renderHud();
    };
    $("wx-items").onclick = (e) => {
      const b = e.target.closest("[data-wx]");
      if (b) useWxItem(b.dataset.wx);
    };

    visualViewport?.addEventListener("resize", resize);
    window.addEventListener("orientationchange", () => setTimeout(resize, 180));
    const hold = (id, key) => {
      const el = $(id);
      const dir = key === "left" ? -1 : 1;
      const down = (e) => {
        e.preventDefault();
        keys[key] = true;
        state.steerTarget = null;
      };
      const up = () => { keys[key] = false; };
      el.addEventListener("pointerdown", down);
      el.addEventListener("mousedown", down);
      el.addEventListener("touchstart", down, { passive: false });
      window.addEventListener("pointerup", up);
      window.addEventListener("mouseup", up);
      window.addEventListener("touchend", up);
      el.addEventListener("click", () => {
        if (state.paused || state.ended || state.fishing || state.helpOpen) return;
        state.steerTarget = null;
        state.boatX = Math.max(140, Math.min(WORLD - 140, state.boatX + dir * (50 + boatOf().speed * 180)));
      });
    };
    hold("btn-left", "left");
    hold("btn-right", "right");
    const aimBoat = (clientX) => {
      if (state.helpOpen || state.paused || state.ended) return;
      if (state.fishing) {
        toast("收线后再移船，钩从当前位置抛下");
        return;
      }
      const r = $("stage").getBoundingClientRect();
      const sx = clientX - r.left;
      state.steerTarget = Math.max(140, Math.min(WORLD - 140, toWorldX(sx)));
    };
    $("steer-layer").addEventListener("pointerdown", (e) => {
      if (e.target !== e.currentTarget) return;
      aimBoat(e.clientX);
    });
    $("steer-layer").addEventListener("mousedown", (e) => {
      if (e.target !== e.currentTarget) return;
      aimBoat(e.clientX);
    });
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        onCastPress();
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keys.left = true;
        state.steerTarget = null;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keys.right = true;
        state.steerTarget = null;
      }
      if (e.key === "b" || e.key === "B") $("btn-bet").click();
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
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
  syncHubBtn();
  seedTicker();
  ensureTourney();
  if (!sawHelp) {
    state.helpOpen = true;
    $("help-mask").classList.remove("hidden");
  }
  requestAnimationFrame(loop);
})();
