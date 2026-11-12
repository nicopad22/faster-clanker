// Faster Clanker — Platanus Hack 26 Arcade Challenge
// 1v1 Frantic Vibecoding Duel: Fix Syntax, AI Hallucinations & Cyber CVEs before they hit the live Demo!

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const VW = 400; // Virtual pixel width (every pixel is strictly 2x2 screen pixels)
const VH = 300; // Virtual pixel height
const STORAGE_KEY = 'faster-clanker-scores-v1';

// 4x6 Pixel Font (6 hex digits per ASCII char 32..126; each hex digit is a 4-bit row from top to bottom)
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
  bg: '#0b0e17',
  ideBg: '#101420',
  ideAlt: '#141929',
  termBg: '#07090f',
  demoBg: '#161c2e',
  judgeBg: '#121624',
  border: '#2c3654',
  p1: '#00f5d4',
  p1Dark: '#005c50',
  p2: '#ff5c8a',
  p2Dark: '#661830',
  syn: '#ff4757',
  synBg: '#42121b',
  hal: '#ffa502',
  halBg: '#3d2806',
  cyb: '#c77dff',
  cybBg: '#31144a',
  ok: '#2ed573',
  white: '#f1f2f6',
  muted: '#6c7a9c',
  codeKw: '#70a1ff',
  codeStr: '#7bed9f',
  popupBg: '#d2dae2',
  popupBar: '#1e272e',
};

// DO NOT replace existing keys — they match the physical arcade cabinet wiring.
// To add local testing shortcuts, append extra keys to any array.
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
  for (const key of keys) {
    KEYBOARD_TO_ARCADE[normalizeKey(key)] = arcadeCode;
  }
}

function normalizeKey(key) {
  if (typeof key !== 'string' || !key.length) return '';
  if (key === ' ') return 'space';
  return key.length === 1 ? key.toLowerCase() : key;
}

const HALLUCINATIONS = [
  'useMagicAI({ fixBugs: "pls" })',
  'arr.sortByVibes({ fast: 99 })',
  'if (2 + 2 === 5) return true;',
  'const db = new QuantumSQL();',
  'await sleep(Infinity);',
  'React.useMiracle(winHack);',
  'Math.PI = 4; // close enough',
  'window.downloadMoreRAM(128);',
  'JSON.parse("[object Object]")',
  'return maybe ? yes : perhaps;',
  'new BananaFactory().deploy()',
  'llm.hallucinate("npm-ghost")',
];

const CYBER_ERRORS = [
  'API_KEY = "sk-live-pLaTaNuS"',
  'db.query("DROP TABLE " + req)',
  'exec("chmod 777 / && rm -rf")',
  'cors({ origin: "*", cred: 1 })',
  'git.push("-f", ".env.prod")',
  'auth = (pw) => pw.length > 0',
  'res.send(process.env.SECRET)',
  'crypto.seed("123456")',
];

const POPUP_TEMPLATES = [
  { title: 'RANSOMWARE.EXE', body: 'ENCRYPTED node_modules! Pay 4 BTC', col: '#ff4757' },
  { title: 'NPM AUDIT ALERT', body: '9,999 CRITICAL VULNERABILITIES!', col: '#ffa502' },
  { title: 'AWS BILLING', body: '.env leaked! Balance: $84,420.69', col: '#ff4757' },
  { title: 'CLIPPY-GPT v9', body: 'I ran git push --force to help!', col: '#70a1ff' },
  { title: 'DOGE MINER', body: 'GPU AT 420C - MINING $CLANK...', col: '#c77dff' },
];

const JUDGE_QUIPS = {
  ok: ['SHIP IT!', '10X DEV!', 'YC READY!', 'CLEAN AF', 'FUNDED!', 'LGTM!!'],
  syn: ['SYNTAX?!', 'NO COMPILA', 'RED SQUIGGLE', 'LINTER CRIED', 'TYPO BRO'],
  hal: ['WTF IS THAT', 'AI SLOP!', 'FAKE API?!', 'DELUSIONAL', 'BANANA?!'],
  cyb: ['CVE OPEN!', '.ENV LEAK!', 'HACKABLE!', '0-DAY!!', 'RIP PROD'],
  hack: ['PWNED!!', 'RANSOMWARE!', 'DB WIPED!', 'GG NO RE'],
};

const DEMO_FEATURES = ['+AUTH', '+DARKMODE', '+AI CHAT', '+STRIPE', '+WEB3', '+SSR', '+RUST', '+AGI'];

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-root',
  backgroundColor: C.bg,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: { create, update },
};

new Phaser.Game(config);

function create() {
  const scene = this;
  createControls(scene);
  buildFontCache(scene);
  buildSelfCodePool(scene);

  // Create strict 400x300 virtual pixel framebuffer scaled 2x with NEAREST filtering
  scene.vTex = scene.textures.createCanvas('vscreen', VW, VH);
  scene.vTex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  scene.vCtx = scene.vTex.getContext();
  scene.vCtx.imageSmoothingEnabled = false;
  scene.add.image(0, 0, 'vscreen').setOrigin(0, 0).setScale(2);

  scene.state = {
    phase: 'title', // 'title' | 'playing' | 'gameover'
    splitX: 200,
    targetSplitX: 200,
    timeLeft: 90,
    speedMult: 1,
    sprintName: 'SPRINT 1: CHILL VIBES',
    highScores: [],
    winner: 0,
    winReason: '',
    nameChars: [65, 65, 65],
    nameIdx: 0,
    saved: false,
    tick: 0,
    p1: createPlayerState(1),
    p2: createPlayerState(2),
  };

  loadHighScores().then((scores) => {
    scene.state.highScores = scores;
  });
}

function createPlayerState(id) {
  return {
    id,
    score: 0,
    fixed: 0,
    leaked: 0,
    streak: 0,
    lines: [],
    scrollY: 0,
    spawnDist: 0,
    linesSinceErr: 0,
    nextErrGap: 2,
    codeCursor: id === 1 ? 0 : 17,
    vulnTimer: 0,
    hackCombo: [],
    hackProgress: 0,
    popups: [],
    judgeMood: 'neutral', // 'neutral' | 'ok' | 'bad'
    judgeTimer: 0,
    judgeQuip: id === 1 ? 'SHOW ME CODE' : 'DEMO TIME!',
    demoState: 'ok', // 'ok' | 'syn' | 'hal' | 'cyb'
    demoTimer: 0,
    demoFeatures: ['+INIT'],
    termLog: 'ready: clanker-v4.2 --turbo',
    termFlash: 0,
    termFlashCol: C.ok,
    lastInput: '',
  };
}

