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
  tut: '#3ce8e0', // practice mode: everything practice-only wears this color
  kw: '#8fb4ff',
  str: '#9be38f',
  com: '#5f8f6a',
  num: '#ffb86b',
};

// Error types: each one plays differently and has its own color/sound/visual
const TYPES = {
  syn: { name: 'BUG', tag: 'BUG', how: 'COPIA LAS FLECHAS', col: C.syn, bg: '#2a0b12', pts: 100 },
  hal: { name: 'ALUCINACION', tag: 'ALUCINACIÓN', how: '¡AL REVÉS! ↑=↓ ←=→', col: C.hal, bg: '#2a1a03', pts: 150 },
  vul: { name: 'VULNERABLE', tag: 'VULN ⚠', how: 'COPIA · NO DEJES PASAR', col: C.vul, bg: '#081a33', pts: 200 },
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

const DIRS = ['U', 'D', 'L', 'R'];
const OPP = { U: 'D', D: 'U', L: 'R', R: 'L' };
const AR = { U: '↑', D: '↓', L: '←', R: '→', 1: '(1)' };

// Practice mode: one scripted error per step, no timer and no penalties
const TUT_T = ['syn', 'hal', 'hal', 'vul'];
const TUT_OK = ['bug arreglado', 'alucinación borrada', '¡ya la cachaste!', 'agujero cerrado', 'así le robas puntos'];
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
    tags: [],
    mine: [],
    idle: 0,
    tutEnd: 0,
    winner: 0,
    reason: '',
    beat: 0,
    beatStep: 0,
  };
  refreshScores(scene);
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
    term: [['$ npx clanker --turbo', C.muted], ['clanker v4.2 listo · escribiendo demo.ts', C.ok]],
    prod: [0, 0, 0],
    cpuT: 0.5,
    tut: 5,
    tutW: 0,
    hint: null,
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
  const menu = st.phase === 'title' || st.phase === 'join';
  const any1 = menu && anyPressed(scene, 1);
  const any2 = menu && anyPressed(scene, 2);

  if (st.phase === 'title') {
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
      startTut(scene);
    }
  } else if (st.phase === 'tut') {
    updateTut(scene, dt);
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
    updateGameOver(scene, dt);
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
  clearInput(scene);
}

// --- practice ----------------------------------------------------------------

function startTut(scene) {
  const st = scene.st;
  startMatch(scene);
  st.phase = 'tut';
  st.tutEnd = 0;
  for (const p of st.p) {
    p.tut = p.cpu ? 5 : 0;
    tutStep(scene, p);
  }
}

function tutStep(scene, p) {
  if (p.prompt && p.prompt.line) p.prompt.line.st = '';
  p.prompt = null;
  if (p.tut < 4) spawnError(scene, p, TUT_T[p.tut]);
  else if (p.tut === 4) {
    p.zd = 6;
  } else {
    p.zd = 0;
  }
}

function updateTut(scene, dt) {
  const st = scene.st;
  for (let i = 0; i < 2; i++) {
    const p = st.p[i];
    const pr = p.prompt;
    tickFx(p, dt);
    // The editor waits on the broken line so it never scrolls away
    if (!pr || !pr.line || pr.line.n < pr.line.s.length) streamCode(p, dt, 30);
    if (pr && pr.wait > 0) pr.wait -= dt;
    if (p.tutW > 0 && (p.tutW -= dt) <= 0) {
      p.tut++;
      tutStep(scene, p);
    }
    if (p.cpu) continue;
    if (p.tut < 5 && consumePressed(scene, `START${p.id}`)) {
      p.tut = 5;
      p.tutW = 0;
      tutStep(scene, p);
      tone(scene, 880, 0.08, 'square', 0.08);
    }
    for (const tok of readTokens(scene, p.id)) handleToken(scene, p, st.p[1 - i], tok);
  }
  st.tutEnd = st.p.every((p) => p.tut >= 5) ? st.tutEnd + dt : 0;
  if (st.tutEnd > 1.2 || st.phaseT > 150) startMatch(scene);
}

function tutClear(scene, p) {
  const pr = p.prompt;
  fixLine(pr.line);
  p.prompt = null;
  p.tutW = 1.5;
  p.flash = 0.18;
  p.flashCol = C.ok;
  addFloat(p, pr.type === 'hack' ? 'ROOT ACCESS' : '¡BIEN!', C.ok, TUT_OK[p.tut]);
  tone(scene, 660, 0.06, 'square', 0.1);
  tone(scene, 880, 0.06, 'square', 0.1, 0, 0.05);
  tone(scene, 1320, 0.12, 'square', 0.1, 0, 0.1);
}

function setHint(p, s, c) {
  p.hint = { s, c, t: 2.2 };
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
    finishMatch(scene, w, '¡TIEMPO! GANA EL MEJOR PUNTAJE');
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
  if (p.hint && (p.hint.t -= dt) <= 0) p.hint = null;
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

function spawnError(scene, p, force) {
  const lv = scene.st.lv;
  const roll = Math.random();
  // Early on it's mostly plain bugs; hallucinations and vulns ramp up with the match
  const type = force || (roll < 0.62 - 0.17 * lv ? 'syn' : roll < 0.86 - 0.1 * lv ? 'hal' : 'vul');
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

  // Easy curve: long timers and short combos for the first half, then it squeezes
  const e = lv * lv;
  const len = force ? 3 + (type === 'vul') : type === 'syn' ? 2 + (lv > 0.2) + (lv > 0.6) : type === 'hal' ? 2 + (lv > 0.35) + (lv > 0.75) : 4 + (lv > 0.5);
  const base = type === 'syn' ? 3.6 - 1.7 * e : type === 'hal' ? 4.6 - 2.1 * e : 5.8 - 2.4 * e;
  // The first practice bug always ends on button 1 so it gets taught
  setPrompt(p, type, makeSeq(len, type === 'hal' ? 0 : force === 'syn' ? 1 : 0.25), base + (len > 3 && type !== 'vul' ? 0.3 : 0), ln);
  if (type === 'syn') log(p, `tsc: error TS1005 en demo.ts:${ln.no}`, C.syn);
  else if (type === 'hal') log(p, `warn: '${(bad.match(/(\w+)\(/) || [0, 'winHack'])[1]}' no existe · L${ln.no}`, C.hal);
  else log(p, `npm audit: 1 critical · demo.ts:${ln.no}`, C.vul);
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
    a: 0,
  };
  // CPU paces itself to finish at 38–93% of the timer: PERFECT ~40% of the time
  p.cpuS = (dur * (0.38 + Math.random() * 0.55)) / seq.length;
  p.cpuT = p.cpuS + (wait || 0);
}

