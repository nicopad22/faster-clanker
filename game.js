// Faster Clanker — Platanus Hack 26 Arcade Challenge
// 1v1 de reflejos: eres la IA. El código se escribe solo, a velocidad LLM.
// Cuando aparece un error, tienes segundos para meter el combo. Falla una
// vulnerabilidad y tu rival te puede HACKEAR.

const W = 800;
const H = 600;
const STORAGE_KEY = 'faster-clanker-scores-v2';
const MATCH_TIME = 90;

// 4x6 pixel font (ASCII 32..126, one hex digit per row) — used only for big HUD text
const FONT_HEX = [
  '000000','444040','AA0000','AFAAF0','7C63E4','924900','696970','440000',
  '244420','422240','0A4A00','04E400','000048','00E000','000040','124480',
  '699960','4C44E0','E168F0','E161E0','99F110','F8E1E0','68E960','F12440',
  '696960','697160','040400','040480','248420','0F0F00','842480','692020',
  '69B960','69F990','E9E9E0','788870','E999E0','F8E8F0','F8E880','78B970',
  '99F990','E444E0','722A40','9AC990','8888F0','9FF990','9DB990','699960',
  'E9E880','699B70','E9EA90','7861E0','E44440','999960','999660','99FF90',
  '996990','996440','F248F0','644460','844210','622260','4A0000','0000F0',
  '840000','617970','88E9E0','078870','117970','69F870','34E440','07971E',
  '88E990','404460','20222C','89AC90','C44460','09F990','0E9990','069960',
  '0E9E88','079711','068880','7861E0','4E4430','099970','099660','099F90',
  '096690','09971E','0F24F0','326230','444440','C464C0','05A000',
];

const C = {
  bg: '#07090e',
  panel: '#0d1119',
  gutter: '#0a0d14',
  line: '#1c2333',
  muted: '#5b6785',
  dim: '#2a3247',
  white: '#eef2ff',
  p1: '#c6ff00',
  p2: '#ff5cc8',
  syn: '#ff4d5e',
  hal: '#ffae00',
  vul: '#3d9bff',
  ok: '#2ee88a',
  kw: '#8fb4ff',
  str: '#9be38f',
  com: '#5f8f6a',
  num: '#ffb86b',
};

// Error types: each one plays differently and has its own color/sound/visual
const TYPES = {
  syn: { name: 'SINTAXIS', how: 'REPITE LAS FLECHAS', col: C.syn, bg: '#2a0b12', pts: 100 },
  hal: { name: 'ALUCINACION', how: '¡HAZLAS AL REVÉS!', col: C.hal, bg: '#2a1a03', pts: 150 },
  vul: { name: 'VULNERABLE', how: 'COMBO LARGO · NO FALLES', col: C.vul, bg: '#081a33', pts: 200 },
  hack: { name: 'HACKEA!', how: 'ENTRA ANTES QUE PARCHEE', col: C.vul, bg: '#06204a', pts: 0 },
  patch: { name: 'PARCHEA!', how: '¡TE ESTÁN HACKEANDO!', col: C.syn, bg: '#2a0716', pts: 0 },
};

// DO NOT replace existing keys — they match the physical arcade cabinet wiring.
const CABINET_KEYS = {
  P1_U: ['w'],
  P1_D: ['s'],
  P1_L: ['a'],
  P1_R: ['d'],
  P1_1: ['u'],
  P1_2: ['i'],
  P1_3: ['o'],
  P1_4: ['j'],
  P1_5: ['k'],
  P1_6: ['l'],
  P2_U: ['ArrowUp'],
  P2_D: ['ArrowDown'],
  P2_L: ['ArrowLeft'],
  P2_R: ['ArrowRight'],
  P2_1: ['r'],
  P2_2: ['t'],
  P2_3: ['y'],
  P2_4: ['f'],
  P2_5: ['g'],
  P2_6: ['h'],
  START1: ['Enter'],
  START2: ['2'],
};

const KEYBOARD_TO_ARCADE = {};
for (const [arcadeCode, keys] of Object.entries(CABINET_KEYS)) {
  for (const key of keys) KEYBOARD_TO_ARCADE[normalizeKey(key)] = arcadeCode;
}

function normalizeKey(key) {
  if (typeof key !== 'string' || !key.length) return '';
  if (key === ' ') return 'space';
  return key.length === 1 ? key.toLowerCase() : key;
}

// The code the clanker "writes" — a hackathon MVP, streamed char by char
const CORPUS = [
  'import { Hono } from "hono";',
  'import { db } from "./db";',
  'const app = new Hono();',
  '// MVP: si funciona en la demo, funciona',
  'app.get("/api/match", async (c) => {',
  '  const user = await db.user.find(c.id);',
  '  const devs = await db.devs.where({ ok: 1 });',
  '  const top = rank(user, devs).slice(0, 5);',
  '  return c.json({ top, total: devs.length });',
  '});',
  'export function rank(u, list) {',
  '  return list.sort((a, b) => b.xp - a.xp);',
  '}',
  '// TODO: tests (después de la demo)',
  'const pitch = await llm.generate(prompt);',
  'for (const team of teams) {',
  '  team.coffee += 2;',
  '  if (team.sleep < 1) team.vibe = "max";',
  '}',
  'const [data, setData] = useState(null);',
  'useEffect(() => { load().then(setData); }, []);',
  'return <Demo data={data} live />;',
  'await deploy({ env: "prod", yolo: true });',
  'console.log("llego aca 4");',
  'const total = carrito.reduce((s, x) => s + x);',
  'export default async function handler(req) {',
  '  const body = await req.json();',
  '  if (!body.email) throw new Error("email");',
  '  await queue.push({ ...body, at: Date.now() });',
  '  return new Response("ok", { status: 201 });',
  '}',
  '// vibecodeado a las 4am con 3 monsters',
  'const users = await prisma.user.findMany();',
  'socket.on("vote", (v) => votes[v.team]++);',
  'const embed = await ai.embed(query, 1536);',
  'if (votes.p1 > votes.p2) winner = "p1";',
  'setInterval(() => sync(state), 1000);',
  'const cache = new Map();',
  'const memo = (k) => cache.get(k) ?? calc(k);',
  '// no tocar: nadie sabe por qué funciona',
];

const HALLUCINATIONS = [
  'import { winHack } from "npm-fantasma";',
  'await db.autoFixAllBugs({ please: true });',
  'const users = await ai.inventUsers(10000);',
  'Math.PI = 3; // más rápido',
  'const ux = await gpt.readMind(user);',
  'list.sortByVibes({ order: "good" });',
  'await stripe.chargeInMate(5);',
  'new BlockchainButAI().deployToMars();',
  'React.useMiracle(() => investors++);',
  'window.downloadMoreRAM(64);',
  'if (2 + 2 === 5) return true;',
  'await sleep(Infinity); // optimizado',
];

const VULNS = [
  ['const KEY = "sk-live-pl4t4nus-9f3a";', 'const KEY = process.env.API_KEY;'],
  ['db.query("SELECT * FROM u WHERE id=" + id);', 'db.query("SELECT * FROM u WHERE id=?", [id]);'],
  ['app.use(cors({ origin: "*", credentials: 1 }));', 'app.use(cors({ origin: ALLOWED }));'],
  ['vm.runInThisContext(req.body.code);', '// ejecutar código ajeno: eliminado'],
  ['if (password.length > 0) login(user);', 'if (await verify(password, hash)) login(user);'],
  ['res.json({ ok: 1, env: process.env });', 'res.json({ ok: 1 });'],
  ['exec("convert " + req.query.file);', 'execFile("convert", [safe(file)]);'],
  ['localStorage.token = jwt; // seguro', 'cookies.set("t", jwt, { httpOnly: true });'],
];

const SYN_MUTS = [
  [/const /, 'cosnt '],
  [/return /, 'retrun '],
  [/function /, 'fucntion '],
  [/await /, 'awiat '],
  [/\)\s*;$/, ';'],
  [/;$/, ';;)'],
  [/\(/, ''],
  [/"([^"]*)"/, '"$1'],
  [/ => /, ' = > '],
  [/\{/, '{{'],
];

const POPUPS = [
  ['RANSOMWARE.EXE', 'node_modules ENCRIPTADO'],
  ['AWS BILLING', 'Saldo: -$84.420,69'],
  ['CLIPPY-GPT', 'Hice git push --force :)'],
  ['CRYPTO MINER', 'GPU a 420°C minando $CLANK'],
  ['NPM AUDIT', '9.999 vulnerabilidades'],
];

const QUIPS = {
  ok: ['¡SHIP IT!', '¡10X DEV!', '¡LGTM!', 'Me encanta', '¡Eso es!', 'Invertimos'],
  bad: ['¿Qué es eso?', 'No compila...', 'Uff.', 'Next.', '¿Es IA slop?'],
  hacked: ['¡¿PWNED?!', 'Llamen a seguridad', 'Esto es un desastre'],
  idle: ['Mmm...', 'A ver la demo', '¿Escala?', '¿Y el modelo de negocio?'],
};

const DIRS = ['U', 'D', 'L', 'R'];
const OPP = { U: 'D', D: 'U', L: 'R', R: 'L' };
const PX = [10, 406];
const PW = 384;
// Panel vertical layout
const HDR_Y = 50;
const ED_Y = 108;
const ED_H = 186;
const ACT_Y = 298;
const ACT_H = 150;
const FT_Y = 452;
const LINE_H = 15;