function startMatch(scene) {
  const st = scene.state;
  st.phase = 'playing';
  st.splitX = 200;
  st.targetSplitX = 200;
  st.timeLeft = 90;
  st.speedMult = 1;
  st.winner = 0;
  st.winReason = '';
  st.saved = false;
  st.nameIdx = 0;
  st.p1 = createPlayerState(1);
  st.p2 = createPlayerState(2);

  // Pre-populate initial lines in IDE
  for (let i = 0; i < 11; i++) {
    const y = 84 + i * 13;
    spawnCodeLine(scene, st.p1, y, i > 4 && i % 3 === 0);
    spawnCodeLine(scene, st.p2, y, i > 4 && i % 3 === 0);
  }
  playSound(scene, 'start');
  startMusic(scene);
}

function update(time, delta) {
  const scene = this;
  const st = scene.state;
  if (!st) return;

  const dt = Math.min(delta / 1000, 0.1);
  st.tick += dt;

  if (st.phase === 'title') {
    if (
      consumePressed(scene, 'START1') ||
      consumePressed(scene, 'START2') ||
      consumePressed(scene, 'P1_1') ||
      consumePressed(scene, 'P2_1')
    ) {
      startMatch(scene);
    }
  } else if (st.phase === 'playing') {
    updateMatch(scene, dt);
  } else if (st.phase === 'gameover') {
    updateGameOver(scene);
  }

  renderScreen(scene);
}

function updateMatch(scene, dt) {
  const st = scene.state;
  st.timeLeft = Math.max(0, st.timeLeft - dt);

  // Overcooked frantic escalation curve
  const elapsed = 90 - st.timeLeft;
  if (elapsed < 22) {
    st.speedMult = 1.0 + (elapsed / 22) * 0.35;
    st.sprintName = 'SPRINT 1: VIBECODING';
  } else if (elapsed < 50) {
    st.speedMult = 1.35 + ((elapsed - 22) / 28) * 0.5;
    st.sprintName = 'SPRINT 2: CAFFEINE HIT';
  } else if (elapsed < 72) {
    st.speedMult = 1.85 + ((elapsed - 50) / 22) * 0.55;
    st.sprintName = 'SPRINT 3: PROD ON FIRE';
  } else {
    st.speedMult = 2.4 + ((elapsed - 72) / 18) * 0.55;
    st.sprintName = 'OVERDRIVE: 1 MIN TO DEMO!';
  }

  updatePlayer(scene, st.p1, st.p2, dt);
  updatePlayer(scene, st.p2, st.p1, dt);

  // Smoothly move splitX snapped to integer virtual pixels
  const diff = st.targetSplitX - st.splitX;
  if (Math.abs(diff) >= 1) {
    st.splitX += Math.sign(diff) * Math.max(1, Math.round(Math.abs(diff) * 0.25));
  } else {
    st.splitX = Math.round(st.targetSplitX);
  }

  // Check knockout or timer end
  if (st.splitX <= 76) {
    finishMatch(scene, 2, 'KO! P1 RAN OUT OF SCREEN SPACE!');
  } else if (st.splitX >= 324) {
    finishMatch(scene, 1, 'KO! P2 RAN OUT OF SCREEN SPACE!');
  } else if (st.timeLeft <= 0) {
    const w = st.splitX > 200 ? 1 : st.splitX < 200 ? 2 : st.p1.score >= st.p2.score ? 1 : 2;
    finishMatch(scene, w, 'TIME UP! JUDGES PICKED WINNER!');
  }
}

function updatePlayer(scene, p, rival, dt) {
  const st = scene.state;
  const baseSpeed = 14.5 * st.speedMult;

  if (p.vulnTimer > 0) {
    p.vulnTimer = Math.max(0, p.vulnTimer - dt);
  }
  if (p.judgeTimer > 0) {
    p.judgeTimer = Math.max(0, p.judgeTimer - dt);
    if (p.judgeTimer === 0) p.judgeMood = 'neutral';
  }
  if (p.demoTimer > 0) {
    p.demoTimer = Math.max(0, p.demoTimer - dt);
    if (p.demoTimer === 0) p.demoState = 'ok';
  }
  if (p.termFlash > 0) {
    p.termFlash = Math.max(0, p.termFlash - dt);
  }
  for (let i = p.popups.length - 1; i >= 0; i--) {
    p.popups[i].timer -= dt;
    if (p.popups[i].timer <= 0) p.popups.splice(i, 1);
  }

  // Move lines upward
  for (let i = p.lines.length - 1; i >= 0; i--) {
    const ln = p.lines[i];
    const mult = ln.status === 'failed' ? 3.2 : 1;
    ln.y -= baseSpeed * mult * dt;

    // Crossed top threshold into Live Demo!
    if (ln.y <= 70) {
      if (ln.errType && ln.status === 'active') {
        onErrorLeakedToDemo(scene, p, rival, ln);
      } else if (ln.errType && ln.status === 'failed') {
        onErrorLeakedToDemo(scene, p, rival, ln);
      }
      p.lines.splice(i, 1);
    }
  }

  // Spawn new lines at bottom (y = 222)
  p.spawnDist += baseSpeed * dt;
  while (p.spawnDist >= 13) {
    p.spawnDist -= 13;
    spawnCodeLine(scene, p, 222 - p.spawnDist, false);
  }

  handlePlayerInput(scene, p, rival);
}

function spawnCodeLine(scene, p, y, forceErr) {
  p.linesSinceErr++;
  const shouldErr = forceErr || p.linesSinceErr >= p.nextErrGap;

  if (!shouldErr) {
    const raw = scene.codePool[p.codeCursor % scene.codePool.length];
    p.codeCursor++;
    p.lines.push({
      y,
      text: raw,
      errType: null,
      status: 'clean',
      combo: [],
      progress: 0,
      chances: 1,
    });
    return;
  }

  p.linesSinceErr = 0;
  // High error density that tightens as speedMult increases
  const maxGap = scene.state.speedMult > 1.8 ? 2 : 3;
  p.nextErrGap = Phaser.Math.Between(1, maxGap);

  // Pick error type: ~58% Syntax (fast 1-2 steps), ~27% Hallucination (2-3 steps), ~15% Cyber (3-4 steps)
  const roll = Math.random();
  let errType = 'syn';
  if (roll > 0.85) errType = 'cyb';
  else if (roll > 0.58) errType = 'hal';

  let text = '';
  let combo = [];
  let chances = 1;

  if (errType === 'syn') {
    const base = scene.codePool[p.codeCursor % scene.codePool.length];
    p.codeCursor++;
    text = mutateSyntax(base, p.codeCursor);
    // 1 or 2 steps max for instinctive muscle memory!
    const len = Math.random() < 0.45 ? 1 : 2;
    combo = makeCombo(len);
  } else if (errType === 'hal') {
    text = HALLUCINATIONS[(p.codeCursor++) % HALLUCINATIONS.length];
    const len = scene.state.speedMult > 1.6 && Math.random() < 0.5 ? 3 : 2;
    combo = makeCombo(len);
  } else {
    text = CYBER_ERRORS[(p.codeCursor++) % CYBER_ERRORS.length];
    combo = makeCombo(3);
    chances = 2; // Cybersecurity gives a 2nd opportunity!
  }

  p.lines.push({
    y,
    text,
    errType,
    status: 'active', // 'active' | 'fixed' | 'failed'
    combo,
    progress: 0,
    chances,
  });
}

