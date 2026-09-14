(() => {
  /* 构建版本号：只出现在设置面板角落 + 控制台一行，
     **不显示在游戏界面上**（用户明确要求，天气旁边挂个 vXX 太出戏）。
     发版时改这里和 index.html 里的 ?v=。 */
  const BUILD = "v65";
  console.log("[Deep Abyss] build " + BUILD);
  /* 元素查询带缓存。原来每次 $() 都走 getElementById——实测静止时每帧 22 次，纯属浪费。
     缓存元素引用；被 innerHTML 重建过的元素 isConnected=false，会自动重查。
     setText 顺带做「值没变就不写 DOM」——原来每帧无条件写 8.7 次 textContent，
     每次写入即便内容相同也可能触发样式重算，这是静止时吃 CPU 的主要来源之一。 */
  const elCache = new Map();
  const $ = (id) => {
    const hit = elCache.get(id);
    if (hit && hit.isConnected) return hit;
    const el = document.getElementById(id);
    if (el) elCache.set(id, el);
    else elCache.delete(id);
    return el;
  };
  const textCache = new Map();
  function setText(el, txt) {
    if (!el) return;
    const s = String(txt);
    if (textCache.get(el) === s) return;
    textCache.set(el, s);
    el.textContent = s;
  }
  /* 单个绑定出错不要连累其它绑定。
     bind() 里几十个 onclick 是顺序执行的，中间一个 null 解引用会让
     后面所有绑定静默失效（曾经因为删了 HUD 上的回流/冲榜按钮、
     但代码里还在绑它们，导致齿轮等后续按钮全部没反应）。 */
  function bindStep(name, fn) {
    try { fn(); } catch (e) { (window.__bindErr = window.__bindErr || []).push(name + ": " + (e && e.message)); }
  }

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
  const TICKER_KEEP = 6;      // 跑马灯只保留最近几条，避免条带越滚越长
  const TICKER_SPEED = 56;    // 每秒滚过的像素数，用来反推动画时长（条带窄时也不会太快）
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
      // 自动玩：remaining>0 表示正在跑；rounds=面板里选的局数；fast=加速开关
      auto: { remaining: 0, all: 0, left: 0, wait: 0, spent: 0, gold0: 0, hit: 0, rounds: 10, fast: true },
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
      playerName: "",
      playerId: "",
    };
  }

  /* 玩家身份：没有就生成一次并持久化。
     参照同类游戏——HUD 上展示头像 + 名称 + ID，与余额放在一起。 */
  const NAME_POOL = ["深渊钓手", "夜潮渔人", "深海行者", "沉锚老李", "磷光船长", "浪里白条", "铁钩阿海", "月下渔火"];
  const AVATAR_POOL = ["深", "潮", "锚", "钓", "浪", "磷", "钩", "渔"];
  function ensureIdentity() {
    if (!meta.playerName) {
      meta.playerName = NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
      const n = 100000 + Math.floor(Math.random() * 900000);
      meta.playerId = String(n);
      meta.avatar = AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)];
      saveMeta();
    }
    if (!meta.avatar) meta.avatar = (meta.playerName || "深")[0];
    return { name: meta.playerName, id: meta.playerId, avatar: meta.avatar };
  }
  function renderIdentity() {
    const idn = ensureIdentity();
    const pairs = [
      ["player-name", idn.name], ["player-id", "ID " + idn.id], ["player-avatar", idn.avatar],
      ["gear-name", idn.name], ["gear-id", "ID " + idn.id], ["gear-avatar", idn.avatar],
    ];
    pairs.forEach(([id, v]) => setText($(id), v));
    return idn;
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
    // 奖池数字很大，每帧格式化成千分位字符串其实只有偶尔才会变；
    // 限流到约 8 次/秒，肉眼完全看不出差别，省下来的全是格式化开销。
    tickJackpots._acc = (tickJackpots._acc || 0) + dt;
    const paint = tickJackpots._acc >= 0.12;
    if (paint) tickJackpots._acc = 0;
    JACKS.forEach((j) => {
      meta.jp[j.id] += j.idle * dt;
      jpShow[j.id] += (meta.jp[j.id] - jpShow[j.id]) * Math.min(1, dt * 6);
      if (!paint) return;
      const el = $("jp-" + j.id);
      if (!el) return;
      setText(el, fmt(jpShow[j.id]));
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
    sfx.jackpot();                                 // 奖池命中：金币 + 铜钟
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
    // 回流/冲榜已移进设置面板，主界面上没有按钮了；
    // 有可领奖励时改成让"齿轮"按钮脉冲，提示玩家点进去。
    const gear = $("btn-gear");
    if (gear) gear.classList.toggle("pulse", hubClaimable());
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
    // 只留最近几条，跑马灯不必背着一长串历史
    const bits = tickerLines.slice(0, TICKER_KEEP).map((t) => `<span class="${t.hot ? "hot" : ""}">${t.text}</span>`).join("");
    track.innerHTML = bits + bits;
    // 动画默认 40s 走完一半；内容短的时候会慢得像卡住，按实际宽度定速
    const half = track.scrollWidth / 2;
    if (half > 0) track.style.animationDuration = `${Math.max(6, half / TICKER_SPEED)}s`;
  }
  function pushLive(who, rod, fish, gold) {
    tickerLines = [{ text: liveLine(who, rod, fish, gold), hot: gold >= 8000 }, ...tickerLines].slice(0, TICKER_KEEP);
    renderTicker();
  }
  function seedTicker() {
    tickerLines = Array.from({ length: TICKER_KEEP }, fakeLive);
    renderTicker();
  }
  function tickLive(dt) {
    tickerAcc += dt;
    if (tickerAcc < 3.2) return;
    tickerAcc = 0;
    tickerLines = tickerLines.concat(fakeLive()).slice(-TICKER_KEEP);
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

  /* ============================ 音频 ============================
     两层实现：
     1) 真实音效（assets/sfx/*.ogg）——来自 Kenney（CC0）与 OpenGameArt「40 CC0 water /
        splash / slime SFX」「100 CC0 SFX #1/#2」，全部 CC0，可商用、署名非强制。
        预加载成 AudioBuffer，播放走 BufferSource，延迟低、可精确控音量。
     2) 合成兜底（下面的 tone/noiseHit 与 sfx.* 合成实现）——文件没加载成功时用，
        保证任何环境下游戏都不会变哑。
     环境层用真实循环音（海浪/雨/气泡）交叉淡入淡出。
     重要：移动端（iOS Safari）必须在用户手势里创建/恢复 AudioContext，
     否则一直是 suspended，整个游戏没声音——所以有 unlockAudio()。 */
  let audio = null;
  let masterGain = null;
  let ambGain = null;
  let noiseBuf = null;
  let ambLayers = {};       // 环境层：{ key: { src, gain, filter } }
  let ambKey = "";
  /* 注意：SND 必须在这里就声明。bind() 里的 kickLoad / unlock 闭包会引用它，
     而 bind() 在启动阶段就执行——如果声明放到后面会撞「暂时性死区」(TDZ)，
     启动直接中断、requestAnimationFrame(loop) 永远排不上，
     表现就是整个游戏卡死：画布空白、倒计时不走、且不报明显错误。
     这个坑我踩过一次，别再把 SND 往后挪。 */
  const SND = { on: true, unlockTried: false, quietClick: false };

  // ---- 真实音效清单：逻辑名 -> [文件名, 音量] ----
  const SFX_FILES = {
    ui_click: ["ui_click.ogg", 0.32],
    ui_click_soft: ["ui_click_soft.ogg", 0.26],
    ui_select: ["ui_select.ogg", 0.34],
    ui_select_alt: ["ui_select_alt.ogg", 0.3],
    ui_confirm: ["ui_confirm.ogg", 0.4],
    ui_confirm_big: ["ui_confirm_big.ogg", 0.45],
    ui_error: ["ui_error.ogg", 0.34],
    ui_deny: ["ui_deny.ogg", 0.34],
    ui_open: ["ui_open.ogg", 0.34],
    ui_close: ["ui_close.ogg", 0.32],
    ui_switch_on: ["ui_switch_on.ogg", 0.3],
    ui_switch_off: ["ui_switch_off.ogg", 0.3],
    ui_back: ["ui_back.ogg", 0.34],
    ui_drop: ["ui_drop.ogg", 0.4],
    ui_reel: ["ui_reel.ogg", 0.22],
    ui_scratch: ["ui_scratch.ogg", 0.4],
    ui_bong: ["ui_bong.ogg", 0.42],
    ui_pluck: ["ui_pluck.ogg", 0.34],
    ui_maximize: ["ui_maximize.ogg", 0.36],
    ui_minimize: ["ui_minimize.ogg", 0.32],
    water_splash_sm: ["water_splash_sm.ogg", 0.5],
    water_splash_md: ["water_splash_md.ogg", 0.6],
    water_splash_big: ["water_splash_big.ogg", 0.7],
    water_splash_cast: ["water_splash_cast.ogg", 0.55],
    water_bubble_1: ["water_bubble_1.ogg", 0.35],
    water_bubble_2: ["water_bubble_2.ogg", 0.35],
    water_bubble_3: ["water_bubble_3.ogg", 0.35],
    water_struggle_1: ["water_struggle_1.ogg", 0.5],
    water_struggle_2: ["water_struggle_2.ogg", 0.5],
    water_struggle_3: ["water_struggle_3.ogg", 0.5],
    water_struggle_4: ["water_struggle_4.ogg", 0.5],
    water_land_1: ["water_land_1.ogg", 0.6],
    water_land_2: ["water_land_2.ogg", 0.6],
    water_plop: ["water_plop.ogg", 0.5],
    water_plop2: ["water_plop2.ogg", 0.5],
    impact_soft: ["impact_soft.ogg", 0.5],
    impact_wet: ["impact_wet.ogg", 0.5],
    impact_wood: ["impact_wood.ogg", 0.55],
    impact_metal: ["impact_metal.ogg", 0.45],
    impact_stone: ["impact_stone.ogg", 0.5],
    impact_hit: ["impact_hit.ogg", 0.45],
    impact_slam: ["impact_slam.ogg", 0.5],
    impact_glass: ["impact_glass.ogg", 0.4],
    comp_ready: ["comp_ready.ogg", 0.4],
    comp_power1: ["comp_power1.ogg", 0.4],
    comp_pep1: ["comp_pep1.ogg", 0.4],
    comp_pep2: ["comp_pep2.ogg", 0.4],
    comp_pep3: ["comp_pep3.ogg", 0.4],
    comp_high_up: ["comp_high_up.ogg", 0.4],
    comp_high_down: ["comp_high_down.ogg", 0.38],
    comp_phaser_up1: ["comp_phaser_up1.ogg", 0.42],
    comp_phaser_up2: ["comp_phaser_up2.ogg", 0.42],
    comp_phaser_dn1: ["comp_phaser_dn1.ogg", 0.4],
    comp_laser1: ["comp_laser1.ogg", 0.35],
    comp_laser5: ["comp_laser5.ogg", 0.35],
    comp_low_three: ["comp_low_three.ogg", 0.4],
    comp_phase_jump1: ["comp_phase_jump1.ogg", 0.38],
    comp_phase_jump3: ["comp_phase_jump3.ogg", 0.38],
    comp_zap1: ["comp_zap1.ogg", 0.35],
    comp_twotone: ["comp_twotone.ogg", 0.38],
  };
  // 环境层素材：逻辑名 -> [文件名, 音量]
  const AMB_FILES = {
    amb_water_01: ["amb_water_01.ogg", 0.42],
    amb_water_02: ["amb_water_02.ogg", 0.34],
    amb_water_03: ["amb_water_03.ogg", 0.34],
    amb_rain: ["amb_rain.ogg", 0.4],
    amb_bubbles_1: ["amb_bubbles_1.ogg", 0.26],
    amb_bubbles_2: ["amb_bubbles_2.ogg", 0.26],
    amb_v2_water_01: ["amb_v2_water_01.ogg", 0.36],
    amb_v2_water_02: ["amb_v2_water_02.ogg", 0.36],
    amb_v2_water_03: ["amb_v2_water_03.ogg", 0.36],
    amb_v2_amb_01: ["amb_v2_amb_01.ogg", 0.3],
    amb_v2_amb_02: ["amb_v2_amb_02.ogg", 0.3],
    amb_v2_amb_03: ["amb_v2_amb_03.ogg", 0.3],
    amb_v2_amb_04: ["amb_v2_amb_04.ogg", 0.3],
    amb_thunder: ["amb_thunder.ogg", 0.5],
  };
  const SFX_BASE = "assets/sfx/";
  const clips = new Map();          // 逻辑名 -> { buf, vol }
  let clipsReady = 0;
  let clipsWanted = 0;

  /* 读本地音频文件。
     ⚠ 关键结论（实测过）：file:// 直开时 Chrome 把本地文件当跨域，
       fetch / XHR(arraybuffer) / XHR(blob) 三种方式**全部被拦**（fetch: Failed to fetch，
       XHR: status 0 + onerror）。唯一能读到本地 OGG 的途径是 HTMLAudioElement
       （loadedmetadata 正常触发，duration 也对）。
     所以：http(s) 环境用 fetch + decodeAudioData（延迟低、可精确控音量）；
           file:// 环境回退到 <audio> 元素池（能出声，音量靠 element.volume）。
     这条不能想当然，改之前先想清楚在哪种协议下跑。 */
  const isFileProto = location.protocol === "file:";
  const audioPool = new Map();     // file:// 模式：音效元素池（一拍一播，可复用）
  const ambPool = new Map();       // file:// 模式：环境层模板元素（播放时克隆，避免与音效争用）
  let fileMode = false;
  const FILE_MASTER = 0.9;         // file:// 模式下的总音量系数（<audio> 各自音量相乘）
  // 只读诊断信息，方便在控制台确认音效到底加载了多少 / 走的哪条路径
  const sndInfo = {};
  window.__snd = sndInfo;

  function loadViaAudioEl(name, def, pool) {
    const el = new Audio(SFX_BASE + def[0]);
    el.preload = "auto";
    pool.set(name, el);
    clipsReady++;
    sndInfo.ready = clipsReady;
  }

  function loadClips() {
    const a = ac();
    if (!a) return;
    const names = [...Object.keys(SFX_FILES), ...Object.keys(AMB_FILES)];
    clipsWanted = names.length;
    sndInfo.wanted = clipsWanted;
    sndInfo.mode = isFileProto ? "audio-element" : "webaudio";
    // file://：直接用 <audio>，不用也不能用 fetch/XHR
    if (isFileProto) {
      fileMode = true;
      Object.keys(SFX_FILES).forEach((n) => loadViaAudioEl(n, SFX_FILES[n], audioPool));
      Object.keys(AMB_FILES).forEach((n) => loadViaAudioEl(n, AMB_FILES[n], ambPool));
      return;
    }
    names.forEach(async (name) => {
      const def = SFX_FILES[name] || AMB_FILES[name];
      try {
        const res = await fetch(SFX_BASE + def[0], { cache: "force-cache" });
        if (!res.ok) return;
        const buf = await a.decodeAudioData(await res.arrayBuffer());
        clips.set(name, { buf, vol: def[1] });
        clipsReady++;
        sndInfo.ready = clipsReady;
      } catch (_) { /* 单个失败不影响整体，播放时回退合成音 */ }
    });
  }

  // 播放真实音效；返回 false 表示没有素材（调用方回退到合成音）
  // 统一的总音量/静音应用：Web Audio 模式改 masterGain，
  // file:// 模式必须逐个改 <audio> 元素（没有全局增益节点）。
  /* ============================ 背景音乐 ============================
     每种天气 / 异象一段，全部来自 OpenGameArt 的 CC0 曲目（可商用、署名非强制），
     清单见 assets/music/CREDITS.md。切换用双元素交叉淡入淡出（不叠加多首，省内存）。
     和音效一样，file:// 与 http(s) 都用 <audio>：音乐不需要精确调度，
     元素方式反而最省事（不用把几 MB 解码进内存）。 */
  const MUSIC_VOL = 0.34;                 // 背景音乐相对音量（压低，别盖过音效）
  const MUSIC_FILES = {
    clear: "clear.ogg",
    overcast: "overcast.mp3",
    wind: "wind.mp3",
    rain: "rain.ogg",
    heat: "heat.ogg",
    fog: "fog.mp3",
    frog: "frog.wav",
    glow: "glow.mp3",
    gold: "gold.ogg",
  };
  const MUSIC_BASE = "assets/music/";
  const music = { key: "", playing: [], on: true, gen: 0, info: {} };
  const dbg = {};               // 只读运行状态快照，供 window.__dbg() 排查问题
  window.__dbg = () => dbg;
  // 只读诊断：能在控制台直接看当前曲目 / 播放进度 / 几个元素在播
  /* 只读诊断：控制台 __music 可看当前曲目 / 进度 / 音量 */
  const musicCurrent = () => musicEls.get(music.key) || null;
  Object.defineProperty(music.info, "time", { get() { const L = musicCurrent(); return L ? +L.el.currentTime.toFixed(2) : 0; } });
  Object.defineProperty(music.info, "paused", { get() { const L = musicCurrent(); return L ? L.el.paused : true; } });
  Object.defineProperty(music.info, "vol", { get() { const L = musicCurrent(); return L ? +L.el.volume.toFixed(2) : 0; } });
  window.__music = music.info;

  function musicTargetVol() {
    return (music.on && SND.on) ? MUSIC_VOL : 0;
  }

  /* 每个天气一个**常驻**播放元素：创建起就一直播着，切换只改音量（交叉淡入淡出）。
     为什么不每次新建元素再 play()：实测 file:// 下会偶发"play() 后一直 paused"，
     因为新建/seek/pause 会让 readyState 退回加载中，起播时机不可控；
     常驻元素一开始就进入稳定播放，切曲只动 volume，最可靠。
     代价是 9 首同时存在（由浏览器管理解码），换来的是不出错。 */
  const musicEls = new Map();      // key -> { el, want }
  function musicEl(key) {
    let L = musicEls.get(key);
    if (L) return L;
    if (!MUSIC_FILES[key]) return null;
    try {
      const el = new Audio(MUSIC_BASE + MUSIC_FILES[key]);
      el.loop = true;
      el.preload = "auto";
      el.volume = 0;
      L = { el, want: 0 };
      musicEls.set(key, L);
      const p = el.play();
      if (p && p.catch) p.catch(() => {});
    } catch (_) { return null; }
    return L;
  }
  // 错峰把 9 首曲子都起起来（各自 0 音量），切曲时就不用等加载了
  function preloadMusic() {
    const keys = Object.keys(MUSIC_FILES);
    let i = 0;
    const next = () => {
      if (i >= keys.length) { music.info.preloaded = musicEls.size; return; }
      musicEl(keys[i]);
      i++;
      music.info.preloaded = musicEls.size;
      setTimeout(next, 900);
    };
    next();
  }

  /* 交叉淡入淡出：只改音量，不碰播放状态 */
  function fadeEls() {
    const gen = music.gen;
    let i = 0;
    const iv = setInterval(() => {
      if (gen !== music.gen) { clearInterval(iv); return; }
      i++;
      musicEls.forEach((L, k) => {
        const goal = (k === music.key) ? L.want : 0;
        L.el.volume = Math.max(0, Math.min(1, L.el.volume + (goal - L.el.volume) * 0.18));
      });
      if (i >= 24) clearInterval(iv);
    }, 55);
  }

  function playMusic(key) {
    if (key === music.key) return;
    if (!MUSIC_FILES[key]) return;
    music.key = key;
    music.gen++;
    const target = musicTargetVol();
    Object.keys(MUSIC_FILES).forEach((k) => {
      const L = musicEls.get(k);
      if (L) L.want = (k === key) ? target : 0;
    });
    const L = musicEl(key);
    if (L) {
      L.want = target;
      if (target > 0 && L.el.paused) { const p = L.el.play(); if (p && p.catch) p.catch(() => {}); }
    }
    fadeEls();
    music.info.key = key;
  }

  function stopMusic() {
    music.gen++;
    music.key = "";
    musicEls.forEach((L) => { L.want = 0; try { L.el.volume = 0; L.el.pause(); } catch (_) {} });
  }

  // 跟随当前天气/异象换曲
  function syncMusic(wid) {
    if (!music.on) return;
    if (!MUSIC_FILES[wid]) return;
    playMusic(wid);
  }

  function applyMasterVolume() {
    const on = SND.on;
    if (masterGain) masterGain.gain.value = on ? 0.9 : 0;
    // 背景音乐跟着总开关走：所有常驻元素一起淡到位
    const mt = musicTargetVol();
    musicEls.forEach((L, k) => { L.want = (k === music.key) ? mt : 0; L.el.volume = Math.max(0, Math.min(1, mt)); });
    if (fileMode) {
      audioPool.forEach((el, name) => {
        const def = SFX_FILES[name] || AMB_FILES[name];
        try { el.volume = Math.max(0, Math.min(1, def[1] * FILE_MASTER * (on ? 1 : 0))); } catch (_) {}
      });
      if (!on) Object.keys(ambLayers).forEach((k) => ambSetVol(ambLayers[k], 0));
    }
  }

  function play(name, opt = {}) {
    if (!SND.on) return true;
    // file:// 模式：<audio> 元素池。不能叠加播放，所以同一个音效打断重播即可，
    // 这对短音效（点击/水花/咬钩）听感完全够用。
    if (fileMode) {
      const el = audioPool.get(name);
      if (!el) return false;
      const def = SFX_FILES[name] || AMB_FILES[name];
      try {
        el.volume = Math.max(0, Math.min(1, (opt.vol != null ? opt.vol : def[1]) * FILE_MASTER * (SND.on ? 1 : 0)));
        if (opt.rate) el.playbackRate = opt.rate;
        el.currentTime = 0;
        const p = el.play();
        if (p && p.catch) p.catch(() => {});
      } catch (_) {}
      return true;
    }
    const a = ac();
    const c = clips.get(name);
    if (!a || !c) return !!c;
    try {
      const src = a.createBufferSource();
      src.buffer = c.buf;
      src.playbackRate.value = opt.rate || 1;
      const g = a.createGain();
      g.gain.value = (opt.vol != null ? opt.vol : c.vol);
      src.connect(g);
      g.connect(opt.dest || masterGain);
      src.start(a.currentTime + (opt.delay || 0));
      return true;
    } catch (_) { return false; }
  }
  // 随机挑一个变体，避免重复听感
  function playAny(names, opt) {
    return play(names[Math.floor(Math.random() * names.length)], opt);
  }

  function ac() {
    if (audio) return audio;
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      audio = new Ctor();
      masterGain = audio.createGain();
      masterGain.gain.value = SND.on ? 0.9 : 0;
      masterGain.connect(audio.destination);
      ambGain = audio.createGain();
      ambGain.gain.value = 0.5;
      ambGain.connect(masterGain);
    } catch (_) { audio = null; }
    return audio;
  }

  // 在第一次用户手势时调用（pointerdown / keydown / click 都行）
  function unlockAudio() {
    const a = ac();
    if (!a) return;
    SND.unlockTried = true;
    if (a.state === "suspended") a.resume().catch(() => {});
  }

  // 一次性生成的噪声缓冲，做水花/卷线/风/雨都靠它
  function noise() {
    const a = ac();
    if (!a) return null;
    if (noiseBuf) return noiseBuf;
    const len = Math.floor(a.sampleRate * 2);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;          // 一点点布朗成分，听起来更像水/风
      d[i] = white * 0.7 + last * 3;
    }
    noiseBuf = buf;
    return buf;
  }

  function envGain(a, t0, atk, hold, rel, peak) {
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + atk);
    g.gain.setValueAtTime(peak, t0 + atk + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + atk + hold + rel);
    return g;
  }

  function tone(freq, dur, type = "sine", vol = 0.05, opt = {}) {
    const a = ac();
    if (!a || !SND.on) return;
    try {
      const t0 = a.currentTime + (opt.delay || 0);
      const o = a.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      if (opt.to) o.frequency.exponentialRampToValueAtTime(Math.max(20, opt.to), t0 + dur);
      if (opt.detune) o.detune.setValueAtTime(opt.detune, t0);
      const g = a.createGain();
      const out = opt.dest || masterGain;
      if (opt.filter) {
        const f = a.createBiquadFilter();
        f.type = opt.filter;
        f.frequency.value = opt.cutoff || 1200;
        if (opt.q) f.Q.value = opt.q;
        o.connect(g); g.connect(f); f.connect(out);
      } else {
        o.connect(g); g.connect(out);
      }
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + (opt.atk || 0.008));
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch (_) {}
  }

  function noiseHit(dur, vol, opt = {}) {
    const a = ac();
    const buf = noise();
    if (!a || !buf || !SND.on) return;
    try {
      const t0 = a.currentTime + (opt.delay || 0);
      const src = a.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = opt.rate || 1;
      const f = a.createBiquadFilter();
      f.type = opt.type || "lowpass";
      f.frequency.setValueAtTime(opt.cutoff || 1400, t0);
      if (opt.cutoffTo) f.frequency.exponentialRampToValueAtTime(Math.max(60, opt.cutoffTo), t0 + dur);
      if (opt.q) f.Q.value = opt.q;
      const g = envGain(a, t0, opt.atk || 0.006, opt.hold || 0, opt.rel || dur, vol);
      src.connect(f); f.connect(g); g.connect(opt.dest || masterGain);
      src.start(t0);
      src.stop(t0 + dur + 0.05);
    } catch (_) {}
  }

  /* ---- 环境层：海浪 + 按天气叠加 ---- */
  function ambLayer(key, cfg) {
    const a = ac();
    if (!a) return null;
    const src = a.createBufferSource();
    src.buffer = noise();
    src.loop = true;
    src.playbackRate.value = cfg.rate || 1;
    const f = a.createBiquadFilter();
    f.type = cfg.type || "lowpass";
    f.frequency.value = cfg.cutoff || 500;
    if (cfg.q) f.Q.value = cfg.q;
    const g = a.createGain();
    g.gain.value = 0.0001;
    src.connect(f); f.connect(g); g.connect(ambGain);
    src.start();
    return { src, gain: g, filter: f, vol: cfg.vol || 0.05, lfo: cfg.lfo || 0 };
  }

  /* ---- 环境层：优先真实循环录音（海浪/雨/气泡），没有素材时回退合成噪声 ---- */
  function ambLayerReal(key, cfg) {
    const vol = (cfg && cfg.vol) || 0.3;
    // file:// 模式：<audio> loop + 代码做淡入淡出。
    // 必须克隆，否则会和音效共用同一个元素互相打断。
    if (fileMode) {
      const tpl = ambPool.get(key);
      if (!tpl) return null;
      const el = tpl.cloneNode(true);
      el.loop = true;
      el.preload = "auto";
      el.volume = 0;
      if (cfg && cfg.rate) el.playbackRate = Math.max(0.5, Math.min(2, cfg.rate));
      const p = el.play();
      if (p && p.catch) p.catch(() => {});
      return { el, cur: 0, vol, real: true };
    }
    const a = ac();
    const c = clips.get(key);
    if (!a || !c) return ambLayer(key, cfg);
    const src = a.createBufferSource();
    src.buffer = c.buf;
    src.loop = true;
    const g = a.createGain();
    g.gain.value = 0.0001;
    src.connect(g);
    g.connect(ambGain);
    src.start();
    return { src, gain: g, vol, real: true };
  }

  // 统一的环境层音量/淡出控制，屏蔽两种实现（BufferSource / <audio>）的差异
  function ambSetVol(L, v) {
    const t = Math.max(0, Math.min(1, v));
    if (L.el) { L.cur = t; L.el.volume = t; }
    else if (L.gain) L.gain.gain.value = t;
  }
  function ambGetVol(L) { return L.el ? L.cur : (L.gain ? L.gain.gain.value : 0); }
  function ambFadeOut(L, now, secs) {
    if (L.el) {
      const from = L.cur, steps = 18;
      for (let i = 1; i <= steps; i++) {
        setTimeout(() => { if (L.el.isConnected !== false) L.el.volume = Math.max(0, from * (1 - i / steps)); }, (secs * 1000 * i) / steps);
      }
      setTimeout(() => { try { L.el.pause(); } catch (_) {} }, secs * 1000 + 60);
    } else if (L.gain) {
      try {
        L.gain.gain.cancelScheduledValues(now);
        L.gain.gain.setValueAtTime(L.gain.gain.value, now);
        L.gain.gain.linearRampToValueAtTime(0.0001, now + secs);
        setTimeout(() => { try { L.src.stop(); } catch (_) {} }, secs * 1000 + 100);
      } catch (_) {}
    }
  }

  /* 把 key 映射到真实循环素材；缺哪个就退回合成层名 */
  function ambPlan(w) {
    const plan = [["amb_water_01", { vol: 0.4 }]];                       // 基底：海浪
    if (w === "clear") plan.push(["amb_v2_water_02", { vol: 0.3 }]);
    if (w === "overcast") plan.push(["amb_v2_amb_01", { vol: 0.28 }]);
    if (w === "wind") plan.push(["amb_v2_amb_03", { vol: 0.42 }]);
    if (w === "rain") { plan.push(["amb_rain", { vol: 0.4 }]); plan.push(["amb_v2_water_03", { vol: 0.24 }]); }
    if (w === "heat") plan.push(["amb_v2_amb_02", { vol: 0.22 }]);
    if (w === "fog") plan.push(["amb_bubbles_1", { vol: 0.2 }]);
    if (w === "frog") plan.push(["amb_bubbles_2", { vol: 0.24 }]);
    if (w === "glow") { plan.push(["amb_bubbles_1", { vol: 0.26 }]); plan.push(["amb_v2_amb_04", { vol: 0.2 }]); }
    if (w === "gold") plan.push(["amb_v2_amb_04", { vol: 0.3 }]);
    return plan;
  }

  function setAmbient(key, w) {
    if (!ac()) return;
    if (key === ambKey) return;
    if (fileMode && audioPool.size === 0) return;    // 素材还没就绪
    ambKey = key;
    const now = audio ? audio.currentTime : 0;
    Object.keys(ambLayers).forEach((k) => {
      try { ambFadeOut(ambLayers[k], now, 0.9); } catch (_) {}
    });
    ambLayers = {};
    if (!SND.on) return;
    ambPlan(w).forEach(([k, cfg]) => {
      const L = ambLayerReal(k, cfg);
      if (!L) return;
      ambLayers[k] = L;
      if (L.el) {
        // <audio> 没有自动化参数，用短定时器做淡入
        const target = L.vol;
        let v = 0;
        const steps = 16;
        const iv = setInterval(() => {
          v += target / steps;
          if (v >= target) { v = target; clearInterval(iv); }
          ambSetVol(L, v);
        }, 80);
      } else {
        L.gain.gain.setValueAtTime(0.0001, now);
        L.gain.gain.linearRampToValueAtTime(L.vol, now + 1.3);
      }
    });
  }

  // 合成兜底用的层参数（真实素材缺失时才会用到）
  function ambForWeather(w) {
    const base = ["surf", { type: "lowpass", cutoff: 420, rate: 0.55, vol: 0.06, q: 0.7 }];
    const layers = [base];
    if (w === "overcast") layers.push(["wind", { type: "bandpass", cutoff: 620, q: 0.6, rate: 0.8, vol: 0.035 }]);
    if (w === "wind") layers.push(["wind", { type: "bandpass", cutoff: 780, q: 0.5, rate: 1.05, vol: 0.09 }]);
    if (w === "rain") layers.push(["rain", { type: "highpass", cutoff: 1800, rate: 1.15, vol: 0.065 }]);
    if (w === "fog") layers.push(["deep", { type: "lowpass", cutoff: 240, rate: 0.4, vol: 0.05 }]);
    if (w === "heat") layers.push(["hiss", { type: "highpass", cutoff: 3200, rate: 0.9, vol: 0.026 }]);
    if (w === "frog") layers.push(["frog", { type: "bandpass", cutoff: 260, q: 1.4, rate: 0.5, vol: 0.035 }]);
    if (w === "glow") layers.push(["deep", { type: "lowpass", cutoff: 300, rate: 0.5, vol: 0.055 }]);
    if (w === "gold") layers.push(["deep", { type: "lowpass", cutoff: 320, rate: 0.45, vol: 0.045 }]);
    return layers;
  }

  /* ---- 音效：优先真实录音，缺失时回退到合成 ----
     每个方法第一行 `if (play(...)) return;` 就是"有素材就用素材"。 */
  const sfx = {
    // 抛竿：渔线出线的"唰"
    cast() {
      if (play("ui_scratch", { vol: 0.45 })) { play("water_splash_sm", { vol: 0.18, delay: 0.16 }); return; }
      noiseHit(0.26, 0.075, { type: "bandpass", cutoff: 2600, cutoffTo: 700, q: 1.1, rate: 1.2 });
      tone(760, 0.12, "triangle", 0.035, { to: 320, filter: "bandpass", cutoff: 1600 });
    },
    // 入水：水花 + 气泡
    splash(power = 1) {
      if (power > 1.35) { if (play("water_splash_big", { vol: 0.5 + power * 0.12 })) { play("water_bubble_1", { delay: 0.12 }); return; } }
      else if (play("water_splash_md", { vol: 0.42 + power * 0.14 })) { play("water_bubble_2", { delay: 0.1 }); return; }
      noiseHit(0.34, 0.1 * power, { type: "lowpass", cutoff: 2400, cutoffTo: 320, q: 0.8 });
      noiseHit(0.14, 0.05 * power, { type: "highpass", cutoff: 1600, delay: 0.02 });
      tone(180, 0.22, "sine", 0.05 * power, { to: 80 });
    },
    // 等待中的水面轻拍
    idleWater() {
      if (playAny(["water_plop", "water_bubble_3", "water_splash_sm"], { vol: 0.16 })) return;
      noiseHit(0.18, 0.014, { type: "lowpass", cutoff: 700, cutoffTo: 400 });
    },
    // 咬钩：竿尖一顿 + 浮漂下沉
    bite() {
      if (play("ui_drop", { vol: 0.5 })) return;
      tone(1180, 0.05, "square", 0.05);
      tone(620, 0.14, "triangle", 0.055, { to: 300, delay: 0.03 });
    },
    // 拉扯：渔线张力（合成更贴切，真实素材里没有单独的线张力）
    tug() {
      tone(140, 0.2, "sawtooth", 0.05, { to: 260, filter: "lowpass", cutoff: 700 });
      tone(96, 0.26, "square", 0.035, { to: 180, delay: 0.04, filter: "lowpass", cutoff: 500 });
    },
    // 鱼挣扎：真实拍水声（随机变体，避免重复）
    struggle() {
      if (playAny(["water_struggle_1", "water_struggle_2", "water_struggle_3", "water_struggle_4"], { vol: 0.42, rate: 0.94 + Math.random() * 0.14 })) return;
      noiseHit(0.16, 0.05, { type: "bandpass", cutoff: 760, q: 1.8 });
    },
    // 收线：棘轮（真实素材是短促的卷动声）
    reel(step = 0, speed = 1) {
      if (play("ui_reel", { vol: 0.16, rate: 1.25 + (step % 3) * 0.09 })) return;
      noiseHit(0.045, 0.03, { type: "bandpass", cutoff: 1800 + (step % 3) * 260, q: 6 });
    },
    // 入舱：鱼尾拍水 + 甲板扑腾
    land(rarity = 1) {
      if (playAny(["water_land_1", "water_land_2"], { vol: 0.55 })) {
        const n = Math.min(3, rarity);
        for (let i = 0; i < n; i++) play("impact_wet", { vol: 0.22, delay: 0.12 + i * 0.13, rate: 0.95 + i * 0.06 });
        return;
      }
      noiseHit(0.2, 0.085, { type: "lowpass", cutoff: 1500, cutoffTo: 320 });
    },
    // 脱钩：线一松
    slip() {
      if (play("ui_back", { vol: 0.5 })) { play("comp_high_down", { vol: 0.22, delay: 0.05 }); return; }
      tone(420, 0.3, "sawtooth", 0.05, { to: 90, filter: "lowpass", cutoff: 900 });
    },
    // 杂物：闷响
    junk() {
      if (playAny(["impact_stone", "impact_wood", "impact_soft"], { vol: 0.42 })) return;
      tone(150, 0.18, "square", 0.045, { to: 90, filter: "lowpass", cutoff: 600 });
    },
    // 收获"叮"，音高随品质上升
    reward(rarity = 1) {
      if (rarity >= 3) { if (play("ui_confirm_big", { vol: 0.45, rate: 0.96 + rarity * 0.03 })) return; }
      if (play("ui_confirm", { vol: 0.38, rate: 0.92 + rarity * 0.08 })) {
        if (rarity >= 2) play("comp_high_up", { vol: 0.2, delay: 0.08 });
        return;
      }
      const base = 620 + rarity * 90;
      tone(base, 0.16, "triangle", 0.05);
    },
    // 传说级：上行琶音
    fanfare() {
      if (play("comp_pep2", { vol: 0.5 })) {
        play("comp_phaser_up2", { vol: 0.32, delay: 0.1 });
        play("ui_bong", { vol: 0.3, delay: 0.24 });
        return;
      }
      [0, 4, 7, 12, 16].forEach((s, i) => tone(523.25 * Math.pow(2, s / 12), 0.5, "triangle", 0.05, { delay: i * 0.075 }));
    },
    // 声呐暴击：扫频
    sonar() {
      if (play("comp_phaser_up1", { vol: 0.5 })) { play("comp_laser5", { vol: 0.24, delay: 0.1 }); return; }
      tone(320, 0.5, "sine", 0.045, { to: 2400, filter: "bandpass", cutoff: 1800, q: 1.4 });
    },
    // 金币：小额
    coin() {
      if (play("ui_select", { vol: 0.36 })) return;
      tone(1180, 0.06, "square", 0.04);
    },
    // 大奖：密集 + 铜钟余韵
    jackpot() {
      if (play("ui_bong", { vol: 0.55 })) {
        for (let i = 0; i < 6; i++) play("ui_confirm", { vol: 0.26, delay: 0.05 + i * 0.06, rate: 1 + i * 0.05 });
        play("comp_pep3", { vol: 0.4, delay: 0.3 });
        return;
      }
      for (let i = 0; i < 8; i++) tone(880 + i * 120, 0.12, "square", 0.03, { delay: i * 0.055 });
    },
    // 升级 / 通行证 / 签到奖励
    levelup() {
      if (play("comp_power1", { vol: 0.45 })) { play("comp_pep1", { vol: 0.35, delay: 0.16 }); return; }
      [0, 5, 9, 12].forEach((s, i) => tone(392 * Math.pow(2, s / 12), 0.4, "triangle", 0.045, { delay: i * 0.08 }));
    },
    // UI：按下 / 切换
    click() { if (play("ui_click", { vol: 0.3 })) return; tone(560, 0.035, "square", 0.028); },
    clickSoft() { if (play("ui_click_soft", { vol: 0.24 })) return; tone(500, 0.03, "square", 0.022); },
    toggleOn() { if (play("ui_switch_on", { vol: 0.34 })) return; tone(520, 0.05, "square", 0.03); },
    toggleOff() { if (play("ui_switch_off", { vol: 0.34 })) return; tone(360, 0.08, "square", 0.022); },
    // 倒计时紧迫
    tick() { if (play("ui_click_soft", { vol: 0.22, rate: 1.5 })) return; tone(1500, 0.04, "square", 0.035); },
    // 打开 / 关闭面板
    open() { if (play("ui_open", { vol: 0.36 })) return; tone(420, 0.08, "triangle", 0.035); },
    close() { if (play("ui_close", { vol: 0.34 })) return; tone(500, 0.07, "triangle", 0.03); },
    // 金币不足 / 操作被拒
    deny() { if (play("ui_deny", { vol: 0.4 })) return; tone(200, 0.16, "square", 0.04); },
    error() { if (play("ui_error", { vol: 0.4 })) return; tone(180, 0.18, "sawtooth", 0.04); },
    // 购买
    buy() { if (play("ui_select_alt", { vol: 0.38 })) return; tone(640, 0.08, "triangle", 0.04); },
    buyBig() { if (play("impact_slam", { vol: 0.46 })) { play("ui_confirm_big", { vol: 0.34, delay: 0.08 }); return; } tone(280, 0.2, "sawtooth", 0.05); },
    // 自动玩开始
    autoStart() { if (play("comp_ready", { vol: 0.45 })) return; [0, 7, 12].forEach((s, i) => tone(523.25 * Math.pow(2, s / 12), 0.16, "triangle", 0.04, { delay: i * 0.06 })); },
  };

  // 兼容旧调用：beep(freq, dur, type, gain)
  function beep(freq, dur, type = "sine", gain = 0.04) {
    tone(freq, dur, type, gain);
  }


  /* 数字千分位格式化。
     原来用 Number.toLocaleString("en-US")——它每次调用都要新建 ICU formatter，
     实测是 Profiler 里游戏函数自身耗时的第一名；奖池滚动每帧要格式 4 次，
     加上分数/金币/宝石等一共十几次。改成复用一个 Intl.NumberFormat 实例，
     快一个数量级，而且避免了逐帧无谓的格式分配。 */
  const NF = new Intl.NumberFormat("en-US");
  function fmt(n) {
    return NF.format(Math.floor(n));
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
      bumpGrad();                    // 配色变了，渐变缓存作废
    }
    const stage = $("stage");
    // 只在真的变了才写 dataset，避免每帧都碰 DOM
    if (stage && stage.dataset.wx !== id) stage.dataset.wx = id;
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
    // 气泡分两行：第一行=本竿花费 + 饵/租/注拆分，第二行=空钩亏与命中预估
    const parts = `饵 ${meta.freeBait > 0 ? `赠×${meta.freeBait}` : fmt(bait)}${n > 1 && meta.freeBait <= 0 ? `×${n}` : ""} · 租 ${rent <= 0 ? "0" : fmt(rent)} · 注 ${fmt(bet)}${n > 1 ? `×${n}` : ""}`;
    $("cast-total").textContent = (n > 1 ? `${n}线 ${fmt(total)}` : `本竿 ${fmt(total)}`) + " · " + parts;
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
    // 派彩音：1~2 级金币声，3 级以上上行 + 铜钟
    if (tier >= 3) { sfx.fanfare(); sfx.jackpot(); }
    else sfx.coin();
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

  /* 渐变缓存：只在"尺寸 / 天气配色 / 过渡进度"变化时重建。
     createLinearGradient 每帧调用很贵，实测静止时也在每秒重建 120 个。
     注意 mixedLook() 返回的是插值后的颜色对象、不含天气 id，
     所以这里用一个显式的版本号 gradV 来判失效，由天气切换与过渡进度推进。 */
  const gradCache = { v: -1, sky: null, water: null };
  const beamCache = { v: -1, list: null };
  let gradV = 0;
  function bumpGrad() { gradV++; }
  function buildGradients(g, L) {
    const skyH = H * 0.22;
    const sky = g.createLinearGradient(0, 0, 0, skyH);
    sky.addColorStop(0, L.sky[0]);
    sky.addColorStop(0.55, L.sky[1]);
    sky.addColorStop(1, L.sky[2]);
    const water = g.createLinearGradient(0, skyH, 0, H);
    water.addColorStop(0, L.water[0]);
    water.addColorStop(0.22, L.water[1]);
    water.addColorStop(0.55, L.water[2]);
    water.addColorStop(1, L.water[3]);
    gradCache.v = gradV;
    gradCache.sky = sky;
    gradCache.water = water;
  }
  function gradients(g, L) {
    if (gradCache.v !== gradV || !gradCache.sky || !gradCache.water) buildGradients(g, L);
    return gradCache;
  }

  function resize() {
    const stage = $("stage");
    // 用布局尺寸而不是 getBoundingClientRect()：竖屏旋转兜底后，边界框返回的是旋转后的
    // 视觉尺寸（宽高互换），画布会按转过 90° 的比例分配，画面就会歪。
    let w = stage.offsetWidth;
    let h = stage.offsetHeight;
    if (w < 80 || h < 80) {
      const vw = window.innerWidth || 1024;
      const vh = window.innerHeight || 640;
      w = Math.min(vw, vh * 1024 / 640);
      h = Math.min(vh, vw * 640 / 1024);
      stage.style.width = `${w}px`;
      stage.style.height = `${h}px`;
      w = stage.offsetWidth || w;
      h = stage.offsetHeight || h;
    }
    // 画布用布局盒子（像素）而不是 100%：竖屏旋转兜底时 #stage 的百分比高度可能因
    // 包含块高度不确定而失效，100% 会跟着变形。
    // DPR 上限 2：3x 手机上按物理像素渲染等于 4 倍填充量，人眼几乎看不出差别却极吃 CPU。
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    canvas.style.width = `${Math.max(80, w)}px`;
    canvas.style.height = `${Math.max(80, h)}px`;
    canvas.width = Math.floor(Math.max(80, w) * dpr);
    canvas.height = Math.floor(Math.max(80, h) * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = Math.max(80, w);
    H = Math.max(80, h);
    bumpGrad();                    // 尺寸变了，缓存的渐变必须重建
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
    g.fillStyle = gradients(g, L).sky;
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
    g.fillStyle = gradients(g, L).water;
    g.fillRect(0, skyH - 4, W, H - skyH + 8 + (state.camY || 0) + 90);

    if (L.glow > 0.05) {
      g.save();
      g.globalAlpha = 0.12 * L.glow;
      // 光柱渐变按 x 位置缓存，避免每帧为 4 根柱子各建一个渐变
      if (!beamCache.v || beamCache.v !== gradV || !beamCache.list) {
        beamCache.v = gradV;
        beamCache.list = [0, 1, 2, 3].map((i) => {
          const x = W * (0.18 + i * 0.22);
          const b = g.createLinearGradient(x, skyH, x, H);
          b.addColorStop(0, "#7dfff2");
          b.addColorStop(1, "rgba(0,0,0,0)");
          return { x, b };
        });
      }
      for (const { x, b } of beamCache.list) {
        g.fillStyle = b;
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
      sfx.slip();
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
      if (fish.kind === "trash") sfx.junk();
      else if (fish.rarity >= 3) sfx.fanfare();
      else sfx.reward(fish.rarity);
    } else {
      state.combo += 1;
      $("streak").hidden = state.combo < 2;
      $("streak").textContent = `COMBO x${state.combo}`;
      el.classList.add("r" + fish.rarity);
      const cut = state.skipCut ? " · 七成" : "";
      el.innerHTML = `<h3>${fish.name}</h3><p>+${fmt(reward.gold)} 金 · +${fmt(reward.points)} 分${cut}</p>`;
      sfx.land(fish.rarity);                       // 入舱：鱼尾拍水
      if (fish.rarity >= 3) sfx.fanfare();
      else sfx.reward(fish.rarity);
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
    setText($("time"), timeText(state.timeLeft));
    // 最后 10 秒每秒"滴答"催紧（用秒数取整去重，避免每帧都响）
    if (!state.paused && !state.ended) {
      const sec = Math.ceil(state.timeLeft);
      if (sec <= 10 && sec > 0 && sec !== renderHud._lastTick) { renderHud._lastTick = sec; sfx.tick(); }
      if (sec > 10) renderHud._lastTick = null;
    }
    const castLabel = $("btn-cast")?.querySelector(".cast-label");
    if (castLabel) {
      setText(castLabel, state.fishing
        ? (state.phase === "swing" ? "抛竿…" : bonusOn() ? "奖励中" : "跳过·七折")
        : bonusOn() ? "奖励关" : "下钩");
    }
    const blocked = state.paused || state.ended || state.helpOpen;
    const canPress = !blocked && (state.fishing ? !bonusOn() : (bonusOn() || (state.gold >= castCost() && baitReady())));
    const castBtn = $("btn-cast");
    if (castBtn.disabled === canPress) castBtn.disabled = !canPress;   // 只在需要时写
    // 自动玩：按钮上显示剩余局数，底部细条显示进度；跑动中禁用其它下注类按钮
    const auto = $("btn-auto");
    if (auto) {
      const a = state.auto;
      const running = a.remaining > 0;
      auto.classList.toggle("on", running);
      // 没在跑显示"10"（点一下会开 10 局）；跑动中显示剩余局数
      setText(auto.querySelector("strong"), running ? a.left : 10);
      auto.style.setProperty("--auto-p", running && a.all ? `${Math.round(((a.all - a.left) / a.all) * 100)}%` : "0%");
      const tip = running ? `自动玩进行中 · 剩 ${a.left} 局 · 点一下加局，点"下钩"停止` : "自动玩 · 点一下开始 10 局";
      if (auto.title !== tip) auto.title = tip;
      if (auto.disabled !== blocked) auto.disabled = blocked;
    }
    const charmBtn = $("btn-charm");
    const charmOff = blocked || state.fishing || state.luckyHook || state.gems < 1;
    if (charmBtn.disabled !== charmOff) charmBtn.disabled = charmOff;
    const sonarBtn = $("btn-sonar");
    const sonarOff = blocked || state.fishing || state.sonar > 0 || state.gems < 1;
    if (sonarBtn.disabled !== sonarOff) sonarBtn.disabled = sonarOff;
    if (state.sonar > 0) {
      sonarBtn.querySelector(".gem-cost")?.classList.add("hidden");
      const st = sonarBtn.querySelector(".sonar-time");
      if (st) { st.classList.remove("hidden"); setText(st, `${Math.ceil(state.sonar)}秒`); }
    } else {
      sonarBtn.querySelector(".gem-cost")?.classList.remove("hidden");
      sonarBtn.querySelector(".sonar-time")?.classList.add("hidden");
    }
    const betOff = blocked || state.fishing || bonusOn();
    const betBtn = $("btn-bet");
    const x3Btn = $("btn-x3");
    if (betBtn.disabled !== betOff) betBtn.disabled = betOff;
    if (x3Btn.disabled !== betOff) x3Btn.disabled = betOff;
    const kNeed = featureCost("kraken");
    const fNeed = featureCost("frenzy");
    const featOff = blocked || state.fishing || bonusOn();
    const kraken = $("btn-kraken");
    const frenzy = $("btn-frenzy");
    if (kraken) { const d = featOff || state.gold < kNeed; if (kraken.disabled !== d) kraken.disabled = d; }
    if (frenzy) { const d = featOff || state.gold < fNeed; if (frenzy.disabled !== d) frenzy.disabled = d; }
    x3Btn.classList.toggle("on", state.multi === 3);
    setText(x3Btn.querySelector("strong"), state.multi === 3 ? "x3" : "x1");
    // ---- 以下几项随金币/分数每秒都在变，放在 dirty 判断之前，用 setText 去重 ----
    setText($("points"), fmt(state.points));
    setText($("gold"), fmt(state.gold));
    setText($("gems"), fmt(state.gems));
    setText($("goal-hud"), `${state.gotRare ? "✓" : "○"} ${Math.min(state.points, GOAL_POINTS)}`);
    setText($("charm-hud"), state.luckyHook ? "开" : "关");
    setText($("wx-hud"), wxLine());
    setText($("bite-hud"), biteHudText());
    const fill = $("sonar-fill");
    if (fill) {
      const w = `${Math.round(state.sonarPow)}%`;
      if (fill.style.width !== w) fill.style.width = w;
    }
    setText($("sonar-txt"), state.critArmed ? "暴击" : `${Math.round(state.sonarPow)}%`);
    const meter = fill && fill.closest(".sonar-meter");
    if (meter) meter.classList.toggle("ready", state.critArmed);
    // 手机上声呐进度条被收进合并按钮里，用 --sonar 让"探鱼"那一半随充能发光
    $("stage").style.setProperty("--sonar", state.critArmed ? 1 : Math.min(1, state.sonarPow / 100));
    if (!state.dirtyHud) return;
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
      // 选中态由 .active 高亮表达，标签只写价格
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
    sfx.bite();                                   // 咬钩：竿尖一顿
    if (found.fish.loot) startFight(line, found.fish);
    else {
      line.phase = "approach";
      line.phaseT = 0;
      $("fight-hint").textContent = "有鱼咬钩！";
      $("fight-hint").classList.remove("hidden", "now");
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
    autoSettle();
    renderHud();
  }

  function settleCast() {
    state.lines.forEach((l) => {
      if (!l.done) finishLine(l);
    });
    settleAll();
  }

  /* 自动玩专用：一次把抛竿 + 咬钩判定 + 结算全部走完。
     手动路径靠 updateLine 推进状态机（下坠→等待咬钩→拉扯→收线），一局要 3~5 秒；
     自动玩如果也走那条路，100 局要八九分钟。这里复用 skipCast 的同一套判定代码
     （ensureLure / findBite / forceLuckyBite / maybeLoot / payout），只是不等动画。
     不设 state.skipCut，免得玩家中途自己点"跳过"时吃到七折惩罚。 */
  function autoSettleRound() {
    if (!state.fishing) return;
    if (state.phase === "swing") {
      state.phase = "busy";
      state.lines.forEach((l) => {
        l.phase = "wait";
        l.hookY = l.hookTarget;
      });
    } else if (state.phase === "idle") {
      return;
    } else {
      state.phase = "busy";           // 无论卡在哪个阶段都强制进结算
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

  /* ---- 自动玩 ----
     一局 = 一次完整的下钩→结算。用 skipCast()（就是那个"跳过·七折"）把等待期快进掉，
     所以自动玩和手动点"跳过"是同一条路径，不会绕开任何概率或结算逻辑。
     每局之间留 520ms，让玩家看得清结果。 */
  const AUTO_STEP_MS = 300;

  /* 自动玩交互（参考常见老虎机的 Auto）：
     点「自动」弹出面板 → 选局数(10/20/50/100) + 加速开关 → 开始。
     跑动中再点「自动」= 加一组同样的局数；想停就点「下钩」（手动接管）或打开任何面板。
     局数会被"金币 ×0.6 ÷ 单局花费"封顶，避免一路跑到金币见底。 */
  function autoCap() {
    const per = Math.max(1, baitReady() ? castCost() : 1);
    return Math.min(200, Math.max(1, Math.floor((state.gold * 0.6) / per)));
  }

  function autoStart() {
    const a = state.auto;
    const cap = autoCap();
    const add = Math.min(a.rounds || 10, cap);
    if (a.remaining > 0) {
      a.remaining += add;
      a.all += add;
      a.left += add;
      toast(`自动玩 +${add} 局 · 剩 ${a.left} 局`);
    } else {
      a.remaining = add;
      a.all = add;
      a.left = add;
      a.hit = 0;
      a.spent = 0;
      a.gold0 = state.gold;
      toast(`自动玩 ${add} 局${a.fast ? " · 加速中" : ""} · 点「下钩」可停`);
    }
    a.wait = 0;
    state.dirtyHud = true;
  }

  function autoStop(reason) {
    const a = state.auto;
    const done = Math.max(0, (a.all || 0) - a.left);
    const net = state.gold - a.gold0;
    a.remaining = 0;
    a.all = 0;
    a.left = 0;
    if (reason) toast(`${reason} · 已跑 ${done} 局 · 命中 ${a.hit} · 净${net >= 0 ? "+" : ""}${fmt(net)} 金`);
    state.dirtyHud = true;
  }

  // 一局结算时记一笔账（净收益 = 结束后金币 - 本局开始前金币）
  function autoSettle() {
    if (!state.auto.remaining) return;
    state.auto.spent += 1;
    if (state.gold > state.auto.gold0) state.auto.hit += 1;
  }

  function autoTick() {
    if (!state.auto.remaining) return;
    // 只剩最后一局且已经打完，收尾
    if (state.auto.left <= 0 && !state.fishing) { autoStop("自动玩完成"); return; }
    // 时间到 / 暂停 / 打开面板 / 金币不够 → 停下并说明原因
    if (state.ended) { autoStop("本局时间到"); return; }
    if (state.paused || state.helpOpen) return;
    if (state.modal) { autoStop("已打开面板"); return; }
    // 顺序很重要：必须先处理"正在钓鱼"，否则 wait 不减（它只在非钓鱼时倒数），
    // 会永远卡在等待分支、走不到结算。
    if (state.fishing) {
      // 奖励关不结算，让它自己跑完
      if (bonusOn()) return;
      // 加速开启：一帧结算；关闭：让状态机自然跑完这一局（看得见下坠/咬钩/收线）
      if (state.auto.fast) autoSettleRound();
      return;
    }
    if (state.auto.wait > 0) { state.auto.wait -= 1 / 60; return; }
    if (!baitReady()) { autoStop(`换${DEPTH_NAME[baitOf().depth]}层船或改用浅饵`); return; }
    // 留一点家底：连两局的钱都不够就停，别把金币耗干净
    if (!bonusOn() && state.gold < castCost() * 2) { autoStop("金币快见底，已停"); return; }
    if (state.timeLeft <= 4) return;      // 快结束了，等这局自然结束
    state.auto.left -= 1;
    state.auto.gold0 = state.gold;
    state.auto.wait = (state.auto.fast ? AUTO_STEP_MS : 900) / 1000;
    onCastPress();
    state.dirtyHud = true;
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
    sfx.sonar();                                   // 声呐：扫频
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
    sfx.cast();                                      // 抛竿：渔线出线
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
        sfx.splash(0.8 + boatOf().depth * 0.1);      // 入水水花
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
    // 环境音：天气/异象变了就换层；收线时棘轮、拉扯时鱼挣扎
    if (audio && !audio.__ambInit) { audio.__ambInit = 1; ambKey = ""; }
    const wxId = state.omenId || WEATHERS[state.wx].id;
    setAmbient(wxId, wxId);
    syncMusic(wxId);
    // 只读诊断：控制台 __dbg() 能看到帧、天气计时、音乐当前曲目，排查换曲问题很方便
    dbg.raf++;
    dbg.wxId = wxId;
    dbg.wxT = +(state.wxT || 0).toFixed(1);
    dbg.wx = WEATHERS[state.wx].name;
    dbg.omen = state.omenId;
    dbg.helpOpen = state.helpOpen;
    dbg.paused = state.paused;
    dbg.ended = state.ended;
    dbg.musicKey = music.key;
    dbg.musicTime = music.info.time;
    dbg.musicPaused = music.info.paused;
    dbg.musicPreloaded = music.info.preloaded;
    dbg.musicOn = music.on;
    dbg.soundOn = SND.on;
    if (state.fishing && !state.paused) {
      const isReel = state.lines.some((l) => !l.done && l.phase === "reel") || state.phase === "reel";
      const isTug = state.lines.some((l) => !l.done && (l.phase === "fight" || l.phase === "approach"));
      if (isReel) {
        loop.__reelAcc = (loop.__reelAcc || 0) + dt;
        if (loop.__reelAcc > 0.085) { loop.__reelAcc = 0; loop.__reelStep = (loop.__reelStep || 0) + 1; sfx.reel(loop.__reelStep, rodOf().reel || 1); }
      } else if (isTug) {
        // 鱼挣扎：真实拍水声，间隔带随机，听起来像活物在挣
        loop.__tugAcc = (loop.__tugAcc || 0) + dt;
        if (loop.__tugAcc > 0.32 + Math.random() * 0.4) { loop.__tugAcc = 0; sfx.struggle(); if (Math.random() < 0.5) sfx.tug(); }
      } else {
        loop.__idleAcc = (loop.__idleAcc || 0) + dt;
        if (loop.__idleAcc > 1.8 + Math.random() * 3.2) { loop.__idleAcc = 0; sfx.idleWater(); }
      }
    }
    if (H < 80 || W < 80) resize();
    syncWeatherLook();
    // 天气过渡期间颜色每帧在变，渐变缓存要跟着失效（过渡只持续约 0.7 秒）
    const blendStep = Math.round((state.wxBlend == null ? 1 : state.wxBlend) * 24);
    if (loop._blendStep !== blendStep) { loop._blendStep = blendStep; bumpGrad(); }
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
    autoTick();
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
    // 移动端必须在用户手势里创建/恢复 AudioContext，否则一直是 suspended（整局没声音）
    const unlock = () => { unlockAudio(); };
    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });
    window.addEventListener("touchstart", unlock, { once: true, capture: true, passive: true });
    // 首次手势时预加载真实音效（file:// 用 <audio>，见 loadViaAudioEl 注释）与首曲
    const kickLoad = () => { ac(); loadClips(); preloadMusic(); };
    window.addEventListener("pointerdown", kickLoad, { once: true, capture: true });
    window.addEventListener("keydown", kickLoad, { once: true, capture: true });
    // 所有按钮统一加一个轻点击声（面板/开关类自己会再叠音效）
    document.addEventListener("pointerdown", (e) => {
      const b = e.target.closest && e.target.closest("button");
      if (b && !b.disabled && !SND.quietClick) sfx.click();
    }, { passive: true });
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
    $("btn-cast").onclick = () => {
      if (state.auto.remaining) { autoStop("已转为手动"); return; }   // 手动接管
      onCastPress();
    };
    if ($("btn-kraken")) $("btn-kraken").onclick = () => buyFeature("kraken");
    $("btn-auto").onclick = () => {
      if (state.paused || state.ended || state.helpOpen) return;
      openAutoPanel();
    };
    /* ---- 自动玩面板 ----
       注意：这里用函数声明（不是 const 箭头函数），因为它被上面的 btn-auto 引用，
       箭头函数会踩暂时性死区（TDZ）直接抛错。 */
    const autoPanel = $("auto-panel");
    let syncAutoPanel = () => {};
    function openAutoPanel() {
      syncAutoPanel();
      autoPanel.classList.remove("hidden");
    }
    function closeAutoPanel() { autoPanel.classList.add("hidden"); }
    if (autoPanel) {
      const syncPanel = () => {
        const a = state.auto;
        const cap = autoCap();
        autoPanel.querySelectorAll("[data-auto-n]").forEach((b) => {
          const n = Number(b.dataset.autoN);
          b.classList.toggle("active", n === a.rounds);
          b.classList.toggle("over", n > cap);          // 金币不够这么多局
        });
        $("auto-fast").classList.toggle("on", a.fast);
        $("auto-fast").setAttribute("aria-pressed", a.fast ? "true" : "false");
        $("auto-num").textContent = String(a.fast ? a.rounds : a.rounds);
        const note = $("auto-note");
        // 加速约 0.7 秒/局，正常速度要跑完整动画约 5 秒/局（实测）
        const perRound = a.fast ? 0.7 : 5;
        if (a.remaining) {
          note.textContent = `进行中 · 剩 ${a.left} 局 · 每局约 ${perRound} 秒`;
          $("auto-go").textContent = `再加 ${a.rounds} 局`;
        } else {
          const eff = Math.min(a.rounds, cap);
          note.textContent = cap < a.rounds
            ? `金币只够 ${cap} 局，将按 ${eff} 局跑`
            : `每局约 ${perRound} 秒 · 共约 ${(eff * perRound).toFixed(0)} 秒`;
          $("auto-go").textContent = `开始 ${eff} 局`;
        }
        $("auto-go").classList.remove("hidden");
        $("auto-close").textContent = a.remaining ? "停止" : "取消";
      };
      syncAutoPanel = syncPanel;
      autoPanel.querySelectorAll("[data-auto-n]").forEach((b) => {
        b.onclick = () => {
          state.auto.rounds = Number(b.dataset.autoN);
          beep(320, 0.05);
          syncPanel();
          state.dirtyHud = true;
        };
      });
      $("auto-fast").onclick = () => {
        state.auto.fast = !state.auto.fast;
        beep(state.auto.fast ? 420 : 300, 0.05);
        syncPanel();
      };
      $("auto-go").onclick = () => {
        if (state.paused || state.ended) return;
        autoStart();
        if (!state.auto.remaining) return;      // 没能开起来（金币不够）就留在面板上
        closeAutoPanel();
        state.dirtyHud = true;
      };
      $("auto-close").onclick = () => {
        if (state.auto.remaining) autoStop("自动玩已停止");
        closeAutoPanel();
        state.dirtyHud = true;
      };
    }
    if ($("btn-frenzy")) $("btn-frenzy").onclick = () => buyFeature("frenzy");
    $("btn-charm").onclick = buyCharm;
    $("btn-sonar").onclick = buySonar;
    $("btn-help").onclick = () => {
      sawHelp = true;
      state.helpOpen = false;      $("help-mask").classList.add("hidden");
    };
    // 回流 / 冲榜：入口已移进设置面板，这里只保留逻辑供面板调用
    const openHub = () => (modalOn("hub") ? closeModal() : openPanel("hub", "收线后再打开回流"));
    const openRank = () => (modalOn("rank") ? closeModal() : openPanel("rank", "收线后再看冲榜"));
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
    /* ---- 系统设置面板（齿轮）----
       音效/音乐开关、回流/冲榜都收进来，不再占用主界面。 */
    const gearPanel = $("gear-panel");
    function syncGear() {
      if (!gearPanel) return;
      const s = $("gear-sound"), m = $("gear-music");
      if (s) { s.classList.toggle("on", SND.on); setText($("gear-sound-state"), SND.on ? "开" : "关"); }
      if (m) { m.classList.toggle("on", music.on); setText($("gear-music-state"), music.on ? "开" : "关"); }
      setText($("gear-ver"), BUILD);
      renderIdentity();
    }
    function openGear() { syncGear(); if (gearPanel) gearPanel.classList.remove("hidden"); }
    function closeGear() { if (gearPanel) gearPanel.classList.add("hidden"); }
    if ($("btn-gear")) $("btn-gear").onclick = () => {
      if (state.ended) return;
      if (gearPanel && gearPanel.classList.contains("hidden")) { openGear(); sfx.open(); }
      else { closeGear(); sfx.close(); }
    };
    if ($("gear-close")) $("gear-close").onclick = () => { closeGear(); sfx.close(); };
    if ($("gear-sound")) $("gear-sound").onclick = () => {
      SND.on = !SND.on;
      applyMasterVolume();
      if (SND.on) { unlockAudio(); sfx.toggleOn(); } else sfx.toggleOff();
      syncGear();
      ambKey = "";
      if (SND.on) { const wid = state.omenId || WEATHERS[state.wx].id; setAmbient(wid, wid); }
      state.dirtyHud = true;
    };
    if ($("gear-music")) $("gear-music").onclick = () => {
      music.on = !music.on;
      if (music.on) { unlockAudio(); preloadMusic(); music.key = ""; syncMusic(state.omenId || WEATHERS[state.wx].id); sfx.toggleOn(); }
      else { stopMusic(); sfx.toggleOff(); }
      syncGear();
      state.dirtyHud = true;
    };
    if ($("gear-hub")) $("gear-hub").onclick = () => { closeGear(); openHub(); };
    if ($("gear-rank")) $("gear-rank").onclick = () => { closeGear(); openRank(); };
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
    // 移船：没有开船键了，改成按住海面左/右半边持续开船。
    // 点在 HUD、按钮、抽屉把手上的事件会被那些元素自己拦住或冒泡到它们，
    // 这里再用 closest 兜一层，保证按住 UI 不会误触发开船。
    const steerHold = { dir: 0, pid: null };
    const steerUI = (t) => !!(t && t.closest && t.closest(".hud-top, .controls, .drawer, .mask, .help-tip, .rotate-hint"));
    const steerSet = (clientX) => {
      const r = $("stage").getBoundingClientRect();
      steerHold.dir = clientX - r.left < r.width / 2 ? -1 : 1;
      keys.left = steerHold.dir < 0;
      keys.right = steerHold.dir > 0;
      state.steerTarget = null;      // 手控优先，取消自动航行目标
    };
    const steerStop = () => {
      steerHold.dir = 0;
      steerHold.pid = null;
      keys.left = false;
      keys.right = false;
    };
    const layer = $("steer-layer");
    layer.addEventListener("pointerdown", (e) => {
      if (steerUI(e.target)) return;
      if (state.fishing) {           // 收线中不能移船，和旧版点海面一样只提示一次
        if (steerHold.dir === 0) toast("收线后再移船，钩从当前位置抛下");
        return;
      }
      steerHold.pid = e.pointerId;
      steerSet(e.clientX);
    });
    layer.addEventListener("pointermove", (e) => {
      if (steerHold.pid === null || e.pointerId !== steerHold.pid) return;
      steerSet(e.clientX);          // 按住时左右滑动可以改方向
    });
    window.addEventListener("pointerup", (e) => {
      if (steerHold.pid !== null && e.pointerId === steerHold.pid) steerStop();
    });
    window.addEventListener("pointercancel", steerStop);
    window.addEventListener("blur", steerStop);
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
    /* drawers stay collapsed by default so side tabs do not block the water */
  }

  /* 启动每一步都单独兜底：任何一步出错只记录、不中断后面的初始化。
     之前踩过坑——某一步抛异常会让整个启动静默中断，
     表现为画布不画、倒计时不走、按钮全无反应，而且 file:// 下连错误信息都看不到。 */
  const BOOT = [];
  const step = (name, fn) => { try { fn(); BOOT.push(name); } catch (e) { BOOT.push(name + ":ERR " + (e && e.message)); } };
  step("resize", resize);
  step("layoutChrome", layoutChrome);
  const orient = window.matchMedia("(orientation: portrait)");
  if (orient.addEventListener) orient.addEventListener("change", layoutChrome);
  else if (orient.addListener) orient.addListener(layoutChrome);
  step("spawnCreatures", spawnCreatures);
  step("renderShop", renderShop);
  step("renderIdentity", renderIdentity);
  step("renderHud", renderHud);
  step("bind", () => bindStep("bind", bind));
  step("syncHubBtn", syncHubBtn);
  step("seedTicker", seedTicker);
  step("ensureTourney", ensureTourney);
  if (!sawHelp) {
    state.helpOpen = true;
    $("help-mask").classList.remove("hidden");
  }
  if (BOOT.some((s) => s.includes(":ERR"))) console.warn("[boot]", BOOT.join(" | "));
  requestAnimationFrame(loop);
})();