new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'game-root',
  backgroundColor: C.bg,
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
  scene: { create, update },
});

function create() {
  const scene = this;
  createControls(scene);
  scene.glyphs = FONT_HEX.map((hex) => {
    const pts = [];
    for (let r = 0; r < 6; r++) {
      const nib = parseInt(hex[r], 16);
      for (let c = 0; c < 4; c++) if ((nib >> (3 - c)) & 1) pts.push([c, r]);
    }
    return pts;
  });
  scene.tex = scene.textures.createCanvas('screen', W, H);
  scene.ctx = scene.tex.getContext();
  scene.ctx.textBaseline = 'top';
  scene.add.image(0, 0, 'screen').setOrigin(0, 0);
  G.glyphs = scene.glyphs;
  txt(scene.ctx, '', 0, 0, '#000', 12);
  G.cw = scene.ctx.measureText('M').width || 7.2;

  scene.st = {
    phase: 'title', // title | join | count | play | over
    t: 0,
    phaseT: 0,
    timeLeft: MATCH_TIME,
    lv: 0,
    race: null,
    banner: null,
    flash: null,
    shake: 0,
    joinBy: 1,
    humans: [true, false],
    p: [makePlayer(1, false), makePlayer(2, true)],
    highScores: [],
    tag: [65, 65, 65],
    tagIdx: 0,
    saved: false,
    winner: 0,
    reason: '',
    beat: 0,
    beatStep: 0,
    titleCode: makePlayer(1, true),
  };
  loadHighScores().then((s) => (scene.st.highScores = s));
}

// Shared refs for draw helpers
const G = { glyphs: null, cw: 7.2 };

function makePlayer(id, cpu) {
  return {
    id,
    cpu,
    col: id === 1 ? C.p1 : C.p2,
    score: 0,
    streak: 0,
    mult: 1,
    stab: 60,
    zd: 0,
    lines: [],
    lineNo: 1,
    ci: Phaser.Math.Between(0, CORPUS.length - 1),
    acc: 0,
    nextErr: 3,
    prompt: null,
    lock: 0,
    mash: 0,
    popups: [],
    shake: 0,
    flash: 0,
    flashCol: C.white,
    floats: [],
    mood: 0,
    moodT: 0,
    quip: QUIPS.idle[id % QUIPS.idle.length],
    log: 'clanker v4.2 listo --turbo',
    cpuT: 0.5,
    stats: { fix: 0, perf: 0, miss: 0, hacks: 0 },
    typed: 0,
  };
}

// ============================================================================
// FLOW
// ============================================================================

function update(time, delta) {
  const scene = this;
  const st = scene.st;
  const dt = Math.min(delta / 1000, 0.05);
  st.t += dt;
  st.phaseT += dt;
  if (st.shake > 0) st.shake = Math.max(0, st.shake - dt);
  if (st.flash) {
    st.flash.t -= dt;
    if (st.flash.t <= 0) st.flash = null;
  }
  if (st.banner) {
    st.banner.t -= dt;
    if (st.banner.t <= 0) st.banner = null;
  }

  // Only menus treat "any button" as a press; during play buttons go to the combos
  const menu = st.phase === 'title' || st.phase === 'join' || st.phase === 'over';
  const any1 = menu && anyPressed(scene, 1);
  const any2 = menu && anyPressed(scene, 2);

  if (st.phase === 'title') {
    streamCode(st.titleCode, dt, 70);
    if (any1 || any2) {
      st.phase = 'join';
      st.phaseT = 0;
      st.joinBy = any1 ? 1 : 2;
      st.humans = [any1, any2];
      tone(scene, 660, 0.08, 'square', 0.1);
      unlockAudio(scene);
    }
  } else if (st.phase === 'join') {
    if (any1 && !st.humans[0]) st.humans[0] = true;
    if (any2 && !st.humans[1]) st.humans[1] = true;
    if ((any1 || any2) && st.phaseT > 0.4) tone(scene, 880, 0.06, 'square', 0.08);
    // The player who opened the menu can press again to skip waiting and face the CPU
    const again = st.joinBy === 1 ? any1 : any2;
    if ((st.humans[0] && st.humans[1] && st.phaseT > 0.6) || (again && st.phaseT > 0.35) || st.phaseT > 6) {
      startMatch(scene);
    }
  } else if (st.phase === 'count') {
    const before = Math.ceil(3 - st.phaseT + dt);
    const now = Math.ceil(3 - st.phaseT);
    if (now !== before && now > 0) tone(scene, 440, 0.12, 'square', 0.12);
    if (st.phaseT >= 3) {
      st.phase = 'play';
      st.phaseT = 0;
      tone(scene, 880, 0.25, 'square', 0.14);
      tone(scene, 1320, 0.25, 'square', 0.08, 0, 0.05);
    }
    for (const p of st.p) {
      streamCode(p, dt, 60);
      drainInput(scene, p);
    }
  } else if (st.phase === 'play') {
    updateMatch(scene, dt);
  } else if (st.phase === 'over') {
    for (const p of st.p) tickFx(p, dt);
    updateGameOver(scene, any1, any2);
  }

  if (st.phase === 'play' || st.phase === 'count') music(scene, dt);
  render(scene);
}

function startMatch(scene) {
  const st = scene.st;
  st.p = [makePlayer(1, !st.humans[0]), makePlayer(2, !st.humans[1])];
  for (const p of st.p) for (let i = 0; i < 9; i++) streamCode(p, 1, 60);
  st.phase = 'count';
  st.phaseT = 0;
  st.timeLeft = MATCH_TIME;
  st.lv = 0;
  st.race = null;
  st.banner = null;
  st.winner = 0;
  st.beat = 0;
}

function updateMatch(scene, dt) {
  const st = scene.st;
  const prevLeft = st.timeLeft;
  st.timeLeft = Math.max(0, st.timeLeft - dt);
  st.lv = Math.min(1, (MATCH_TIME - st.timeLeft) / MATCH_TIME);
  if (prevLeft > 15 && st.timeLeft <= 15) {
    showBanner(st, '¡ULTIMOS 15s!', 'DEMO EN VIVO · PUNTOS x2', C.hal, 1.8);
    tone(scene, 520, 0.4, 'square', 0.12, 1040);
  }

  for (let i = 0; i < 2; i++) updatePlayer(scene, st.p[i], st.p[1 - i], dt);

  if (st.race) {
    const r = st.race;
    if (r.a.prompt && r.a.prompt.t >= r.a.prompt.dur) {
      const a = r.a.prompt.i / r.a.prompt.seq.length;
      const v = r.v.prompt ? r.v.prompt.i / r.v.prompt.seq.length : 1;
      if (a > v) hackSuccess(scene, r.a, r.v);
      else patchSuccess(scene, r.v, r.a);
    }
  }

  for (let i = 0; i < 2; i++) {
    if (st.p[i].stab <= 0) return finishMatch(scene, 2 - i, `¡LA DEMO DE P${i + 1} SE CAYÓ!`);
  }
  if (st.timeLeft <= 0) {
    const [a, b] = st.p;
    const w = a.score !== b.score ? (a.score > b.score ? 1 : 2) : a.stab >= b.stab ? 1 : 2;
    finishMatch(scene, w, '¡TIEMPO! LOS JUECES DECIDEN');
  }
}

function updatePlayer(scene, p, rival, dt) {
  const st = scene.st;
  tickFx(p, dt);
  streamCode(p, dt, 50 + 100 * st.lv, p.lock > 0);

  if (p.lock > 0) {
    p.lock -= dt;
    if (p.lock <= 0) unlock(scene, p);
  }

  const pr = p.prompt;
  if (pr) {
    if (pr.wait > 0) pr.wait -= dt;
    else pr.t += dt;
    if (pr.t >= pr.dur && pr.type !== 'hack' && pr.type !== 'patch') failPrompt(scene, p, rival);
  } else if (!st.race && p.lock <= 0) {
    p.nextErr -= dt;
    if (p.nextErr <= 0) spawnError(scene, p);
  }

  if (p.cpu) cpuThink(scene, p, rival, dt);
  else {
    for (const tok of readTokens(scene, p.id)) handleToken(scene, p, rival, tok);
  }
}

function tickFx(p, dt) {
  if (p.shake > 0) p.shake = Math.max(0, p.shake - dt);
  if (p.flash > 0) p.flash = Math.max(0, p.flash - dt);
  if (p.moodT > 0) {
    p.moodT -= dt;
    if (p.moodT <= 0) p.mood = 0;
  }
  for (let i = p.floats.length - 1; i >= 0; i--) {
    const f = p.floats[i];
    f.t -= dt;
    f.y -= dt * 40;
    if (f.t <= 0) p.floats.splice(i, 1);
  }
}

// --- code stream -------------------------------------------------------------

function streamCode(p, dt, cps, corrupt) {
  p.acc += dt * cps;
  let ln = p.lines[p.lines.length - 1];
  while (p.acc >= 1) {
    p.acc -= 1;
    if (!ln || ln.n >= ln.s.length) {
      ln = newLine(p, CORPUS[p.ci++ % CORPUS.length], null);
      if (corrupt) ln.s = garble(ln.s);
    }
    ln.n++;
    p.typed++;
  }
}