function mutateSyntax(line, seed) {
  const muts = [
    (s) => s.replace(/function|const|let|return/, 'functino'),
    (s) => s.replace(/[;{}()]/g, '') + ';;;',
    (s) => 'cosnt ' + s.slice(0, 18) + ' = ;',
    (s) => s.slice(0, 16) + ' === = null)',
    (s) => 'if (' + s.slice(0, 14) + ' ?? !!',
  ];
  return muts[seed % muts.length](line);
}

function makeCombo(len) {
  const dirs = ['U', 'D', 'L', 'R'];
  const out = [];
  for (let i = 0; i < len - 1; i++) {
    out.push(dirs[Phaser.Math.Between(0, 3)]);
  }
  // Last step is either B1 or a direction for 1-step combos
  out.push(len === 1 && Math.random() < 0.4 ? dirs[Phaser.Math.Between(0, 3)] : 'B1');
  return out;
}

function makeHackCombo() {
  const dirs = ['U', 'D', 'L', 'R'];
  return [
    'B2',
    dirs[Phaser.Math.Between(0, 3)],
    dirs[Phaser.Math.Between(0, 3)],
  ];
}

function getActiveErrorLine(p) {
  let best = null;
  for (let i = 0; i < p.lines.length; i++) {
    const ln = p.lines[i];
    if (ln.errType && ln.status === 'active') {
      if (!best || ln.y < best.y) best = ln;
    }
  }
  return best;
}

function handlePlayerInput(scene, p, rival) {
  const prefix = p.id === 1 ? 'P1_' : 'P2_';
  const map = [
    ['U', prefix + 'U'],
    ['D', prefix + 'D'],
    ['L', prefix + 'L'],
    ['R', prefix + 'R'],
    ['B1', prefix + '1'],
    ['B2', prefix + '2'],
  ];

  let pressedInput = null;
  for (let i = 0; i < map.length; i++) {
    if (consumePressed(scene, map[i][1])) {
      pressedInput = map[i][0];
      break;
    }
  }
  if (!pressedInput) return;

  p.lastInput = pressedInput;

  // If player has active popups from being hacked, tapping B2 shaves time off popups!
  if (pressedInput === 'B2' && p.popups.length > 0) {
    for (let i = 0; i < p.popups.length; i++) {
      p.popups[i].timer -= 0.9;
    }
    p.termLog = 'kill -9 popup.exe';
    playSound(scene, 'key');
    if (rival.vulnTimer <= 0) return;
  }

  // Check if player is initiating or continuing a Hack against a vulnerable rival!
  if (rival.vulnTimer > 0 && rival.hackCombo.length > 0) {
    const expectedHack = rival.hackCombo[p.hackProgress];
    if (p.hackProgress > 0 || pressedInput === 'B2') {
      if (pressedInput === expectedHack) {
        p.hackProgress++;
        playSound(scene, 'key');
        if (p.hackProgress >= rival.hackCombo.length) {
          executeHackOnRival(scene, p, rival);
        }
        return;
      } else {
        p.hackProgress = 0;
        if (pressedInput === 'B2') {
          p.hackProgress = 1;
          playSound(scene, 'key');
          return;
        }
      }
    }
  } else {
    p.hackProgress = 0;
  }

  // Otherwise, check active error line in player's IDE (closest to top Demo line)
  const target = getActiveErrorLine(p);
  if (!target) return;

  const expected = target.combo[target.progress];
  if (pressedInput === expected) {
    target.progress++;
    playSound(scene, 'key');
    if (target.progress >= target.combo.length) {
      onErrorFixed(scene, p, target);
    }
  } else {
    // Mistake on combo!
    if (target.errType === 'cyb' && target.chances > 1) {
      target.chances--;
      target.progress = 0;
      p.termLog = 'CVE RETRY! 2ND CHANCE!';
      p.termFlash = 0.35;
      p.termFlashCol = C.hal;
      playSound(scene, 'warn');
    } else {
      target.status = 'failed';
      p.streak = 0;
      p.termLog = 'ERR: MERGE CONFLICT!';
      p.termFlash = 0.4;
      p.termFlashCol = C.syn;
      playSound(scene, 'fail');
    }
  }
}

function onErrorFixed(scene, p, ln) {
  ln.status = 'fixed';
  p.fixed++;
  p.streak++;

  const pts = ln.errType === 'cyb' ? 30 : ln.errType === 'hal' ? 20 : 10;
  const streakBonus = p.streak >= 5 ? 4 : 0;
  p.score += pts + streakBonus * 5;

  // Push territory divider toward rival!
  const push = (ln.errType === 'cyb' ? 11 : ln.errType === 'hal' ? 8 : 5) + (p.streak >= 5 ? 2 : 0);
  const dir = p.id === 1 ? 1 : -1;
  scene.state.targetSplitX = Phaser.Math.Clamp(scene.state.targetSplitX + dir * push, 72, 328);

  p.termFlash = 0.25;
  p.termFlashCol = C.ok;
  p.termLog =
    p.streak >= 5
      ? '10X STREAK x' + p.streak + '! git push -f'
      : 'FIXED ' + ln.errType.toUpperCase() + ' (+' + pts + ')';

  if (p.fixed % 2 === 0 && p.demoFeatures.length < 6) {
    p.demoFeatures.push(DEMO_FEATURES[p.fixed % DEMO_FEATURES.length]);
  }
  p.judgeMood = 'ok';
  p.judgeTimer = 1.8;
  p.judgeQuip = JUDGE_QUIPS.ok[(p.fixed + p.streak) % JUDGE_QUIPS.ok.length];
  playSound(scene, 'fix');
}