function handleToken(scene, p, rival, tok) {
  const st = scene.st;
  const tut = st.phase === 'tut';
  if (st.phase !== 'play' && !tut) return;

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

  const pr = p.prompt;
  if (tok === '2') {
    if (tut) {
      // Practice hack: a solo exploit combo, the rival isn't touched
      if (p.tut === 4 && !pr && p.tutW <= 0) {
        p.zd = 0;
        setPrompt(p, 'hack', makeSeq(5, 0.5), 9, null, 0.6);
        for (let i = 0; i < 2; i++) tone(scene, 500, 0.18, 'sawtooth', 0.08, 1100, i * 0.2);
      }
    } else if (p.zd >= 6 && !st.race && rival.lock <= 0) {
      p.zd = 0;
      startRace(scene, p, rival, `P${p.id} LANZÓ UN 0-DAY`);
      log(rival, `!! p${p.id} llenó su 0-DAY con 6 PERFECTOS`, C.syn);
    }
    return;
  }

  if (!pr) {
    if (tut && p.tut === 4 && p.tutW <= 0) setHint(p, 'Aprieta el BOTÓN 2 para atacar', C.vul);
    return;
  }
  if (pr.wait > 0) return;
  if (tok === pr.exp[pr.i]) {
    pr.i++;
    pr.pop = 0.12;
    tone(scene, 700 + pr.i * 90, 0.04, 'square', 0.07);
    if (pr.i >= pr.exp.length) completePrompt(scene, p, rival);
  } else {
    // Explain the mistake when it's the classic mix-up: hallucinations are the only reversed combo
    const want = pr.exp[pr.i];
    if (pr.type === 'hal') {
      // First slip on a hallucination: flash, blink AL REVES and show the real arrows
      pr.h = 1;
      p.flash = 0.25;
      p.flashCol = C.hal;
      setHint(p, `¡AL REVÉS! ${AR[pr.seq[pr.i]]} = ${AR[want]}`, C.hal);
    }
    else if (pr.type !== 'hal' && tok === OPP[want]) setHint(p, 'Esta va IGUAL: solo la alucinación se invierte', C.white);
    else if (tut) setHint(p, `Ahora toca ${AR[want]}`, C.white);
    pr.err = 0.3;
    p.shake = 0.2;
    tone(scene, 140, 0.12, 'sawtooth', 0.12, 90);
    if (tut) return;
    // Wrong input: progress resets and you lose time — mashing doesn't pay
    pr.i = 0;
    pr.t = Math.min(pr.dur - 0.05, pr.t + 0.3);
    p.stab = Math.max(0, p.stab - 2);
  }
}

function completePrompt(scene, p, rival) {
  const st = scene.st;
  const pr = p.prompt;
  if (st.phase === 'tut') return tutClear(scene, p);
  if (pr.type === 'hack') return hackSuccess(scene, p, rival);
  if (pr.type === 'patch') return patchSuccess(scene, p, rival);

  const perfect = pr.t <= pr.dur * 0.6;
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
        log(p, '0-day listo >> BOTÓN 2 para hackear', C.vul);
        tone(scene, 1200, 0.3, 'triangle', 0.1, 1800, 0.12);
      }
    }
  }
  fixLine(pr.line);
  const up = p.mult > 1 && p.streak % 4 === 0;
  addFloat(p, perfect ? '¡PERFECTO!' : 'BIEN', perfect ? C.ok : C.white, `+${pts}${up ? `  ·  ¡MULTI x${p.mult}!` : ''}`);
  p.flash = 0.18;
  p.flashCol = C.ok;
  log(p, `$ git commit -m "fix L${pr.line.no}" ${perfect ? '⚡' : ''}+${pts}`, C.ok);
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
  if (up) {
    log(p, `racha ${p.streak} · multiplicador x${p.mult}`, p.col);
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
  p.prod[['syn', 'hal', 'vul'].indexOf(pr.type)]++;
  log(p, `$ git push prod → ${pr.type === 'syn' ? '500 Internal Server Error' : pr.type === 'hal' ? 'IA slop en producción' : 'CVE expuesto en prod'}`, C.syn);
  tone(scene, 220, 0.35, 'sawtooth', 0.16, 60);
  if (pr.type === 'vul' && !st.race && rival.lock <= 0 && p.lock <= 0) {
    startRace(scene, rival, p, `BRECHA EN P${p.id}`);
    log(p, '!! dejaste pasar una vulnerabilidad', C.syn);
  }
}

function fixLine(ln) {
  if (!ln) return;
  ln.s = ln.fix;
  ln.n = ln.s.length;
  ln.st = 'ok';
  ln.fixT = 0.5;
}

function nextGap(st) {
  return 1.8 - 1.2 * st.lv + Math.random() * 0.6;
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
  log(a, `$ nmap -sV p${v.id}.hack26 → 22/tcp open`, C.vul);
  log(v, '!! intrusión detectada · ¡PARCHEA!', C.syn);
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
  log(v, `root@p${a.id}:~# rm -rf demo/`, C.syn);
  log(a, `root access · ${steal} pts robados`, C.vul);
  addFloat(a, 'ROOT ACCESS', C.vul, `+${steal} ROBADOS`);
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
  log(v, '$ iptables -A INPUT -j DROP · bloqueado', C.ok);
  log(a, 'ssh: connection refused', C.syn);
  showBanner(st, `P${v.id} BLOQUEÓ EL HACK`, '¡FIREWALL ARRIBA!', C.ok, 1.3);
  tone(scene, 440, 0.1, 'square', 0.1);
  tone(scene, 660, 0.1, 'square', 0.1, 0, 0.1);
  tone(scene, 990, 0.2, 'square', 0.1, 0, 0.2);
}

function unlock(scene, p) {
  p.lock = 0;
  p.popups = [];
  p.nextErr = 1;
  log(p, '$ kill -9 4242 · sistema restaurado', C.ok);
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
  // A full 0-DAY waits a moment so the human sees the CPU panel flashing first
  if (p.zd >= 6 && !st.race && rival.lock <= 0) {
    p.zw = p.zw || st.t + 2.5;
    if (st.t > p.zw) {
      p.zw = 0;
      p.cpuT = 0.5;
      return handleToken(scene, p, rival, '2');
    }
  }
  const pr = p.prompt;
  if (!pr || pr.wait > 0) {
    p.cpuT = 0.1;
    return;
  }
  const want = pr.exp[pr.i];
  const miss = Math.random() < (pr.type === 'hal' ? 0.1 : 0.06);
  p.cpuT = p.cpuS * (0.7 + Math.random() * 0.6);
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
  // Every human with points gets a tag, winner or not (a CPU win used to skip the ranking)
  st.tags = st.p.map((p) => ({ c: [65, 65, 65], i: 0, done: p.cpu || p.score <= 0, rank: 0 }));
  st.mine = [];
  st.idle = 0;
  clearInput(scene);
  tone(scene, 523, 0.15, 'square', 0.12);
  tone(scene, 659, 0.15, 'square', 0.12, 0, 0.15);
  tone(scene, 784, 0.15, 'square', 0.12, 0, 0.3);
  tone(scene, 1046, 0.4, 'square', 0.12, 0, 0.45);
}