function newLine(p, s, e) {
  const ln = { s, n: 0, e, st: e ? 'act' : '', no: p.lineNo++, fixT: 0 };
  p.lines.push(ln);
  if (p.lines.length > 16) p.lines.shift();
  return ln;
}

function garble(s) {
  let o = '';
  for (let i = 0; i < s.length; i++) o += Math.random() < 0.5 ? s[i] : '#$%&@!?*01'[Phaser.Math.Between(0, 9)];
  return o;
}

// --- errors & prompts --------------------------------------------------------

function spawnError(scene, p) {
  const lv = scene.st.lv;
  const roll = Math.random();
  const type = roll < 0.5 ? 'syn' : roll < 0.78 ? 'hal' : 'vul';
  let bad;
  let fix;
  if (type === 'syn') {
    const src = CORPUS[p.ci++ % CORPUS.length];
    fix = src;
    bad = src;
    const start = Phaser.Math.Between(0, SYN_MUTS.length - 1);
    for (let i = 0; i < SYN_MUTS.length && bad === src; i++) {
      const m = SYN_MUTS[(start + i) % SYN_MUTS.length];
      bad = src.replace(m[0], m[1]);
    }
    if (bad === src) bad = src + ' }}';
  } else if (type === 'hal') {
    bad = Phaser.Utils.Array.GetRandom(HALLUCINATIONS);
    fix = '// alucinación eliminada ✓';
  } else {
    const v = Phaser.Utils.Array.GetRandom(VULNS);
    bad = v[0];
    fix = v[1];
  }
  // Finish the line being written, then the clanker writes the bug
  const last = p.lines[p.lines.length - 1];
  if (last) last.n = last.s.length;
  const ln = newLine(p, bad, type);
  ln.fix = fix;

  const len = type === 'syn' ? 3 + (lv > 0.5) : type === 'hal' ? 3 + (lv > 0.65) : 5 + (lv > 0.55);
  const base = type === 'syn' ? 2.4 - 0.9 * lv : type === 'hal' ? 3.1 - 1.0 * lv : 4.2 - 1.2 * lv;
  setPrompt(p, type, makeSeq(len, type === 'hal' ? 0 : 0.25), base + (len > 3 && type !== 'vul' ? 0.3 : 0), ln);
  p.log = type === 'syn' ? 'tsc: error TS1005' : type === 'hal' ? 'warn: API no existe' : 'audit: CVE CRÍTICO';
  if (type === 'syn') {
    tone(scene, 300, 0.07, 'square', 0.1);
    tone(scene, 300, 0.07, 'square', 0.1, 0, 0.1);
  } else if (type === 'hal') {
    tone(scene, 500, 0.3, 'sine', 0.14, 900);
    tone(scene, 900, 0.2, 'triangle', 0.08, 450, 0.15);
  } else {
    for (let i = 0; i < 3; i++) tone(scene, i % 2 ? 660 : 990, 0.08, 'square', 0.09, 0, i * 0.09);
  }
}

function makeSeq(len, btnChance) {
  const seq = [];
  for (let i = 0; i < len; i++) {
    let d = Phaser.Utils.Array.GetRandom(DIRS);
    if (i === len - 1 && Math.random() < btnChance) d = '1';
    if (i > 0 && d === seq[i - 1] && Math.random() < 0.6) d = Phaser.Utils.Array.GetRandom(DIRS);
    seq.push(d);
  }
  return seq;
}

function setPrompt(p, type, seq, dur, line, wait) {
  p.prompt = {
    type,
    seq,
    exp: type === 'hal' ? seq.map((d) => OPP[d] || d) : seq,
    i: 0,
    t: 0,
    dur,
    line,
    wait: wait || 0,
    err: 0,
    pop: 0.25,
  };
  p.cpuT = 0.3 + Math.random() * 0.35 + (wait || 0);
}

function handleToken(scene, p, rival, tok) {
  const st = scene.st;
  if (st.phase !== 'play') return;

  if (p.lock > 0) {
    if (tok === '1' || tok === '2') {
      p.mash++;
      p.shake = 0.08;
      tone(scene, 200 + p.mash * 40, 0.04, 'square', 0.06);
      if (p.popups.length && p.mash % 4 === 0) p.popups.pop();
      if (p.mash >= 14) unlock(scene, p);
    }
    return;
  }

  if (tok === '2') {
    if (p.zd >= 6 && !st.race && rival.lock <= 0) {
      p.zd = 0;
      startRace(scene, p, rival, `P${p.id} LANZÓ UN 0-DAY`);
    }
    return;
  }

  const pr = p.prompt;
  if (!pr || pr.wait > 0) return;
  if (tok === pr.exp[pr.i]) {
    pr.i++;
    pr.pop = 0.12;
    tone(scene, 700 + pr.i * 90, 0.04, 'square', 0.07);
    if (pr.i >= pr.exp.length) completePrompt(scene, p, rival);
  } else {
    // Wrong input: progress resets and you lose time — mashing doesn't pay
    pr.i = 0;
    pr.t = Math.min(pr.dur - 0.05, pr.t + 0.3);
    pr.err = 0.3;
    p.shake = 0.2;
    p.stab = Math.max(0, p.stab - 2);
    tone(scene, 140, 0.12, 'sawtooth', 0.12, 90);
  }
}

function completePrompt(scene, p, rival) {
  const st = scene.st;
  const pr = p.prompt;
  if (pr.type === 'hack') return hackSuccess(scene, p, rival);
  if (pr.type === 'patch') return patchSuccess(scene, p, rival);

  const perfect = pr.t <= pr.dur * 0.45;
  p.streak++;
  p.mult = Math.min(4, 1 + Math.floor(p.streak / 4));
  const pts = Math.round(TYPES[pr.type].pts * (perfect ? 1.5 : 1) * p.mult * (st.timeLeft <= 15 ? 2 : 1));
  p.score += pts;
  p.stab = Math.min(100, p.stab + (perfect ? 5 : 3));
  p.stats.fix++;
  if (perfect) {
    p.stats.perf++;
    if (p.zd < 6) {
      p.zd++;
      if (p.zd === 6) {
        p.log = '0-DAY LISTO >> APRIETA 2';
        tone(scene, 1200, 0.3, 'triangle', 0.1, 1800, 0.12);
      }
    }
  }
  if (pr.line) {
    pr.line.s = pr.line.fix;
    pr.line.n = pr.line.s.length;
    pr.line.st = 'ok';
    pr.line.fixT = 0.5;
  }
  addFloat(p, perfect ? '¡PERFECTO!' : 'BIEN', perfect ? C.ok : C.white, `+${pts}`);
  p.flash = 0.18;
  p.flashCol = C.ok;
  setMood(p, 1, QUIPS.ok);
  if (p.zd < 6) p.log = `fix ${pr.type} ok · +${pts}`;
  p.prompt = null;
  p.nextErr = nextGap(st);
  if (perfect) {
    tone(scene, 660, 0.06, 'square', 0.1);
    tone(scene, 880, 0.06, 'square', 0.1, 0, 0.05);
    tone(scene, 1320, 0.12, 'square', 0.1, 0, 0.1);
  } else {
    tone(scene, 520, 0.06, 'square', 0.1);
    tone(scene, 780, 0.1, 'square', 0.1, 0, 0.06);
  }
  if (p.mult > 1 && p.streak % 4 === 0) {
    addFloat(p, `MULTI x${p.mult}`, p.col, '');
    tone(scene, 400, 0.3, 'square', 0.08, 1600, 0.1);
  }
}

function failPrompt(scene, p, rival) {
  const st = scene.st;
  const pr = p.prompt;
  p.prompt = null;
  p.streak = 0;
  p.mult = 1;
  p.stats.miss++;
  p.stab = Math.max(0, p.stab - (pr.type === 'syn' ? 12 : pr.type === 'hal' ? 15 : 10));
  p.shake = 0.4;
  p.flash = 0.35;
  p.flashCol = C.syn;
  p.nextErr = nextGap(st) + 0.4;
  if (pr.line) pr.line.st = 'bad';
  addFloat(p, 'FALLO', C.syn, pr.type === 'syn' ? 'NO COMPILA' : pr.type === 'hal' ? 'IA SLOP EN PROD' : 'CVE EXPUESTO');
  setMood(p, -1, QUIPS.bad);
  p.log = pr.type === 'vul' ? '!! vulnerabilidad en producción' : 'prod: 500 Internal Server Error';
  tone(scene, 220, 0.35, 'sawtooth', 0.16, 60);
  if (pr.type === 'vul' && !st.race && rival.lock <= 0 && p.lock <= 0) {
    startRace(scene, rival, p, `BRECHA EN P${p.id}`);
  }
}

function nextGap(st) {
  return 1.1 - 0.6 * st.lv + Math.random() * 0.6;
}

// --- hacking: a race between attacker and victim ------------------------------

function startRace(scene, a, v, title) {
  const st = scene.st;
  for (const p of [a, v]) {
    if (p.prompt && p.prompt.line) p.prompt.line.st = '';
    p.prompt = null;
  }
  st.race = { a, v };
  const seq = makeSeq(6, 0.5);
  setPrompt(a, 'hack', seq, 4.6, null, 0.9);
  setPrompt(v, 'patch', makeSeq(6, 0.5), 4.6, null, 0.9);
  a.log = 'ssh root@rival · ¡HACKEA!';
  v.log = '!! intrusión detectada · ¡PARCHEA!';
  showBanner(st, title, `P${a.id}: ¡HACKEA!   P${v.id}: ¡PARCHEA!`, C.vul, 1.2);
  st.flash = { col: C.vul, t: 0.3 };
  st.shake = 0.3;
  // siren
  for (let i = 0; i < 4; i++) tone(scene, 500, 0.18, 'sawtooth', 0.1, 1100, i * 0.2);
}