function onErrorLeakedToDemo(scene, p, rival, ln) {
  p.leaked++;
  p.streak = 0;

  // Lose territory when a bug hits your live Demo!
  const dmg = ln.errType === 'cyb' ? 10 : ln.errType === 'hal' ? 11 : 7;
  const dir = p.id === 1 ? -1 : 1;
  scene.state.targetSplitX = Phaser.Math.Clamp(scene.state.targetSplitX + dir * dmg, 72, 328);

  p.demoState = ln.errType;
  p.demoTimer = 2.8;
  p.judgeMood = 'bad';
  p.judgeTimer = 2.5;
  const quips = JUDGE_QUIPS[ln.errType] || JUDGE_QUIPS.syn;
  p.judgeQuip = quips[p.leaked % quips.length];

  if (ln.errType === 'cyb') {
    // Open vulnerability so rival can Hack!
    p.vulnTimer = 12.0;
    p.hackCombo = makeHackCombo();
    rival.hackProgress = 0;
    p.termLog = 'ALERT: CVE EXPOSED! VULNERABLE!';
    rival.termLog = 'RIVAL VULNERABLE! PRESS B2!';
    playSound(scene, 'warn');
  } else {
    p.termLog = 'PROD CRASH: ' + ln.errType.toUpperCase();
    playSound(scene, 'fail');
  }
}

function executeHackOnRival(scene, attacker, victim) {
  victim.vulnTimer = 0;
  victim.hackCombo = [];
  attacker.hackProgress = 0;
  attacker.score += 50;

  // Big territory push!
  const dir = attacker.id === 1 ? 1 : -1;
  scene.state.targetSplitX = Phaser.Math.Clamp(scene.state.targetSplitX + dir * 20, 72, 328);

  attacker.termLog = 'HACKED RIVAL! ROOT ACCESS!';
  attacker.termFlash = 0.5;
  attacker.termFlashCol = C.cyb;

  victim.termLog = 'PWNED! MASH B2 TO CLOSE POPUPS!';
  victim.termFlash = 0.7;
  victim.termFlashCol = C.syn;
  victim.judgeMood = 'bad';
  victim.judgeTimer = 3.5;
  victim.judgeQuip = JUDGE_QUIPS.hack[attacker.score % JUDGE_QUIPS.hack.length];

  // Spawn 3 absurd retro popups over victim's IDE
  for (let i = 0; i < 3; i++) {
    const tpl = POPUP_TEMPLATES[(attacker.fixed + i) % POPUP_TEMPLATES.length];
    victim.popups.push({
      title: tpl.title,
      body: tpl.body,
      col: tpl.col,
      ox: 8 + (i % 2) * 18,
      oy: 84 + i * 38,
      timer: 5.5,
    });
  }
  playSound(scene, 'hack');
}

function finishMatch(scene, winner, reason) {
  const st = scene.state;
  st.phase = 'gameover';
  st.winner = winner;
  st.winReason = reason;
  st.nameChars = [65, 65, 65];
  st.nameIdx = 0;
  st.saved = false;
  playSound(scene, 'start');
}

function updateGameOver(scene) {
  const st = scene.state;
  if (st.saved) {
    if (
      consumePressed(scene, 'START1') ||
      consumePressed(scene, 'START2') ||
      consumePressed(scene, 'P1_1') ||
      consumePressed(scene, 'P2_1')
    ) {
      st.phase = 'title';
    }
    return;
  }

  const up = consumePressed(scene, 'P1_U') || consumePressed(scene, 'P2_U');
  const dn = consumePressed(scene, 'P1_D') || consumePressed(scene, 'P2_D');
  const lf = consumePressed(scene, 'P1_L') || consumePressed(scene, 'P2_L');
  const rt = consumePressed(scene, 'P1_R') || consumePressed(scene, 'P2_R');
  const ok =
    consumePressed(scene, 'P1_1') ||
    consumePressed(scene, 'P2_1') ||
    consumePressed(scene, 'START1') ||
    consumePressed(scene, 'START2');

  if (lf) {
    st.nameIdx = (st.nameIdx + 2) % 3;
    playSound(scene, 'key');
  } else if (rt) {
    st.nameIdx = (st.nameIdx + 1) % 3;
    playSound(scene, 'key');
  } else if (up) {
    st.nameChars[st.nameIdx] = st.nameChars[st.nameIdx] >= 90 ? 65 : st.nameChars[st.nameIdx] + 1;
    playSound(scene, 'key');
  } else if (dn) {
    st.nameChars[st.nameIdx] = st.nameChars[st.nameIdx] <= 65 ? 90 : st.nameChars[st.nameIdx] - 1;
    playSound(scene, 'key');
  } else if (ok) {
    st.saved = true;
    const tag = String.fromCharCode(...st.nameChars);
    const winP = st.winner === 1 ? st.p1 : st.p2;
    saveHighScore(scene, {
      tag,
      winner: 'P' + st.winner,
      score: winP.score,
    });
    playSound(scene, 'fix');
  }
}

// ============================================================================
// STRICT PIXEL-ART RENDERER (400x300 Virtual Canvas -> 800x600 Screen)
// ============================================================================

function renderScreen(scene) {
  const ctx = scene.vCtx;
  const st = scene.state;

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, VW, VH);

  if (st.phase === 'title') {
    renderTitleScreen(scene, ctx);
  } else {
    renderGameplay(scene, ctx);
    if (st.phase === 'gameover') {
      renderGameOverOverlay(scene, ctx);
    }
  }

  scene.vTex.refresh();
}