function updateGameOver(scene, dt) {
  const st = scene.st;
  st.idle += dt;
  const all = st.tags.every((t) => t.done);
  let back = st.idle > 40;
  for (let i = 0; i < 2; i++) {
    const tg = st.tags[i];
    const toks = readTokens(scene, i + 1);
    const ok = consumePressed(scene, `START${i + 1}`) || toks.includes('1');
    if (st.phaseT < 1.2) continue;
    if (ok || toks.length) st.idle = 0;
    if (all) {
      if (ok) back = true;
      continue;
    }
    if (tg.done) continue;
    for (const t of toks) {
      if (t === 'L') tg.i = (tg.i + 2) % 3;
      else if (t === 'R') tg.i = (tg.i + 1) % 3;
      else if (t === 'U') tg.c[tg.i] = tg.c[tg.i] >= 90 ? 65 : tg.c[tg.i] + 1;
      else if (t === 'D') tg.c[tg.i] = tg.c[tg.i] <= 65 ? 90 : tg.c[tg.i] - 1;
      else continue;
      tone(scene, 800, 0.03, 'square', 0.06);
    }
    if (ok) {
      saveTag(scene, i);
      tone(scene, 1046, 0.2, 'square', 0.1);
    }
  }
  if (back) {
    // Walked away mid-entry: keep the score anyway
    st.tags.forEach((t, i) => t.done || saveTag(scene, i));
    st.phase = 'title';
    st.phaseT = 0;
    clearInput(scene);
    refreshScores(scene);
  }
}

function saveTag(scene, i) {
  const st = scene.st;
  const tg = st.tags[i];
  tg.done = true;
  const e = { tag: String.fromCharCode(...tg.c), score: st.p[i].score, id: Date.now() * 2 + i };
  st.mine.push(e.id);
  saveHighScore(scene, e).then((r) => (tg.rank = r || 99));
}

// --- small helpers -----------------------------------------------------------

function addFloat(p, s, col, sub) {
  // One judgement at a time: a new one replaces the old so they never stack
  p.floats = [{ s, sub, col, t: 1.1, y: ACT_Y + 40 }];
}

// Terminal log under each editor: every action prints a (fake but plausible) command
function log(p, s, c) {
  p.term.push([s, c || '#8a96b4']);
  if (p.term.length > 4) p.term.shift();
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
  const tut = st.phase === 'tut';
  ctx.fillStyle = tut ? '#062624' : '#0b0f18';
  ctx.fillRect(0, 0, W, 44);
  ctx.fillStyle = C.line;
  ctx.fillRect(0, 44, W, 2);
  // Practice: scrolling hazard stripes under the bar
  if (tut) for (let i = -1; i < 42; i++) {
    ctx.fillStyle = C.tut;
    ctx.beginPath();
    const sx = i * 20 + ((st.t * 30) % 20);
    ctx.moveTo(sx, 46);
    ctx.lineTo(sx + 10, 46);
    ctx.lineTo(sx + 6, 50);
    ctx.lineTo(sx - 4, 50);
    ctx.fill();
  }
  for (let i = 0; i < 2; i++) {
    const p = st.p[i];
    const x = i === 0 ? 14 : W - 14;
    px(ctx, `P${p.id}`, x, 10, 3, p.col, i * 2);
    const lb = !tut || p.cpu ? (p.cpu ? 'CPU' : 'HUMANO') : p.tut < 5 ? 'START = saltar' : '¡LISTO!';
    txt(ctx, lb, i === 0 ? x + 38 : x - 38, 16, tut && !p.cpu ? C.tut : C.muted, 12, tut, i * 2);
  }
  if (tut) {
    box(ctx, W / 2 - 100, 2, 200, 40, '#031614', C.tut);
    px(ctx, 'MODO PRACTICA', W / 2, 16, 2, Math.floor(st.t * 2) % 2 ? C.tut : C.white, 1);
    return;
  }
  const secs = Math.ceil(st.timeLeft);
  const hot = secs <= 15;
  const blink = hot && Math.floor(st.t * 4) % 2 === 0;
  box(ctx, W / 2 - 60, 2, 120, 40, hot ? '#2a0b12' : '#05070b', hot ? C.syn : C.dim);
  px(ctx, String(secs).padStart(2, '0'), W / 2, 8, 5, blink ? C.white : hot ? C.syn : C.white, 1);
  txt(ctx, 'SEG', W / 2 + 32, 26, C.muted, 10);
  const stage = st.lv < 0.33 ? 'SPRINT 1 · CHILL' : st.lv < 0.66 ? 'SPRINT 2 · CAFEÍNA' : 'SPRINT 3 · PROD EN LLAMAS';
  txt(ctx, stage, W / 2 - 74, 16, st.lv < 0.66 ? C.muted : C.hal, 11, true, 2);
  txt(ctx, `${Math.round(50 + 100 * st.lv)} tok/s`, W / 2 + 74, 16, C.muted, 11, false, 0);
}