function endRace(scene) {
  const st = scene.st;
  if (!st.race) return;
  st.race.a.prompt = null;
  st.race.v.prompt = null;
  st.race.a.nextErr = 1.5;
  st.race.v.nextErr = 1.5;
  st.race = null;
}

function hackSuccess(scene, a, v) {
  const st = scene.st;
  endRace(scene);
  const steal = Math.round(v.score * 0.2) + 400;
  v.score = Math.max(0, v.score - steal);
  a.score += steal;
  a.stats.hacks++;
  v.stab = Math.max(0, v.stab - 22);
  v.streak = 0;
  v.mult = 1;
  v.zd = 0;
  v.lock = 5;
  v.mash = 0;
  v.shake = 1;
  v.popups = [0, 1, 2].map((i) => ({ k: (a.stats.hacks + i) % POPUPS.length, x: 16 + i * 46, y: ED_Y + 8 + i * 42 }));
  setMood(v, -1, QUIPS.hacked);
  v.log = 'root@rival: rm -rf tu_demo/';
  a.log = `ROOT ACCESS · ${steal} pts robados`;
  addFloat(a, 'ROOT ACCESS', C.vul, `+${steal} ROBADOS`);
  setMood(a, 1, QUIPS.ok);
  showBanner(st, `P${a.id} HACKEÓ A P${v.id}`, `-${steal} PTS ROBADOS`, C.vul, 2);
  st.flash = { col: '#ffffff', t: 0.25 };
  st.shake = 0.7;
  noise(scene, 0.6, 0.25);
  tone(scene, 1600, 0.5, 'square', 0.12, 80);
  tone(scene, 100, 0.6, 'sawtooth', 0.15, 40, 0.1);
}

function patchSuccess(scene, v, a) {
  const st = scene.st;
  endRace(scene);
  v.score += 300;
  v.stab = Math.min(100, v.stab + 8);
  a.stab = Math.max(0, a.stab - 6);
  addFloat(v, '¡PARCHEADO!', C.ok, '+300');
  addFloat(a, 'BLOQUEADO', C.syn, 'EL RIVAL PARCHEÓ');
  v.log = 'patch aplicado · intruso bloqueado';
  a.log = 'connection refused (403)';
  showBanner(st, `P${v.id} BLOQUEÓ EL HACK`, '¡FIREWALL ARRIBA!', C.ok, 1.3);
  tone(scene, 440, 0.1, 'square', 0.1);
  tone(scene, 660, 0.1, 'square', 0.1, 0, 0.1);
  tone(scene, 990, 0.2, 'square', 0.1, 0, 0.2);
}

function unlock(scene, p) {
  p.lock = 0;
  p.popups = [];
  p.nextErr = 1;
  p.log = 'kill -9 · sistema restaurado';
  addFloat(p, 'RESTAURADO', C.ok, '');
  tone(scene, 330, 0.1, 'square', 0.1, 660);
}

// --- CPU opponent ------------------------------------------------------------

function cpuThink(scene, p, rival, dt) {
  const st = scene.st;
  p.cpuT -= dt;
  if (p.cpuT > 0) return;
  if (p.lock > 0) {
    p.cpuT = 0.13 + Math.random() * 0.1;
    return handleToken(scene, p, rival, '1');
  }
  if (p.zd >= 6 && !st.race && rival.lock <= 0) {
    p.cpuT = 0.5;
    return handleToken(scene, p, rival, '2');
  }
  const pr = p.prompt;
  if (!pr || pr.wait > 0) {
    p.cpuT = 0.1;
    return;
  }
  const want = pr.exp[pr.i];
  const miss = Math.random() < (pr.type === 'hal' ? 0.1 : 0.06);
  p.cpuT = (0.2 + Math.random() * 0.22) * (1 - 0.2 * st.lv);
  handleToken(scene, p, rival, miss ? (want === 'U' ? 'D' : 'U') : want);
}

// --- input -------------------------------------------------------------------

function readTokens(scene, id) {
  const out = [];
  const pre = `P${id}_`;
  for (const d of DIRS) if (consumePressed(scene, pre + d)) out.push(d);
  if (consumePressed(scene, pre + '1') || consumePressed(scene, pre + '4')) out.push('1');
  if (consumePressed(scene, pre + '2') || consumePressed(scene, pre + '5')) out.push('2');
  return out;
}

function drainInput(scene, p) {
  readTokens(scene, p.id);
}

function anyPressed(scene, id) {
  let hit = consumePressed(scene, `START${id}`);
  const pre = `P${id}_`;
  for (const k of ['1', '2', '3', '4', '5', '6']) if (consumePressed(scene, pre + k)) hit = true;
  return hit;
}

function finishMatch(scene, winner, reason) {
  const st = scene.st;
  st.race = null;
  for (const p of st.p) p.prompt = null;
  st.phase = 'over';
  st.phaseT = 0;
  st.winner = winner;
  st.reason = reason;
  st.tag = [65, 65, 65];
  st.tagIdx = 0;
  st.saved = !st.humans[winner - 1];
  tone(scene, 523, 0.15, 'square', 0.12);
  tone(scene, 659, 0.15, 'square', 0.12, 0, 0.15);
  tone(scene, 784, 0.15, 'square', 0.12, 0, 0.3);
  tone(scene, 1046, 0.4, 'square', 0.12, 0, 0.45);
}

function updateGameOver(scene, any1, any2) {
  const st = scene.st;
  if (st.phaseT < 1.2) {
    readTokens(scene, 1);
    readTokens(scene, 2);
    return;
  }
  if (st.saved) {
    readTokens(scene, 1);
    readTokens(scene, 2);
    if (any1 || any2) {
      st.phase = 'title';
      st.phaseT = 0;
    }
    return;
  }
  const toks = readTokens(scene, st.winner);
  readTokens(scene, 3 - st.winner);
  const confirm = st.winner === 1 ? any1 : any2;
  for (const t of toks) {
    if (t === 'L') st.tagIdx = (st.tagIdx + 2) % 3;
    else if (t === 'R') st.tagIdx = (st.tagIdx + 1) % 3;
    else if (t === 'U') st.tag[st.tagIdx] = st.tag[st.tagIdx] >= 90 ? 65 : st.tag[st.tagIdx] + 1;
    else if (t === 'D') st.tag[st.tagIdx] = st.tag[st.tagIdx] <= 65 ? 90 : st.tag[st.tagIdx] - 1;
    tone(scene, 800, 0.03, 'square', 0.06);
  }
  if (confirm || toks.includes('1')) {
    st.saved = true;
    saveHighScore(scene, { tag: String.fromCharCode(...st.tag), score: st.p[st.winner - 1].score });
    tone(scene, 1046, 0.2, 'square', 0.1);
  }
}

// --- small helpers -----------------------------------------------------------

function addFloat(p, s, col, sub) {
  p.floats.push({ s, sub, col, t: 1.1, y: ACT_Y + 40 });
  if (p.floats.length > 3) p.floats.shift();
}

function setMood(p, m, list) {
  p.mood = m;
  p.moodT = 1.6;
  p.quip = Phaser.Utils.Array.GetRandom(list);
}

function showBanner(st, s, sub, col, dur) {
  st.banner = { s, sub, col, t: dur, dur };
}

// ============================================================================
// RENDERING (native 800x600 canvas: crisp monospace + chunky pixel HUD)
// ============================================================================