function renderTitleScreen(scene, ctx) {
  const st = scene.state;
  const pulse = Math.floor(st.tick * 3) % 2 === 0;

  // Grid backdrop
  ctx.fillStyle = '#131829';
  for (let x = 0; x < VW; x += 20) ctx.fillRect(x, 0, 1, VH);
  for (let y = 0; y < VH; y += 20) ctx.fillRect(0, y, VW, 1);

  // Top banner box
  drawBox(ctx, 36, 14, 328, 54, '#151b2e', C.p1);
  drawText(ctx, 'PLATANUS HACK 26 ARCADE EDITION', 110, 22, C.muted);
  drawTextBold(ctx, 'FASTER CLANKER', 142, 34, C.p1);
  drawText(ctx, 'YOU ARE THE AI. FIX THE VIBECODE BEFORE PROD DIES!', 68, 50, C.white);

  // Error Legend Cards (3 columns)
  drawBox(ctx, 20, 78, 114, 62, C.synBg, C.syn);
  drawTextBold(ctx, '1. SINTAXIS', 42, 85, C.syn);
  drawText(ctx, 'HIGH FREQUENCY', 36, 97, C.white);
  drawText(ctx, '1-2 STEP COMBO', 36, 107, C.ok);
  drawComboBadges(ctx, ['U', 'B1'], 0, 56, 120);

  drawBox(ctx, 143, 78, 114, 62, C.halBg, C.hal);
  drawTextBold(ctx, '2. HALUCINACION', 155, 85, C.hal);
  drawText(ctx, 'FAKE AI APIS', 166, 97, C.white);
  drawText(ctx, '2-3 STEP COMBO', 162, 107, C.hal);
  drawComboBadges(ctx, ['L', 'R', 'B1'], 0, 174, 120);

  drawBox(ctx, 266, 78, 114, 62, C.cybBg, C.cyb);
  drawTextBold(ctx, '3. CIBERSEG', 290, 85, C.cyb);
  drawText(ctx, '2 CHANCES! IF', 286, 97, C.white);
  drawText(ctx, 'LEAKED -> HACK!', 283, 107, C.p2);
  drawComboBadges(ctx, ['B2', 'U', 'R'], 0, 297, 120);

  // Controls & Leaderboard boxes
  drawBox(ctx, 20, 150, 174, 96, C.ideBg, C.border);
  drawTextBold(ctx, 'ARCADE CONTROLS', 54, 158, C.p1);
  drawText(ctx, 'P1: WASD + U(B1) I(B2)', 32, 174, C.white);
  drawText(ctx, 'P2: ARROWS + R(B1) T(B2)', 32, 186, C.white);
  drawText(ctx, 'B1: FINISH FIX COMBO', 32, 202, C.ok);
  drawText(ctx, 'B2: HACK VULNERABLE RIVAL', 32, 214, C.cyb);
  drawText(ctx, '    OR CLOSE POPUPS!', 32, 226, C.muted);

  drawBox(ctx, 206, 150, 174, 96, C.ideBg, C.border);
  drawTextBold(ctx, 'TOP CLANKERS', 252, 158, C.hal);
  if (!st.highScores.length) {
    drawText(ctx, 'NO SCORES YET', 258, 192, C.muted);
  } else {
    for (let i = 0; i < Math.min(5, st.highScores.length); i++) {
      const e = st.highScores[i];
      const line = `${i + 1}. ${e.tag}  ${String(e.score).padStart(4, '0')} (${e.winner})`;
      drawText(ctx, line, 228, 174 + i * 12, i === 0 ? C.ok : C.white);
    }
  }

  // Flashing start prompt
  drawBox(ctx, 76, 258, 248, 28, '#192238', pulse ? C.ok : C.p1);
  drawTextBold(
    ctx,
    pulse ? '>>> PRESS START OR B1 TO VIBECODE <<<' : '    PRESS START OR B1 TO VIBECODE    ',
    92,
    269,
    pulse ? C.ok : C.white,
  );
}

function renderGameplay(scene, ctx) {
  const st = scene.state;
  const sx = st.splitX;
  const topH = 68;
  const codeY = 68;
  const codeH = 164;
  const termY = 232;
  const termH = 68;
  const judgeW = 58;

  // 1. TOP ROW: Judges P1 | Demo P1 | Demo P2 | Judges P2
  renderJudgesPanel(ctx, 0, 0, judgeW, topH, st.p1, st.tick);
  renderDemoPanel(ctx, judgeW, 0, Math.max(0, sx - judgeW), topH, st.p1, st.tick);
  renderDemoPanel(ctx, sx, 0, Math.max(0, VW - judgeW - sx), topH, st.p2, st.tick);
  renderJudgesPanel(ctx, VW - judgeW, 0, judgeW, topH, st.p2, st.tick);

  // 2. MIDDLE ROW: Code IDE P1 | Code IDE P2
  renderCodePanel(ctx, 0, codeY, sx, codeH, st.p1, st.tick);
  renderCodePanel(ctx, sx, codeY, VW - sx, codeH, st.p2, st.tick);

  // 3. BOTTOM ROW: Terminal P1 | Terminal P2
  renderTerminalPanel(ctx, 0, termY, sx, termH, st.p1, st.p2, st.tick);
  renderTerminalPanel(ctx, sx, termY, VW - sx, termH, st.p2, st.p1, st.tick);

  // Borders
  ctx.fillStyle = C.border;
  ctx.fillRect(0, topH - 1, VW, 2);
  ctx.fillRect(0, termY - 1, VW, 2);
  ctx.fillRect(judgeW - 1, 0, 2, topH);
  ctx.fillRect(VW - judgeW - 1, 0, 2, topH);

  // Central dynamic Tug-of-War Divider
  ctx.fillStyle = Math.floor(st.tick * 8) % 2 === 0 ? C.white : C.hal;
  ctx.fillRect(sx - 1, 0, 2, VH);

  // Top-center Timer & Speed Badge pinned on the divider
  const badgeX = Phaser.Math.Clamp(sx - 34, 60, VW - 128);
  drawBox(ctx, badgeX, 2, 68, 17, '#090c14', C.white);
  const secs = Math.ceil(st.timeLeft);
  const timeCol = secs <= 15 && Math.floor(st.tick * 6) % 2 === 0 ? C.syn : C.white;
  drawTextBold(ctx, `T-${String(secs).padStart(2, '0')}s`, badgeX + 6, 6, timeCol);
  drawText(ctx, `${st.speedMult.toFixed(1)}x`, badgeX + 42, 6, C.hal);
}

function renderJudgesPanel(ctx, x, y, w, h, p, tick) {
  ctx.fillStyle = C.judgeBg;
  ctx.fillRect(x, y, w, h);

  const col = p.id === 1 ? C.p1 : C.p2;
  drawText(ctx, `JUECES P${p.id}`, x + 6, y + 4, col);

  // Draw 2 pixel-art Judge avatars side by side
  const bounce = p.judgeMood !== 'neutral' && Math.floor(tick * 8) % 2 === 0 ? -1 : 0;
  drawJudgeAvatar(ctx, x + 7, y + 15 + bounce, p.judgeMood, 0);
  drawJudgeAvatar(ctx, x + 31, y + 15 - bounce, p.judgeMood, 1);

  // Speech bubble at bottom of Judge panel
  const qCol = p.judgeMood === 'ok' ? C.ok : p.judgeMood === 'bad' ? C.syn : C.muted;
  drawBox(ctx, x + 3, y + 43, w - 6, 21, '#090b12', qCol);
  drawText(ctx, p.judgeQuip.slice(0, 9), x + 6, y + 50, C.white);
}