function renderPanel(ctx, st, p, rival, x) {
  const race = st.race;
  const attacking = race && race.a === p;
  const defending = race && race.v === p;
  const zdReady = p.zd >= 6 && (st.phase === 'play' || st.phase === 'tut');
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
  } else if (st.phase === 'tut') {
    ctx.fillStyle = 'rgba(60,232,224,0.07)';
    ctx.fillRect(x, HDR_Y, PW, H - HDR_Y - 6);
  }

  renderHeader(ctx, st, p, x);
  renderEditor(ctx, st, p, x);
  renderAction(ctx, st, p, rival, x);
  if (st.phase === 'tut' && p.tut < 5) {
    // Spotlight: darken header + editor, cut a hole over the broken line
    const ln = p.prompt && p.prompt.line;
    const top = p.tut === 4 ? ED_Y : HDR_Y;
    ctx.fillStyle = 'rgba(0,0,0,.75)';
    ctx.beginPath();
    ctx.rect(x, top, PW, ACT_Y - top);
    if (ln) ctx.rect(x + 32, p.aly - 2, PW - 34, LINE_H);
    ctx.fill('evenodd');
    if (ln) frame(ctx, x + 30, p.aly - 4, PW - 30, LINE_H + 4, Math.floor(st.t * 4) % 2 ? TYPES[p.prompt.type].col : C.white, 2);
    frame(ctx, x + 2, ACT_Y, PW - 4, ACT_H, Math.floor(st.t * 4) % 2 ? C.tut : C.white, 2);
  }
  if (st.phase === 'tut') renderCoach(ctx, st, p, x);
  else renderFooter(ctx, st, p, x);

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
  } else if (st.phase === 'tut') {
    bc = C.tut;
    bw = 4;
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
  const tut = st.phase === 'tut';
  ctx.fillStyle = tut ? '#062624' : '#0a0e16';
  ctx.fillRect(x + 2, y + 2, PW - 4, 54);
  if (tut) {
    // No score in practice: the header says so instead
    px(ctx, 'PRACTICA', x + 12, y + 8, 4, C.tut, 0);
    txt(ctx, 'no suma puntos', x + PW - 12, y + 12, '#8fd8d2', 11, true, 2);
  } else {
    px(ctx, String(p.score).padStart(6, '0'), x + 12, y + 8, 4, C.white, 0);
    txt(ctx, 'PUNTOS', x + 12, y + 36, C.muted, 10);
  }

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

  if (tut) return;
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
  if (st.phase === 'tut') txt(ctx, `p${p.id}/practica.ts — de mentira, no pasa nada`, x + 46, y0 + 2, C.tut, 11);
  else txt(ctx, `p${p.id}/demo.ts — clanker escribiendo…`, x + 46, y0 + 2, C.muted, 11);
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
    if (active) p.aly = ly;
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
    // While an error is live the rest of the code fades out so the broken line stands alone
    const fade = active ? 1 : p.prompt && p.prompt.line ? 0.25 : age > 8 ? 0.55 : 1;
    ctx.globalAlpha = fade;
    if (active && ln.e === 'hal') {
      // hallucinations wobble and ghost
      const j = Math.sin(st.t * 18) * 2;
      txt(ctx, shown, x + 38 + j, ly + 1, 'rgba(255,174,0,0.35)', 12);
      txt(ctx, shown, x + 38 - j * 0.5, ly, C.hal, 12, true);
    } else if (active && ln.e === 'vul') {
      txt(ctx, shown, x + 38, ly, '#9fcbff', 12, true);
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
    if (active) {
      // Name tag on the broken line: tells a plain bug apart from a hallucination
      const T = TYPES[ln.e];
      const w = T.tag.length * 6.2 + 8;
      ctx.fillStyle = T.col;
      ctx.fillRect(x + PW - 8 - w, ly - 1, w, 13);
      txt(ctx, T.tag, x + PW - 12, ly, '#05070b', 10, true, 2);
    }
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
    const tut = st.phase === 'tut';
    // Real arrows appear under each key in the first practice hallucination, or after a slip
    const help = (tut && p.tut === 1) || pr.h;
    ctx.fillStyle = T.bg;
    ctx.fillRect(x + 2, y, PW - 4, ACT_H);
    ctx.fillStyle = T.col;
    ctx.fillRect(x + 2, y, PW - 4, 4);
    // Type label + icon
    drawIcon(ctx, pr.type, x + 12, y + 12, T.col);
    px(ctx, pr.h && Math.floor(st.t * 6) % 2 ? 'AL REVES' : T.name, x + 44, y + 12, 3, T.col, 0);
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
    pr.a += 1 / 60;
    for (let i = 0; i < n; i++) {
      const cx = kx + i * (size + gap);
      const done = i < pr.i;
      const next = i === pr.i && !waiting;
      const lift = next ? -3 - (pr.pop > 0 ? 3 : 0) : 0;
      const wob = pr.type === 'hal' && !done ? Math.sin(st.t * 9 + i) * 2 : 0;
      const bg = done ? C.ok : pr.err > 0 ? '#4a0d18' : next ? '#1d2434' : '#0e131d';
      const bd = done ? C.ok : next ? C.white : waiting ? C.dim : T.col;
      box(ctx, cx, ky + lift + wob, size, size, bg, bd);
      if (pr.type === 'hal' && !done) {
        // glitchy double outline: hallucination keys don't look like normal keys
        frame(ctx, cx - 3, ky + lift + wob + 2, size, size, '#f0f', 1);
        frame(ctx, cx + 3, ky + lift + wob - 2, size, size, '#0ff', 1);
      }
      if (next) frame(ctx, cx - 3, ky + lift + wob - 3, size + 6, size + 6, Math.floor(st.t * 10) % 2 ? T.col : C.white, 2);
      const tok = done ? pr.exp[i] : pr.seq[i];
      // Hallucinations: pending arrows keep spinning to their opposite and back — "this one flips"
      const ph = (pr.a + 2 - i * 0.1) % 2;
      const f = pr.type === 'hal' && !done && !waiting && ph < 0.7 ? Math.sin(ph * 4.49) : 0;
      ctx.save();
      ctx.translate(cx + size / 2, ky + lift + wob + size / 2);
      ctx.rotate(f * Math.PI);
      drawKey(ctx, tok, 0, 0, done ? '#062012' : waiting ? C.dim : next || f > 0.6 ? C.white : T.col, size > 46 ? 5 : 4);
      ctx.restore();
      // First practice hallucination shows which arrow to really press
      if (help && !done) txt(ctx, AR[pr.exp[i]], cx + size / 2, ky + size + 1, C.white, 17, true, 1);
    }
    if (help) txt(ctx, 'aprieta', kx - 8, ky + size + 3, C.hal, 10, true, 2);

    // Timer bar with the PERFECT zone marked
    const by = y + 112;
    const bw = PW - 40;
    const left = 1 - pr.t / pr.dur;
    if (tut) help || txt(ctx, 'práctica · tómate tu tiempo', x + PW / 2, by + 1, C.muted, 11, false, 1);
    else {
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 20, by, bw, 12);
      ctx.fillStyle = left > 0.4 ? C.ok : left > 0.2 ? C.hal : C.syn;
      ctx.fillRect(x + 20, by, bw * left, 12);
      ctx.fillStyle = C.white;
      ctx.fillRect(x + 20 + bw * 0.4, by - 2, 2, 16);
      help || txt(ctx, '◀ PERFECTO', x + 20 + bw * 0.4 + 4, by - 11, C.muted, 9);
    }
    if (p.hint) txt(ctx, p.hint.s, x + PW / 2, by + 16, p.hint.c, 14, true, 1);
    if (waiting) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 2, y + 40, PW - 4, 60);
      ctx.globalAlpha = 1;
      px(ctx, pr.type === 'hack' ? 'PREPARA EL EXPLOIT' : 'ALERTA DE INTRUSO', x + PW / 2, y + 62, 3, T.col, 1);
    }
  } else if (st.phase === 'tut' && !p.floats.length) {
    if (p.tut === 4) {
      px(ctx, '0-DAY LISTO', x + PW / 2, y + 18, 4, C.vul, 1);
      drawKey(ctx, '2', x + PW / 2, y + 78, Math.floor(st.t * 4) % 2 ? C.white : C.vul, 6);
      txt(ctx, 'APRIETA EL BOTÓN 2', x + PW / 2, y + 108, C.white, 13, true, 1);
      if (p.hint) txt(ctx, p.hint.s, x + PW / 2, y + 128, p.hint.c, 11, true, 1);
    } else if (p.tut >= 5) {
      px(ctx, 'LISTO', x + PW / 2, y + 40, 6, C.ok, 1);
      txt(ctx, p.cpu ? 'la CPU ya conoce las reglas' : 'esperando al rival...', x + PW / 2, y + 100, C.muted, 12, false, 1);
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

  // Terminal: the match as a stream of commands, plus the audit of what reached prod
  ctx.fillStyle = '#04060a';
  ctx.fillRect(x + 8, y + 44, PW - 16, 92);
  p.term.forEach((l, i) => txt(ctx, l[0].slice(0, 54), x + 14, y + 48 + i * 14, l[1], 11));
  const pr = p.prompt;
  const cmd = pr ? `$ ${{ syn: 'vim +' + (pr.line && pr.line.no) + ' demo.ts', hal: 'git revert --ia', vul: 'npm audit fix', hack: 'ssh root@p' + (3 - p.id), patch: 'iptables -A INPUT' }[pr.type]} ${'■'.repeat(pr.i)}${'□'.repeat(pr.exp.length - pr.i)}` : '$ ' + (Math.floor(st.t * 3) % 2 ? '_' : '');
  txt(ctx, cmd, x + 14, y + 104, pr ? TYPES[pr.type].col : C.white, 11, true);
  const [b, h, v] = p.prod;
  ctx.fillStyle = b + h + v ? '#2a0b12' : '#0b2016';
  ctx.fillRect(x + 8, y + 120, PW - 16, 16);
  txt(ctx, b + h + v ? `audit: ${v} vulns · ${b} bugs · ${h} alucinaciones en prod` : 'audit: 0 vulnerabilidades · prod limpio ✓', x + 14, y + 122, b + h + v ? C.syn : C.ok, 11, true);
}

function coach(st, p) {
  const n = p.tut;
  if (n === 0)
    return ['PASO 1/4 · BUG', C.syn, [
      ['La IA escribió un typo: no compila.'],
      ['Es un BUG normal: COPIA las flechas'],
      ['tal cual, con el joystick.'],
      ['El círculo (1) es el BOTÓN 1.', C.muted],
    ]];
  if (n === 1)
    return ['PASO 2/4 · ALUCINACION', C.hal, [
      ['Código inventado: va ¡AL REVÉS!', C.hal],
      ['↑ es ↓     ← es →'],
      ['Las flechas que GIRAN se invierten.', C.muted],
    ]];
  if (n === 2)
    return ['PASO 2/4 · OTRA MAS', C.hal, [
      ['Ahora sin pista. Fíjate en el COLOR:'],
      ['ROJO     = bug         → IGUAL', C.syn],
      ['AMARILLO = alucinación → AL REVÉS', C.hal],
      ['AZUL     = vulnerable  → IGUAL', C.vul],
    ]];
  if (n === 3)
    return ['PASO 3/4 · VULNERABILIDAD', C.vul, [
      ['Un agujero de seguridad. Flechas IGUAL,'],
      ['pero el combo es más largo.'],
      ['Si se te pasa el tiempo, el rival'],
      ['puede HACKEARTE y robarte puntos.', C.vul],
    ]];
  if (n === 4)
    return ['PASO 4/4 · HACKEO', C.vul, p.prompt ? [
      ['Carrera: tú metes el exploit y'],
      ['el rival mete el parche.'],
      ['El más rápido gana y roba puntos.'],
      ['(En la práctica nadie se defiende.)', C.muted],
    ] : [
      ['Arreglar RÁPIDO (PERFECTO) carga el 0-DAY.'],
      ['Con el 0-DAY lleno, el BOTÓN 2 ataca.'],
      ['Te lo llenamos: ¡aprieta 2!', C.vul],
    ]];
  return ['¡A LA HACKATON!', C.ok, [
    ['90 segundos. Más arreglos = más puntos.'],
    ['Si tu demo llega a 0%, pierdes.'],
    ['Si te hackean: machaca 1 y 2.'],
    [st.p.every((q) => q.tut >= 5) ? 'Arrancando...' : 'Esperando al rival...', C.muted],
  ]];
}

function renderCoach(ctx, st, p, x) {
  const y = FT_Y;
  const [title, col, lines] = coach(st, p);
  ctx.fillStyle = '#0a0e16';
  ctx.fillRect(x + 2, y, PW - 4, H - y - 8);
  ctx.fillStyle = col;
  ctx.fillRect(x + 2, y, PW - 4, 3);
  px(ctx, title, x + 12, y + 10, 2, col, 0);
  lines.forEach((l, i) => txt(ctx, l[0], x + 12, y + 32 + i * 18, l[1] || C.white, 12, true));
  if (p.tut < 5) {
    box(ctx, x + PW - 150, y + 110, 142, 22, '#031614', C.tut);
    if (Math.floor(st.t * 2) % 2) px(ctx, 'START: SALTAR', x + PW - 79, y + 115, 2, C.tut, 1);
  }
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
  txt(ctx, 'Antes: una práctica corta. START la salta.', W / 2, 436, C.muted, 13, false, 1);
}

function renderCount(ctx, st) {
  const n = Math.ceil(3 - st.phaseT);
  ctx.fillStyle = 'rgba(5,7,12,0.5)';
  ctx.fillRect(0, 230, W, 140);
  const s = n > 0 ? String(n) : '¡DEPLOY!';
  const k = 10 + (1 - (st.phaseT % 1)) * 4;
  // The countdown always follows practice: make the switch to the real match obvious
  ctx.fillStyle = C.syn;
  ctx.fillRect(0, 186, W, 40);
  px(ctx, 'FIN DE LA PRACTICA', W / 2, 192, 3, C.white, 1);
  txt(ctx, '¡AHORA VA EN SERIO!', W / 2, 212, '#ffe0e4', 11, true, 1);
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
  ctx.fillStyle = 'rgba(5,7,12,0.93)';
  ctx.fillRect(0, 0, W, H);
  const wp = st.p[st.winner - 1];
  const blink = Math.floor(st.t * 3) % 2;
  px(ctx, `GANA P${st.winner}`, W / 2, 22, 8, wp.col, 1);
  txt(ctx, st.reason, W / 2, 80, C.white, 16, true, 1);
  const rows = [
    ['PUNTOS', (p) => p.score],
    ['ARREGLOS', (p) => p.stats.fix],
    ['PERFECTOS', (p) => p.stats.perf],
    ['FALLOS', (p) => p.stats.miss],
    ['HACKEOS', (p) => p.stats.hacks],
  ];
  rows.forEach((r, j) => txt(ctx, r[0], W / 2, 136 + j * 20, C.muted, 12, false, 1));
  for (let i = 0; i < 2; i++) {
    const p = st.p[i];
    const tg = st.tags[i];
    const cx = i === 0 ? 200 : 600;
    px(ctx, `P${p.id}`, cx, 104, 3, p.col, 1);
    rows.forEach((r, j) => txt(ctx, String(r[1](p)), cx, 134 + j * 20, j === 0 ? C.white : '#aab4cc', 15, j === 0, 1));
    // Tag entry: each human fills their own, side by side
    if (p.cpu) txt(ctx, 'CPU · fuera del ranking', cx, 290, C.muted, 12, false, 1);
    else if (!tg.done && st.phaseT >= 1.2) {
      txt(ctx, 'ESCRIBE TU TAG', cx, 248, C.hal, 13, true, 1);
      for (let k = 0; k < 3; k++) {
        const bx = cx - 73 + k * 50;
        const act = tg.i === k;
        box(ctx, bx, 270, 46, 52, '#05070b', act ? p.col : C.dim);
        px(ctx, String.fromCharCode(tg.c[k]), bx + 23, 281, 5, act ? p.col : C.white, 1);
        if (act) {
          txt(ctx, '▲', bx + 23, 256, p.col, 12, true, 1);
          txt(ctx, '▼', bx + 23, 324, p.col, 12, true, 1);
        }
      }
      txt(ctx, '↑↓ letra · ←→ mover · 1 = OK', cx, 342, C.muted, 11, false, 1);
    } else if (tg.done && p.score > 0) {
      px(ctx, String.fromCharCode(...tg.c), cx, 262, 6, p.col, 1);
      const r = tg.rank;
      txt(ctx, !r ? 'guardando...' : r <= 5 ? `¡ENTRASTE AL TOP ${r}!` : 'puntaje guardado', cx, 310, r && r <= 5 ? C.ok : C.muted, 14, true, 1);
    } else if (tg.done) txt(ctx, 'sin puntos para el ranking', cx, 290, C.muted, 12, false, 1);
  }

  box(ctx, 210, 362, 380, 146, '#0b0f18', C.dim);
  px(ctx, 'MEJORES CLANKERS', W / 2, 374, 2, C.hal, 1);
  if (!st.highScores.length) txt(ctx, 'Todavía no hay puntajes', W / 2, 430, C.muted, 13, false, 1);
  st.highScores.slice(0, 5).forEach((e, i) => {
    const me = st.mine.includes(e.id);
    const col = me ? (blink ? C.white : C.ok) : i ? '#c6cee0' : C.hal;
    txt(ctx, `${i + 1}.  ${e.tag}`, 250, 400 + i * 20, col, 14, true);
    txt(ctx, String(e.score).padStart(6, '0'), 550, 400 + i * 20, col, 14, true, 2);
    if (me) txt(ctx, '◀ TÚ', 556, 400 + i * 20, col, 12, true);
  });

  if (st.phaseT < 1.2) return;
  if (st.tags.every((t) => t.done)) {
    if (blink) txt(ctx, 'PRESIONA START PARA VOLVER', W / 2, 536, C.white, 16, true, 1);
  } else txt(ctx, 'Ingresen su tag para entrar al ranking', W / 2, 536, C.muted, 14, false, 1);
}

// --- title: isometric hackathon floor, your team's table in the spotlight -----

const SKIN = ['#ffdbac', '#e0ac69', '#c68642', '#8d5524'];
const HAIR = ['#2d1b0e', '#111', '#6b3e1f', '#c9a227', '#a33'];
const SHIRT = ['#e74c3c', '#3498db', '#9b59b6', '#1abc9c', '#f39c12', '#e84393', '#00b894', '#636e72'];
const CANS = ['#00d26a', '#1e90ff', '#ff3b3b', '#f5f6fa', '#ffd32a'];
const PANIC = ['¿QUIÉN HIZO PUSH A MAIN?', 'FUNCIONA EN MI MÁQUINA', '¡QUEDAN 5 MINUTOS!', '¿Y EL PITCH?', 'NO HAY TIEMPO PARA TESTS', 'SE CAYÓ EL WIFI', '¡DEPLOY O MUERTE!', 'NADIE DUERME HOY'];
const OURS = ['¡CLANKER, MÁS RÁPIDO!', '¿POR QUÉ ESTÁ EN ROJO?', 'ESA API NO EXISTE...', 'ARREGLA ESO YA'];
// Tables: [x, y, seed, name]; ours sits at the origin, neighbours are cut by the screen edge
const TABLES = [[-10, -3, 3, 'NULL.JS'], [-3, -10, 4, 'TEAM 404'], [-7, 7, 1, 'ESTRES.AI'], [7, -7, 2, 'PROMPT_BROS'], [0, 0, 0]];
const IK = 28;
const ISO = { x: 400, y: 322 };

function hs(n) {
  const v = Math.sin(n * 127.1) * 43758.5453;
  return v - Math.floor(v);
}

// Dimetric projection: x runs down-right, y runs down-left, z is up
function iso(x, y, z) {
  return [ISO.x + (x - y) * IK, ISO.y + ((x + y) * IK) / 2 - z * IK];
}

function poly(ctx, col, P, a) {
  ctx.fillStyle = col;
  ctx.beginPath();
  for (const q of P) ctx.lineTo(...iso(...q));
  ctx.fill();
  if (a) {
    ctx.globalAlpha = a;
    poly(ctx, '#000', P);
    ctx.globalAlpha = 1;
  }
}

// Rectangle on the plane y (faces the viewer's lower-left)
function quad(ctx, col, x0, x1, y, z0, z1) {
  poly(ctx, col, [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]);
}

function cube(ctx, x, y, z, w, d, h, col, top) {
  const X = x + w;
  const Y = y + d;
  const Z = z + h;
  poly(ctx, col, [[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]], 0.45);
  poly(ctx, col, [[x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z]], 0.22);
  poly(ctx, top || col, [[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]]);
}

// Scrolling code on a screen facing the viewer; hot = our clanker, with errors popping up
function code(ctx, x, y, z, w, h, t, s, hot) {
  quad(ctx, '#05070c', x, x + w, y, z, z + h);
  const base = Math.floor(t * (hot ? 5 : 1.5) + s * 7);
  for (let r = 0; r < h / 0.16 - 1; r++) {
    const li = base + r;
    const zz = z + h - 0.16 - r * 0.16;
    const a = x + 0.08 + hs(li + 9) * 0.25 * w;
    const typ = hot && hs(li * 3) < 0.2 ? ['syn', 'hal', 'vul'][li % 3] : 0;
    quad(ctx, typ ? TYPES[typ].col : [C.kw, C.str, '#d7def0', C.num][li % 4], a, Math.min(a + 0.15 + hs(li * 5) * w * 0.6, x + w - 0.08), y, zz, zz + 0.07);
  }
}

// Seated dev. front = facing the viewer (far side of the table), else seen from behind
function dev(ctx, x, y, q, t, front) {
  const panic = Math.floor(t * 1.5 + q * 2.3) % 5 === 0;
  const b = panic ? 0.1 : Math.floor(t * 7 + q) % 2 ? 0.05 : 0;
  const hair = HAIR[q % 5];
  const sh = SHIRT[q % 8];
  const sk = SKIN[q % 4];
  cube(ctx, x + 0.1, y + 0.1, 0, 0.7, 0.7, 1.2, '#2d3436');
  if (panic) cube(ctx, x - 0.18, y + 0.2, 2, 0.16, 0.2, 1.1, sh);
  else if (!front) cube(ctx, x - 0.16, y - 0.4, 1.8, 0.16, 0.8, 0.16, sh);
  cube(ctx, x, y + 0.15, 1.2 + b, 0.9, 0.55, 0.95, sh);
  cube(ctx, x + 0.2, y + 0.2, 2.15 + b, 0.5, 0.46, 0.5, front ? sk : hair, hair);
  if (front) {
    const Y = y + 0.66;
    const z = 2.15 + b;
    quad(ctx, hair, x + 0.2, x + 0.7, Y, z + 0.38, z + 0.5);
    quad(ctx, '#000', x + 0.3, x + 0.37, Y, z + 0.22, z + 0.29);
    quad(ctx, '#000', x + 0.52, x + 0.59, Y, z + 0.22, z + 0.29);
    if (panic) quad(ctx, '#400', x + 0.39, x + 0.51, Y, z + 0.05, z + 0.15);
  }
  if (panic) cube(ctx, x + 0.92, y + 0.2, 2, 0.16, 0.2, 1.1, sh);
  else if (!front) cube(ctx, x + 0.9, y - 0.4, 1.8, 0.16, 0.8, 0.16, sh);
}

function team(ctx, cx, cy, s, t) {
  const T = 2.4;
  const ours = !s;
  const seat = (i) => cx - 2.95 + i * 2.5;
  // pizza boxes stacked on the floor, behind the table so everything else sorts in front
  for (let j = 0; j < 1 + s % 3; j++) cube(ctx, cx - 5.4, cy - 2.8 + 0.03 * j, j * 0.15, 1.1, 1.1, 0.14, '#c49a5a', '#d8b27a');
  const here = (i, k) => (ours ? (k ? i !== 1 : i > 1) : hs(s * 13 + i + k) > 0.25);
  // far side: devs facing us, their laptop lids toward us
  for (let i = 0; i < 3; i++) if (here(i, 0)) dev(ctx, seat(i), cy - 2.9, s * 6 + i, t, 1);
  for (const [lx, ly] of [[-3.8, -1.4], [3.65, -1.4], [-3.8, 1.45], [3.65, 1.45]]) cube(ctx, cx + lx, cy + ly, 0, 0.15, 0.15, T, '#222');
  cube(ctx, cx - 4, cy - 1.6, T - 0.15, 8, 3.2, 0.15, '#7a5a3c', '#9c7a55');
  for (let i = 0; i < 3; i++)
    if (here(i, 0)) {
      cube(ctx, seat(i), cy - 1.6, T, 0.9, 0.75, 0.05, '#b2bec3');
      cube(ctx, seat(i), cy - 0.85, T, 0.9, 0.06, 0.7, '#b2bec3');
      quad(ctx, [C.p1, C.p2, C.vul][(s + i) % 3], seat(i) + 0.38, seat(i) + 0.52, cy - 0.79, T + 0.3, T + 0.44);
    }
  // the chaos in the middle: energy drinks, pizza, coffee, post-its
  for (let k = 0; k < 6; k++) {
    const r = hs(s * 31 + k * 7);
    const x = cx - 3.7 + k * 1.25 + r * 0.4;
    const y = cy - 0.7 + hs(s * 17 + k) * 0.6;
    const kind = Math.floor(hs(s * 11 + k * 3) * 5);
    if (kind === 1 && k < 5) {
      cube(ctx, x, y - 0.05, T, 1.1, 0.05, 1, '#b8894e');
      cube(ctx, x, y, T, 1.1, 1.1, 0.1, '#c49a5a', '#f2b544');
      for (let j = 0; j < 4; j++) cube(ctx, x + 0.2 + hs(k + j) * 0.6, y + 0.2 + hs(k * j + 3) * 0.6, T + 0.1, 0.14, 0.14, 0.02, '#c0392b');
    } else if (kind === 3) {
      cube(ctx, x, y, T, 0.3, 0.3, 0.35, '#ecf0f1', '#5a3a1a');
      const [sx, sy] = iso(x + 0.15, y + 0.15, T + 0.5);
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      for (let j = 0; j < 3; j++) ctx.fillRect(sx + Math.sin(t * 3 + j) * 2, sy - j * 7 - ((t * 10) % 7), 2, 4);
    } else if (kind === 4) cube(ctx, x, y, T, 0.35, 0.35, 0.04, '#fdcb6e');
    else for (let j = 0; j < 1 + (r > 0.5); j++) cube(ctx, x + j * 0.32, y + j * 0.2, T, 0.24, 0.24, 0.42, CANS[(k + j + s) % 5], '#ccc');
  }
  // near side: screens facing us, devs seen from behind
  for (let i = 0; i < 3; i++) {
    const x = seat(i);
    if (ours && i === 1) {
      // the clanker: a big glowing monitor right in the middle
      cube(ctx, cx - 0.12, cy + 0.6, T, 0.24, 0.2, 0.5, '#2d3436');
      cube(ctx, cx - 1.2, cy + 0.66, T + 0.4, 2.4, 0.12, 1.45, Math.floor(t * 4) % 2 ? C.p1 : '#6a8a00');
      code(ctx, cx - 1.08, cy + 0.78, T + 0.52, 2.16, 1.21, t, 0, 1);
    } else if (here(i, 5)) {
      if (hs(s * 5 + i) > 0.5) {
        cube(ctx, x + 0.33, cy + 0.6, T, 0.24, 0.2, 0.45, '#2d3436');
        cube(ctx, x - 0.25, cy + 0.66, T + 0.4, 1.4, 0.1, 0.95, '#1e2229');
        code(ctx, x - 0.17, cy + 0.76, T + 0.48, 1.24, 0.8, t, s + i);
      } else {
        cube(ctx, x, cy + 0.7, T, 1, 0.8, 0.05, '#b2bec3');
        cube(ctx, x, cy + 0.64, T, 1, 0.06, 0.8, '#b2bec3');
        code(ctx, x + 0.06, cy + 0.7, T + 0.08, 0.88, 0.66, t, s + i);
      }
    }
  }
  // desktop tower with RGB, then the near devs
  cube(ctx, cx + 4.15, cy - 0.6, 0, 0.7, 1.5, 1.6, '#1b1f27');
  quad(ctx, `hsl(${(t * 90 + s * 60) % 360},100%,60%)`, cx + 4.25, cx + 4.75, cy + 0.9, 1.3, 1.36);
  for (let i = 0; i < 3; i++) if (here(i, 5)) dev(ctx, seat(i), cy + 2.1, s * 6 + i + 3, t);
}

function renderTitle(ctx, st) {
  const t = st.t;
  ISO.x = 400 + Math.sin(t * 0.3) * 6;
  // floor tiles
  ctx.fillStyle = '#0e1220';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#161d30';
  ctx.beginPath();
  for (let i = -16; i <= 16; i += 2) {
    ctx.moveTo(...iso(i, -16, 0));
    ctx.lineTo(...iso(i, 16, 0));
    ctx.moveTo(...iso(-16, i, 0));
    ctx.lineTo(...iso(16, i, 0));
  }
  ctx.stroke();
  // spotlight on our table
  const [gx, gy] = iso(0, 0, 0);
  ctx.fillStyle = 'rgba(198,255,0,.06)';
  ctx.beginPath();
  ctx.ellipse(gx, gy, 250, 125, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [x, y, s] of TABLES) team(ctx, x, y, s, t);
  // vignette: the other teams fade into the dark
  const [vx, vy] = iso(0, 0, 2.4);
  const vg = ctx.createRadialGradient(vx, vy, 120, vx, vy, 420);
  vg.addColorStop(0, 'rgba(7,9,14,0)');
  vg.addColorStop(1, 'rgba(7,9,14,.85)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  // neighbours panicking
  TABLES.forEach(([x, y, s, name], ti) => {
    if (!s) return;
    const [nx, ny] = iso(x + 4, y + 1.6, 2.4);
    txt(ctx, name, nx, ny + 4, '#8a7560', 10, true, 1);
    const ph = t / 2.2 + ti * 0.37;
    const [bx, by] = iso(x - 0.5 + (Math.floor(ph) % 3) * 2.5, y - 2.6, 4.4);
    if (ph % 1 < 0.8) bubble(ctx, PANIC[(Math.floor(ph) * 3 + ti) % PANIC.length], bx, by, '#fff', '#111');
  });
  // you are the clanker
  const [lx, ly] = iso(0, 0.72, 5.4);
  box(ctx, lx - 110, ly - 34, 220, 24, '#05070b', C.p1);
  txt(ctx, 'TÚ = LA IA DE ESTE EQUIPO', lx, ly - 28, C.p1, 12, true, 1);
  if (Math.floor(t * 3) % 2) txt(ctx, '▼', lx, ly - 10, C.p1, 14, true, 1);
  const ph = t / 1.8;
  const [ox, oy] = iso(Math.floor(ph) % 2 ? 2.4 : -2.6, 2.3, 3.8);
  if (ph % 1 < 0.75) bubble(ctx, OURS[Math.floor(ph) % OURS.length], ox, oy, C.p1, '#05070b');

  // title over everything
  ctx.fillStyle = 'rgba(7,9,14,.88)';
  ctx.fillRect(0, 0, W, 76);
  const g = Math.floor(t * 2) % 7 === 0 ? 3 : 0;
  px(ctx, 'FASTER CLANKER', W / 2 - g, 12, 6, C.p2, 1);
  px(ctx, 'FASTER CLANKER', W / 2 + g, 10, 6, C.p1, 1);
  txt(ctx, 'Eres la IA del equipo. El código se escribe solo... y se rompe solo.', W / 2, 54, C.white, 13, true, 1);
  // deadline clock, ticking 3x faster than real time
  const rem = 299 - (Math.floor(t * 3) % 300);
  const hot = rem < 60 && Math.floor(t * 6) % 2;
  box(ctx, 660, 84, 128, 48, '#1a0508', hot ? C.white : C.syn);
  txt(ctx, 'DEADLINE', 724, 88, C.syn, 10, true, 1);
  px(ctx, `${String(Math.floor(rem / 60)).padStart(2, '0')}${Math.floor(t * 2) % 2 ? ':' : ' '}${String(rem % 60).padStart(2, '0')}`, 724, 102, 4, hot ? C.white : C.syn, 1);

  ctx.fillStyle = 'rgba(7,9,14,.88)';
  ctx.fillRect(0, 490, W, 110);
  if (st.highScores.length) {
    const top = st.highScores.slice(0, 3).map((e, i) => `${i + 1}. ${e.tag} ${e.score}`).join('   ');
    txt(ctx, `MEJORES CLANKERS   ${top}`, W / 2, 500, C.hal, 12, true, 1);
  } else txt(ctx, 'MEJORES CLANKERS: nadie todavía. ¡Sé el primero!', W / 2, 500, C.hal, 12, true, 1);
  const on = Math.floor(t * 2.5) % 2;
  box(ctx, 220, 522, 360, 44, on ? '#14230a' : '#0d1119', on ? C.p1 : C.dim);
  px(ctx, 'PRESIONA START', W / 2, 534, 3, on ? C.p1 : C.white, 1);
  txt(ctx, '1 o 2 jugadores · antes de jugar hay una práctica corta', W / 2, 576, C.muted, 11, false, 1);
}

function bubble(ctx, s, x, y, bg, fg) {
  const w = s.length * 6.7 + 12;
  const bx = Math.max(4, Math.min(W - w - 4, x - w / 2));
  ctx.fillStyle = bg;
  ctx.fillRect(bx, y - 22, w, 18);
  ctx.fillRect(x - 3, y - 4, 6, 4);
  txt(ctx, s, bx + w / 2, y - 19, fg, 11, true, 1);
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

// Drop presses buffered during the previous phase (mashing at the end of a match, etc.)
function clearInput(scene) {
  scene.controls.pressed = Object.create(null);
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

function cleanScores(v) {
  if (!Array.isArray(v)) return [];
  return v
    .filter((e) => e && typeof e.tag === 'string' && Number.isFinite(e.score))
    .map((e) => ({ tag: e.tag.slice(0, 3).toUpperCase(), score: Math.max(0, Math.floor(e.score)), id: Number(e.id) || 0 }));
}

function mergeScores(...lists) {
  const seen = new Set();
  return []
    .concat(...lists)
    .filter((e) => {
      const k = `${e.tag}|${e.score}|${e.id}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

async function loadHighScores() {
  try {
    const res = await getStorage().get(STORAGE_KEY);
    if (res && res.found) return cleanScores(res.value);
  } catch (_) {}
  return [];
}

function refreshScores(scene) {
  loadHighScores().then((s) => (scene.st.highScores = mergeScores(s, scene.st.highScores)));
}

// Saves are queued and re-read storage first, so two players saving at once (or a
// list that failed to load) never overwrite each other's scores. Resolves to the rank.
function saveHighScore(scene, e) {
  G.q = (G.q || Promise.resolve())
    .then(async () => {
      const list = mergeScores(await loadHighScores(), scene.st.highScores, [e]);
      scene.st.highScores = list;
      try {
        await getStorage().set(STORAGE_KEY, list);
      } catch (_) {}
      return list.findIndex((x) => x.id === e.id) + 1;
    })
    .catch(() => 0);
  return G.q;
}