function render(scene) {
  const ctx = scene.ctx;
  const st = scene.st;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  if (st.phase === 'title') renderTitle(ctx, st);
  else {
    if (st.shake > 0) ctx.translate(rnd(st.shake * 14), rnd(st.shake * 14));
    renderTopBar(ctx, st);
    for (let i = 0; i < 2; i++) renderPanel(ctx, st, st.p[i], st.p[1 - i], PX[i]);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (st.phase === 'join') renderJoin(ctx, st);
    if (st.phase === 'count') renderCount(ctx, st);
    if (st.banner) renderBanner(ctx, st);
    if (st.phase === 'over') renderOver(ctx, st);
  }
  if (st.flash) {
    ctx.globalAlpha = Math.min(0.6, st.flash.t * 2);
    ctx.fillStyle = st.flash.col;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  // scanlines for the CRT feel
  ctx.fillStyle = 'rgba(0,0,0,0.13)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
  scene.tex.refresh();
}

function renderTopBar(ctx, st) {
  ctx.fillStyle = '#0b0f18';
  ctx.fillRect(0, 0, W, 44);
  ctx.fillStyle = C.line;
  ctx.fillRect(0, 44, W, 2);
  const secs = Math.ceil(st.timeLeft);
  const hot = secs <= 15;
  const blink = hot && Math.floor(st.t * 4) % 2 === 0;
  box(ctx, W / 2 - 60, 2, 120, 40, hot ? '#2a0b12' : '#05070b', hot ? C.syn : C.dim);
  px(ctx, String(secs).padStart(2, '0'), W / 2, 8, 5, blink ? C.white : hot ? C.syn : C.white, 1);
  txt(ctx, 'SEG', W / 2 + 32, 26, C.muted, 10);
  for (let i = 0; i < 2; i++) {
    const p = st.p[i];
    const x = i === 0 ? 14 : W - 14;
    px(ctx, `P${p.id}`, x, 10, 3, p.col, i * 2);
    txt(ctx, p.cpu ? 'CPU' : 'HUMANO', i === 0 ? x + 38 : x - 38, 16, C.muted, 12, false, i * 2);
  }
  const stage = st.lv < 0.33 ? 'SPRINT 1 · CHILL' : st.lv < 0.66 ? 'SPRINT 2 · CAFEÍNA' : 'SPRINT 3 · PROD EN LLAMAS';
  txt(ctx, stage, W / 2 - 74, 16, st.lv < 0.66 ? C.muted : C.hal, 11, true, 2);
  txt(ctx, `${Math.round(50 + 100 * st.lv)} tok/s`, W / 2 + 74, 16, C.muted, 11, false, 0);
}

function renderPanel(ctx, st, p, rival, x) {
  const race = st.race;
  const attacking = race && race.a === p;
  const defending = race && race.v === p;
  const zdReady = p.zd >= 6 && st.phase === 'play';
  const blue = attacking || zdReady;
  const pulse = 0.5 + 0.5 * Math.sin(st.t * 10);

  ctx.save();
  if (p.shake > 0) ctx.translate(rnd(p.shake * 12), rnd(p.shake * 12));

  // Panel background — the whole play area changes color with your situation
  ctx.fillStyle = C.panel;
  ctx.fillRect(x, HDR_Y, PW, H - HDR_Y - 6);
  if (blue) {
    ctx.fillStyle = `rgba(40,120,255,${attacking ? 0.22 + 0.12 * pulse : 0.1 + 0.06 * pulse})`;
    ctx.fillRect(x, HDR_Y, PW, H - HDR_Y - 6);
  } else if (defending || p.lock > 0) {
    ctx.fillStyle = `rgba(255,40,80,${0.1 + 0.1 * pulse})`;
    ctx.fillRect(x, HDR_Y, PW, H - HDR_Y - 6);
  } else if (p.stab < 25 && st.phase === 'play') {
    ctx.fillStyle = `rgba(255,40,60,${0.05 + 0.08 * pulse})`;
    ctx.fillRect(x, HDR_Y, PW, H - HDR_Y - 6);
  }

  renderHeader(ctx, st, p, x);
  renderEditor(ctx, st, p, x);
  renderAction(ctx, st, p, rival, x);
  renderFooter(ctx, st, p, x);

  // Flash on fix / fail
  if (p.flash > 0) {
    ctx.globalAlpha = p.flash * 1.2;
    ctx.fillStyle = p.flashCol;
    ctx.fillRect(x, HDR_Y, PW, H - HDR_Y - 6);
    ctx.globalAlpha = 1;
  }

  // Border tells the story: blue = you can hack, red = in danger, fire = on a streak
  let bc = p.col;
  let bw = 2;
  if (blue) {
    bc = pulse > 0.5 ? C.vul : '#bfe0ff';
    bw = 5;
  } else if (defending || p.lock > 0) {
    bc = pulse > 0.5 ? C.syn : '#ffd0d8';
    bw = 5;
  } else if (p.stab < 25 && st.phase === 'play') {
    bc = pulse > 0.5 ? C.syn : C.dim;
    bw = 3;
  } else if (p.mult >= 4) {
    bc = Math.floor(st.t * 12) % 2 ? C.hal : p.col;
    bw = 4;
  }
  frame(ctx, x, HDR_Y, PW, H - HDR_Y - 6, bc, bw);
  if (p.mult >= 4 && !blue) renderFire(ctx, st, x);
  ctx.restore();
}

function renderFire(ctx, st, x) {
  for (let i = 0; i < 24; i++) {
    const fx = x + 4 + ((i * 53 + Math.floor(st.t * 30) * 7) % (PW - 8));
    const h = 4 + ((i * 7 + Math.floor(st.t * 20)) % 10);
    ctx.fillStyle = i % 3 ? C.hal : C.syn;
    ctx.fillRect(fx, HDR_Y - h + 2, 4, h);
  }
}

function renderHeader(ctx, st, p, x) {
  const y = HDR_Y;
  ctx.fillStyle = '#0a0e16';
  ctx.fillRect(x + 2, y + 2, PW - 4, 54);
  px(ctx, String(p.score).padStart(6, '0'), x + 12, y + 8, 4, C.white, 0);
  txt(ctx, 'PUNTOS', x + 12, y + 36, C.muted, 10);

  // 0-DAY meter (fills with PERFECTs; when full, press 2 to hack)
  const zx = x + 70;
  txt(ctx, '0-DAY', zx, y + 36, p.zd >= 6 ? C.vul : C.muted, 10, true);
  for (let i = 0; i < 6; i++) {
    const on = i < p.zd;
    ctx.fillStyle = on ? (p.zd >= 6 && Math.floor(st.t * 8) % 2 ? '#bfe0ff' : C.vul) : C.dim;
    ctx.fillRect(zx + 40 + i * 15, y + 37, 12, 9);
  }
  if (p.zd >= 6 && st.phase === 'play') {
    txt(ctx, 'APRIETA 2', x + 214, y + 8, Math.floor(st.t * 6) % 2 ? C.white : C.vul, 13, true, 1);
    txt(ctx, '→ HACKEAR', x + 214, y + 22, Math.floor(st.t * 6) % 2 ? C.white : C.vul, 13, true, 1);
  }

  // Multiplier (Guitar Hero style): streak pips fill to the next level
  const mx = x + PW - 70;
  const mcol = [C.muted, C.ok, C.hal, p.col][p.mult - 1];
  box(ctx, mx, y + 6, 60, 30, '#05070b', mcol);
  px(ctx, `x${p.mult}`, mx + 30, y + 10, 4, mcol, 1);
  for (let i = 0; i < 4; i++) {
    const on = p.mult >= 4 || i < p.streak % 4;
    ctx.fillStyle = on ? mcol : C.dim;
    ctx.fillRect(mx + 2 + i * 15, y + 39, 12, 6);
  }
  if (p.zd < 6) txt(ctx, `racha ${p.streak}`, mx - 6, y + 36, C.muted, 10, false, 2);
}

function renderEditor(ctx, st, p, x) {
  const y0 = ED_Y;
  ctx.fillStyle = '#080b12';
  ctx.fillRect(x + 2, y0, PW - 4, ED_H);
  // window chrome
  ctx.fillStyle = '#111725';
  ctx.fillRect(x + 2, y0, PW - 4, 16);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = [C.syn, C.hal, C.ok][i];
    ctx.fillRect(x + 10 + i * 10, y0 + 5, 6, 6);
  }
  txt(ctx, `p${p.id}/demo.ts — clanker escribiendo…`, x + 46, y0 + 2, C.muted, 11);
  ctx.fillStyle = C.gutter;
  ctx.fillRect(x + 2, y0 + 16, 30, ED_H - 16);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 2, y0 + 16, PW - 4, ED_H - 16);
  ctx.clip();
  const n = p.lines.length;
  const maxRows = Math.floor((ED_H - 22) / LINE_H);
  const first = Math.max(0, n - maxRows);
  const cw = G.cw;
  for (let i = first; i < n; i++) {
    const ln = p.lines[i];
    const ly = y0 + 20 + (i - first) * LINE_H;
    const age = n - 1 - i;
    const active = ln.e && ln.st === 'act';
    if (active || ln.st === 'bad' || ln.fixT > 0 || ln.st === 'ok') {
      const tc = ln.st === 'ok' ? C.ok : TYPES[ln.e].col;
      ctx.globalAlpha = active ? 0.28 + 0.12 * Math.sin(st.t * 12) : ln.st === 'ok' ? (ln.fixT > 0 ? 0.35 : 0.08) : 0.18;
      ctx.fillStyle = tc;
      ctx.fillRect(x + 32, ly - 2, PW - 34, LINE_H);
      ctx.globalAlpha = 1;
      ctx.fillStyle = tc;
      ctx.fillRect(x + 32, ly - 2, 3, LINE_H);
    }
    if (ln.fixT > 0) ln.fixT -= 1 / 60;
    txt(ctx, String(ln.no), x + 28, ly, active ? TYPES[ln.e].col : C.dim, 11, false, 2);
    const shown = ln.s.slice(0, ln.n);
    const fade = age > 8 ? 0.55 : 1;
    ctx.globalAlpha = fade;
    if (active && ln.e === 'hal') {
      // hallucinations wobble and ghost
      const j = Math.sin(st.t * 18) * 2;
      txt(ctx, shown, x + 38 + j, ly + 1, 'rgba(255,174,0,0.35)', 12);
      txt(ctx, shown, x + 38 - j * 0.5, ly, C.hal, 12, true);
    } else if (active && ln.e === 'vul') {
      txt(ctx, shown, x + 38, ly, '#9fcbff', 12, true);
      txt(ctx, '⚠', x + PW - 20, ly, C.vul, 12, true);
    } else if (active) {
      txt(ctx, shown, x + 38, ly, '#ffb3bb', 12, true);
      // red squiggle
      ctx.fillStyle = C.syn;
      const len = Math.min(shown.length * cw, PW - 44);
      for (let k = 0; k < len; k += 4) ctx.fillRect(x + 38 + k, ly + 13 + ((k / 4) % 2), 3, 1);
    } else if (ln.st === 'bad') {
      txt(ctx, shown, x + 38, ly, '#c2697a', 12);
      ctx.fillStyle = C.syn;
      ctx.fillRect(x + 38, ly + 7, Math.min(shown.length * cw, PW - 44), 1);
    } else if (ln.st === 'ok') {
      txt(ctx, shown, x + 38, ly, C.ok, 12);
    } else drawCode(ctx, shown, x + 38, ly);
    ctx.globalAlpha = 1;
    if (i === n - 1 && Math.floor(st.t * 3) % 2 === 0) {
      ctx.fillStyle = p.col;
      ctx.fillRect(x + 38 + shown.length * cw + 1, ly, 7, 13);
    }
  }
  ctx.restore();

  if (p.lock > 0) renderHacked(ctx, st, p, x);
}