function drawJudgeAvatar(ctx, x, y, mood, variant) {
  // 18x22 strict pixel-art character
  ctx.fillStyle = variant === 0 ? '#ffdbac' : '#e0ac69';
  ctx.fillRect(x + 3, y + 4, 12, 12); // Face

  // Hair / Hat
  ctx.fillStyle = variant === 0 ? '#2f3542' : '#57606f';
  ctx.fillRect(x + 2, y + 1, 14, 4);

  if (mood === 'ok') {
    // Cool deal-with-it sunglasses + big grin
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 3, y + 7, 12, 3);
    ctx.fillStyle = C.p1;
    ctx.fillRect(x + 5, y + 8, 2, 1);
    ctx.fillRect(x + 11, y + 8, 2, 1);
    ctx.fillStyle = C.ok;
    ctx.fillRect(x + 6, y + 12, 6, 2);
  } else if (mood === 'bad') {
    // Angry red face + eyebrows + open mouth
    ctx.fillStyle = '#ff6b81';
    ctx.fillRect(x + 3, y + 4, 12, 12);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 4, y + 6, 3, 1);
    ctx.fillRect(x + 11, y + 6, 3, 1);
    ctx.fillRect(x + 5, y + 8, 2, 2);
    ctx.fillRect(x + 11, y + 8, 2, 2);
    ctx.fillRect(x + 6, y + 12, 6, 3);
  } else {
    // Neutral eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 5, y + 8, 2, 2);
    ctx.fillRect(x + 11, y + 8, 2, 2);
    ctx.fillRect(x + 7, y + 13, 4, 1);
  }

  // Suit shoulders
  ctx.fillStyle = variant === 0 ? '#3742fa' : '#2f3542';
  ctx.fillRect(x + 1, y + 16, 16, 6);
}

function renderDemoPanel(ctx, x, y, w, h, p, tick) {
  if (w <= 4) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = p.demoState === 'syn' ? '#2b0912' : p.demoState === 'hal' ? '#2b1e06' : C.demoBg;
  ctx.fillRect(x, y, w, h);

  const col = p.id === 1 ? C.p1 : C.p2;
  drawText(ctx, `DEMO P${p.id}: CLANKR.AI`, x + 6, y + 4, col);

  // Mini browser window inside Demo
  const bx = x + 6;
  const by = y + 14;
  const bw = Math.max(24, w - 12);
  const bh = h - 18;
  drawBox(ctx, bx, by, bw, bh, '#0b0e17', p.demoState === 'ok' ? C.border : C.syn);

  if (p.demoState === 'syn') {
    // Syntax crash in live demo
    ctx.fillStyle = C.syn;
    ctx.fillRect(bx + 3, by + 4, bw - 6, 10);
    drawText(ctx, '500 SYNTAX ERROR', bx + 6, by + 6, C.white);
    drawText(ctx, 'Unexpected token ;', bx + 6, by + 20, C.syn);
    drawText(ctx, 'at prod.js:420:69', bx + 6, by + 30, C.muted);
  } else if (p.demoState === 'hal') {
    // Hallucination visual madness
    const shift = Math.floor(Math.sin(tick * 14) * 4);
    drawText(ctx, '[object Banana] NaN%', bx + 6 + shift, by + 6, C.hal);
    drawText(ctx, 'margin-left: -9999px', bx + 4, by + 18, C.cyb);
    // Floating pixel banana/duck
    ctx.fillStyle = C.hal;
    ctx.fillRect(bx + 14 + shift, by + 28, 12, 6);
    ctx.fillRect(bx + 22 + shift, by + 24, 4, 6);
    drawText(ctx, 'AI SLOP', bx + 32, by + 28, C.white);
  } else {
    // Healthy live demo with rising chart & feature pills
    drawText(ctx, 'USERS: ' + (p.score * 12 + 42), bx + 5, by + 5, C.ok);
    // Mini bar chart
    for (let i = 0; i < 6; i++) {
      const barH = 4 + ((i * 3 + Math.floor(tick * 4)) % 14);
      ctx.fillStyle = i === 5 ? C.ok : col;
      ctx.fillRect(bx + 6 + i * 8, by + 32 - barH, 5, barH);
    }
    // Feature badges
    for (let i = 0; i < Math.min(3, p.demoFeatures.length); i++) {
      const feat = p.demoFeatures[p.demoFeatures.length - 1 - i];
      drawText(ctx, feat, bx + 60, by + 6 + i * 10, C.codeStr);
    }
  }

  // Vulnerability indicator in Demo if exposed
  if (p.vulnTimer > 0 && Math.floor(tick * 8) % 2 === 0) {
    ctx.fillStyle = C.cybBg;
    ctx.fillRect(bx + 2, by + bh - 12, bw - 4, 10);
    drawText(ctx, 'CVE OPEN: ' + Math.ceil(p.vulnTimer) + 's', bx + 5, by + bh - 10, C.cyb);
  }

  ctx.restore();
}

function renderCodePanel(ctx, x, y, w, h, p, tick) {
  if (w <= 4) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = C.ideBg;
  ctx.fillRect(x, y, w, h);

  // Danger Prod Deploy Zone at top of IDE
  ctx.fillStyle = '#290d16';
  ctx.fillRect(x, y, w, 12);
  drawText(ctx, '^^^ LIVE PROD DEPLOY LINE ^^^', x + 8, y + 3, C.syn);

  const activeErr = getActiveErrorLine(p);

  for (let i = 0; i < p.lines.length; i++) {
    const ln = p.lines[i];
    const ly = Math.round(ln.y);
    if (ly < y + 10 || ly > y + h - 6) continue;

    const isTarget = ln === activeErr;

    if (ln.errType && ln.status === 'active') {
      const bgCol = ln.errType === 'syn' ? C.synBg : ln.errType === 'hal' ? C.halBg : C.cybBg;
      const fgCol = ln.errType === 'syn' ? C.syn : ln.errType === 'hal' ? C.hal : C.cyb;

      ctx.fillStyle = bgCol;
      ctx.fillRect(x + 2, ly - 2, w - 4, 12);

      if (isTarget) {
        const bCol = Math.floor(tick * 10) % 2 === 0 ? C.white : fgCol;
        drawBox(ctx, x + 2, ly - 2, w - 4, 12, bgCol, bCol);
      }

      // Left type tag
      const tag = ln.errType === 'syn' ? 'SYN' : ln.errType === 'hal' ? 'HAL' : 'CYB';
      ctx.fillStyle = fgCol;
      ctx.fillRect(x + 4, ly, 17, 8);
      drawText(ctx, tag, x + 5, ly + 1, '#000000');

      // Code text
      drawText(ctx, ln.text, x + 24, ly + 1, C.white);

      // Inline Combo Badges on the right side of the line
      const comboW = ln.combo.length * 13 + 4;
      const cx = Math.max(x + 24, x + w - comboW - 4);
      ctx.fillStyle = '#07090f';
      ctx.fillRect(cx - 2, ly - 1, comboW, 10);
      drawComboBadges(ctx, ln.combo, ln.progress, cx, ly);
    } else if (ln.status === 'fixed') {
      ctx.fillStyle = '#0e291a';
      ctx.fillRect(x + 2, ly - 1, w - 4, 10);
      drawText(ctx, '// FIXED: ' + ln.text, x + 6, ly + 1, C.ok);
    } else if (ln.status === 'failed') {
      ctx.fillStyle = '#4a0e17';
      ctx.fillRect(x + 2, ly - 1, w - 4, 10);
      drawText(ctx, '!! LEAKING: ' + ln.text, x + 6, ly + 1, C.syn);
    } else {
      // Clean self-referential JS code line
      const col = ln.text.startsWith('//')
        ? C.codeStr
        : ln.text.includes('function') || ln.text.includes('const') || ln.text.includes('if')
          ? C.codeKw
          : C.muted;
      drawText(ctx, ln.text, x + 6, ly + 1, col);
    }
  }

  // Render absurd Cyber Hack Popups over victim's IDE!
  for (let i = 0; i < p.popups.length; i++) {
    const pop = p.popups[i];
    const jx = Math.floor(Math.sin(tick * 22 + i) * 2);
    const px = x + Math.min(pop.ox, Math.max(4, w - 144)) + jx;
    const py = pop.oy;
    const pw = Math.min(140, w - 8);
    const ph = 32;

    drawBox(ctx, px, py, pw, ph, C.popupBg, pop.col);
    ctx.fillStyle = pop.col;
    ctx.fillRect(px, py, pw, 9);
    drawText(ctx, pop.title, px + 4, py + 2, C.white);
    drawText(ctx, '[X]', px + pw - 16, py + 2, C.white);
    drawText(ctx, pop.body, px + 4, py + 13, '#0b0e17');
    drawText(ctx, 'MASH B2 TO KILL PROCESS!', px + 4, py + 22, '#b33939');
  }

  ctx.restore();
}