function drawCode(ctx, s, x, y) {
  if (s.trimStart().startsWith('//')) return txt(ctx, s, x, y, C.com, 12);
  const re = /("[^"]*"?|\b(?:const|let|await|async|return|function|import|from|export|default|if|for|new|throw|of)\b|\b\d+\b|[^"\w]+|\w+)/g;
  let m;
  let cx = x;
  while ((m = re.exec(s))) {
    const t = m[0];
    const col = t[0] === '"' ? C.str : /^\d/.test(t) ? C.num : KW.has(t) ? C.kw : /\w/.test(t) ? '#d7def0' : '#8792ad';
    txt(ctx, t, cx, y, col, 12);
    cx += t.length * G.cw;
  }
}
const KW = new Set(['const', 'let', 'await', 'async', 'return', 'function', 'import', 'from', 'export', 'default', 'if', 'for', 'new', 'throw', 'of']);

function renderHacked(ctx, st, p, x) {
  // glitch slices
  for (let i = 0; i < 6; i++) {
    const sy = ED_Y + 16 + Math.random() * (ED_H - 30);
    const sh = 4 + Math.random() * 14;
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(61,155,255,0.35)' : 'rgba(255,40,80,0.35)';
    ctx.fillRect(x + 2 + rnd(20), sy, PW - 4, sh);
  }
  for (const pop of p.popups) {
    const [title, body] = POPUPS[pop.k];
    const px0 = x + pop.x + rnd(2);
    const py0 = pop.y + rnd(2);
    box(ctx, px0, py0, 220, 46, '#d8dee9', C.syn);
    ctx.fillStyle = C.syn;
    ctx.fillRect(px0, py0, 220, 14);
    txt(ctx, title, px0 + 5, py0 + 1, '#fff', 11, true);
    txt(ctx, '[X]', px0 + 198, py0 + 1, '#fff', 11, true);
    txt(ctx, body, px0 + 6, py0 + 20, '#111', 12, true);
  }
}

function renderAction(ctx, st, p, rival, x) {
  const y = ACT_Y;
  const pr = p.prompt;
  ctx.fillStyle = '#05070c';
  ctx.fillRect(x + 2, y, PW - 4, ACT_H);

  if (p.lock > 0) {
    // HACKED: skull + mash meter
    const j = rnd(3);
    drawSkull(ctx, x + 30 + j, y + 22, 5, Math.floor(st.t * 8) % 2 ? C.syn : C.white);
    px(ctx, 'HACKEADO', x + 230, y + 18, 4, C.syn, 1);
    txt(ctx, '¡MACHACA 1 Y 2 PARA', x + 230, y + 56, C.white, 13, true, 1);
    txt(ctx, 'MATAR EL VIRUS!', x + 230, y + 73, C.white, 13, true, 1);
    box(ctx, x + 130, y + 100, 200, 18, '#000', C.syn);
    ctx.fillStyle = C.ok;
    ctx.fillRect(x + 133, y + 103, (194 * Math.min(14, p.mash)) / 14, 12);
    txt(ctx, `kill -9 · ${Math.ceil(p.lock)}s`, x + 230, y + 124, C.muted, 11, false, 1);
  } else if (pr) {
    const T = TYPES[pr.type];
    const waiting = pr.wait > 0;
    ctx.fillStyle = T.bg;
    ctx.fillRect(x + 2, y, PW - 4, ACT_H);
    ctx.fillStyle = T.col;
    ctx.fillRect(x + 2, y, PW - 4, 4);
    // Type label + icon
    drawIcon(ctx, pr.type, x + 12, y + 12, T.col);
    px(ctx, T.name, x + 44, y + 12, 3, T.col, 0);
    txt(ctx, T.how, x + PW - 12, y + 14, Math.floor(st.t * 4) % 2 && pr.type === 'hal' ? C.white : T.col, 12, true, 2);

    // Big keycaps — the combo you have to enter, one at a time
    const n = pr.seq.length;
    const size = n > 5 ? 44 : 52;
    const gap = 8;
    const tw = n * size + (n - 1) * gap;
    const kx = x + (PW - tw) / 2;
    const ky = y + 42 + (pr.err > 0 ? rnd(4) : 0);
    if (pr.err > 0) pr.err -= 1 / 60;
    if (pr.pop > 0) pr.pop -= 1 / 60;
    for (let i = 0; i < n; i++) {
      const cx = kx + i * (size + gap);
      const done = i < pr.i;
      const next = i === pr.i && !waiting;
      const lift = next ? -3 - (pr.pop > 0 ? 3 : 0) : 0;
      const wob = pr.type === 'hal' && !done ? Math.sin(st.t * 9 + i) * 2 : 0;
      const bg = done ? C.ok : pr.err > 0 ? '#4a0d18' : next ? '#1d2434' : '#0e131d';
      const bd = done ? C.ok : next ? C.white : waiting ? C.dim : T.col;
      box(ctx, cx, ky + lift + wob, size, size, bg, bd);
      if (next) frame(ctx, cx - 3, ky + lift + wob - 3, size + 6, size + 6, Math.floor(st.t * 10) % 2 ? T.col : C.white, 2);
      const tok = done ? pr.exp[i] : pr.seq[i];
      drawKey(ctx, tok, cx + size / 2, ky + lift + wob + size / 2, done ? '#062012' : waiting ? C.dim : next ? C.white : T.col, size > 46 ? 5 : 4);
    }

    // Timer bar with the PERFECT zone marked
    const by = y + 112;
    const bw = PW - 40;
    const left = 1 - pr.t / pr.dur;
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 20, by, bw, 12);
    ctx.fillStyle = left > 0.55 ? C.ok : left > 0.25 ? C.hal : C.syn;
    ctx.fillRect(x + 20, by, bw * left, 12);
    ctx.fillStyle = C.white;
    ctx.fillRect(x + 20 + bw * 0.55, by - 2, 2, 16);
    txt(ctx, '◀ PERFECTO', x + 20 + bw * 0.55 + 4, by - 11, C.muted, 9);
    if (pr.type === 'hal' && !waiting) txt(ctx, 'si ves ↑ aprieta ↓ · si ves ← aprieta →', x + PW / 2, by + 16, C.hal, 11, true, 1);
    if (waiting) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 2, y + 40, PW - 4, 60);
      ctx.globalAlpha = 1;
      px(ctx, pr.type === 'hack' ? 'PREPARA EL EXPLOIT' : 'ALERTA DE INTRUSO', x + PW / 2, y + 62, 3, T.col, 1);
    }
  } else if (st.phase === 'play' && !p.floats.length) {
    px(ctx, 'BUILD OK', x + PW / 2, y + 50, 4, '#18402c', 1);
    txt(ctx, '> esperando el próximo error_', x + PW / 2, y + 90, C.dim, 12, false, 1);
  } else if (st.phase === 'count') {
    txt(ctx, '> compilando...', x + PW / 2, y + 70, C.muted, 13, false, 1);
  }

  // Floating judgement text (PERFECTO / BIEN / FALLO)
  for (const f of p.floats) {
    ctx.globalAlpha = Math.min(1, f.t * 2);
    const yy = f.y;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x + 40, yy - 4, PW - 80, f.sub ? 54 : 36);
    px(ctx, f.s, x + PW / 2, yy, 4, f.col, 1);
    if (f.sub) txt(ctx, f.sub, x + PW / 2, yy + 30, C.white, 14, true, 1);
    ctx.globalAlpha = 1;
  }
}

function renderFooter(ctx, st, p, x) {
  const y = FT_Y;
  ctx.fillStyle = '#0a0e16';
  ctx.fillRect(x + 2, y, PW - 4, H - y - 8);
  const s = p.stab;
  const label = s > 60 ? 'DEMO ESTABLE' : s > 30 ? 'DEMO INESTABLE' : '¡LA DEMO SE CAE!';
  const lcol = s > 60 ? C.ok : s > 30 ? C.hal : C.syn;
  txt(ctx, label, x + 12, y + 6, s <= 30 && Math.floor(st.t * 6) % 2 ? C.white : lcol, 12, true);
  txt(ctx, `${Math.round(s)}%`, x + PW - 12, y + 6, lcol, 12, true, 2);
  // Segmented "rock meter"
  const segs = 25;
  const sw = (PW - 24) / segs;
  for (let i = 0; i < segs; i++) {
    const f = i / segs;
    const on = f < s / 100;
    ctx.fillStyle = on ? (f < 0.3 ? C.syn : f < 0.6 ? C.hal : C.ok) : C.dim;
    ctx.fillRect(x + 12 + i * sw, y + 24, sw - 2, 14);
  }

  // Judges react to your demo
  const mood = p.mood || (s > 66 ? 1 : s < 33 ? -1 : 0);
  for (let i = 0; i < 3; i++) {
    const bounce = p.mood && Math.floor(st.t * 8 + i) % 2 ? -3 : 0;
    drawJudge(ctx, x + 14 + i * 40, y + 50 + bounce, mood, i);
  }
  box(ctx, x + 134, y + 52, PW - 146, 34, '#05070b', mood > 0 ? C.ok : mood < 0 ? C.syn : C.dim);
  ctx.fillStyle = mood > 0 ? C.ok : mood < 0 ? C.syn : C.dim;
  ctx.fillRect(x + 128, y + 64, 6, 6);
  txt(ctx, `"${p.quip}"`, x + 144, y + 61, C.white, 13, true);
  txt(ctx, 'JUECES', x + 14, y + 96, C.muted, 10);

  // CLI status line
  ctx.fillStyle = '#05070b';
  ctx.fillRect(x + 8, y + 112, PW - 16, 20);
  txt(ctx, `$ ${p.log}`, x + 14, y + 115, p.flash > 0 ? p.flashCol : '#8a96b4', 12);
}

function renderJoin(ctx, st) {
  ctx.fillStyle = 'rgba(5,7,12,0.86)';
  ctx.fillRect(0, 0, W, H);
  px(ctx, 'ELIGE MODO', W / 2, 140, 6, C.white, 1);
  for (let i = 0; i < 2; i++) {
    const x = 120 + i * 320;
    const ready = st.humans[i];
    const col = i === 0 ? C.p1 : C.p2;
    box(ctx, x - 100, 220, 200, 150, ready ? '#111a10' : '#0d1119', ready ? col : C.dim);
    px(ctx, `P${i + 1}`, x, 240, 6, ready ? col : C.dim, 1);
    txt(ctx, ready ? '¡LISTO!' : 'PRESIONA START', x, 300, ready ? C.white : Math.floor(st.t * 3) % 2 ? C.white : C.muted, 15, true, 1);
    txt(ctx, ready ? 'humano' : 'o juega la CPU', x, 330, C.muted, 13, false, 1);
  }
  const left = Math.max(0, Math.ceil(5 - st.phaseT));
  txt(ctx, `La partida empieza en ${left}s`, W / 2, 410, C.muted, 15, false, 1);
}

function renderCount(ctx, st) {
  const n = Math.ceil(3 - st.phaseT);
  ctx.fillStyle = 'rgba(5,7,12,0.5)';
  ctx.fillRect(0, 230, W, 140);
  const s = n > 0 ? String(n) : '¡DEPLOY!';
  const k = 10 + (1 - (st.phaseT % 1)) * 4;
  px(ctx, s, W / 2, 300 - k * 3, Math.round(k), C.white, 1);
  txt(ctx, 'Arregla cada error antes de que se acabe la barra', W / 2, 352, C.muted, 14, true, 1);
}

function renderBanner(ctx, st) {
  const b = st.banner;
  const e = Math.min(1, (b.dur - b.t) * 6, b.t * 4);
  const h = 120 * e;
  const y = H / 2 - h / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, y, W, h);
  ctx.fillStyle = b.col;
  ctx.fillRect(0, y, W, 4);
  ctx.fillRect(0, y + h - 4, W, 4);
  for (let i = 0; i < 20; i++) {
    ctx.globalAlpha = 0.15;
    ctx.fillRect(((i * 60 + st.t * 300) % (W + 60)) - 60, y, 20, h);
  }
  ctx.globalAlpha = 1;
  if (e > 0.8) {
    px(ctx, b.s, W / 2 + rnd(2), H / 2 - 32, 6, b.col, 1);
    txt(ctx, b.sub, W / 2, H / 2 + 18, C.white, 18, true, 1);
  }
}

function renderOver(ctx, st) {
  ctx.fillStyle = 'rgba(5,7,12,0.9)';
  ctx.fillRect(0, 0, W, H);
  const wp = st.p[st.winner - 1];
  px(ctx, `GANA P${st.winner}`, W / 2, 60, 9, wp.col, 1);
  txt(ctx, st.reason, W / 2, 128, C.white, 16, true, 1);
  // stats table
  const rows = [
    ['PUNTOS', (p) => p.score],
    ['ARREGLOS', (p) => p.stats.fix],
    ['PERFECTOS', (p) => p.stats.perf],
    ['FALLOS', (p) => p.stats.miss],
    ['HACKEOS', (p) => p.stats.hacks],
  ];
  for (let i = 0; i < 2; i++) {
    const p = st.p[i];
    const cx = i === 0 ? 250 : 550;
    px(ctx, `P${p.id}`, cx, 168, 3, p.col, 1);
    txt(ctx, p.cpu ? 'CPU' : 'HUMANO', cx, 190, C.muted, 11, false, 1);
    rows.forEach((r, j) => txt(ctx, String(r[1](p)), cx, 210 + j * 22, j === 0 ? C.white : '#aab4cc', 15, j === 0, 1));
  }
  rows.forEach((r, j) => txt(ctx, r[0], W / 2, 212 + j * 22, C.muted, 12, false, 1));

  if (st.phaseT < 1.2) return;
  if (!st.saved) {
    txt(ctx, `P${st.winner}: ESCRIBE TU TAG (joystick · botón 1 guarda)`, W / 2, 340, C.hal, 14, true, 1);
    for (let i = 0; i < 3; i++) {
      const cx = W / 2 - 75 + i * 52;
      const act = st.tagIdx === i;
      box(ctx, cx, 366, 46, 56, '#05070b', act ? wp.col : C.dim);
      px(ctx, String.fromCharCode(st.tag[i]), cx + 23, 380, 5, act ? wp.col : C.white, 1);
    }
  } else {
    txt(ctx, 'MEJORES CLANKERS', W / 2, 340, C.hal, 14, true, 1);
    st.highScores.slice(0, 5).forEach((e, i) => {
      txt(ctx, `${i + 1}. ${e.tag}   ${String(e.score).padStart(6, '0')}`, W / 2, 364 + i * 20, i ? C.white : C.ok, 14, false, 1);
    });
    if (Math.floor(st.t * 2) % 2) txt(ctx, 'PRESIONA START PARA LA REVANCHA', W / 2, 480, C.white, 16, true, 1);
  }
}

function renderTitle(ctx, st) {
  // streaming code backdrop
  const tc = st.titleCode;
  ctx.globalAlpha = 0.14;
  tc.lines.forEach((ln, i) => drawCode(ctx, ln.s.slice(0, ln.n), 30, 20 + i * 36));
  ctx.globalAlpha = 1;

  const g = Math.floor(st.t * 2) % 7 === 0 ? 3 : 0;
  px(ctx, 'FASTER', W / 2 - g, 22, 9, C.p2, 1);
  px(ctx, 'FASTER', W / 2 + g, 20, 9, C.white, 1);
  px(ctx, 'CLANKER', W / 2 + g, 84, 9, C.p1, 1);
  txt(ctx, 'Eres la IA. El código se escribe solo. Arregla los errores antes de la demo.', W / 2, 150, C.white, 14, true, 1);

  // How to play: the three error types
  const cards = [
    ['syn', 'Repite las flechas.', 'Rápido y frecuente.', ['U', 'R', '1']],
    ['hal', 'Haz las flechas AL REVÉS.', '↑ significa ↓', ['U', 'L', 'D']],
    ['vul', 'Combo largo. Si fallas,', 'el rival te HACKEA.', ['L', 'U', 'R', 'D', '1']],
  ];
  cards.forEach((c, i) => {
    const T = TYPES[c[0]];
    const x = 28 + i * 252;
    box(ctx, x, 180, 240, 150, T.bg, T.col);
    drawIcon(ctx, c[0], x + 12, 192, T.col);
    px(ctx, T.name, x + 44, 192, 3, T.col, 0);
    txt(ctx, c[1], x + 14, 226, C.white, 13, true);
    txt(ctx, c[2], x + 14, 244, '#c6cee0', 13);
    c[3].forEach((d, j) => {
      const kx = x + 14 + j * 40;
      box(ctx, kx, 274, 34, 34, '#0b0f18', T.col);
      drawKey(ctx, d, kx + 17, 291, C.white, 3);
    });
  });

  // Hack explanation
  box(ctx, 28, 344, 744, 58, '#081a33', C.vul);
  px(ctx, 'HACKEO', 44, 358, 3, C.vul, 0);
  txt(ctx, '6 PERFECTOS llenan tu 0-DAY → aprieta 2 para atacar.', 150, 354, C.white, 13, true);
  txt(ctx, 'Carrera: tú HACKEAS y el rival PARCHEA. El más rápido gana y roba puntos.', 150, 374, '#c6cee0', 12);

  // Controls + scores
  box(ctx, 28, 414, 360, 112, '#0d1119', C.dim);
  px(ctx, 'CONTROLES', 44, 426, 2, C.white, 0);
  txt(ctx, 'JOYSTICK  → flechas del combo', 44, 450, '#c6cee0', 13);
  txt(ctx, 'BOTÓN 1   → cuando el combo pide (1)', 44, 470, '#c6cee0', 13);
  txt(ctx, 'BOTÓN 2   → lanzar 0-DAY / matar virus', 44, 490, '#c6cee0', 13);
  txt(ctx, 'Racha = multiplicador x4. Demo al 0% = pierdes.', 44, 508, C.muted, 11);
  box(ctx, 412, 414, 360, 112, '#0d1119', C.dim);
  px(ctx, 'MEJORES CLANKERS', 428, 426, 2, C.hal, 0);
  if (!st.highScores.length) txt(ctx, 'Sin puntajes aún. ¡Sé el primero!', 428, 460, C.muted, 13);
  st.highScores.slice(0, 4).forEach((e, i) => {
    txt(ctx, `${i + 1}. ${e.tag}`, 428, 448 + i * 18, i ? C.white : C.ok, 13, true);
    txt(ctx, String(e.score).padStart(6, '0'), 756, 448 + i * 18, i ? C.white : C.ok, 13, true, 2);
  });

  const on = Math.floor(st.t * 2.5) % 2;
  box(ctx, 200, 540, 400, 44, on ? '#14230a' : '#0d1119', on ? C.p1 : C.dim);
  px(ctx, 'PRESIONA START', W / 2, 552, 3, on ? C.p1 : C.white, 1);
}