function renderTerminalPanel(ctx, x, y, w, h, p, rival, tick) {
  if (w <= 4) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = p.termFlash > 0 ? '#182436' : C.termBg;
  ctx.fillRect(x, y, w, h);

  const pCol = p.id === 1 ? C.p1 : C.p2;
  const pct = Math.round(((p.id === 1 ? sceneWidthShare(p.id, w) : w) / VW) * 100);
  drawText(
    ctx,
    `P${p.id} SCORE:${String(p.score).padStart(4, '0')}  SPACE:${pct}%  STREAK:${p.streak}`,
    x + 6,
    y + 4,
    pCol,
  );

  // Priority 1: If Rival is Vulnerable, show neon HACK RIVAL prompt!
  if (rival.vulnTimer > 0 && rival.hackCombo.length > 0) {
    const pulse = Math.floor(tick * 10) % 2 === 0;
    drawBox(ctx, x + 4, y + 14, w - 8, 22, C.cybBg, pulse ? C.white : C.cyb);
    drawTextBold(ctx, 'HACK RIVAL:', x + 8, y + 22, C.cyb);
    drawComboBadges(ctx, rival.hackCombo, p.hackProgress, x + 76, y + 21);
  } else {
    // Priority 2: Show active target error combo clearly in Terminal
    const activeErr = getActiveErrorLine(p);
    if (activeErr) {
      const eCol =
        activeErr.errType === 'syn' ? C.syn : activeErr.errType === 'hal' ? C.hal : C.cyb;
      const label =
        activeErr.errType === 'syn'
          ? 'FIX SINTAXIS:'
          : activeErr.errType === 'hal'
            ? 'FIX HALUCIN:'
            : `FIX CVE (${activeErr.chances}x):`;
      drawBox(ctx, x + 4, y + 14, w - 8, 22, '#111625', eCol);
      drawTextBold(ctx, label, x + 8, y + 22, eCol);
      drawComboBadges(ctx, activeErr.combo, activeErr.progress, x + 84, y + 21);
    } else {
      drawBox(ctx, x + 4, y + 14, w - 8, 22, '#0d111c', C.border);
      drawText(ctx, 'STATUS: ALL CHECKS PASSING...', x + 8, y + 22, C.ok);
    }
  }

  // Terminal console log line at bottom
  const logCol = p.termFlash > 0 ? p.termFlashCol : C.muted;
  drawText(ctx, `$ ${p.termLog}`, x + 6, y + 42, logCol);
  drawText(
    ctx,
    p.vulnTimer > 0 ? `!! CVE OPEN (${Math.ceil(p.vulnTimer)}s) !!` : `FIXED:${p.fixed} LEAK:${p.leaked}`,
    x + 6,
    y + 54,
    p.vulnTimer > 0 ? C.syn : C.muted,
  );

  ctx.restore();
}

function sceneWidthShare(id, w) {
  return w;
}

function renderGameOverOverlay(scene, ctx) {
  const st = scene.state;
  ctx.fillStyle = 'rgba(7, 9, 15, 0.86)';
  ctx.fillRect(0, 0, VW, VH);

  const wCol = st.winner === 1 ? C.p1 : C.p2;
  drawBox(ctx, 54, 38, 292, 224, '#101524', wCol);

  drawTextBold(ctx, `PLAYER ${st.winner} WINS THE HACKATHON!`, 104, 54, wCol);
  drawText(ctx, st.winReason, 86, 72, C.white);

  drawText(
    ctx,
    `P1 SCORE: ${st.p1.score} (FIXED ${st.p1.fixed})   P2 SCORE: ${st.p2.score} (FIXED ${st.p2.fixed})`,
    72,
    94,
    C.muted,
  );

  // 3-letter Arcade Tag Entry
  drawTextBold(ctx, 'ENTER WINNER TAG:', 146, 120, C.hal);
  for (let i = 0; i < 3; i++) {
    const cx = 162 + i * 28;
    const cy = 136;
    const active = !st.saved && st.nameIdx === i;
    drawBox(ctx, cx, cy, 20, 24, '#080b12', active ? C.ok : C.border);
    drawTextBold(ctx, String.fromCharCode(st.nameChars[i]), cx + 7, cy + 9, active ? C.ok : C.white);
  }

  if (!st.saved) {
    drawText(ctx, 'JOYSTICK TO CHANGE LETTERS, B1/START TO SAVE', 84, 174, C.white);
  } else {
    drawTextBold(ctx, 'SCORE SAVED! PRESS START FOR REMATCH', 86, 174, C.ok);
  }

  // Mini leaderboard
  drawText(ctx, 'HIGH SCORES:', 168, 198, C.p1);
  for (let i = 0; i < Math.min(3, st.highScores.length); i++) {
    const e = st.highScores[i];
    drawText(
      ctx,
      `${i + 1}. ${e.tag} - ${e.score} PTS (${e.winner})`,
      138,
      212 + i * 11,
      C.white,
    );
  }
}