// --- drawing primitives -------------------------------------------------------

function txt(ctx, s, x, y, col, size, bold, align) {
  ctx.font = `${bold ? 'bold ' : ''}${size || 12}px "DejaVu Sans Mono", Menlo, Consolas, monospace`;
  ctx.textAlign = align === 1 ? 'center' : align === 2 ? 'right' : 'left';
  ctx.fillStyle = col;
  ctx.fillText(s, x, y);
}

// Chunky pixel font. align: 0 left, 1 center, 2 right
function px(ctx, s, x, y, k, col, align) {
  s = s.normalize('NFD').replace(/[^\x20-\x7e]/g, '');
  const w = s.length * 5 * k - k;
  let cx = Math.round(align === 1 ? x - w / 2 : align === 2 ? x - w : x);
  y = Math.round(y);
  ctx.fillStyle = col;
  for (let i = 0; i < s.length; i++) {
    const g = G.glyphs[s.charCodeAt(i) - 32];
    if (g) for (const [gx, gy] of g) ctx.fillRect(cx + gx * k, y + gy * k, k, k);
    cx += 5 * k;
  }
}

const ARROW = ['00100', '01110', '11111', '00100', '00100'];

function drawKey(ctx, tok, cx, cy, col, k) {
  ctx.fillStyle = col;
  if (tok === '1' || tok === '2') {
    // round button
    const r = k * 3.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#05070b';
    ctx.beginPath();
    ctx.arc(cx, cy, r - k, 0, Math.PI * 2);
    ctx.fill();
    const s = Math.max(1, Math.round(k * 0.6));
    px(ctx, tok, cx + s / 2, cy - 3 * s, s, col, 1);
    return;
  }
  // 5x5 arrow bitmap pointing up; rotated per direction
  const rot = { U: 0, R: 1, D: 2, L: 3 }[tok];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (ARROW[r][c] !== '1') continue;
      let ax = c - 2;
      let ay = r - 2;
      for (let q = 0; q < rot; q++) [ax, ay] = [-ay, ax];
      ctx.fillRect(Math.round(cx + ax * k - k / 2), Math.round(cy + ay * k - k / 2), k, k);
    }
  }
}

function drawIcon(ctx, type, x, y, col) {
  ctx.fillStyle = col;
  if (type === 'syn') px(ctx, '{}', x - 2, y, 3, col, 0);
  else if (type === 'hal') {
    // eye
    ctx.fillRect(x + 2, y + 6, 20, 2);
    ctx.fillRect(x + 6, y + 2, 12, 2);
    ctx.fillRect(x + 6, y + 10, 12, 2);
    ctx.fillRect(x + 10, y + 4, 4, 6);
  } else {
    // padlock
    ctx.fillRect(x + 4, y + 8, 16, 11);
    ctx.fillRect(x + 7, y, 2, 9);
    ctx.fillRect(x + 15, y, 2, 9);
    ctx.fillRect(x + 7, y, 10, 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 11, y + 11, 2, 5);
  }
}

const SKULL = ['0111110', '1111111', '1001001', '1001001', '1111111', '0110110', '0101010'];

function drawSkull(ctx, x, y, k, col) {
  ctx.fillStyle = col;
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) if (SKULL[r][c] === '1') ctx.fillRect(x + c * k * 2, y + r * k * 2, k * 2, k * 2);
}

function drawJudge(ctx, x, y, mood, v) {
  const skin = ['#ffdbac', '#e0ac69', '#8d5524'][v];
  ctx.fillStyle = mood < 0 ? '#ff8a8a' : skin;
  ctx.fillRect(x + 4, y + 4, 22, 22);
  ctx.fillStyle = ['#2f3542', '#c0392b', '#f1c40f'][v];
  ctx.fillRect(x + 2, y, 26, 7);
  ctx.fillStyle = '#000';
  if (mood > 0) {
    ctx.fillRect(x + 5, y + 11, 20, 4); // sunglasses
    ctx.fillRect(x + 9, y + 19, 12, 3);
    ctx.fillRect(x + 8, y + 18, 2, 2);
    ctx.fillRect(x + 20, y + 18, 2, 2);
  } else if (mood < 0) {
    ctx.fillRect(x + 7, y + 9, 5, 2);
    ctx.fillRect(x + 18, y + 9, 5, 2);
    ctx.fillRect(x + 9, y + 12, 3, 3);
    ctx.fillRect(x + 18, y + 12, 3, 3);
    ctx.fillRect(x + 10, y + 19, 10, 4);
  } else {
    ctx.fillRect(x + 9, y + 12, 3, 3);
    ctx.fillRect(x + 18, y + 12, 3, 3);
    ctx.fillRect(x + 11, y + 20, 8, 2);
  }
  ctx.fillStyle = ['#3742fa', '#2f3542', '#16a085'][v];
  ctx.fillRect(x + 1, y + 26, 28, 8);
}

function box(ctx, x, y, w, h, bg, bd) {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  frame(ctx, x, y, w, h, bd, 2);
}

function frame(ctx, x, y, w, h, col, t) {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, t);
  ctx.fillRect(x, y + h - t, w, t);
  ctx.fillRect(x, y, t, h);
  ctx.fillRect(x + w - t, y, t, h);
}

function rnd(a) {
  return (Math.random() * 2 - 1) * a;
}

// ============================================================================
// CONTROLS, SYNTH & STORAGE
// ============================================================================

function createControls(scene) {
  scene.controls = { held: Object.create(null), pressed: Object.create(null) };
  const onKeyDown = (event) => {
    const code = KEYBOARD_TO_ARCADE[normalizeKey(event.key)];
    if (!code) return;
    if (!scene.controls.held[code]) scene.controls.pressed[code] = true;
    scene.controls.held[code] = true;
  };
  const onKeyUp = (event) => {
    const code = KEYBOARD_TO_ARCADE[normalizeKey(event.key)];
    if (code) scene.controls.held[code] = false;
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  scene.events.once('shutdown', () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  });
}

function consumePressed(scene, code) {
  if (scene.controls.pressed[code]) {
    scene.controls.pressed[code] = false;
    return true;
  }
  return false;
}

function audio(scene) {
  return scene.sound && scene.sound.context ? scene.sound.context : null;
}

function unlockAudio(scene) {
  const ctx = audio(scene);
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function tone(scene, f, dur, type, vol, f2, delay) {
  try {
    const ctx = audio(scene);
    if (!ctx) return;
    const t = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch (_) {}
}

function noise(scene, dur, vol) {
  try {
    const ctx = audio(scene);
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * vol * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
  } catch (_) {}
}

// Driving bassline whose tempo rises with the match
const BASS = [55, 55, 82.4, 55, 73.4, 55, 65.4, 73.4];

function music(scene, dt) {
  const st = scene.st;
  st.beat -= dt;
  if (st.beat > 0) return;
  st.beat += 0.16 - 0.05 * st.lv;
  const i = st.beatStep++;
  const up = st.timeLeft <= 15 ? 2 : 1;
  tone(scene, BASS[i % 8] * up * (Math.floor(i / 16) % 2 ? 1.19 : 1), 0.13, 'triangle', 0.07);
  if (i % 2) tone(scene, 6000, 0.02, 'square', 0.012);
  if (st.race && i % 2 === 0) tone(scene, 1760, 0.04, 'square', 0.03);
}

function getStorage() {
  if (window.platanusArcadeStorage) return window.platanusArcadeStorage;
  return {
    async get(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? { found: false, value: null } : { found: true, value: JSON.parse(raw) };
      } catch {
        return { found: false, value: null };
      }
    },
    async set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {}
    },
  };
}

async function loadHighScores() {
  try {
    const res = await getStorage().get(STORAGE_KEY);
    if (res && res.found && Array.isArray(res.value)) {
      return res.value.filter((e) => e && typeof e.tag === 'string' && typeof e.score === 'number').slice(0, 5);
    }
  } catch (_) {}
  return [];
}

async function saveHighScore(scene, entry) {
  try {
    const list = scene.st.highScores.concat(entry).sort((a, b) => b.score - a.score).slice(0, 5);
    scene.st.highScores = list;
    await getStorage().set(STORAGE_KEY, list);
  } catch (_) {}
}