// ============================================================================
// PIXEL FONT, COMBO BADGES & SELF-REFERENTIAL CODE POOL
// ============================================================================

function drawComboBadges(ctx, combo, progress, x, y) {
  for (let i = 0; i < combo.length; i++) {
    const step = combo[i];
    const bx = x + i * 13;
    const done = i < progress;
    const isNext = i === progress;

    const bg = done ? C.ok : step === 'B1' ? '#1e90ff' : step === 'B2' ? C.cyb : '#2f3542';
    const border = isNext ? C.white : done ? C.ok : C.border;
    ctx.fillStyle = bg;
    ctx.fillRect(bx, y, 11, 8);
    ctx.fillStyle = border;
    ctx.fillRect(bx, y, 11, 1);

    const fg = done ? '#000000' : C.white;
    if (step === 'U') drawArrowGlyph(ctx, bx + 3, y + 2, 0, fg);
    else if (step === 'D') drawArrowGlyph(ctx, bx + 3, y + 2, 1, fg);
    else if (step === 'L') drawArrowGlyph(ctx, bx + 3, y + 2, 2, fg);
    else if (step === 'R') drawArrowGlyph(ctx, bx + 3, y + 2, 3, fg);
    else drawText(ctx, step, bx + 1, y + 1, fg);
  }
}

function drawArrowGlyph(ctx, x, y, dir, col) {
  ctx.fillStyle = col;
  // 5x5 crisp pixel arrow
  const maps = [
    ['00100', '01110', '10101', '00100', '00100'], // U
    ['00100', '00100', '10101', '01110', '00100'], // D
    ['00100', '01000', '11111', '01000', '00100'], // L
    ['00100', '00010', '11111', '00010', '00100'], // R
  ];
  const m = maps[dir];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (m[r][c] === '1') ctx.fillRect(x + c, y + r, 1, 1);
    }
  }
}

function drawBox(ctx, x, y, w, h, bg, borderCol) {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = borderCol;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
}

function buildFontCache(scene) {
  // Decode 4x6 bitmaps once for ultra-fast integer pixel rendering
  scene.glyphs = FONT_HEX.map((hex) => {
    const coords = [];
    for (let r = 0; r < 6; r++) {
      const nib = parseInt(hex[r], 16);
      for (let c = 0; c < 4; c++) {
        if ((nib >> (3 - c)) & 1) coords.push([c, r]);
      }
    }
    return coords;
  });
}

function drawText(ctx, str, x, y, color) {
  if (!str) return;
  ctx.fillStyle = color;
  const glyphs = window._fcGlyphs;
  let cx = x | 0;
  const cy = y | 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 32;
    const g = glyphs[code];
    if (g) {
      for (let j = 0; j < g.length; j++) {
        ctx.fillRect(cx + g[j][0], cy + g[j][1], 1, 1);
      }
    }
    cx += 5;
  }
}

function drawTextBold(ctx, str, x, y, color) {
  drawText(ctx, str, x, y, '#000000');
  drawText(ctx, str, x, y - 1, color);
}

function buildSelfCodePool(scene) {
  window._fcGlyphs = scene.glyphs;
  // Extract our own source code functions at runtime!
  const fns = [
    updateMatch,
    updatePlayer,
    spawnCodeLine,
    handlePlayerInput,
    onErrorFixed,
    executeHackOnRival,
    renderGameplay,
  ];
  const rawLines = [];
  const jokes = [
    '// TODO: ask Claude why this works',
    '// DO NOT TOUCH OR DEMO EXPLODES',
    'console.log("LLEGO AQUI 12345");',
    '// vibecoded at 4:12 AM on Mate',
    'const aiConfidence = 999.9;',
  ];
  for (let i = 0; i < fns.length; i++) {
    const lines = fns[i].toString().split('\n');
    for (let j = 0; j < lines.length; j++) {
      const t = lines[j].trim();
      if (t.length >= 6) {
        rawLines.push(t.slice(0, 48));
        if (rawLines.length % 7 === 0) {
          rawLines.push(jokes[Math.floor(rawLines.length / 7) % jokes.length]);
        }
      }
    }
  }
  scene.codePool = rawLines;
}

// ============================================================================
// CONTROLS, 8-BIT SYNTH & STORAGE
// ============================================================================

function createControls(scene) {
  scene.controls = {
    held: Object.create(null),
    pressed: Object.create(null),
  };

  const onKeyDown = (event) => {
    const code = KEYBOARD_TO_ARCADE[normalizeKey(event.key)];
    if (!code) return;
    if (!scene.controls.held[code]) {
      scene.controls.pressed[code] = true;
    }
    scene.controls.held[code] = true;
  };

  const onKeyUp = (event) => {
    const code = KEYBOARD_TO_ARCADE[normalizeKey(event.key)];
    if (!code) return;
    scene.controls.held[code] = false;
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

function startMusic(scene) {
  if (scene.musicStarted) return;
  scene.musicStarted = true;
  try {
    const ctx = scene.sound && scene.sound.context ? scene.sound.context : null;
    if (!ctx) return;
    const notes = [110, 130.81, 146.83, 164.81, 146.83, 130.81, 196, 164.81];
    let step = 0;
    scene.time.addEvent({
      delay: 180,
      loop: true,
      callback: () => {
        if (!scene.state || scene.state.phase !== 'playing') return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        const mult = scene.state.speedMult > 1.8 ? 1.25 : 1;
        osc.frequency.setValueAtTime(notes[step % notes.length] * mult, ctx.currentTime);
        g.gain.setValueAtTime(0.04, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        step++;
      },
    });
  } catch (_) {}
}

function playSound(scene, type) {
  try {
    const ctx = scene.sound && scene.sound.context ? scene.sound.context : null;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'key') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(920, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.035);
    } else if (type === 'fix') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.04);
      osc.frequency.setValueAtTime(1046.5, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'warn') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.07);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.17);
    } else if (type === 'fail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(85, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.21);
    } else if (type === 'hack') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(220, now + 0.05);
      osc.frequency.setValueAtTime(660, now + 0.1);
      osc.frequency.setValueAtTime(1760, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.start(now);
      osc.stop(now + 0.27);
    } else if (type === 'start') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.19);
    }
  } catch (_) {}
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
      return res.value.slice(0, 5);
    }
  } catch (_) {}
  return [];
}

async function saveHighScore(scene, entry) {
  try {
    const list = scene.state.highScores.concat(entry).sort((a, b) => b.score - a.score).slice(0, 5);
    scene.state.highScores = list;
    await getStorage().set(STORAGE_KEY, list);
  } catch (_) {}
}
