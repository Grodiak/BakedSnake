const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const snakeHeadSprites = {
  closed: null,
  littleOpen: null,
  open: null,
};
const assetLoadState = {
  body: { loaded: false, processed: false, fallback: false, error: null },
  heads: {
    closed: { loaded: false, processed: false, fallback: false, error: null },
    littleOpen: { loaded: false, processed: false, fallback: false, error: null },
    open: { loaded: false, processed: false, fallback: false, error: null },
  },
};
const snakeBodyImage = new Image();
let snakeBodySprite = null;
const floorTileImage = new Image();
let floorTilePattern = null;
const bossImage = new Image();
const itemSprites = {
  blue1: null,
  blue2: null,
  blue3: null,
  bluex: null,
  red1: null,
  red2: null,
  red3: null,
  redx: null,
};
const itemSpriteSrcs = {
  blue1: "./assets/item-blue1-coffee.png?v=blue1-coffee-v1",
  blue2: "./assets/item-blue2-donut.png?v=blue2-donut-v2",
  blue3: "./assets/item-blue3-pizza.png?v=blue3-pizza-v1",
  bluex: "./assets/item-bluex-bottle.png?v=bluex-bottle-v1",
  red1: "./assets/item-red1-gummy.png?v=red1-gummy-v4",
  red2: "./assets/item-red2-mushroom.png?v=red2-mushroom-v1",
  red3: "./assets/item-red3-capsule.png?v=red3-capsule-v1",
  redx: "./assets/item-redx-bottle.png?v=redx-bottle-v1",
};

const gameWrap = document.querySelector(".game-wrap");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const levelEl = document.querySelector("#level");
const levelProgressEl = document.querySelector("#levelProgress");
const livesEl = document.querySelector("#lives");
const bossGasMeter = document.querySelector("#bossGasMeter");
const bossGasFill = document.querySelector("#bossGasFill");
const titleBestEl = document.querySelector("#titleBest");
const deathOverlay = document.querySelector("#deathOverlay");
const deathScoreEl = document.querySelector("#deathScore");
const deathBestEl = document.querySelector("#deathBest");
const deathKickerEl = document.querySelector("#deathKicker");
const deathPromptEl = document.querySelector("#deathPrompt");
const clearStatsEl = document.querySelector("#clearStats");
const clearStreakIconEl = document.querySelector("#clearStreakIcon");
const clearStreakValueEl = document.querySelector("#clearStreakValue");
const scoreEntryEl = document.querySelector("#scoreEntry");
const scoreNameInput = document.querySelector("#scoreName");
const scoreBoardEl = document.querySelector("#scoreBoard");
const scoreBoardListEl = document.querySelector("#scoreBoardList");
const restartButton = document.querySelector("#restartButton");
const cinematicOverlay = document.querySelector("#cinematicOverlay");
const cinematicImage = document.querySelector("#cinematicImage");
const cinematicLine = document.querySelector("#cinematicLine");
const cinematicContinueButton = document.querySelector("#cinematicContinueButton");
const screenWipe = document.querySelector("#screenWipe");
const overlay = document.querySelector("#overlay");
const overlayText = document.querySelector("#overlayText");
const startButton = document.querySelector("#startButton");
const briefingOverlay = document.querySelector("#briefingOverlay");
const briefingStartButton = document.querySelector("#briefingStartButton");
const musicOnButton = document.querySelector("#musicOnButton");
const musicOffButton = document.querySelector("#musicOffButton");
const soundOnButton = document.querySelector("#soundOnButton");
const soundOffButton = document.querySelector("#soundOffButton");

const WORLD = { w: 1290, h: 600 };
const STORAGE_KEY = "baked-snake-best";
const SCOREBOARD_KEY = "baked-snake-top10";
const SCORE_SCALE = 100;
const LEVEL_ONE_TARGET = 1000;
const LEVEL_DURATION = 45;
const MENU_MUSIC_SRC = "./assets/audio/menu-coin-clash.mp3";
const GAME_MUSIC_SRC = "./assets/audio/coin-clash.mp3";
const BOSS_MUSIC_SRC = "./assets/audio/blotch-on-sight.mp3";
const CINEMATIC_MUSIC_SRC = "./assets/audio/cinematics.mp3";
const MENU_MUSIC_LOOP_START = 0;
const GAME_MUSIC_LOOP_START = 51;
const BOSS_MUSIC_LOOP_START = 2;
const CINEMATIC_MUSIC_LOOP_START = 0;
const MUSIC_VOLUME = 0.31;
const BOSS_MUSIC_FADE_MS = 1200;
const MUSIC_NORMAL_RATE = 1;
const MUSIC_SLOWMO_RATE = 0.8;
const MUSIC_NORMAL_CUTOFF = 18000;
const MUSIC_SLOWMO_CUTOFF = 680;
const PICKUP_SOUND_SRC = "./assets/audio/gather-point-regular.wav";
const PICKUP_SOUND_VOLUME = 1;
const BITE_SOUND_VOLUME = 0.198;
const ARCADE_TEXT_SOUND_SRC = "./assets/audio/arcade-text.mp3";
const ARCADE_TEXT_VOLUME = 0.36;
const PICKUP_SOUND_DELAY = 35;
const BLOTCH_CHARGE_SOUND_SRC = "./assets/audio/blotch-charge.mp3";
const BLOTCH_FIRE_SOUND_SRC = "./assets/audio/blotch-fire.mp3";
const BLOTCH_BEAM_CRACKLE_SOUND_SRC = "./assets/audio/blotch-beam-crackle.mp3";
const BLOTCH_BEAM_CRACKLE_2_SOUND_SRC = "./assets/audio/blotch-beam-crackle-2.mp3";
const BOSS_LEVEL_SFX_MULTIPLIER = 0.5;
const BLOTCH_BOSS_SFX_VOLUME = 0.075;
const RED_X_SHOUT_SRC = "./assets/audio/red-x-shout.wav";
const RED_X_SHOUT_VOLUME = 0.45;
const BLUE_X_SHOUT_SRC = "./assets/audio/blue-x-shout.wav";
const BLUE_X_SHOUT_VOLUME = 0.5;
const BLUE_X_SHOUT_RATE = 0.8;
const DEATH_BOOM_VOLUME = 0.72;
const HERO_ITEM_SPAWN_VOLUME = 0.62;
const DEBUG_DEATH = new URLSearchParams(window.location.search).has("debugDeath");
const DEBUG_BACKGROUND_B = new URLSearchParams(window.location.search).has("debugBgB");
const DEBUG_MOUTH = new URLSearchParams(window.location.search).get("debugMouth");
const DEBUG_SLOWMO = new URLSearchParams(window.location.search).has("debugSlowMo");
const DEBUG_TRIP = new URLSearchParams(window.location.search).has("debugTrip");
const DEBUG_EXIT = new URLSearchParams(window.location.search).has("debugExit");
const DEBUG_LEVEL = Number(new URLSearchParams(window.location.search).get("debugLevel")) || 1;
const DEBUG_CINEMATIC = new URLSearchParams(window.location.search).has("debugCinematic");
const X_ITEM_UNLOCK = {
  score: 180,
  length: 340,
  speed: 190,
};
const HELP_COLOR = "#42cafd";
const HARM_COLOR = "#ef4d5a";
const X_HELP_COLOR = "#9df7ff";
const X_HARM_COLOR = "#ff2a8a";
const EXIT_COLOR = "#fff2a8";
const HEAD_SPRITE_SIZE = 68;
const BODY_TEXTURE_WIDTH = 24;
const BODY_TEXTURE_LENGTH = 46;
const BODY_TEXTURE_STEP = 13;
const BODY_TEXTURE_WRAP_INSET = 8;
const FLOOR_TILE_PATTERN_SIZE = 360;
const ITEM_SPRITE_HEIGHT = 43;
const MOUTH_PREP_DISTANCE = 96;
const MOUTH_BITE_TIME = 0.18;
const BOSS_SPRITE_SIZE = 220;
const BOSS_CANNON_TIP_OFFSET_X = -20;
const BOSS_CANNON_TIP_OFFSET_Y = -89;
const BOSS_LEVEL = 5;
const CINEMATIC_TRIGGER_LEVEL = 4;
const BOSS_ATTACK_HOLD = 5;
const BOSS_PHASE_THREE_ATTACK_HOLD = 8;
const BOSS_WINDUP = 1.25;
const BOSS_PHASE_TWO_GAS = 2 / 3;
const BOSS_PHASE_THREE_GAS = 1 / 3;
const BOSS_PHASE_ONE_SPEED = 118;
const BOSS_PHASE_TWO_SPEED = 218;
const BOSS_PHASE_THREE_SPEED = 330;
const BOSS_PHASE_TWO_WINDUP = 0.68;
const BOSS_PHASE_THREE_WINDUP = 0.48;
const BOSS_SHOT_DAMAGE = 0.085;
const BOSS_TRACKING_LEAD = 68;
const BOSS_TRACKING_JITTER = 74;
const BOSS_LASER_HALF_WIDTH = 7;
const BOSS_CROSS_BEAM_DELAY = 1.05;
const BOSS_CROSS_LASER_HALF_WIDTH = 7;
const BOSS_ROTATING_BEAM_DELAY = 2.85;
const BOSS_ROTATING_BEAM_WARNING = 1.8;
const BOSS_ROTATING_BEAM_SPEED = 0.28;
const BOSS_CHARGE_CUTOFF_BEFORE_FIRE = 0.08;
const BOSS_EXPLOSION_TIME = 1.65;
const BOSS_DEFEAT_BEAT_TIME = 3.55;
const BOSS_DEFEAT_WARNING_TIME = 1.75;
const BOSS_MESSAGE_TIME = 3.2;
const BOSS_RANDOM_BARK_MIN = 5.8;
const BOSS_RANDOM_BARK_MAX = 10.5;
const BOSS_INTRO_TIME = 9.2;
const BOSS_INTRO_FIRST_LINE_TIME = 4.8;
const BOSS_RETRY_INTRO_TIME = 3.35;
const STARTING_LIVES = 3;
const STAGE_INVULNERABLE_TIME = 3;
const CINEMATIC_TYPE_MS = 38;
const CINEMATIC_SENTENCE_PAUSE_MS = 440;
const CINEMATIC_SCENES = [
  {
    image: "./assets/blotch-neutral-mcu.png?v=arcade-text-sfx-v1",
    text: "Heyyy! If it isn't my number one customer! Good to run into you.",
    framing: { zoom: 1.02, x: "50%", y: "50%" },
  },
  {
    image: "./assets/blotch-bites-donut.png?v=arcade-text-sfx-v1",
    text: "Word on the street is that you've been munching up product big time these past few days. Sounds like you've been hella hungry...",
    framing: { zoom: 1, x: "50%", y: "50%" },
  },
  {
    image: "./assets/blotch-holds-donut.png?v=arcade-text-sfx-v1",
    text: "I'm no mathematician, but my numbers guy says you'd need some serious Bezos-level mulah to square up. And I mean no disrespect, but you don't look the part.",
    framing: { zoom: 1.01, x: "50%", y: "50%" },
  },
  {
    image: "./assets/blotch-accusing.png?v=arcade-text-sfx-v1",
    text: "So now I'm gonna have to mess you up so other dipshit potheads like you don't come squirming around for freebies... It's go time!",
    framing: { zoom: 1, x: "50%", y: "50%" },
  },
];
const BOSS_RANDOM_BARKS = [
  "You can slither, but you can't hide!",
  "Stay still you piece of shit!",
  "Aaaaaah!",
  "Say hello to my big-ass friend!",
  "Nobody messes with the BLOTCH!",
  "You've eaten your last gummy!",
];
const MAX_LEVEL = 5;
const LEVELS = {
  1: {
    label: "1-1",
    start: { x: WORLD.w * 0.5, y: WORLD.h * 0.5, angle: -Math.PI * 0.2 },
    obstacles: [],
    lines: [],
  },
  2: {
    label: "2-1",
    start: { x: WORLD.w * 0.28, y: WORLD.h * 0.55, angle: -Math.PI * 0.16 },
    obstacles: [{
      x: WORLD.w * 0.5 - 62,
      y: WORLD.h * 0.5 - 62,
      size: 124,
      padding: 88,
      colors: ["#ff5af1", "#62efff", "#fff2a8"],
      phase: 0,
    }],
    lines: [],
  },
  3: {
    label: "3-1",
    start: { x: WORLD.w * 0.5, y: WORLD.h * 0.78, angle: -Math.PI * 0.5 },
    obstacles: [
      {
        x: WORLD.w / 3 - 56,
        y: WORLD.h * 0.5 - 56,
        size: 112,
        padding: 82,
        colors: ["#5cf8ff", "#ff5af1", "#fff2a8"],
        phase: 0.35,
      },
      {
        x: WORLD.w * 2 / 3 - 56,
        y: WORLD.h * 0.5 - 56,
        size: 112,
        padding: 82,
        colors: ["#8cff5c", "#b66cff", "#ffef5c"],
        phase: 1.2,
      },
    ],
    lines: [],
  },
  4: {
    label: "4-1",
    start: { x: WORLD.w * 0.5, y: WORLD.h * 0.78, angle: 0 },
    obstacles: [],
    lines: [{
      y: WORLD.h * 0.5,
      thickness: 8,
      height: 22,
      padding: 78,
      colors: ["#55e9ff", "#ff57e3", "#7cff5d"],
      phase: 0.6,
    }],
  },
  5: {
    label: "5-1",
    start: { x: WORLD.w * 0.5, y: WORLD.h * 0.2, angle: Math.PI * 0.02 },
    obstacles: [],
    lines: [],
    boss: {
      y: WORLD.h - 58,
      minX: 118,
      maxX: WORLD.w - 118,
    },
  },
};
const SPAWN_DELAY = { min: 0.85, max: 1.75 };
const SNAP_MODE_THRESHOLD = 0.08;
const SNAP_TURN_MIN = 20 * Math.PI / 180;
const SNAP_TURN_MAX = 90 * Math.PI / 180;
const EFFECT_DECAY = {
  wobble: 0.075,
  trip: 0.065,
  stim: 0.052,
  jitter: 0.09,
  snap: 0.08,
};

loadHeadSprite("closed", "./assets/snake-head-closed-v21-source.png?v=mouth-cycle-v1");
loadHeadSprite("littleOpen", "./assets/snake-head-little-open-v2-source.png?v=mouth-cycle-v1");
loadHeadSprite("open", "./assets/snake-head-open-v2-source.png?v=mouth-cycle-v1");

bossImage.src = "./assets/blotch-boss.png?v=blotch-sprite-v1";

snakeBodyImage.addEventListener("load", () => {
  assetLoadState.body.loaded = true;
  try {
    snakeBodySprite = buildSnakeBodySprite(snakeBodyImage);
    assetLoadState.body.processed = true;
  } catch (error) {
    console.warn("Baked Snake: using Safari-safe body texture fallback", error);
    snakeBodySprite = buildSnakeBodySpriteFallback(snakeBodyImage);
    assetLoadState.body.fallback = true;
    assetLoadState.body.error = error?.message || String(error);
  }
});
snakeBodyImage.src = "./assets/snake-body-sheet.png?v=body-texture-v1";

floorTileImage.addEventListener("load", () => {
  floorTilePattern = buildFloorTilePattern(floorTileImage);
});
floorTileImage.src = "./assets/floor-tile.png?v=floor-tile-v1";

for (const [key, src] of Object.entries(itemSpriteSrcs)) {
  loadItemSprite(key, src);
}

function loadHeadSprite(key, src) {
  const image = new Image();
  image.addEventListener("load", () => {
    assetLoadState.heads[key].loaded = true;
    try {
      snakeHeadSprites[key] = buildSnakeHeadSprite(image);
      assetLoadState.heads[key].processed = true;
    } catch (error) {
      console.warn(`Baked Snake: using Safari-safe ${key} head fallback`, error);
      snakeHeadSprites[key] = buildSnakeHeadSpriteFallback(key);
      assetLoadState.heads[key].fallback = true;
      assetLoadState.heads[key].error = error?.message || String(error);
    }
  });
  image.src = src;
}

function buildFloorTilePattern(image) {
  const tileCanvas = document.createElement("canvas");
  tileCanvas.width = FLOOR_TILE_PATTERN_SIZE;
  tileCanvas.height = FLOOR_TILE_PATTERN_SIZE;
  const tileCtx = tileCanvas.getContext("2d");
  tileCtx.drawImage(image, 0, 0, tileCanvas.width, tileCanvas.height);
  return ctx.createPattern(tileCanvas, "repeat");
}

function loadItemSprite(key, src) {
  const image = new Image();
  image.addEventListener("load", () => {
    itemSprites[key] = image;
  });
  image.src = src;
}

const music = new Audio(MENU_MUSIC_SRC);
music.id = "backgroundMusic";
music.preload = "auto";
music.autoplay = true;
music.loop = true;
music.muted = false;
music.volume = MUSIC_VOLUME;
music.setAttribute("playsinline", "");
music.dataset.loopStart = String(MENU_MUSIC_LOOP_START);
document.body.appendChild(music);

const pickupSounds = Array.from({ length: 8 }, () => {
  const sound = new Audio(PICKUP_SOUND_SRC);
  sound.preload = "auto";
  sound.volume = PICKUP_SOUND_VOLUME;
  sound.preservesPitch = false;
  sound.mozPreservesPitch = false;
  sound.webkitPreservesPitch = false;
  sound.load();
  return sound;
});
const biteSounds = Array.from({ length: 4 }, () => {
  const sound = new Audio("./assets/audio/quick-bite.wav");
  sound.preload = "auto";
  sound.volume = BITE_SOUND_VOLUME;
  return sound;
});
const deathBoomSounds = Array.from({ length: 2 }, () => {
  const sound = new Audio("./assets/audio/end-boom.wav");
  sound.preload = "auto";
  sound.volume = DEATH_BOOM_VOLUME;
  return sound;
});
const heroItemSpawnSounds = Array.from({ length: 2 }, () => {
  const sound = new Audio("./assets/audio/hero-item-spawn.wav");
  sound.preload = "auto";
  sound.volume = HERO_ITEM_SPAWN_VOLUME;
  return sound;
});
const blotchChargeSound = new Audio(BLOTCH_CHARGE_SOUND_SRC);
blotchChargeSound.preload = "auto";
blotchChargeSound.volume = BLOTCH_BOSS_SFX_VOLUME;
const blotchFireSound = new Audio(BLOTCH_FIRE_SOUND_SRC);
blotchFireSound.preload = "auto";
blotchFireSound.volume = BLOTCH_BOSS_SFX_VOLUME;
const blotchBeamCrackleSound = new Audio(BLOTCH_BEAM_CRACKLE_SOUND_SRC);
blotchBeamCrackleSound.preload = "auto";
blotchBeamCrackleSound.loop = true;
blotchBeamCrackleSound.volume = BLOTCH_BOSS_SFX_VOLUME;
const blotchBeamCrackle2Sound = new Audio(BLOTCH_BEAM_CRACKLE_2_SOUND_SRC);
blotchBeamCrackle2Sound.preload = "auto";
blotchBeamCrackle2Sound.loop = true;
blotchBeamCrackle2Sound.volume = BLOTCH_BOSS_SFX_VOLUME;
const arcadeTextSound = new Audio(ARCADE_TEXT_SOUND_SRC);
arcadeTextSound.id = "arcadeTextSound";
arcadeTextSound.preload = "auto";
arcadeTextSound.loop = true;
arcadeTextSound.volume = ARCADE_TEXT_VOLUME;
document.body.appendChild(arcadeTextSound);
let pickupSoundIndex = 0;
let biteSoundIndex = 0;
let deathBoomSoundIndex = 0;
let heroItemSpawnSoundIndex = 0;

let musicStarted = false;
let musicStatus = "waiting";
let musicNeedsCue = false;
let musicEnabled = true;
let musicMode = "menu";
let bossMusicFadeTimer = null;
let soundEnabled = true;
let audioContext = null;
let musicFilter = null;
let musicAudioSource = null;
let pickupSoundBuffer = null;
let pickupSoundLoading = null;
let redXShoutBuffer = null;
let redXShoutLoading = null;
let blueXShoutBuffer = null;
let blueXShoutLoading = null;
let redXReverbBuffer = null;

function updateMusicMenu() {
  musicOnButton.classList.toggle("active", musicEnabled);
  musicOffButton.classList.toggle("active", !musicEnabled);
  musicOnButton.setAttribute("aria-pressed", String(musicEnabled));
  musicOffButton.setAttribute("aria-pressed", String(!musicEnabled));
}

function updateSoundMenu() {
  soundOnButton.classList.toggle("active", soundEnabled);
  soundOffButton.classList.toggle("active", !soundEnabled);
  soundOnButton.setAttribute("aria-pressed", String(soundEnabled));
  soundOffButton.setAttribute("aria-pressed", String(!soundEnabled));
}

function musicLoopStart() {
  if (musicMode === "game") return GAME_MUSIC_LOOP_START;
  if (musicMode === "boss") return BOSS_MUSIC_LOOP_START;
  if (musicMode === "cinematic") return CINEMATIC_MUSIC_LOOP_START;
  return MENU_MUSIC_LOOP_START;
}

function musicSourceForMode(mode) {
  if (mode === "game") return GAME_MUSIC_SRC;
  if (mode === "boss") return BOSS_MUSIC_SRC;
  if (mode === "cinematic") return CINEMATIC_MUSIC_SRC;
  return MENU_MUSIC_SRC;
}

function stopBossMusicFade() {
  if (!bossMusicFadeTimer) return;
  window.clearInterval(bossMusicFadeTimer);
  bossMusicFadeTimer = null;
}

function startBossMusicFade() {
  stopBossMusicFade();
  if (musicMode !== "boss" || !musicEnabled) return;

  const start = performance.now();
  music.volume = 0;
  bossMusicFadeTimer = window.setInterval(() => {
    if (musicMode !== "boss" || !musicEnabled) {
      stopBossMusicFade();
      return;
    }

    const progress = clamp((performance.now() - start) / BOSS_MUSIC_FADE_MS, 0, 1);
    music.volume = MUSIC_VOLUME * progress;
    if (progress >= 1) {
      stopBossMusicFade();
      music.volume = MUSIC_VOLUME;
    }
  }, 40);
}

function switchMusicMode(mode) {
  const nextSrc = musicSourceForMode(mode);
  const srcChanged = !music.currentSrc || !music.currentSrc.endsWith(nextSrc.replace("./", ""));
  if (musicMode === mode && !srcChanged) return;

  const shouldResume = !music.paused && musicEnabled;
  music.pause();
  musicMode = mode;
  music.dataset.mode = musicMode;
  musicNeedsCue = true;
  music.loop = mode === "menu" || mode === "cinematic";
  music.playbackRate = MUSIC_NORMAL_RATE;
  if (mode !== "boss") {
    stopBossMusicFade();
    music.volume = MUSIC_VOLUME;
  } else {
    music.volume = 0;
  }
  if (srcChanged) {
    music.src = nextSrc;
  }
  music.dataset.loopStart = String(musicLoopStart());
  music.load();
  cueMusicLoopPoint();

  if (shouldResume) {
    playMusic();
    if (mode === "boss") {
      startBossMusicFade();
    }
  }
}

function cueMusicLoopPoint() {
  if (musicMode === "menu" || musicMode === "cinematic") {
    musicStatus = "cued";
    return;
  }

  try {
    music.currentTime = musicLoopStart();
    musicStatus = "cued";
  } catch {
    music.addEventListener("loadedmetadata", cueMusicLoopPoint, { once: true });
  }
}

function confirmMusicCue() {
  if (musicMode === "menu" || musicMode === "cinematic") {
    musicNeedsCue = false;
    return;
  }

  if (!musicNeedsCue) return;
  if (music.currentTime >= musicLoopStart() - 0.35) {
    musicNeedsCue = false;
    return;
  }
  cueMusicLoopPoint();
}

function playMusic() {
  if (musicMode === "game") {
    ensureMusicEffects();
  }
  musicStatus = music.muted ? "starting-muted" : "starting";
  music.dataset.status = musicStatus;
  music.dataset.error = "";
  music.play().then(() => {
    if (audioContext?.state === "suspended") {
      audioContext.resume();
    }
    confirmMusicCue();
    musicStatus = music.muted ? "playing-muted" : "playing";
    music.dataset.status = musicStatus;
  }).catch((error) => {
    musicStatus = error?.name || "blocked";
    music.dataset.status = musicStatus;
    music.dataset.error = error?.message || "";
    musicStarted = false;
  });
}

function primeMenuMusic() {
  if (!musicEnabled) return;
  switchMusicMode("menu");

  if (!musicStarted) {
    musicStarted = true;
    musicNeedsCue = true;
    music.muted = false;
    music.volume = MUSIC_VOLUME;
    music.load();
    cueMusicLoopPoint();
  }

  if (music.paused) {
    playMusic();
  }
}

function startMenuMusic() {
  if (!musicEnabled) return;
  switchMusicMode("menu");

  if (!musicStarted) {
    musicStarted = true;
    musicNeedsCue = true;
    music.load();
    cueMusicLoopPoint();
  }

  music.muted = false;
  music.volume = MUSIC_VOLUME;

  if (music.paused) {
    playMusic();
  } else {
    confirmMusicCue();
    musicStatus = "playing";
  }
}

function startMusic() {
  if (!musicEnabled) return;
  const mode = isBossLevel() ? "boss" : "game";
  switchMusicMode(mode);
  music.loop = false;

  if (!musicStarted) {
    musicStarted = true;
    musicNeedsCue = true;
    music.load();
    cueMusicLoopPoint();
  }

  music.muted = false;
  music.volume = mode === "boss" ? 0 : MUSIC_VOLUME;
  ensureMusicEffects();
  if (audioContext?.state === "suspended") {
    audioContext.resume();
  }
  loadPickupSoundBuffer();
  loadRedXShout();
  loadBlueXShout();

  if (music.paused) {
    playMusic();
  } else {
    confirmMusicCue();
    musicStatus = "playing";
  }
  if (mode === "boss") {
    startBossMusicFade();
  }
}

function startCinematicMusic() {
  if (!musicEnabled) return;
  switchMusicMode("cinematic");

  if (!musicStarted) {
    musicStarted = true;
    musicNeedsCue = true;
    music.load();
    cueMusicLoopPoint();
  }

  music.muted = false;
  music.volume = MUSIC_VOLUME;
  music.playbackRate = MUSIC_NORMAL_RATE;

  if (music.paused) {
    playMusic();
  } else {
    confirmMusicCue();
    musicStatus = "playing";
  }
}

function resumeGameMusicFromInput() {
  if (!musicEnabled || (musicMode !== "game" && musicMode !== "boss") || !music.paused) return;
  startMusic();
}

function setMusicEnabled(enabled) {
  musicEnabled = enabled;
  updateMusicMenu();

  if (!musicEnabled) {
    stopBossMusicFade();
    music.pause();
    music.muted = true;
    musicStatus = "off";
    return;
  }

  if (running) {
    startMusic();
  } else if (!cinematicOverlay.classList.contains("hidden")) {
    startCinematicMusic();
  } else {
    startMenuMusic();
  }
}

function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  updateSoundMenu();
  if (!soundEnabled) {
    stopArcadeTextSound();
    stopBlotchBeamCrackleSounds();
  }
}

function playSoundFromPool(sounds, index, volume, playbackRate = 1) {
  const sound = sounds[index];
  sound.volume = levelSfxVolume(volume);
  sound.playbackRate = playbackRate;
  sound.preservesPitch = false;
  sound.mozPreservesPitch = false;
  sound.webkitPreservesPitch = false;
  sound.currentTime = 0;
  sound.play().catch(() => {});
  return (index + 1) % sounds.length;
}

function playBiteSound() {
  if (!soundEnabled) return;

  biteSoundIndex = playSoundFromPool(biteSounds, biteSoundIndex, BITE_SOUND_VOLUME);
}

function levelSfxVolume(volume) {
  return state?.level === BOSS_LEVEL ? volume * BOSS_LEVEL_SFX_MULTIPLIER : volume;
}

function startArcadeTextSound() {
  if (!soundEnabled || !cinematicOverlay || cinematicOverlay.classList.contains("hidden")) return;
  arcadeTextSound.volume = ARCADE_TEXT_VOLUME;
  arcadeTextSound.muted = false;
  if (!arcadeTextSound.paused) {
    arcadeTextSound.currentTime = 0;
    return;
  }
  arcadeTextSound.currentTime = 0;
  arcadeTextSound.play().catch(() => {});
}

function stopArcadeTextSound() {
  arcadeTextSound.pause();
  arcadeTextSound.muted = false;
  arcadeTextSound.currentTime = 0;
}

function primeArcadeTextSound() {
  if (!soundEnabled || !arcadeTextSound.paused) return;
  arcadeTextSound.muted = true;
  arcadeTextSound.volume = ARCADE_TEXT_VOLUME;
  arcadeTextSound.currentTime = 0;
  arcadeTextSound.play().catch(() => {
    arcadeTextSound.muted = false;
  });
}

function loadPickupSoundBuffer() {
  if (pickupSoundBuffer || pickupSoundLoading) return pickupSoundLoading;
  const context = getAudioContext();
  if (!context || !window.fetch) return Promise.resolve(null);

  pickupSoundLoading = fetch(PICKUP_SOUND_SRC)
    .then((response) => response.arrayBuffer())
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      pickupSoundBuffer = buffer;
      return buffer;
    })
    .catch(() => null);

  return pickupSoundLoading;
}

function playBufferedPickupSound(volume, playbackRate) {
  const context = getAudioContext();
  if (!context || !pickupSoundBuffer) return false;

  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = pickupSoundBuffer;
  source.playbackRate.value = playbackRate;
  gain.gain.value = levelSfxVolume(volume);
  source.connect(gain);
  gain.connect(context.destination);
  source.start();
  return true;
}

function playGatherSound(streak = 1) {
  if (!soundEnabled) return;

  const playbackRate = 1 + clamp(streak - 1, 0, 5) * 0.13;
  loadPickupSoundBuffer();
  window.setTimeout(() => {
    if (!soundEnabled) return;
    if (playBufferedPickupSound(PICKUP_SOUND_VOLUME, playbackRate)) return;
    pickupSoundIndex = playSoundFromPool(pickupSounds, pickupSoundIndex, PICKUP_SOUND_VOLUME, playbackRate);
  }, PICKUP_SOUND_DELAY);
}

function playDeathBoomSound() {
  if (!soundEnabled) return;

  deathBoomSoundIndex = playSoundFromPool(deathBoomSounds, deathBoomSoundIndex, DEATH_BOOM_VOLUME);
}

function playHeroItemSpawnSound() {
  if (!soundEnabled) return;

  heroItemSpawnSoundIndex = playSoundFromPool(heroItemSpawnSounds, heroItemSpawnSoundIndex, HERO_ITEM_SPAWN_VOLUME);
}

function playBlotchOneShot(sound) {
  if (!soundEnabled) return;
  sound.pause();
  sound.volume = BLOTCH_BOSS_SFX_VOLUME;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function stopBlotchOneShot(sound) {
  sound.pause();
  sound.muted = false;
  sound.currentTime = 0;
}

function startBlotchLoop(sound) {
  if (!soundEnabled) return;
  sound.volume = BLOTCH_BOSS_SFX_VOLUME;
  sound.muted = false;
  if (!sound.paused) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function stopBlotchLoop(sound) {
  sound.pause();
  sound.muted = false;
  sound.currentTime = 0;
}

function stopBlotchBeamCrackleSounds() {
  stopBlotchLoop(blotchBeamCrackleSound);
  stopBlotchLoop(blotchBeamCrackle2Sound);
}

function playBlotchChargeSound() {
  playBlotchOneShot(blotchChargeSound);
}

function playBlotchFireSound() {
  stopBlotchOneShot(blotchChargeSound);
  playBlotchOneShot(blotchFireSound);
}

function startBlotchBeamCrackleSound() {
  startBlotchLoop(blotchBeamCrackleSound);
}

function startBlotchBeamCrackle2Sound() {
  startBlotchLoop(blotchBeamCrackle2Sound);
}

function getAudioContext() {
  if (audioContext) return audioContext;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  audioContext = new AudioContextClass();
  return audioContext;
}

function buildEtherealReverbBuffer(context) {
  const duration = 2.8;
  const sampleRate = context.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const impulse = context.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      const shimmer = Math.sin(i * 0.019 + channel) * 0.38 + Math.sin(i * 0.047) * 0.18;
      data[i] = (Math.random() * 2 - 1 + shimmer) * Math.pow(1 - t, 2.6);
    }
  }

  return impulse;
}

function loadReverbShout(src, assignBuffer, getBuffer, assignLoading, getLoading) {
  if (getBuffer() || getLoading()) return getLoading();
  const context = getAudioContext();
  if (!context || !window.fetch) return Promise.resolve(null);

  const loading = fetch(src)
    .then((response) => response.arrayBuffer())
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      assignBuffer(buffer);
      return buffer;
    })
    .catch(() => null);
  assignLoading(loading);

  return loading;
}

function loadRedXShout() {
  return loadReverbShout(
    RED_X_SHOUT_SRC,
    (buffer) => { redXShoutBuffer = buffer; },
    () => redXShoutBuffer,
    (loading) => { redXShoutLoading = loading; },
    () => redXShoutLoading
  );
}

function loadBlueXShout() {
  return loadReverbShout(
    BLUE_X_SHOUT_SRC,
    (buffer) => { blueXShoutBuffer = buffer; },
    () => blueXShoutBuffer,
    (loading) => { blueXShoutLoading = loading; },
    () => blueXShoutLoading
  );
}

function playReverbShout({ src, buffer, load, volume, rate = 1, retry }) {
  if (!soundEnabled) return;

  const context = getAudioContext();
  if (!context) {
    const fallback = new Audio(src);
    fallback.volume = levelSfxVolume(volume);
    fallback.playbackRate = rate;
    fallback.play().catch(() => {});
    return;
  }

  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  if (!buffer()) {
    load()?.then(() => {
      if (soundEnabled) retry();
    });
    return;
  }

  if (!redXReverbBuffer) {
    redXReverbBuffer = buildEtherealReverbBuffer(context);
  }

  const source = context.createBufferSource();
  const dryGain = context.createGain();
  const wetGain = context.createGain();
  const convolver = context.createConvolver();
  const highpass = context.createBiquadFilter();

  source.buffer = buffer();
  source.playbackRate.value = rate;
  dryGain.gain.value = levelSfxVolume(volume) * 0.62;
  wetGain.gain.value = levelSfxVolume(volume) * 0.72;
  highpass.type = "highpass";
  highpass.frequency.value = 360;
  convolver.buffer = redXReverbBuffer;

  source.connect(dryGain);
  dryGain.connect(context.destination);
  source.connect(highpass);
  highpass.connect(convolver);
  convolver.connect(wetGain);
  wetGain.connect(context.destination);
  source.start();
}

function playRedXShout() {
  playReverbShout({
    src: RED_X_SHOUT_SRC,
    buffer: () => redXShoutBuffer,
    load: loadRedXShout,
    volume: RED_X_SHOUT_VOLUME,
    retry: playRedXShout,
  });
}

function playBlueXShout() {
  playReverbShout({
    src: BLUE_X_SHOUT_SRC,
    buffer: () => blueXShoutBuffer,
    load: loadBlueXShout,
    volume: BLUE_X_SHOUT_VOLUME,
    rate: BLUE_X_SHOUT_RATE,
    retry: playBlueXShout,
  });
}

function ensureMusicEffects() {
  if (musicFilter || (!window.AudioContext && !window.webkitAudioContext)) return;

  audioContext = getAudioContext();
  if (!audioContext) return;
  musicAudioSource = audioContext.createMediaElementSource(music);
  musicFilter = audioContext.createBiquadFilter();
  musicFilter.type = "lowpass";
  musicFilter.frequency.value = MUSIC_NORMAL_CUTOFF;
  musicFilter.Q.value = 0.2;
  musicAudioSource.connect(musicFilter);
  musicFilter.connect(audioContext.destination);
}

function updateSlowMoAudio(slowMoFocus) {
  const targetRate = slowMoFocus > 0 ? MUSIC_SLOWMO_RATE : MUSIC_NORMAL_RATE;
  music.playbackRate += (targetRate - music.playbackRate) * 0.18;

  if (!musicFilter || !audioContext) return;

  const cutoff = MUSIC_NORMAL_CUTOFF + (MUSIC_SLOWMO_CUTOFF - MUSIC_NORMAL_CUTOFF) * slowMoFocus;
  const q = 0.2 + slowMoFocus * 1.15;
  musicFilter.frequency.setTargetAtTime(cutoff, audioContext.currentTime, 0.055);
  musicFilter.Q.setTargetAtTime(q, audioContext.currentTime, 0.055);
}

function loopGameMusic() {
  musicNeedsCue = true;
  cueMusicLoopPoint();
  music.play().then(() => {
    confirmMusicCue();
    musicStatus = music.muted ? "playing-muted" : "playing";
  }).catch((error) => {
    musicStatus = error?.name || "blocked";
    musicStarted = false;
  });
}

function maintainMusicLoop() {
  confirmMusicCue();
  if ((musicMode !== "game" && musicMode !== "boss") || music.paused || !Number.isFinite(music.duration)) return;
  if (music.duration - music.currentTime > 0.18) return;

  loopGameMusic();
}

music.addEventListener("ended", () => {
  if (musicMode === "menu" || musicMode === "cinematic") return;

  loopGameMusic();
});

music.addEventListener("loadedmetadata", () => {
  confirmMusicCue();
});

music.addEventListener("play", () => {
  confirmMusicCue();
});

music.addEventListener("playing", () => {
  confirmMusicCue();
  musicStatus = music.muted ? "playing-muted" : "playing";
});

music.addEventListener("timeupdate", () => {
  maintainMusicLoop();
});

window.bakedSnakeAudioState = () => ({
  currentTime: music.currentTime,
  loopStart: musicLoopStart(),
  mode: musicMode,
  paused: music.paused,
  src: music.currentSrc,
  status: musicStatus,
  muted: music.muted,
  enabled: musicEnabled,
  volume: music.volume,
  playbackRate: music.playbackRate,
  filterFrequency: musicFilter?.frequency.value || null,
  filterQ: musicFilter?.Q.value || null,
});

window.bakedSnakeAssetState = () => JSON.parse(JSON.stringify(assetLoadState));

window.bakedSnakeDebugState = () => ({
  head: state?.head || null,
  mouthOpen: state?.mouthOpen || 0,
  backgroundBActive: state?.backgroundBActive || false,
});

const itemTypes = [
  {
    id: "bean",
    name: "Bean Shot",
    glyph: "1",
    kind: "cleanse",
    color: HELP_COLOR,
    sprite: "blue1",
    points: 5,
    growth: 24,
    radius: 13,
    ttl: 10.5,
    apply: (s) => {
      coolChaos(s, 0.22);
      s.speedBoost += 20;
      s.baseSpeed += 10;
    },
  },
  {
    id: "zap",
    name: "Zap Can",
    glyph: "2",
    kind: "cleanse",
    color: HELP_COLOR,
    sprite: "blue2",
    points: 8,
    growth: 32,
    radius: 14,
    ttl: 9.5,
    apply: (s) => {
      coolChaos(s, 0.34);
      s.speedBoost += 28;
      s.baseSpeed += 16;
    },
  },
  {
    id: "buzz",
    name: "Buzz Tabs",
    glyph: "3",
    kind: "cleanse",
    color: HELP_COLOR,
    sprite: "blue3",
    points: 10,
    growth: 42,
    radius: 13,
    ttl: 8.5,
    apply: (s) => {
      coolChaos(s, 0.5);
      s.effects.stim += 0.16;
      s.speedBoost += 36;
      s.baseSpeed += 24;
    },
  },
  {
    id: "bluex",
    name: "Blue X",
    glyph: "X",
    kind: "x-cleanse",
    color: X_HELP_COLOR,
    sprite: "bluex",
    spriteHeight: 64,
    hero: true,
    rotationRange: 0,
    points: 25,
    growth: 0,
    radius: 17,
    ttl: 5.2,
    apply: (s) => {
      fullCleanse(s);
      s.length = Math.max(180, s.length * 0.58);
      s.slowMo = 8.5;
      s.selfHitGrace = 0.9;
      s.screenPulse = 1.25;
    },
  },
  {
    id: "wobble",
    name: "Wobble Juice",
    glyph: "1",
    kind: "risk",
    color: HARM_COLOR,
    sprite: "red1",
    points: 60,
    growth: 82,
    radius: 15,
    ttl: 7.2,
    apply: (s) => {
      s.effects.wobble += 1.05;
    },
  },
  {
    id: "rainbow",
    name: "Rainbow Tabs",
    glyph: "2",
    kind: "risk",
    color: HARM_COLOR,
    sprite: "red2",
    points: 25,
    growth: 122,
    radius: 15,
    ttl: 5.8,
    apply: (s) => {
      s.effects.trip += 0.72;
    },
  },
  {
    id: "zoom",
    name: "Zoom Dust",
    glyph: "3",
    kind: "risk",
    color: HARM_COLOR,
    sprite: "red3",
    points: 75,
    growth: 145,
    radius: 14,
    ttl: 4.8,
    apply: (s) => {
      s.effects.stim += 0.56;
      s.effects.jitter += 0.58;
      s.effects.snap += 0.42;
      s.speedBoost += 135;
    },
  },
  {
    id: "redx",
    name: "Red X",
    glyph: "X",
    kind: "x-risk",
    color: X_HARM_COLOR,
    sprite: "redx",
    spriteHeight: 64,
    hero: true,
    rotationRange: 0,
    points: 240,
    growth: 260,
    radius: 18,
    ttl: 3.8,
    apply: (s) => {
      s.effects.wobble += 1.35;
      s.effects.trip += 1.05;
      s.effects.stim += 0.9;
      s.effects.jitter += 0.95;
      s.effects.snap += 0.72;
      s.speedBoost += 145;
      s.screenPulse = 1.5;
    },
  },
];

const exitItemType = {
  id: "exit",
  name: "Exit",
  glyph: "EXIT",
  kind: "exit",
  color: EXIT_COLOR,
  points: 0,
  growth: 0,
  radius: 28,
  ttl: Infinity,
  apply: levelComplete,
};

const keys = {
  left: false,
  right: false,
};

let state;
let lastTime = 0;
let running = false;
let briefingPending = false;
let cinematicPending = false;
let cinematicTypeTimer = undefined;
let cinematicSceneIndex = 0;
let cinematicTypedChars = 0;
let cinematicSceneComplete = false;
let cinematicMorphing = false;
let screenWipeActive = false;
let nextRunLevel = 1;
let nextRunScore = 0;
let nextRunLives = STARTING_LIVES;
let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
let pendingScoreEntry = null;
bestEl.textContent = String(best);
titleBestEl.textContent = String(best);
deathBestEl.textContent = String(best);
updateHud();

function loadScoreboard() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SCOREBOARD_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => Number.isFinite(entry?.score) && typeof entry.name === "string")
      .map((entry) => ({
        name: sanitizeScoreName(entry.name) || "AAA",
        score: Math.max(0, Math.round(entry.score)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}

function saveScoreboard(entries) {
  localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(entries.slice(0, 10)));
}

function sanitizeScoreName(name) {
  return String(name || "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .trim()
    .slice(0, 10);
}

function qualifiesForScoreboard(score) {
  if (score <= 0) return false;
  const entries = loadScoreboard();
  return entries.length < 10 || score > entries[entries.length - 1].score;
}

function renderScoreboard() {
  if (!scoreBoardEl || !scoreBoardListEl) return;
  const entries = loadScoreboard();
  scoreBoardEl.classList.toggle("hidden", entries.length === 0 && !pendingScoreEntry);
  scoreBoardListEl.innerHTML = "";
  entries.forEach((entry, index) => {
    const row = document.createElement("li");
    const rank = document.createElement("span");
    const name = document.createElement("strong");
    const score = document.createElement("em");
    rank.textContent = String(index + 1).padStart(2, "0");
    name.textContent = entry.name;
    score.textContent = String(entry.score);
    row.append(rank, name, score);
    scoreBoardListEl.appendChild(row);
  });
}

function showScoreEntry(score) {
  pendingScoreEntry = { score };
  scoreEntryEl.classList.remove("hidden");
  scoreNameInput.value = "AAA";
  renderScoreboard();
  window.setTimeout(() => {
    scoreNameInput.focus({ preventScroll: true });
    scoreNameInput.select();
  }, 0);
}

function hideScoreEntry() {
  pendingScoreEntry = null;
  scoreEntryEl.classList.add("hidden");
}

function submitScoreEntry() {
  if (!pendingScoreEntry) return;
  const entry = {
    name: sanitizeScoreName(scoreNameInput.value) || "AAA",
    score: pendingScoreEntry.score,
  };
  const entries = loadScoreboard();
  entries.push(entry);
  entries.sort((a, b) => b.score - a.score);
  saveScoreboard(entries.slice(0, 10));
  hideScoreEntry();
  renderScoreboard();
  restartButton.focus({ preventScroll: true });
}

function newState(level = 1, carriedScore = 0, carriedLives = STARTING_LIVES) {
  const levelNumber = clamp(Math.round(level), 1, MAX_LEVEL);
  const levelConfig = LEVELS[levelNumber] || LEVELS[1];
  const startX = levelConfig.start.x;
  const startY = levelConfig.start.y;
  return {
    level: levelNumber,
    levelConfig,
    score: Math.max(0, carriedScore),
    lives: clamp(Math.round(carriedLives), 1, STARTING_LIVES),
    baseSpeed: 190,
    speedBoost: 0,
    angle: levelConfig.start.angle,
    steerLag: 0,
    length: 135,
    head: { x: startX, y: startY },
    trail: [{ x: startX, y: startY }],
    items: [],
    scorePopups: [],
    effects: {
      wobble: 0,
      trip: DEBUG_TRIP ? 1.25 : 0,
      stim: 0,
      jitter: 0,
      snap: 0,
    },
    time: 0,
    slowMo: DEBUG_SLOWMO ? 8.5 : 0,
    selfHitGrace: 0,
    stageInvulnerable: STAGE_INVULNERABLE_TIME,
    influenceMemory: 0,
    combo: {
      itemId: null,
      count: 0,
    },
    bestCombo: {
      count: 1,
      itemId: null,
      sprite: null,
    },
    levelTime: DEBUG_EXIT ? LEVEL_DURATION - 2 : 0,
    exitSpawned: false,
    levelCleared: false,
    spawnDelay: 0.7,
    alive: true,
    backgroundBActive: false,
    mouthOpen: 0,
    mouthBiteTimer: 0,
    screenPulse: 0,
    boss: createBossState(levelConfig, carriedLives),
  };
}

function createBossState(levelConfig, carriedLives = STARTING_LIVES) {
  if (!levelConfig.boss) return null;
  const config = levelConfig.boss;
  const x = (config.minX + config.maxX) * 0.5;
  const intro = bossIntroConfig(carriedLives);
  return {
    x,
    y: config.y,
    minX: config.minX,
    maxX: config.maxX,
    targetX: randomBossTarget(config),
    facing: -1,
    speed: BOSS_PHASE_ONE_SPEED,
    gas: 1,
    phase: "intro",
    phaseTime: intro.duration,
    introDuration: intro.duration,
    windupDuration: BOSS_WINDUP,
    attackDuration: BOSS_ATTACK_HOLD,
    attackX: x,
    attackY: config.y + BOSS_CANNON_TIP_OFFSET_Y,
    crossY: null,
    hasCrossBeam: false,
    crossCrackleStarted: false,
    chargeCutoffDone: false,
    announcedPhase: 1,
    introFollowupPending: intro.followup.length > 0,
    meltdownLineShown: false,
    message: { kind: "blotch", lines: intro.lines },
    messageTime: intro.duration,
    barkTimer: nextBossBarkDelay(),
    shots: 0,
    defeated: false,
  };
}

function bossIntroConfig(carriedLives) {
  if (carriedLives === 2) {
    return {
      duration: BOSS_RETRY_INTRO_TIME,
      lines: ["Oh, back for more?!", "Your funeral!"],
      followup: [],
    };
  }
  if (carriedLives === 1) {
    return {
      duration: BOSS_RETRY_INTRO_TIME,
      lines: ["You can't take a hint can you?!", "Stay down!"],
      followup: [],
    };
  }
  return {
    duration: BOSS_INTRO_TIME,
    lines: ["Time to teach your wiggly little ass to", "respect Blotch's product!"],
    followup: ["Get ready for the sweet taste of", "the bottom of my boot!"],
  };
}

function nextBossBarkDelay() {
  return BOSS_RANDOM_BARK_MIN + Math.random() * (BOSS_RANDOM_BARK_MAX - BOSS_RANDOM_BARK_MIN);
}

function queueBossMessage(kind, lines, duration = BOSS_MESSAGE_TIME) {
  const boss = state?.boss;
  if (!boss) return;
  boss.message = { kind, lines };
  boss.messageTime = duration;
}

function maybeTriggerBossBark(boss, dt) {
  if (!boss || boss.phase === "intro" || boss.phase === "exploding" || boss.defeated) return;
  if (boss.messageTime > 0.15) return;
  boss.barkTimer -= dt;
  if (boss.barkTimer > 0) return;

  const bark = BOSS_RANDOM_BARKS[Math.floor(Math.random() * BOSS_RANDOM_BARKS.length)];
  queueBossMessage("blotch", [bark], 2.7);
  boss.barkTimer = nextBossBarkDelay();
}

function randomBossTarget(config = state.levelConfig.boss) {
  if (!state?.head) {
    return config.minX + Math.random() * (config.maxX - config.minX);
  }

  const phaseTracking = bossIsPhaseThree()
    ? 0.88
    : bossIsPhaseTwo()
      ? 0.74
      : 0.58;
  const randomTarget = config.minX + Math.random() * (config.maxX - config.minX);
  const lead = Math.cos(state.angle) * BOSS_TRACKING_LEAD;
  const jitter = (Math.random() - 0.5) * BOSS_TRACKING_JITTER;
  const playerTarget = clamp(state.head.x + lead + jitter, config.minX, config.maxX);
  return randomTarget * (1 - phaseTracking) + playerTarget * phaseTracking;
}

function randomBossCrossY() {
  return 118 + Math.random() * (WORLD.h - 236);
}

function bossIsPhaseTwo(boss = state?.boss) {
  return Boolean(boss && boss.gas <= BOSS_PHASE_TWO_GAS);
}

function bossIsPhaseThree(boss = state?.boss) {
  return Boolean(boss && boss.gas <= BOSS_PHASE_THREE_GAS);
}

function bossMoveSpeed(boss = state.boss) {
  if (bossIsPhaseThree(boss)) return BOSS_PHASE_THREE_SPEED;
  return bossIsPhaseTwo(boss) ? BOSS_PHASE_TWO_SPEED : BOSS_PHASE_ONE_SPEED;
}

function bossWindupDuration(boss = state.boss) {
  if (bossIsPhaseThree(boss)) return BOSS_PHASE_THREE_WINDUP;
  return bossIsPhaseTwo(boss) ? BOSS_PHASE_TWO_WINDUP : BOSS_WINDUP;
}

function bossAttackHoldDuration(boss = state.boss) {
  return bossIsPhaseThree(boss) ? BOSS_PHASE_THREE_ATTACK_HOLD : BOSS_ATTACK_HOLD;
}

function bossWindupProgress(boss) {
  const duration = boss.windupDuration || bossWindupDuration(boss);
  return clamp(1 - boss.phaseTime / duration, 0, 1);
}

function bossAttackElapsed(boss) {
  const duration = boss.attackDuration || bossAttackHoldDuration(boss);
  return clamp(duration - boss.phaseTime, 0, duration);
}

function bossCrossBeamActive(boss) {
  return Boolean(boss?.hasCrossBeam && boss.phase === "attack" && bossAttackElapsed(boss) >= BOSS_CROSS_BEAM_DELAY);
}

function bossRotatingBeamActive(boss) {
  return Boolean(bossIsPhaseThree(boss) && bossCrossBeamActive(boss) && bossAttackElapsed(boss) >= BOSS_ROTATING_BEAM_DELAY);
}

function bossRotatingBeamWarningActive(boss) {
  return Boolean(
    bossIsPhaseThree(boss) &&
    bossCrossBeamActive(boss) &&
    bossAttackElapsed(boss) >= BOSS_ROTATING_BEAM_DELAY - BOSS_ROTATING_BEAM_WARNING &&
    bossAttackElapsed(boss) < BOSS_ROTATING_BEAM_DELAY
  );
}

function bossRotatingBeamAngle(boss) {
  const elapsed = Math.max(0, bossAttackElapsed(boss) - BOSS_ROTATING_BEAM_DELAY);
  return elapsed * BOSS_ROTATING_BEAM_SPEED;
}

function bossCannonTip(boss) {
  const direction = boss.facing === 1 ? 1 : -1;
  return {
    x: boss.x + BOSS_CANNON_TIP_OFFSET_X * -direction,
    y: boss.y + BOSS_CANNON_TIP_OFFSET_Y,
  };
}

function startGame(level = nextRunLevel, carriedScore = nextRunScore, carriedLives = nextRunLives) {
  stopBlotchBeamCrackleSounds();
  state = newState(level, carriedScore, carriedLives);
  nextRunLevel = state.level;
  nextRunScore = state.score;
  nextRunLives = state.lives;
  cinematicPending = false;
  const shouldBrief = state.level === 1;
  running = !shouldBrief;
  briefingPending = shouldBrief;
  keys.left = false;
  keys.right = false;
  lastTime = performance.now();
  updateHud();
  updateFrameGlow();
  startMusic();
  overlay.classList.remove("game-over");
  overlay.classList.add("hidden");
  deathOverlay.classList.add("hidden");
  cinematicOverlay.classList.add("hidden");
  screenWipe.classList.add("hidden");
  screenWipe.classList.remove("enter", "exit");
  screenWipeActive = false;
  cinematicMorphing = false;
  briefingOverlay.classList.toggle("hidden", !shouldBrief);
  draw();
  if (shouldBrief) {
    briefingStartButton.focus({ preventScroll: true });
  } else {
    requestAnimationFrame(loop);
  }
}

function beginBriefedGame() {
  if (!briefingPending || running) return;
  briefingPending = false;
  briefingOverlay.classList.add("hidden");
  startMusic();
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function finishRun({ cleared = false } = {}) {
  running = false;
  stopBlotchBeamCrackleSounds();
  briefingPending = false;
  state.levelCleared = cleared;
  state.alive = false;
  const remainingLives = cleared ? state.lives : Math.max(0, state.lives - 1);
  state.lives = remainingLives;
  const canRetryLevel = !cleared && remainingLives > 0;
  const hasNextLevel = cleared && state.level < MAX_LEVEL;
  nextRunLevel = canRetryLevel ? state.level : hasNextLevel ? state.level + 1 : 1;
  nextRunScore = canRetryLevel || hasNextLevel ? state.score : 0;
  nextRunLives = canRetryLevel || hasNextLevel ? remainingLives : STARTING_LIVES;
  updateSlowMoAudio(0);
  gameWrap.style.setProperty("--slowmo-focus", "0.000");
  if (state.score > best) {
    best = state.score;
    localStorage.setItem(STORAGE_KEY, String(best));
  }
  bestEl.textContent = String(best);
  titleBestEl.textContent = String(best);
  deathScoreEl.textContent = String(state.score);
  deathBestEl.textContent = String(best);
  cinematicPending = cleared && state.level === CINEMATIC_TRIGGER_LEVEL;
  const finalClear = cleared && state.level >= MAX_LEVEL;
  deathKickerEl.textContent = finalClear ? "Snake City Complete" : cleared ? "Level Clear" : canRetryLevel ? "Life Lost" : "Run Cooked";
  deathOverlay.classList.toggle("city-complete", finalClear);
  hideScoreEntry();
  restartButton.textContent = cinematicPending
    ? "Continue"
    : canRetryLevel
      ? "Retry Level"
      : cleared && !finalClear
        ? "Next Level"
        : "Play Again";
  deathPromptEl.textContent = cinematicPending
    ? "Press Space or tap Continue"
    : canRetryLevel
      ? "Press Space or tap Retry Level"
      : cleared && !finalClear
        ? "Press Space or tap Next Level"
        : "Press Space or tap Play Again";
  renderClearStats(cleared);
  const runIsOver = !canRetryLevel && !hasNextLevel && !cinematicPending;
  if (runIsOver && qualifiesForScoreboard(state.score)) {
    showScoreEntry(state.score);
  } else {
    renderScoreboard();
  }
  if (cleared) {
    playHeroItemSpawnSound();
  } else {
    playDeathBoomSound();
  }
  briefingOverlay.classList.add("hidden");
  deathOverlay.classList.remove("hidden");
  if (!pendingScoreEntry) {
    restartButton.focus({ preventScroll: true });
  }
}

function showCinematic() {
  cinematicPending = false;
  briefingOverlay.classList.add("hidden");
  deathOverlay.classList.add("hidden");
  overlay.classList.add("hidden");
  cinematicOverlay.classList.remove("hidden");
  startCinematicMusic();
  startCinematicScene(0);
}

function closeCinematic() {
  stopCinematicTypewriter();
  stopArcadeTextSound();
  const shouldStartPostCinematicLevel = nextRunLevel === BOSS_LEVEL;
  const postCinematicScore = nextRunScore;
  cinematicOverlay.classList.add("hidden");
  overlay.classList.remove("hidden");
  state = undefined;
  running = false;
  briefingPending = false;
  cinematicPending = false;
  drawStartScreen();
  if (shouldStartPostCinematicLevel) {
    overlay.classList.add("hidden");
    startGame(BOSS_LEVEL, postCinematicScore, nextRunLives);
  } else {
    nextRunLevel = 1;
    nextRunScore = 0;
    nextRunLives = STARTING_LIVES;
    startMenuMusic();
  }
}

function stopCinematicTypewriter() {
  if (cinematicTypeTimer) {
    clearTimeout(cinematicTypeTimer);
    cinematicTypeTimer = undefined;
  }
  stopArcadeTextSound();
}

function finishCinematicLine() {
  stopCinematicTypewriter();
  const scene = CINEMATIC_SCENES[cinematicSceneIndex];
  cinematicLine.textContent = scene.text;
  cinematicTypedChars = scene.text.length;
  finishCinematicSceneBeat();
}

function startCinematicScene(sceneIndex) {
  stopCinematicTypewriter();
  cinematicOverlay.classList.remove("morphing");
  cinematicMorphing = false;
  cinematicSceneIndex = sceneIndex;
  cinematicSceneComplete = false;
  cinematicTypedChars = 0;
  cinematicLine.textContent = "";
  cinematicContinueButton.classList.remove("ready");
  cinematicContinueButton.focus({ preventScroll: true });
  const scene = CINEMATIC_SCENES[cinematicSceneIndex];
  cinematicImage.src = scene.image;
  cinematicImage.style.setProperty("--cinematic-zoom", String(scene.framing?.zoom || 1));
  cinematicImage.style.setProperty("--cinematic-x", scene.framing?.x || "50%");
  cinematicImage.style.setProperty("--cinematic-y", scene.framing?.y || "50%");
  cinematicLine.dataset.text = scene.text;
  startArcadeTextSound();
  typeNextCinematicCharacter();
}

function morphToCinematicScene(sceneIndex) {
  if (cinematicMorphing) return;
  cinematicMorphing = true;
  stopCinematicTypewriter();
  stopArcadeTextSound();
  cinematicLine.textContent = "";
  cinematicContinueButton.classList.remove("ready");
  cinematicOverlay.classList.remove("morphing");
  cinematicOverlay.offsetHeight;
  cinematicOverlay.classList.add("morphing");

  window.setTimeout(() => {
    const scene = CINEMATIC_SCENES[sceneIndex];
    cinematicSceneIndex = sceneIndex;
    cinematicSceneComplete = false;
    cinematicTypedChars = 0;
    cinematicImage.src = scene.image;
    cinematicImage.style.setProperty("--cinematic-zoom", String(scene.framing?.zoom || 1));
    cinematicImage.style.setProperty("--cinematic-x", scene.framing?.x || "50%");
    cinematicImage.style.setProperty("--cinematic-y", scene.framing?.y || "50%");
    cinematicLine.dataset.text = scene.text;
  }, 80);

  window.setTimeout(() => {
    cinematicOverlay.classList.remove("morphing");
    cinematicMorphing = false;
    startArcadeTextSound();
    typeNextCinematicCharacter();
  }, 190);
}

function typeNextCinematicCharacter() {
  const scene = CINEMATIC_SCENES[cinematicSceneIndex];
  if (cinematicTypedChars === 0) {
    startArcadeTextSound();
  }
  cinematicTypedChars += 1;
  cinematicLine.textContent = scene.text.slice(0, cinematicTypedChars);
  const currentChar = scene.text[cinematicTypedChars - 1];
  const nextChar = scene.text[cinematicTypedChars];
  const isSentenceEnd = /[!?]/.test(currentChar) || (currentChar === "." && nextChar !== ".");
  if (isSentenceEnd) {
    stopArcadeTextSound();
  }
  if (cinematicTypedChars >= scene.text.length) {
    const finishDelay = isSentenceEnd ? CINEMATIC_SENTENCE_PAUSE_MS : CINEMATIC_TYPE_MS;
    cinematicTypeTimer = setTimeout(finishCinematicSceneBeat, finishDelay);
    return;
  }

  const delay = isSentenceEnd ? CINEMATIC_SENTENCE_PAUSE_MS : CINEMATIC_TYPE_MS;
  cinematicTypeTimer = setTimeout(() => {
    if (isSentenceEnd) {
      startArcadeTextSound();
    }
    typeNextCinematicCharacter();
  }, delay);
}

function finishCinematicSceneBeat() {
  stopCinematicTypewriter();
  stopArcadeTextSound();
  cinematicSceneComplete = true;
  cinematicContinueButton.classList.add("ready");
  cinematicContinueButton.focus({ preventScroll: true });
}

function runScreenWipe(swapScene) {
  if (screenWipeActive) return Promise.resolve();
  screenWipeActive = true;
  screenWipe.classList.remove("hidden", "enter", "exit");
  screenWipe.offsetHeight;
  screenWipe.classList.add("enter");

  return new Promise((resolve) => {
    window.setTimeout(() => {
      swapScene();
      screenWipe.classList.remove("enter");
      screenWipe.offsetHeight;
      screenWipe.classList.add("exit");
    }, 620);

    window.setTimeout(() => {
      screenWipe.classList.remove("exit");
      screenWipe.classList.add("hidden");
      screenWipeActive = false;
      resolve();
    }, 1400);
  });
}

function advanceCinematic() {
  if (screenWipeActive || cinematicMorphing) return;
  if (cinematicSceneComplete && cinematicSceneIndex < CINEMATIC_SCENES.length - 1) {
    primeArcadeTextSound();
    morphToCinematicScene(cinematicSceneIndex + 1);
    return;
  }
  if (!cinematicContinueButton.classList.contains("ready")) {
    finishCinematicLine();
    return;
  }
  runScreenWipe(closeCinematic);
}

function advanceFromRecap() {
  if (screenWipeActive) return;
  if (cinematicPending) {
    primeArcadeTextSound();
    runScreenWipe(showCinematic);
    return;
  }
  startGame();
}

function gameOver() {
  finishRun();
}

function levelComplete() {
  finishRun({ cleared: true });
}

function renderClearStats(cleared) {
  const bestCombo = state.bestCombo;
  if (!cleared || !bestCombo.itemId || bestCombo.count < 2) {
    clearStatsEl.classList.add("hidden");
    clearStreakIconEl.removeAttribute("src");
    clearStreakValueEl.textContent = "x1";
    return;
  }

  const comboType = itemTypes.find((type) => type.id === bestCombo.itemId);
  const spriteSrc = itemSpriteSrcs[comboType?.sprite] || "";
  clearStatsEl.classList.remove("hidden");
  clearStreakIconEl.src = spriteSrc;
  clearStreakIconEl.alt = comboType?.name || "Combo item";
  clearStreakValueEl.textContent = `x${bestCombo.count}`;
}

function loop(now) {
  if (!running) return;
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function update(dt) {
  state.time += dt;
  state.stageInvulnerable = Math.max(0, state.stageInvulnerable - dt);
  updateLevelTimer(dt);
  updateBoss(dt);
  if (!running) return;

  for (const key of Object.keys(state.effects)) {
    state.effects[key] = moveToward(state.effects[key], 0, EFFECT_DECAY[key] * dt);
  }
  state.speedBoost = Math.max(0, state.speedBoost - 16 * dt);
  state.slowMo = Math.max(0, state.slowMo - dt);
  state.selfHitGrace = Math.max(0, state.selfHitGrace - dt);
  state.screenPulse = Math.max(0, state.screenPulse - 2.4 * dt);
  state.influenceMemory = Math.max(currentInfluence(), moveToward(state.influenceMemory, 0, 0.11 * dt));

  const effect = state.effects;
  const speed = currentSpeed() * slowMoFactor();
  const snapMode = effect.snap > SNAP_MODE_THRESHOLD;
  const rawTurn = snapMode ? 0 : (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
  const lag = 0.08;
  state.steerLag += (rawTurn - state.steerLag) * clamp(dt / lag, 0, 1);

  const wobble = Math.sin(state.time * (4.8 + effect.wobble * 1.8)) * effect.wobble * 1.65;
  const tripWave = Math.sin(state.time * 2.35 + state.head.x * 0.012) * effect.trip * 0.82;
  const jitter = (Math.random() - 0.5) * effect.jitter * 2.15;
  const snapTwitch = snapMode ? 0 : steppedNoise(state.time * 13) * effect.snap * 0.9;
  const turnPower = 2.65 + effect.stim * 1.55;
  const turn = state.steerLag * turnPower + wobble + tripWave + jitter + snapTwitch;

  state.angle += turn * dt;
  if (effect.snap > 0.04 && !snapMode) {
    const step = clamp(0.28 - effect.snap * 0.08, 0.12, 0.28);
    const snapped = Math.round(state.angle / step) * step;
    state.angle += (snapped - state.angle) * clamp(effect.snap * 0.9, 0, 0.62);
  }
  state.head.x = wrap(state.head.x + Math.cos(state.angle) * speed * dt, WORLD.w);
  state.head.y = wrap(state.head.y + Math.sin(state.angle) * speed * dt, WORLD.h);
  state.trail.push({ x: state.head.x, y: state.head.y });
  trimTrail();

  collectItems();
  updateMouth(dt);
  expireItems(dt);
  updateScorePopups(dt);
  state.spawnDelay -= dt;
  if (normalItemCount() < targetItemCount() && state.spawnDelay <= 0) {
    spawnItem(state);
    state.spawnDelay = nextSpawnDelay();
  }

  if (!isStageInvulnerable() && (hitsSelf() || hitsLevelObstacle() || hitsLevelLine() || hitsBossLaser())) {
    gameOver();
  }

  updateHud();
  updateFrameGlow();
}

function updateLevelTimer(dt) {
  if (isBossLevel()) return;
  if (state.exitSpawned) return;

  state.levelTime = Math.min(LEVEL_DURATION, state.levelTime + dt);
  if (state.levelTime >= LEVEL_DURATION) {
    spawnExitItem(state);
  }
}

function updateBoss(dt) {
  const boss = state.boss;
  if (!boss || state.levelCleared) return;
  boss.messageTime = Math.max(0, boss.messageTime - dt);
  maybeTriggerBossBark(boss, dt);

  if (boss.phase === "intro") {
    boss.phaseTime -= dt;
    const elapsed = boss.introDuration - boss.phaseTime;
    if (boss.introFollowupPending && elapsed >= BOSS_INTRO_FIRST_LINE_TIME) {
      boss.introFollowupPending = false;
      queueBossMessage("blotch", ["Get ready for the sweet taste of", "the bottom of my boot!"], boss.introDuration - elapsed);
    }
    if (boss.phaseTime <= 0) {
      boss.phase = "roam";
      boss.message = null;
      boss.messageTime = 0;
      boss.phaseTime = nextBossAttackDelay();
      boss.targetX = randomBossTarget();
    }
    return;
  }

  if (boss.phase === "roam") {
    const dx = boss.targetX - boss.x;
    boss.speed = bossMoveSpeed(boss);
    if (Math.abs(dx) > 2) {
      boss.facing = dx > 0 ? 1 : -1;
    }
    const step = Math.sign(dx) * boss.speed * dt;
    if (Math.abs(dx) <= Math.abs(step) + 3) {
      boss.x = boss.targetX;
      boss.targetX = randomBossTarget();
    } else {
      boss.x += step;
    }

    boss.phaseTime -= dt;
    if (boss.phaseTime <= 0) {
      boss.phase = "windup";
      boss.windupDuration = bossWindupDuration(boss);
      boss.phaseTime = boss.windupDuration;
      const cannonTip = bossCannonTip(boss);
      boss.attackX = cannonTip.x;
      boss.attackY = cannonTip.y;
      boss.hasCrossBeam = bossIsPhaseTwo(boss);
      boss.crossY = boss.hasCrossBeam ? randomBossCrossY() : null;
      boss.crossCrackleStarted = false;
      boss.chargeCutoffDone = false;
      state.screenPulse = Math.max(state.screenPulse, 0.55);
      playBlotchChargeSound();
    }
    return;
  }

  if (boss.phase === "windup") {
    boss.phaseTime -= dt;
    const cannonTip = bossCannonTip(boss);
    boss.attackX = cannonTip.x;
    boss.attackY = cannonTip.y;
    state.screenPulse = Math.max(state.screenPulse, 0.34 + bossWindupProgress(boss) * 0.48);
    if (!boss.chargeCutoffDone && boss.phaseTime <= BOSS_CHARGE_CUTOFF_BEFORE_FIRE) {
      boss.chargeCutoffDone = true;
      stopBlotchOneShot(blotchChargeSound);
    }
    if (boss.phaseTime <= 0) {
      boss.phase = "attack";
      boss.attackDuration = bossAttackHoldDuration(boss);
      boss.phaseTime = boss.attackDuration;
      boss.shots += 1;
      boss.gas = Math.max(0, boss.gas - BOSS_SHOT_DAMAGE);
      boss.defeated = boss.gas <= 0;
      if (boss.announcedPhase < 2 && bossIsPhaseTwo(boss)) {
        boss.announcedPhase = 2;
        queueBossMessage("blotch", ["I'll mess you up!"]);
      }
      if (boss.announcedPhase < 3 && bossIsPhaseThree(boss)) {
        boss.announcedPhase = 3;
        queueBossMessage("warning", [
          "Warning! Overheating possible.",
          "Shut up, stupid machine! Override!",
        ], 4.4);
      }
      state.screenPulse = Math.max(state.screenPulse, 0.8);
      playBlotchFireSound();
      startBlotchBeamCrackleSound();
    }
    return;
  }

  if (boss.phase === "attack") {
    state.screenPulse = Math.max(state.screenPulse, 1);
    if (bossCrossBeamActive(boss) && !boss.crossCrackleStarted) {
      boss.crossCrackleStarted = true;
      startBlotchBeamCrackle2Sound();
    }
    boss.phaseTime -= dt;
    if (boss.phaseTime <= 0) {
      if (boss.defeated) {
        stopBlotchBeamCrackleSounds();
        boss.phase = "meltdown";
        boss.phaseTime = BOSS_DEFEAT_BEAT_TIME;
        boss.hasCrossBeam = false;
        boss.crossY = null;
        boss.crossCrackleStarted = false;
        boss.meltdownLineShown = false;
        queueBossMessage("warning", ["Overheating critical!", "Core meltdown imminent!"], BOSS_DEFEAT_WARNING_TIME);
        state.screenPulse = Math.max(state.screenPulse, 1.25);
        return;
      }
      boss.phase = "cooldown";
      boss.phaseTime = 0.52;
      boss.hasCrossBeam = false;
      boss.crossY = null;
      boss.crossCrackleStarted = false;
      stopBlotchBeamCrackleSounds();
    }
    return;
  }

  if (boss.phase === "cooldown") {
    boss.phaseTime -= dt;
    if (boss.phaseTime <= 0) {
      boss.phase = "roam";
      boss.targetX = randomBossTarget();
      boss.phaseTime = nextBossAttackDelay();
    }
  }

  if (boss.phase === "meltdown") {
    boss.phaseTime -= dt;
    state.screenPulse = Math.max(state.screenPulse, 1.2);
    const elapsed = BOSS_DEFEAT_BEAT_TIME - boss.phaseTime;
    if (!boss.meltdownLineShown && elapsed >= BOSS_DEFEAT_WARNING_TIME) {
      boss.meltdownLineShown = true;
      queueBossMessage("blotch", ["AAAAAAHhhh Shiiiiii..."], BOSS_DEFEAT_BEAT_TIME - elapsed);
    }
    if (boss.phaseTime <= 0) {
      boss.phase = "exploding";
      boss.phaseTime = BOSS_EXPLOSION_TIME;
      boss.message = null;
      boss.messageTime = 0;
      state.screenPulse = Math.max(state.screenPulse, 1.5);
      playDeathBoomSound();
    }
    return;
  }

  if (boss.phase === "exploding") {
    boss.phaseTime -= dt;
    state.screenPulse = Math.max(state.screenPulse, 1.4);
    if (boss.phaseTime <= 0) {
      levelComplete();
    }
  }
}

function nextBossAttackDelay() {
  const urgency = 1 - (state.boss?.gas ?? 1);
  return 3.1 - urgency * 1.85 + Math.random() * (0.82 - urgency * 0.34);
}

function draw() {
  const trip = clamp(state.effects.trip, 0, 1.25);
  ctx.clearRect(0, 0, WORLD.w, WORLD.h);
  ctx.save();

  drawGroundPlane(trip);
  drawTripBackdrop(trip);
  drawBossAtmosphere();
  drawLevelObstacle();
  drawLevelLines();
  drawBossHazards();

  for (const item of state.items) {
    drawItem(item);
  }

  drawBoss();
  drawSnake();

  if (trip > 0.03 || state.screenPulse > 0.02) {
    ctx.globalAlpha = clamp(trip * 0.2 + state.screenPulse * 0.16, 0, 0.34);
    ctx.fillStyle = state.time % 0.32 > 0.16 ? "#b88cff" : "#55d6a0";
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  }

  drawScorePopups();
  ctx.restore();
}

function drawGroundPlane(trip) {
  const time = state ? state.time : 0;
  const pulse = Math.sin(time * 1.8) * 0.5 + 0.5;
  const horizon = WORLD.h * 0.34;
  const centerX = WORLD.w * 0.5;

  const base = ctx.createLinearGradient(0, 0, 0, WORLD.h);
  base.addColorStop(0, "#09111b");
  base.addColorStop(0.42, "#0c1718");
  base.addColorStop(1, "#05080d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);

  const glow = ctx.createRadialGradient(centerX, WORLD.h * 0.55, 80, centerX, WORLD.h * 0.54, WORLD.w * 0.68);
  glow.addColorStop(0, "rgba(31, 255, 179, 0.09)");
  glow.addColorStop(0.45, "rgba(74, 206, 255, 0.05)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);

  drawFloorTileTexture(horizon, trip);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";

  for (let i = -14; i <= 14; i += 1) {
    const bottomX = centerX + i * 82;
    const horizonX = centerX + i * 16 + Math.sin(time * 1.3 + i) * trip * 16;
    ctx.beginPath();
    ctx.moveTo(horizonX, horizon);
    ctx.lineTo(bottomX, WORLD.h + 18);
    ctx.strokeStyle = `rgba(74, 206, 255, ${0.055 + trip * 0.025})`;
    ctx.lineWidth = i === 0 ? 1.5 : 1;
    ctx.stroke();
  }

  for (let i = 0; i < 18; i += 1) {
    const t = i / 17;
    const y = horizon + Math.pow(t, 1.82) * (WORLD.h - horizon);
    const alpha = 0.035 + t * 0.09 + trip * 0.025;
    const wobble = Math.sin(time * 2.2 + i * 0.8) * trip * 8;
    ctx.beginPath();
    ctx.moveTo(0, y + wobble);
    ctx.lineTo(WORLD.w, y - wobble);
    ctx.strokeStyle = `rgba(255, 95, 238, ${alpha})`;
    ctx.lineWidth = 1 + t * 1.2;
    ctx.stroke();
  }

  const horizonGlow = ctx.createLinearGradient(0, horizon - 28, 0, horizon + 45);
  horizonGlow.addColorStop(0, "rgba(0, 0, 0, 0)");
  horizonGlow.addColorStop(0.48, `rgba(80, 236, 255, ${0.11 + pulse * 0.025})`);
  horizonGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, horizon - 28, WORLD.w, 74);
  ctx.restore();

  const vignette = ctx.createRadialGradient(centerX, WORLD.h * 0.5, WORLD.w * 0.18, centerX, WORLD.h * 0.5, WORLD.w * 0.63);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.72, "rgba(0, 0, 0, 0.18)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.58)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);
}

function drawFloorTileTexture(horizon, trip) {
  if (!floorTilePattern) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, horizon - 8, WORLD.w, WORLD.h - horizon + 8);
  ctx.clip();
  ctx.globalAlpha = 0.34 + clamp(trip, 0, 1) * 0.08;
  ctx.globalCompositeOperation = "screen";
  ctx.translate(-24, horizon - 18);
  ctx.fillStyle = floorTilePattern;
  ctx.fillRect(0, 0, WORLD.w + FLOOR_TILE_PATTERN_SIZE, WORLD.h - horizon + FLOOR_TILE_PATTERN_SIZE);
  ctx.restore();

  ctx.save();
  const fade = ctx.createLinearGradient(0, horizon - 8, 0, WORLD.h);
  fade.addColorStop(0, "rgba(5, 8, 14, 0.88)");
  fade.addColorStop(0.28, "rgba(5, 8, 14, 0.2)");
  fade.addColorStop(1, "rgba(5, 8, 14, 0.34)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, horizon - 8, WORLD.w, WORLD.h - horizon + 8);
  ctx.restore();
}

function drawLevelObstacle() {
  const obstacles = levelObstacles();
  if (!obstacles.length) return;

  for (const obstacle of obstacles) {
    drawObstacleSquare(obstacle);
  }
}

function drawObstacleSquare(obstacle) {
  const pulse = 0.5 + Math.sin(state.time * 3.1 + (obstacle.phase || 0)) * 0.5;
  const colors = obstacle.colors || ["#ff5af1", "#62efff", "#fff2a8"];
  const inset = 8;
  ctx.save();
  ctx.translate(obstacle.x, obstacle.y);
  ctx.globalCompositeOperation = "screen";

  ctx.shadowColor = colors[0];
  ctx.shadowBlur = 18 + pulse * 18;
  ctx.strokeStyle = hexToRgba(colors[0], 0.72 + pulse * 0.24);
  ctx.lineWidth = 6 + pulse * 2;
  ctx.strokeRect(0, 0, obstacle.size, obstacle.size);

  ctx.shadowColor = colors[1];
  ctx.shadowBlur = 12 + pulse * 12;
  ctx.strokeStyle = hexToRgba(colors[1], 0.58 + pulse * 0.26);
  ctx.lineWidth = 2;
  ctx.strokeRect(inset, inset, obstacle.size - inset * 2, obstacle.size - inset * 2);

  ctx.shadowColor = colors[2];
  ctx.shadowBlur = 8 + pulse * 8;
  ctx.strokeStyle = hexToRgba(colors[2], 0.32 + pulse * 0.22);
  ctx.lineWidth = 1;
  ctx.strokeRect(inset * 2, inset * 2, obstacle.size - inset * 4, obstacle.size - inset * 4);
  ctx.restore();
}

function drawLevelLines() {
  const lines = levelLines();
  if (!lines.length) return;

  for (const line of lines) {
    drawNeonHazardLine(line);
  }
}

function drawBossHazards() {
  const boss = state.boss;
  if (!boss || (boss.phase !== "windup" && boss.phase !== "attack")) return;

  const x = boss.attackX;
  const warning = boss.phase === "windup";
  const progress = bossWindupProgress(boss);
  const intensity = warning
    ? 0.35 + Math.sin(state.time * 18) * 0.25 + progress * 0.35
    : 1;
  const top = 0;
  const bottom = clamp(boss.attackY, 0, WORLD.h + 18);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";

  if (warning) {
    ctx.setLineDash([18, 14]);
    ctx.lineDashOffset = -state.time * 90;
    ctx.strokeStyle = `rgba(89, 232, 255, ${0.2 + intensity * 0.42})`;
    ctx.shadowColor = "#55e9ff";
    ctx.shadowBlur = 14 + intensity * 28;
    ctx.lineWidth = 3 + intensity * 3;
    ctx.beginPath();
    ctx.moveTo(x, top + 18);
    ctx.lineTo(x, bottom + 4);
    ctx.stroke();
    ctx.setLineDash([]);

    if (boss.hasCrossBeam) {
      drawBossCrossWarning(x, boss.crossY, intensity);
    }

    const reticle = 24 + intensity * 12;
    ctx.strokeStyle = `rgba(255, 242, 168, ${0.28 + intensity * 0.42})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, bottom, reticle, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const rotating = bossRotatingBeamActive(boss);
  const rotatingWarning = bossRotatingBeamWarningActive(boss);
  if (rotating) {
    drawBossRotatingBeam(x, boss.crossY, bossRotatingBeamAngle(boss));
  } else {
    drawBossLaserBeam(x, top, bottom);
  }
  if (boss.hasCrossBeam) {
    const crossProgress = clamp((bossAttackElapsed(boss) - BOSS_CROSS_BEAM_DELAY) / 0.22, 0, 1);
    if (crossProgress > 0 && !rotating) {
      drawBossHorizontalLaserBeam(boss.crossY, 0, WORLD.w, crossProgress);
      if (rotatingWarning) {
        drawBossRotatingBeamWarning(x, boss.crossY);
      }
    } else {
      drawBossCrossPoint(x, boss.crossY, 0.55 + Math.sin(state.time * 28) * 0.22);
    }
  }
  ctx.restore();
}

function drawBossCrossWarning(x, y, intensity) {
  if (typeof y !== "number") return;

  ctx.save();
  ctx.setLineDash([20, 13]);
  ctx.lineDashOffset = state.time * 130;
  ctx.strokeStyle = `rgba(255, 242, 168, ${0.18 + intensity * 0.36})`;
  ctx.shadowColor = "#fff2a8";
  ctx.shadowBlur = 10 + intensity * 22;
  ctx.lineWidth = 2 + intensity * 2;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(WORLD.w - 20, y);
  ctx.stroke();
  ctx.setLineDash([]);
  drawBossCrossPoint(x, y, intensity);
  ctx.restore();
}

function drawBossCrossPoint(x, y, intensity) {
  if (typeof y !== "number") return;

  const radius = 12 + intensity * 14;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.shadowColor = "#fff2a8";
  ctx.shadowBlur = 12 + intensity * 24;
  ctx.strokeStyle = `rgba(255, 242, 168, ${0.3 + intensity * 0.42})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = `rgba(85, 233, 255, ${0.14 + intensity * 0.22})`;
  ctx.beginPath();
  ctx.arc(x, y, 4 + intensity * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBossAtmosphere() {
  const boss = state.boss;
  if (!boss || (boss.phase !== "windup" && boss.phase !== "attack" && boss.phase !== "exploding")) return;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  if (boss.phase === "exploding") {
    const progress = clamp(1 - boss.phaseTime / BOSS_EXPLOSION_TIME, 0, 1);
    const flash = state.time % 0.1 < 0.05;
    ctx.globalAlpha = flash ? 0.48 : 0.22;
    ctx.fillStyle = flash ? "#fff2a8" : "#ff2a8a";
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);

    const blast = ctx.createRadialGradient(boss.x, boss.y - 18, 20, boss.x, boss.y - 18, 160 + progress * 360);
    blast.addColorStop(0, `rgba(255, 255, 255, ${0.65 * (1 - progress * 0.35)})`);
    blast.addColorStop(0.18, `rgba(255, 242, 168, ${0.48 * (1 - progress * 0.25)})`);
    blast.addColorStop(0.42, `rgba(255, 42, 138, ${0.32 * (1 - progress)})`);
    blast.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = blast;
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);
    ctx.restore();
    return;
  }

  if (boss.phase === "windup") {
    const progress = bossWindupProgress(boss);
    const pulse = 0.5 + Math.sin(state.time * (bossIsPhaseTwo(boss) ? 15 : 10)) * 0.5;
    const alpha = 0.04 + progress * 0.16 + pulse * 0.05;
    const charge = ctx.createRadialGradient(boss.attackX, boss.attackY, 24, boss.attackX, boss.attackY, WORLD.w * 0.42);
    charge.addColorStop(0, `rgba(85, 233, 255, ${alpha * 1.35})`);
    charge.addColorStop(0.38, `rgba(255, 87, 227, ${alpha})`);
    charge.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = charge;
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);

    ctx.globalAlpha = 0.08 + progress * 0.12;
    ctx.fillStyle = pulse > 0.5 ? "#55e9ff" : "#ff57e3";
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);

    if (boss.hasCrossBeam && typeof boss.crossY === "number") {
      const crossGlow = ctx.createLinearGradient(0, boss.crossY - 82, 0, boss.crossY + 82);
      crossGlow.addColorStop(0, "rgba(0, 0, 0, 0)");
      crossGlow.addColorStop(0.5, `rgba(255, 242, 168, ${0.08 + progress * 0.16})`);
      crossGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = crossGlow;
      ctx.fillRect(0, boss.crossY - 84, WORLD.w, 168);
    }
    ctx.restore();
    return;
  }

  const strobe = state.time % 0.115 < 0.055;
  ctx.globalAlpha = strobe ? 0.32 : 0.12;
  ctx.fillStyle = strobe ? "#55e9ff" : "#ff57e3";
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);

  const laserGlow = ctx.createLinearGradient(boss.attackX - 95, 0, boss.attackX + 95, 0);
  laserGlow.addColorStop(0, "rgba(0, 0, 0, 0)");
  laserGlow.addColorStop(0.48, strobe ? "rgba(255, 255, 255, 0.32)" : "rgba(85, 233, 255, 0.18)");
  laserGlow.addColorStop(0.52, strobe ? "rgba(255, 87, 227, 0.28)" : "rgba(255, 87, 227, 0.16)");
  laserGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = laserGlow;
  ctx.fillRect(boss.attackX - 100, 0, 200, clamp(boss.attackY + 24, 0, WORLD.h));

  if (bossCrossBeamActive(boss) && typeof boss.crossY === "number") {
    const crossGlow = ctx.createLinearGradient(0, boss.crossY - 100, 0, boss.crossY + 100);
    crossGlow.addColorStop(0, "rgba(0, 0, 0, 0)");
    crossGlow.addColorStop(0.5, strobe ? "rgba(255, 242, 168, 0.28)" : "rgba(255, 87, 227, 0.14)");
    crossGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = crossGlow;
    ctx.fillRect(0, boss.crossY - 100, WORLD.w, 200);
  }
  ctx.restore();
}

function drawBossLaserBeam(x, top, bottom) {
  const waveAmp = 6;
  const drawLaserPath = () => {
    ctx.beginPath();
    for (let y = top - 18; y <= bottom; y += 16) {
      const waveX = bossLaserXAt(y, x, state.time);
      if (y === top - 18) {
        ctx.moveTo(waveX, y);
      } else {
        ctx.lineTo(waveX, y);
      }
    }
  };

  ctx.shadowColor = "#55e9ff";
  ctx.shadowBlur = 42;
  drawLaserPath();
  ctx.strokeStyle = "rgba(85, 233, 255, 0.28)";
  ctx.lineWidth = 30 + Math.sin(state.time * 24) * 2;
  ctx.stroke();

  ctx.shadowColor = "#ff57e3";
  ctx.shadowBlur = 18;
  drawLaserPath();
  ctx.strokeStyle = "rgba(255, 87, 227, 0.34)";
  ctx.lineWidth = 13;
  ctx.stroke();

  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 16;
  drawLaserPath();
  ctx.strokeStyle = "rgba(222, 255, 255, 0.98)";
  ctx.lineWidth = 4 + Math.sin(state.time * 32) * 0.8;
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(85, 233, 255, 0.12)";
  for (let y = top + 18; y < bottom; y += 54) {
    const sparkX = bossLaserXAt(y, x, state.time) + Math.sin(state.time * 9 + y) * waveAmp;
    ctx.beginPath();
    ctx.arc(sparkX, y, 2 + Math.sin(state.time * 14 + y) * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBossHorizontalLaserBeam(y, left, right, intensity = 1) {
  if (typeof y !== "number") return;

  const drawLaserPath = () => {
    ctx.beginPath();
    for (let x = left - 18; x <= right + 18; x += 18) {
      const waveY = y + Math.sin(x * 0.031 + state.time * 10.2) * 4 + Math.sin(x * 0.074 - state.time * 6.8) * 2;
      if (x === left - 18) {
        ctx.moveTo(x, waveY);
      } else {
        ctx.lineTo(x, waveY);
      }
    }
  };

  const snap = 0.65 + intensity * 0.35;
  ctx.shadowColor = "#fff2a8";
  ctx.shadowBlur = 34 * snap;
  drawLaserPath();
  ctx.strokeStyle = `rgba(255, 242, 168, ${0.2 + intensity * 0.2})`;
  ctx.lineWidth = 24 + Math.sin(state.time * 24) * 2;
  ctx.stroke();

  ctx.shadowColor = "#ff57e3";
  ctx.shadowBlur = 22 * snap;
  drawLaserPath();
  ctx.strokeStyle = `rgba(255, 87, 227, ${0.28 + intensity * 0.2})`;
  ctx.lineWidth = 11;
  ctx.stroke();

  ctx.shadowColor = "#55e9ff";
  ctx.shadowBlur = 18 * snap;
  drawLaserPath();
  ctx.strokeStyle = `rgba(222, 255, 255, ${0.78 + intensity * 0.18})`;
  ctx.lineWidth = 4 + Math.sin(state.time * 30) * 0.7;
  ctx.stroke();
}

function drawBossRotatingBeamWarning(x, y) {
  if (typeof y !== "number") return;

  const warningProgress = clamp(
    (bossAttackElapsed(state.boss) - (BOSS_ROTATING_BEAM_DELAY - BOSS_ROTATING_BEAM_WARNING)) /
      BOSS_ROTATING_BEAM_WARNING,
    0,
    1
  );
  const length = Math.hypot(WORLD.w, WORLD.h) * 0.58;
  const angle = 0;
  const pulse = 0.5 + Math.sin(state.time * 18) * 0.5;
  const arrowRadius = 46 + warningProgress * 34;
  const arrowAlpha = 0.32 + warningProgress * 0.46;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";
  ctx.setLineDash([34, 18]);
  ctx.lineDashOffset = -state.time * (38 + warningProgress * 42);

  for (const offset of [0, Math.PI * 0.5]) {
    const a = angle + offset;
    const dx = Math.cos(a) * length;
    const dy = Math.sin(a) * length;
    ctx.beginPath();
    ctx.moveTo(x - dx, y - dy);
    ctx.lineTo(x + dx, y + dy);
    ctx.shadowColor = "#75ff66";
    ctx.shadowBlur = 18 + warningProgress * 34;
    ctx.strokeStyle = `rgba(117, 255, 102, ${0.2 + warningProgress * 0.38})`;
    ctx.lineWidth = 5 + warningProgress * 5;
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.shadowColor = "#ffef5a";
  ctx.shadowBlur = 20 + pulse * 26;
  ctx.strokeStyle = `rgba(255, 239, 90, ${arrowAlpha})`;
  ctx.fillStyle = `rgba(255, 239, 90, ${arrowAlpha})`;
  ctx.lineWidth = 4 + warningProgress * 2.5;

  for (const start of [-Math.PI * 0.74, -Math.PI * 0.07, Math.PI * 0.58]) {
    const end = start + Math.PI * 0.54;
    ctx.beginPath();
    ctx.arc(x, y, arrowRadius, start, end);
    ctx.stroke();

    const headX = x + Math.cos(end) * arrowRadius;
    const headY = y + Math.sin(end) * arrowRadius;
    const tangent = end + Math.PI * 0.5;
    const size = 10 + warningProgress * 5;
    ctx.beginPath();
    ctx.moveTo(headX + Math.cos(tangent) * size, headY + Math.sin(tangent) * size);
    ctx.lineTo(
      headX + Math.cos(tangent + Math.PI * 0.78) * size * 0.82,
      headY + Math.sin(tangent + Math.PI * 0.78) * size * 0.82
    );
    ctx.lineTo(
      headX + Math.cos(tangent - Math.PI * 0.78) * size * 0.82,
      headY + Math.sin(tangent - Math.PI * 0.78) * size * 0.82
    );
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = `rgba(255, 239, 90, ${0.16 + warningProgress * 0.28})`;
  ctx.beginPath();
  ctx.arc(x, y, 10 + warningProgress * 12 + pulse * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBossRotatingBeam(x, y, angle) {
  if (typeof y !== "number") return;

  const length = Math.hypot(WORLD.w, WORLD.h) * 0.86;
  const pulse = 0.5 + Math.sin(state.time * 20) * 0.5;
  const overload = 0.5 + Math.sin(state.time * 37) * 0.5;
  const drawRotatingPath = (offset = 0) => {
    const a = angle + offset;
    const dx = Math.cos(a) * length;
    const dy = Math.sin(a) * length;
    ctx.beginPath();
    ctx.moveTo(x - dx, y - dy);
    ctx.lineTo(x + dx, y + dy);
  };

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";

  for (const offset of [0, Math.PI * 0.5]) {
    ctx.shadowColor = "#ff2aff";
    ctx.shadowBlur = 58 + pulse * 24;
    drawRotatingPath(offset);
    ctx.strokeStyle = `rgba(255, 42, 255, ${0.28 + overload * 0.12})`;
    ctx.lineWidth = 36 + pulse * 8;
    ctx.stroke();

    ctx.shadowColor = "#55e9ff";
    ctx.shadowBlur = 36 + overload * 12;
    drawRotatingPath(offset);
    ctx.strokeStyle = `rgba(85, 233, 255, ${0.42 + pulse * 0.18})`;
    ctx.lineWidth = 18 + overload * 4;
    ctx.stroke();

    ctx.shadowColor = "#ffef5a";
    ctx.shadowBlur = 28;
    drawRotatingPath(offset);
    ctx.strokeStyle = "rgba(255, 239, 90, 0.54)";
    ctx.lineWidth = 8 + pulse * 1.5;
    ctx.stroke();

    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 22 + overload * 8;
    drawRotatingPath(offset);
    ctx.strokeStyle = "rgba(244, 255, 255, 1)";
    ctx.lineWidth = 4.8 + pulse * 1.6;
    ctx.stroke();
  }

  const core = ctx.createRadialGradient(x, y, 3, x, y, 78 + pulse * 28);
  core.addColorStop(0, "rgba(255, 255, 255, 0.92)");
  core.addColorStop(0.18, "rgba(255, 239, 90, 0.58)");
  core.addColorStop(0.42, "rgba(255, 42, 255, 0.34)");
  core.addColorStop(0.68, "rgba(85, 233, 255, 0.22)");
  core.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = core;
  ctx.fillRect(x - 112, y - 112, 224, 224);

  const tip = bossCannonTip(state.boss);
  for (let i = 0; i < 24; i += 1) {
    const seed = i * 12.917 + state.time * 29;
    const sparkAngle = seed + Math.sin(seed * 0.7) * 0.9;
    const distance = 12 + (i % 6) * 7 + overload * 18;
    const sx = tip.x + Math.cos(sparkAngle) * distance;
    const sy = tip.y + Math.sin(sparkAngle) * distance * 0.72;
    const radius = 1.5 + (i % 4) * 0.8 + pulse * 1.2;
    ctx.fillStyle = i % 3 === 0 ? "#fff2a8" : i % 3 === 1 ? "#55e9ff" : "#ff57e3";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 12 + overload * 16;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBoss() {
  const boss = state.boss;
  if (!boss) return;

  const pulse = 0.5 + Math.sin(state.time * 5.4) * 0.5;
  const exploding = boss.phase === "exploding";
  const explodeProgress = exploding ? clamp(1 - boss.phaseTime / BOSS_EXPLOSION_TIME, 0, 1) : 0;
  const explodeFlash = exploding && state.time % 0.085 < 0.042;
  const attackGlow = boss.phase === "windup"
    ? 0.55 + bossWindupProgress(boss) * 0.7
    : boss.phase === "attack"
      ? 1
      : exploding
        ? 1.35
        : 0;
  const x = boss.x;
  const y = boss.y;
  const tip = bossCannonTip(boss);
  const direction = boss.facing === 1 ? 1 : -1;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const groundGlow = ctx.createRadialGradient(x, y + 52, 16, x, y + 52, 126);
  groundGlow.addColorStop(0, `rgba(85, 233, 255, ${0.12 + attackGlow * 0.2})`);
  groundGlow.addColorStop(0.48, `rgba(255, 87, 227, ${0.08 + attackGlow * 0.14})`);
  groundGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = groundGlow;
  ctx.fillRect(x - 145, y - 60, 290, 180);

  if (bossImage.complete && bossImage.naturalWidth > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.translate(x, y);
    if (exploding) {
      const jitter = 5 + explodeProgress * 10;
      ctx.translate((Math.random() - 0.5) * jitter, (Math.random() - 0.5) * jitter);
      ctx.scale(1 + explodeProgress * 0.12, 1 + explodeProgress * 0.12);
      ctx.beginPath();
      ctx.ellipse(0, 0, BOSS_SPRITE_SIZE * 0.52, BOSS_SPRITE_SIZE * 0.46, 0, 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.scale(direction === 1 ? -1 : 1, 1);
    ctx.shadowColor = exploding ? (explodeFlash ? "#fff2a8" : "#ff2a8a") : attackGlow > 0 ? "#55e9ff" : "rgba(255, 87, 227, 0.42)";
    ctx.shadowBlur = exploding ? 34 + explodeProgress * 48 : attackGlow > 0 ? 16 + attackGlow * 26 : 7 + pulse * 5;
    ctx.globalAlpha = exploding && !explodeFlash ? 0.72 : 1;
    ctx.drawImage(
      bossImage,
      -BOSS_SPRITE_SIZE / 2,
      -BOSS_SPRITE_SIZE / 2,
      BOSS_SPRITE_SIZE,
      BOSS_SPRITE_SIZE
    );
    if (exploding && explodeFlash) {
      ctx.globalCompositeOperation = "screen";
      const flash = ctx.createRadialGradient(0, -8, 8, 0, -8, BOSS_SPRITE_SIZE * 0.58);
      flash.addColorStop(0, `rgba(255, 255, 255, ${0.46 + explodeProgress * 0.28})`);
      flash.addColorStop(0.42, `rgba(255, 242, 168, ${0.32 + explodeProgress * 0.2})`);
      flash.addColorStop(1, "rgba(255, 42, 138, 0)");
      ctx.fillStyle = flash;
      ctx.fillRect(-BOSS_SPRITE_SIZE * 0.6, -BOSS_SPRITE_SIZE * 0.55, BOSS_SPRITE_SIZE * 1.2, BOSS_SPRITE_SIZE * 1.1);
    }
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = attackGlow > 0 ? "#55e9ff" : "#7cff5d";
    ctx.shadowBlur = 16 + attackGlow * 38;
    ctx.strokeStyle = `rgba(124, 255, 93, ${0.78 + pulse * 0.16})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 62, 25, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (attackGlow > 0) {
    const core = 4 + attackGlow * 7 + pulse * 2;
    const aura = ctx.createRadialGradient(tip.x, tip.y, 2, tip.x, tip.y, 58 + attackGlow * 34);
    aura.addColorStop(0, `rgba(255, 255, 255, ${0.35 + attackGlow * 0.24})`);
    aura.addColorStop(0.24, `rgba(255, 87, 227, ${0.22 + attackGlow * 0.28})`);
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(tip.x - 92, tip.y - 92, 184, 184);

    ctx.shadowColor = "#fff2a8";
    ctx.shadowBlur = 16 + attackGlow * 26;
    ctx.fillStyle = attackGlow > 0.9 ? "#fff2a8" : "#55e9ff";
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, core, 0, Math.PI * 2);
    ctx.fill();
  }

  if (exploding) {
    drawBossExplosion(boss, explodeProgress);
  } else {
    drawBossMessage(boss);
  }

  ctx.restore();
}

function drawBossExplosion(boss, progress) {
  const pulse = 0.5 + Math.sin(state.time * 42) * 0.5;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i += 1) {
    const radius = 36 + progress * (150 + i * 58) + i * 22;
    ctx.shadowColor = i % 2 ? "#ff2a8a" : "#fff2a8";
    ctx.shadowBlur = 24 + pulse * 24;
    ctx.strokeStyle = i % 2
      ? `rgba(255, 42, 138, ${0.46 * (1 - progress)})`
      : `rgba(255, 242, 168, ${0.54 * (1 - progress * 0.72)})`;
    ctx.lineWidth = 4 + i * 2;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y - 20, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let i = 0; i < 22; i += 1) {
    const angle = i * 2.399 + state.time * 0.8;
    const distance = 28 + progress * (90 + (i % 5) * 30);
    const x = boss.x + Math.cos(angle) * distance;
    const y = boss.y - 20 + Math.sin(angle) * distance * 0.66;
    ctx.fillStyle = i % 3 === 0 ? "#fff2a8" : i % 3 === 1 ? "#55e9ff" : "#ff2a8a";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(x, y, 2.5 + (i % 4) + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBossMessage(boss) {
  if (!boss.message || boss.messageTime <= 0) return;

  const isWarning = boss.message.kind === "warning";
  const font = isWarning
    ? "950 15px 'Courier New', ui-monospace, SFMono-Regular, Menlo, monospace"
    : "950 16px 'Courier New', ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.save();
  ctx.font = font;
  const maxWidth = isWarning ? 460 : 500;
  const minWidth = isWarning ? 290 : 280;
  const lineHeight = isWarning ? 18 : 19;
  const lines = wrapBossMessageLines(ctx, boss.message.lines, maxWidth - 36);
  const measuredWidth = Math.max(...lines.map((line) => ctx.measureText(line).width), 0);
  const width = clamp(Math.ceil(measuredWidth + 36), minWidth, maxWidth);
  const height = 34 + lines.length * lineHeight;
  const side = boss.x < WORLD.w * 0.56 ? 1 : -1;
  const sideOffset = isWarning ? 126 : 154;
  const preferredX = boss.x + side * sideOffset - width / 2;
  const x = clamp(preferredX, 20, WORLD.w - width - 20);
  const y = clamp(boss.y - 132 - height * 0.22, 28, WORLD.h - height - 24);
  const alpha = clamp(boss.messageTime / 0.25, 0, 1);

  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = isWarning ? "rgba(35, 2, 12, 0.92)" : "rgba(23, 3, 29, 0.93)";
  ctx.strokeStyle = isWarning ? "rgba(255, 42, 80, 0.96)" : "rgba(255, 57, 205, 0.98)";
  ctx.shadowColor = isWarning ? "#ff2a50" : "#ff39cd";
  ctx.shadowBlur = 24;
  ctx.lineWidth = 3;
  roundedRectPath(ctx, x, y, width, height, 8);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 9;
  ctx.strokeStyle = isWarning ? "rgba(255, 242, 168, 0.7)" : "rgba(255, 213, 248, 0.58)";
  ctx.lineWidth = 1.5;
  roundedRectPath(ctx, x + 5, y + 5, width - 10, height - 10, 5);
  ctx.stroke();

  ctx.shadowBlur = 8;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = font;
  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillStyle = isWarning && i === 0 ? "#ff405f" : isWarning ? "#fff2a8" : "#fff2a8";
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillText(lines[i], x + 18, y + 23 + i * lineHeight);
  }
  ctx.restore();
}

function wrapBossMessageLines(context, sourceLines, maxWidth) {
  const wrapped = [];
  for (const sourceLine of sourceLines) {
    const start = wrapped.length;
    const words = String(sourceLine).split(/\s+/).filter(Boolean);
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && context.measureText(candidate).width > maxWidth) {
        wrapped.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) wrapped.push(current);
    balanceWrappedBossLines(context, wrapped, start, maxWidth);
  }
  return wrapped.length ? wrapped : [""];
}

function balanceWrappedBossLines(context, lines, start, maxWidth) {
  if (lines.length - start < 2) return;

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = start + 1; i < lines.length; i += 1) {
      const previousWords = lines[i - 1].split(/\s+/).filter(Boolean);
      if (previousWords.length < 3) continue;

      const lastWord = previousWords[previousWords.length - 1];
      const nextCandidate = `${lastWord} ${lines[i]}`;
      const previousCandidate = previousWords.slice(0, -1).join(" ");
      if (context.measureText(nextCandidate).width > maxWidth) continue;

      const currentDiff = Math.abs(context.measureText(lines[i - 1]).width - context.measureText(lines[i]).width);
      const candidateDiff = Math.abs(context.measureText(previousCandidate).width - context.measureText(nextCandidate).width);
      if (candidateDiff + 18 < currentDiff || context.measureText(lines[i]).width < maxWidth * 0.38) {
        lines[i - 1] = previousCandidate;
        lines[i] = nextCandidate;
        changed = true;
      }
    }
  }
}

function drawNeonHazardLine(line) {
  const pulse = 0.5 + Math.sin(state.time * 3.1 + (line.phase || 0)) * 0.5;
  const colors = line.colors || ["#55e9ff", "#ff57e3", "#7cff5d"];
  const height = line.height || 38;
  const x = -24;
  const y = line.y - height / 2;
  const width = WORLD.w + 48;
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  ctx.shadowColor = colors[0];
  ctx.shadowBlur = 16 + pulse * 12;
  ctx.strokeStyle = hexToRgba(colors[0], 0.74 + pulse * 0.18);
  ctx.lineWidth = 4 + pulse;
  ctx.strokeRect(x, y, width, height);

  ctx.shadowColor = colors[1];
  ctx.shadowBlur = 14 + pulse * 10;
  ctx.strokeStyle = hexToRgba(colors[1], 0.66 + pulse * 0.18);
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 5, y + 5, width - 10, height - 10);

  ctx.shadowColor = colors[2];
  ctx.shadowBlur = 10 + pulse * 6;
  ctx.strokeStyle = hexToRgba(colors[2], 0.28 + pulse * 0.14);
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 10, y + 9, width - 20, height - 18);

  ctx.restore();
}

function lineYAt(line) {
  return line.y;
}

function drawTripBackdrop(trip) {
  if (trip <= 0.03) return;

  const strength = clamp(trip, 0, 1.35);
  const bandHeight = 18;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let y = -bandHeight; y < WORLD.h + bandHeight; y += bandHeight) {
    const wave = Math.sin(y * 0.035 + state.time * 3.6) * 34 * strength;
    const hue = (state.time * 90 + y * 0.9 + wave * 1.6) % 360;
    ctx.fillStyle = `hsla(${hue}, 92%, 58%, ${0.06 + strength * 0.065})`;
    ctx.beginPath();
    ctx.moveTo(0, y + wave);
    for (let x = 0; x <= WORLD.w; x += 36) {
      const wobble = Math.sin(x * 0.018 + y * 0.045 + state.time * 4.2) * 18 * strength;
      ctx.lineTo(x, y + wobble + wave);
    }
    ctx.lineTo(WORLD.w, y + bandHeight + wave);
    ctx.lineTo(0, y + bandHeight - wave * 0.18);
    ctx.closePath();
    ctx.fill();
  }

  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.11 * strength;
  for (let i = 0; i < 7; i += 1) {
    const x = ((state.time * 45 + i * 151) % (WORLD.w + 160)) - 80;
    const y = WORLD.h * (0.12 + i * 0.13);
    const radius = 52 + Math.sin(state.time * 2 + i) * 18;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, `hsla(${(i * 54 + state.time * 80) % 360}, 100%, 68%, 0.9)`);
    glow.addColorStop(1, "hsla(0, 100%, 50%, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSnake() {
  const points = state.trail;
  if (points.length < 2) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const snakeAlpha = isStageInvulnerable() && Math.sin(state.time * 24) > 0 ? 0.42 : 1;
  ctx.globalAlpha = snakeAlpha;

  traceSnakeBody(points);
  ctx.strokeStyle = "#07100c";
  ctx.lineWidth = 24;
  ctx.stroke();

  traceSnakeBody(points);
  ctx.strokeStyle = "#55d6a0";
  ctx.lineWidth = 18;
  ctx.stroke();

  traceSnakeBody(points);
  ctx.strokeStyle = "#f2c14e";
  ctx.lineWidth = 6;
  ctx.globalAlpha = 0.65 * snakeAlpha;
  ctx.stroke();
  ctx.globalAlpha = snakeAlpha;

  drawTexturedBody(points);
  drawHead();
  ctx.restore();
}

function traceSnakeBody(points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const p = points[i];
    if (isWrapJump(prev, p)) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
}

function isWrapJump(a, b) {
  return Math.abs(a.x - b.x) > WORLD.w * 0.5 || Math.abs(a.y - b.y) > WORLD.h * 0.5;
}

function drawTexturedBody(points) {
  if (!snakeBodySprite) return;

  let run = [points[0]];

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    if (isWrapJump(prev, current)) {
      drawTexturedRun(run);
      run = [current];
      continue;
    }

    run.push(current);
  }

  drawTexturedRun(run);
}

function drawTexturedRun(run) {
  if (run.length < 2) return;

  let runLength = 0;
  for (let i = 1; i < run.length; i += 1) {
    runLength += Math.hypot(run[i].x - run[i - 1].x, run[i].y - run[i - 1].y);
  }
  if (runLength < BODY_TEXTURE_WRAP_INSET * 2 + BODY_TEXTURE_STEP) return;

  let nextStamp = BODY_TEXTURE_WRAP_INSET;
  let traveled = 0;

  for (let i = 1; i < run.length; i += 1) {
    const prev = run[i - 1];
    const current = run[i];
    const dx = current.x - prev.x;
    const dy = current.y - prev.y;
    const segmentLength = Math.hypot(dx, dy);
    if (segmentLength < 0.01) continue;

    while (nextStamp <= traveled + segmentLength && nextStamp <= runLength - BODY_TEXTURE_WRAP_INSET) {
      const t = (nextStamp - traveled) / segmentLength;
      const x = prev.x + dx * t;
      const y = prev.y + dy * t;
      drawBodyStamp(x, y, Math.atan2(dy, dx));
      nextStamp += BODY_TEXTURE_STEP;
    }

    traveled += segmentLength;
  }
}

function drawBodyStamp(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.globalAlpha = 0.72;
  ctx.drawImage(
    snakeBodySprite,
    -BODY_TEXTURE_WIDTH / 2,
    -BODY_TEXTURE_LENGTH / 2,
    BODY_TEXTURE_WIDTH,
    BODY_TEXTURE_LENGTH,
  );
  ctx.restore();
}

function buildSnakeBodySprite(image) {
  const crop = { x: 610, y: 150, w: 130, h: 330 };
  const sprite = document.createElement("canvas");
  sprite.width = crop.w;
  sprite.height = crop.h;

  const spriteCtx = sprite.getContext("2d", { willReadFrequently: true });
  spriteCtx.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);

  const pixels = spriteCtx.getImageData(0, 0, sprite.width, sprite.height);
  const data = pixels.data;
  const cx = sprite.width * 0.5;
  const cy = sprite.height * 0.5;
  const rx = sprite.width * 0.48;
  const ry = sprite.height * 0.49;

  for (let i = 0; i < data.length; i += 4) {
    const pixel = i / 4;
    const x = pixel % sprite.width;
    const y = Math.floor(pixel / sprite.width);
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const ellipse = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
    const vividScale = saturation > 0.16 && max > 46;
    const inCapsule = ellipse < 1.05;

    if (!inCapsule || !vividScale) {
      data[i + 3] = 0;
    }
  }

  spriteCtx.putImageData(pixels, 0, 0);
  return sprite;
}

function buildSnakeBodySpriteFallback(image) {
  const crop = { x: 610, y: 150, w: 130, h: 330 };
  const sprite = document.createElement("canvas");
  sprite.width = crop.w;
  sprite.height = crop.h;

  const spriteCtx = sprite.getContext("2d");
  spriteCtx.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  spriteCtx.globalCompositeOperation = "destination-in";
  spriteCtx.fillStyle = "#000";
  spriteCtx.beginPath();
  spriteCtx.ellipse(crop.w * 0.5, crop.h * 0.5, crop.w * 0.48, crop.h * 0.49, 0, 0, Math.PI * 2);
  spriteCtx.fill();
  spriteCtx.globalCompositeOperation = "source-over";
  return sprite;
}

function buildSnakeHeadSprite(image) {
  const sprite = document.createElement("canvas");
  sprite.width = image.naturalWidth;
  sprite.height = image.naturalHeight;

  const spriteCtx = sprite.getContext("2d", { willReadFrequently: true });
  spriteCtx.drawImage(image, 0, 0);

  const pixels = spriteCtx.getImageData(0, 0, sprite.width, sprite.height);
  const data = pixels.data;
  const { width, height } = sprite;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isNeutralBackground(pixel) {
    const i = pixel * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const channelSpread = max - min;
    return max > 120 && saturation < 0.12 && channelSpread < 28;
  }

  function enqueue(pixel) {
    if (visited[pixel] || !isNeutralBackground(pixel)) return;
    visited[pixel] = 1;
    queue.push(pixel);
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }

  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const pixel = queue[cursor];
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) enqueue(pixel - 1);
    if (x < width - 1) enqueue(pixel + 1);
    if (y > 0) enqueue(pixel - width);
    if (y < height - 1) enqueue(pixel + width);
  }

  for (let pixel = 0; pixel < visited.length; pixel += 1) {
    if (visited[pixel]) {
      data[pixel * 4 + 3] = 0;
    }
  }

  spriteCtx.putImageData(pixels, 0, 0);
  return sprite;
}

function buildSnakeHeadSpriteFallback(key) {
  const sprite = document.createElement("canvas");
  sprite.width = 96;
  sprite.height = 96;

  const spriteCtx = sprite.getContext("2d");
  const mouthOpen = key === "open" ? 1 : key === "littleOpen" ? 0.52 : 0;

  spriteCtx.translate(48, 51);
  spriteCtx.lineJoin = "round";
  spriteCtx.lineCap = "round";

  const headGradient = spriteCtx.createLinearGradient(-28, -32, 30, 34);
  headGradient.addColorStop(0, "#c9ff34");
  headGradient.addColorStop(0.42, "#63e82d");
  headGradient.addColorStop(1, "#079065");

  spriteCtx.fillStyle = "#07100c";
  spriteCtx.beginPath();
  spriteCtx.ellipse(0, 0, 32, 34, 0, 0, Math.PI * 2);
  spriteCtx.fill();

  spriteCtx.fillStyle = headGradient;
  spriteCtx.beginPath();
  spriteCtx.ellipse(0, 0, 27, 30, 0, 0, Math.PI * 2);
  spriteCtx.fill();

  const spots = [
    [-14, -16, 5], [3, -19, 4], [16, -11, 5], [-19, 1, 4],
    [10, 5, 5], [-7, 16, 4], [18, 17, 3], [-20, 20, 3],
  ];
  for (const [x, y, radius] of spots) {
    spriteCtx.fillStyle = "rgba(22, 120, 36, 0.42)";
    spriteCtx.beginPath();
    spriteCtx.arc(x, y, radius, 0, Math.PI * 2);
    spriteCtx.fill();
    spriteCtx.fillStyle = "rgba(222, 255, 58, 0.25)";
    spriteCtx.beginPath();
    spriteCtx.arc(x - 1.5, y - 1.5, radius * 0.45, 0, Math.PI * 2);
    spriteCtx.fill();
  }

  spriteCtx.fillStyle = "#f9ffd8";
  spriteCtx.strokeStyle = "#08100b";
  spriteCtx.lineWidth = 3;
  spriteCtx.beginPath();
  spriteCtx.ellipse(-11, -8, 7, 10, -0.14, 0, Math.PI * 2);
  spriteCtx.ellipse(11, -8, 7, 10, 0.14, 0, Math.PI * 2);
  spriteCtx.fill();
  spriteCtx.stroke();

  spriteCtx.fillStyle = "#101212";
  spriteCtx.beginPath();
  spriteCtx.arc(-9, -7, 2.7, 0, Math.PI * 2);
  spriteCtx.arc(9, -7, 2.7, 0, Math.PI * 2);
  spriteCtx.fill();

  spriteCtx.strokeStyle = "#07100c";
  spriteCtx.lineWidth = 3.5;
  spriteCtx.beginPath();
  if (mouthOpen > 0.1) {
    spriteCtx.fillStyle = "#26050f";
    spriteCtx.ellipse(0, 13, 9 + mouthOpen * 4, 4 + mouthOpen * 7, 0, 0, Math.PI * 2);
    spriteCtx.fill();
    spriteCtx.stroke();
    spriteCtx.strokeStyle = "#ff4b7a";
    spriteCtx.lineWidth = 2.5;
    spriteCtx.beginPath();
    spriteCtx.moveTo(0, 19);
    spriteCtx.lineTo(-4, 27 + mouthOpen * 6);
    spriteCtx.moveTo(0, 19);
    spriteCtx.lineTo(5, 27 + mouthOpen * 6);
    spriteCtx.stroke();
  } else {
    spriteCtx.moveTo(-9, 13);
    spriteCtx.quadraticCurveTo(0, 18, 9, 13);
    spriteCtx.stroke();
  }

  spriteCtx.strokeStyle = "rgba(255, 67, 191, 0.82)";
  spriteCtx.lineWidth = 3;
  spriteCtx.beginPath();
  spriteCtx.arc(0, 1, 31, 0.58, Math.PI - 0.58);
  spriteCtx.stroke();

  spriteCtx.strokeStyle = "rgba(88, 232, 255, 0.58)";
  spriteCtx.lineWidth = 2;
  spriteCtx.beginPath();
  spriteCtx.arc(0, 0, 28, Math.PI + 0.5, Math.PI * 2 - 0.5);
  spriteCtx.stroke();

  return sprite;
}

function drawHead() {
  const h = state.head;
  const a = state.angle;
  const faceStress = clamp(chaosLevel(), 0, 1.4);

  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.rotate(a);
  const tripPulse = clamp(state.effects.trip, 0, 3.2);
  if (tripPulse > 0.03) {
    const pulseAmount = clamp(0.04 + tripPulse * 0.085, 0, 0.27);
    const primaryPulse = Math.sin(state.time * 8.8) * pulseAmount;
    const secondaryPulse = Math.sin(state.time * 17.6 + 0.8) * pulseAmount * 0.22;
    const headScale = 1 + primaryPulse + secondaryPulse;
    ctx.scale(headScale, headScale);
  }

  const headSprite = currentHeadSprite();
  if (headSprite) {
    const headSize = HEAD_SPRITE_SIZE + faceStress * 2;
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(headSprite, -headSize / 2, -headSize / 2, headSize, headSize);
    ctx.restore();
    ctx.restore();
    return;
  }

  ctx.fillStyle = "#7bf0b8";
  ctx.strokeStyle = "#07100c";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f8f5ea";
  ctx.beginPath();
  ctx.arc(5, -6, 5, 0, Math.PI * 2);
  ctx.arc(5, 6, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#101212";
  ctx.beginPath();
  ctx.arc(6 + faceStress * 2, -6, 2.2 + faceStress, 0, Math.PI * 2);
  ctx.arc(6 + faceStress * 2, 6, 2.2 + faceStress, 0, Math.PI * 2);
  ctx.fill();

  drawStressTongue(faceStress, 14);
  ctx.restore();
}

function currentHeadSprite() {
  if (state.mouthOpen > 0.72) {
    return snakeHeadSprites.open || snakeHeadSprites.littleOpen || snakeHeadSprites.closed;
  }
  if (state.mouthOpen > 0.2) {
    return snakeHeadSprites.littleOpen || snakeHeadSprites.open || snakeHeadSprites.closed;
  }
  return snakeHeadSprites.closed || snakeHeadSprites.littleOpen || snakeHeadSprites.open;
}

function drawStressTongue(faceStress, startX) {
  if (faceStress <= 0.65) return;

  const endX = startX + 11 + faceStress * 2;
  ctx.strokeStyle = "#ef6f6c";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(startX, 0);
  ctx.lineTo(endX, -5);
  ctx.moveTo(startX, 0);
  ctx.lineTo(endX, 5);
  ctx.stroke();
}

function drawItem(item) {
  const bob = Math.sin(state.time * 4 + item.x * 0.02) * 3;
  const lifeRatio = Number.isFinite(item.ttl) ? clamp(item.life / item.ttl, 0, 1) : 1;
  const warningBlink = lifeRatio < 0.22 ? 0.62 + Math.sin(state.time * 18) * 0.28 : 1;
  const isXItem = item.type.kind === "x-cleanse" || item.type.kind === "x-risk";
  const sprite = item.type.sprite ? itemSprites[item.type.sprite] : null;
  ctx.save();
  ctx.translate(item.x, item.y + bob);
  ctx.globalAlpha = clamp(0.35 + lifeRatio * 0.65, 0.35, 1) * warningBlink;
  if (item.type.kind === "exit") {
    drawExitItem(item);
    ctx.restore();
    return;
  }
  if (sprite) {
    const pulse = 1 + Math.sin(state.time * 6 + item.x * 0.01) * 0.035;
    const spriteHeight = (item.type.spriteHeight || ITEM_SPRITE_HEIGHT) * pulse;
    const spriteWidth = spriteHeight * (sprite.naturalWidth / sprite.naturalHeight);
    const ringRadius = item.type.radius + 10;
    const ringIsCleanse = item.type.kind === "cleanse" || item.type.kind === "x-cleanse";
    const ringGlow = ringIsCleanse ? "rgba(66,202,253,0.22)" : "rgba(255,42,80,0.22)";
    const ringTrack = ringIsCleanse ? "rgba(5,35,45,0.52)" : "rgba(35,8,13,0.52)";
    const ringProgress = ringIsCleanse ? "rgba(92,238,255,0.64)" : "rgba(255,42,80,0.64)";
    if (item.type.hero) {
      const heroPulse = 0.5 + 0.5 * Math.sin(state.time * 7.5 + item.x * 0.015);
      const haloRadius = ringRadius + 5 + heroPulse * 5;
      const heroPrimary = ringIsCleanse ? "120,248,255" : "255,42,80";
      const heroSecondary = ringIsCleanse ? "255,255,255" : "255,220,220";
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.shadowColor = item.type.color;
      ctx.shadowBlur = 28 + heroPulse * 18;
      ctx.strokeStyle = `rgba(${heroPrimary},${0.28 + heroPulse * 0.22})`;
      ctx.lineWidth = 6 + heroPulse * 3;
      ctx.beginPath();
      ctx.arc(0, 0, haloRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${heroSecondary},${0.18 + heroPulse * 0.16})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, haloRadius + 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.shadowColor = item.type.color;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = ringGlow;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = ringTrack;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = ringProgress;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius + 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
    ctx.stroke();
    ctx.shadowColor = item.type.color;
    ctx.shadowBlur = 16;
    ctx.rotate(item.rotation || 0);
    ctx.drawImage(sprite, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
    ctx.restore();
    return;
  }
  ctx.shadowColor = item.type.color;
  ctx.shadowBlur = isXItem ? 26 : item.type.kind === "risk" ? 18 : 10;
  ctx.fillStyle = item.type.color;
  ctx.strokeStyle = "#07100c";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, item.type.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  if (isXItem) {
    ctx.strokeStyle = "rgba(248,245,234,0.92)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, item.type.radius + 11 + Math.sin(state.time * 7) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(248,245,234,0.82)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, item.type.radius + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeRatio);
  ctx.stroke();
  ctx.fillStyle = "#07100c";
  ctx.font = "800 14px ui-sans-serif, system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(item.type.glyph, 0, 1);
  ctx.restore();
}

function drawExitItem(item) {
  const pulse = 0.5 + 0.5 * Math.sin(state.time * 6.5);
  const radius = item.type.radius + pulse * 4;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.shadowColor = item.type.color;
  ctx.shadowBlur = 28 + pulse * 18;
  ctx.strokeStyle = `rgba(255, 242, 168, ${0.32 + pulse * 0.26})`;
  ctx.lineWidth = 7 + pulse * 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius + 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(92, 238, 255, ${0.22 + pulse * 0.18})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius + 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.shadowColor = item.type.color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = "rgba(7, 16, 12, 0.92)";
  ctx.strokeStyle = item.type.color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, item.type.radius + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 12;
  ctx.fillStyle = item.type.color;
  ctx.font = "950 13px 'Courier New', ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("EXIT", 0, 1);
}

function expireItems(dt) {
  for (let i = state.items.length - 1; i >= 0; i -= 1) {
    if (!Number.isFinite(state.items[i].ttl)) continue;
    state.items[i].life -= dt;
    if (state.items[i].life <= 0) {
      state.items.splice(i, 1);
    }
  }
}

function updateScorePopups(dt) {
  for (let i = state.scorePopups.length - 1; i >= 0; i -= 1) {
    const popup = state.scorePopups[i];
    popup.age += dt;
    popup.x += popup.vx * dt;
    popup.y += popup.vy * dt;
    popup.vy -= 5 * dt;
    if (popup.age >= popup.ttl) {
      state.scorePopups.splice(i, 1);
    }
  }
}

function addScorePopup(item, value, combo) {
  const isHero = isXItemType(item.type);
  const isHarm = isHarmItem(item.type);
  state.scorePopups.push({
    x: clamp(item.x, 42, WORLD.w - 42),
    y: clamp(item.y - item.type.radius - 12, 42, WORLD.h - 42),
    vx: (Math.random() - 0.5) * 12,
    vy: -34 - Math.random() * 10,
    age: 0,
    ttl: isHero ? 1 : 0.82,
    value,
    combo,
    color: isHero ? item.type.color : isHarm ? "#ff6a84" : "#72ecff",
    shadow: isHero ? item.type.color : isHarm ? "#ff2a50" : "#42cafd",
  });
}

function drawScorePopups() {
  if (!state.scorePopups.length) return;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const popup of state.scorePopups) {
    const t = clamp(popup.age / popup.ttl, 0, 1);
    const alpha = Math.sin((1 - t) * Math.PI * 0.5);
    const scale = 1 + (1 - t) * 0.12;
    const text = `+${popup.value}`;
    const comboText = popup.combo > 1 ? ` x${popup.combo}` : "";

    ctx.save();
    ctx.translate(popup.x, popup.y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha * 0.92;
    ctx.font = "950 17px 'Courier New', ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(3, 6, 14, 0.72)";
    ctx.shadowColor = popup.shadow;
    ctx.shadowBlur = 12;
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = popup.color;
    ctx.fillText(text, 0, 0);
    if (comboText) {
      ctx.globalAlpha = alpha * 0.72;
      ctx.font = "850 11px 'Courier New', ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#fff2a8";
      ctx.fillText(comboText, 0, 16);
    }
    ctx.restore();
  }
  ctx.restore();
}

function collectItems() {
  for (let i = state.items.length - 1; i >= 0; i -= 1) {
    const item = state.items[i];
    if (wrappedDistance(state.head, item) <= item.type.radius + 15) {
      if (!item.bitePlayed) {
        playBiteSound();
      }
      state.items.splice(i, 1);
      state.mouthBiteTimer = MOUTH_BITE_TIME;
      if (item.type.kind === "exit") {
        playGatherSound(1);
        item.type.apply(state);
        return;
      }
      const combo = comboForItem(item.type);
      const lengthBeforeApply = state.length;
      const scoreGain = item.type.points * SCORE_SCALE * combo;
      state.score += scoreGain;
      state.length += item.type.growth;
      state.screenPulse = isHarmItem(item.type) ? 1 : 0.55;
      addScorePopup(item, scoreGain, combo);
      playGatherSound(combo);
      if (item.type.id === "redx") {
        playRedXShout();
      }
      if (item.type.id === "bluex") {
        playBlueXShout();
        playDeathBoomSound();
      }
      item.type.apply(state);
      if (state.length < lengthBeforeApply) {
        trimTrail();
      }
      state.influenceMemory = Math.max(state.influenceMemory, currentInfluence());
    }
  }
}

function updateMouth(dt) {
  if (DEBUG_MOUTH !== null) {
    state.mouthOpen = clamp(Number(DEBUG_MOUTH) || 0, 0, 1);
    state.mouthBiteTimer = 0;
    return;
  }

  state.mouthBiteTimer = Math.max(0, state.mouthBiteTimer - dt);

  let nearest = Infinity;
  for (const item of state.items) {
    const itemDistance = wrappedDistance(state.head, item) - item.type.radius;
    nearest = Math.min(nearest, itemDistance);
  }

  const prep = clamp(1 - nearest / MOUTH_PREP_DISTANCE, 0, 1);
  const target = state.mouthBiteTimer > 0 ? 1 : prep * 0.55;
  const speed = target > state.mouthOpen ? 12 : 11;
  state.mouthOpen += (target - state.mouthOpen) * clamp(dt * speed, 0, 1);
}

function comboForItem(type) {
  if (type.kind !== "risk") {
    state.combo.itemId = null;
    state.combo.count = 0;
    return 1;
  }

  if (!isUnderMatchingInfluence(type)) {
    state.combo.itemId = type.id;
    state.combo.count = 1;
    return 1;
  }

  if (state.combo.itemId === type.id) {
    state.combo.count = Math.min(state.combo.count + 1, 5);
  } else {
    state.combo.itemId = type.id;
    state.combo.count = 1;
  }

  if (state.combo.count > state.bestCombo.count) {
    state.bestCombo.count = state.combo.count;
    state.bestCombo.itemId = type.id;
    state.bestCombo.sprite = type.sprite || null;
  }

  return state.combo.count;
}

function isHarmItem(type) {
  return type.kind === "risk" || type.kind === "x-risk";
}

function isUnderMatchingInfluence(type) {
  const e = state.effects;
  if (type.id === "wobble") return e.wobble > 0.1;
  if (type.id === "rainbow") return e.trip > 0.18;
  if (type.id === "zoom") return e.stim > 0.18 || e.jitter > 0.18 || e.snap > 0.12;
  if (type.id === "redx") return chaosLevel() > 0.7;
  return false;
}

function spawnItem(s) {
  const type = chooseItemType(s);
  let item;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    item = {
      type,
      x: 38 + Math.random() * (WORLD.w - 76),
      y: 76 + Math.random() * (WORLD.h - 114),
      ttl: type.ttl + Math.random() * 0.8,
      life: 0,
      rotation: type.sprite ? (Math.random() * ((type.rotationRange ?? 20) * 2) - (type.rotationRange ?? 20)) * Math.PI / 180 : 0,
      bitePlayed: false,
    };
    item.life = item.ttl;
    if (isGoodSpawn(item)) {
      s.items.push(item);
      if (isXItemType(type)) {
        playHeroItemSpawnSound();
      }
      return;
    }
  }
}

function spawnExitItem(s) {
  if (s.exitSpawned) return;

  let item;
  let found = false;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    item = {
      type: exitItemType,
      x: 54 + Math.random() * (WORLD.w - 108),
      y: 86 + Math.random() * (WORLD.h - 142),
      ttl: exitItemType.ttl,
      life: exitItemType.ttl,
      rotation: 0,
      bitePlayed: false,
    };
    if (isGoodSpawn(item)) {
      found = true;
      break;
    }
  }
  if (!found) return;

  s.exitSpawned = true;
  s.items.push(item);
  s.screenPulse = 1.1;
  playHeroItemSpawnSound();
}

function isXItemType(type) {
  return type.kind === "x-cleanse" || type.kind === "x-risk";
}

function chooseItemType(s) {
  const roll = Math.random();
  const score = unscaledScore();
  const xProgress = Math.max(0, score - X_ITEM_UNLOCK.score);
  const xChance = clamp(0.008 + xProgress / 25000, 0.008, 0.035);
  if (xItemsUnlocked(s) && roll < xChance) {
    const wantsBlueX = Math.random() < clamp(0.32 + chaosLevel() * 0.08, 0.32, 0.5);
    return itemTypes.find((item) => item.id === (wantsBlueX ? "bluex" : "redx"));
  }

  const cleanseChance = clamp(0.16 - score / 9000 + chaosLevel() * 0.08, 0.06, 0.28);
  const pool = Math.random() < cleanseChance
    ? itemTypes.filter((item) => item.kind === "cleanse")
    : itemTypes.filter((item) => item.kind === "risk");

  const filtered = pool.filter((item) => {
    if (item.id === "rainbow") return score > 90;
    if (item.id === "zoom") return score > 140;
    if (item.id === "buzz") return score > 60;
    return true;
  });
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function xItemsUnlocked(s) {
  return (
    unscaledScore() >= X_ITEM_UNLOCK.score &&
    s.length >= X_ITEM_UNLOCK.length &&
    currentSpeed() >= X_ITEM_UNLOCK.speed
  );
}

function isGoodSpawn(item) {
  if (wrappedDistance(state.head, item) < 110) return false;
  if (isNearLevelObstacle(item, item.type.radius + 28)) return false;
  if (isNearLevelLine(item, item.type.radius + 28)) return false;
  if (isNearBoss(item, item.type.radius + 28)) return false;
  if (isNearBossLaser(item, item.type.radius + 24)) return false;
  for (const p of state.trail) {
    if (wrappedDistance(p, item) < 34) return false;
  }
  for (const existing of state.items) {
    if (wrappedDistance(existing, item) < 54) return false;
  }
  return true;
}

function isNearLevelObstacle(point, padding = 0) {
  return levelObstacles().some((obstacle) => point.x >= obstacle.x - padding &&
    point.x <= obstacle.x + obstacle.size + padding &&
    point.y >= obstacle.y - padding &&
    point.y <= obstacle.y + obstacle.size + padding);
}

function isNearLevelLine(point, padding = 0) {
  return levelLines().some((line) => {
    const y = lineYAt(line);
    return Math.abs(point.y - y) <= lineCollisionHalfHeight(line) + line.padding + padding;
  });
}

function isNearBoss(point, padding = 0) {
  const boss = state.boss;
  if (!boss) return false;
  return Math.abs(point.x - boss.x) <= 92 + padding && Math.abs(point.y - boss.y) <= 48 + padding;
}

function isNearBossLaser(point, padding = 0) {
  const boss = state.boss;
  if (!boss || boss.phase === "roam" || boss.phase === "cooldown") return false;
  if (bossRotatingBeamActive(boss)) {
    return distanceToBossRotatingBeam(point, boss) <= BOSS_CROSS_LASER_HALF_WIDTH + padding;
  }
  const x = boss.phase === "attack" ? bossLaserXAt(point.y, boss.attackX, state.time) : boss.attackX;
  const nearVertical = point.y <= boss.attackY + 18 + padding && Math.abs(point.x - x) <= BOSS_LASER_HALF_WIDTH + padding;
  const nearHorizontal = boss.hasCrossBeam &&
    typeof boss.crossY === "number" &&
    Math.abs(point.y - boss.crossY) <= BOSS_CROSS_LASER_HALF_WIDTH + padding;
  return nearVertical || nearHorizontal;
}

function hitsLevelObstacle() {
  const obstacles = levelObstacles();
  if (!obstacles.length) return false;
  const radius = 14;
  return obstacles.some((obstacle) => {
    const nearestX = clamp(state.head.x, obstacle.x, obstacle.x + obstacle.size);
    const nearestY = clamp(state.head.y, obstacle.y, obstacle.y + obstacle.size);
    const dx = state.head.x - nearestX;
    const dy = state.head.y - nearestY;
    return dx * dx + dy * dy < radius * radius;
  });
}

function hitsLevelLine() {
  const lines = levelLines();
  if (!lines.length) return false;
  return lines.some((line) => Math.abs(state.head.y - lineYAt(line)) <= lineCollisionHalfHeight(line));
}

function hitsBossLaser() {
  const boss = state.boss;
  if (!boss || boss.phase !== "attack") return false;
  const snakeRadius = 14;
  if (bossRotatingBeamActive(boss)) {
    return distanceToBossRotatingBeam(state.head, boss) <= BOSS_CROSS_LASER_HALF_WIDTH + snakeRadius + 5;
  }
  const laserX = bossLaserXAt(state.head.y, boss.attackX, state.time);
  const hitsVertical = state.head.y <= boss.attackY + 18 &&
    Math.abs(state.head.x - laserX) <= BOSS_LASER_HALF_WIDTH + snakeRadius;
  const hitsHorizontal = bossCrossBeamActive(boss) &&
    typeof boss.crossY === "number" &&
    Math.abs(state.head.y - boss.crossY) <= BOSS_CROSS_LASER_HALF_WIDTH + snakeRadius + 4;
  return hitsVertical || hitsHorizontal;
}

function bossLaserXAt(y, attackX, time) {
  return attackX + Math.sin(y * 0.035 + time * 11.5) * 5 + Math.sin(y * 0.071 - time * 7.4) * 2.5;
}

function distanceToBossRotatingBeam(point, boss) {
  if (typeof boss.crossY !== "number") return Infinity;

  const dx = point.x - boss.attackX;
  const dy = point.y - boss.crossY;
  const angle = bossRotatingBeamAngle(boss);
  const distanceA = Math.abs(dx * Math.sin(angle) - dy * Math.cos(angle));
  const angleB = angle + Math.PI * 0.5;
  const distanceB = Math.abs(dx * Math.sin(angleB) - dy * Math.cos(angleB));
  return Math.min(distanceA, distanceB);
}

function levelObstacles() {
  return state?.levelConfig?.obstacles || [];
}

function levelLines() {
  return state?.levelConfig?.lines || [];
}

function isBossLevel() {
  return Boolean(state?.boss);
}

function lineCollisionHalfHeight(line) {
  const snakeRadius = 14;
  return (line.height || line.thickness * 2) / 2 + snakeRadius;
}

function hitsSelf() {
  if (state.selfHitGrace > 0) return false;

  const points = state.trail;
  const skip = 17;
  if (points.length <= skip + 6) return false;
  for (let i = 0; i < points.length - skip; i += 3) {
    if (wrappedDistance(state.head, points[i]) < 15) {
      return true;
    }
  }
  return false;
}

function trimTrail() {
  let total = 0;
  for (let i = state.trail.length - 1; i > 0; i -= 1) {
    total += wrappedDistance(state.trail[i], state.trail[i - 1]);
    if (total > state.length) {
      state.trail.splice(0, i - 1);
      return;
    }
  }
}

function currentSpeed() {
  const e = state.effects;
  return state.baseSpeed + state.speedBoost + e.stim * 110 + unscaledScore() * 0.06;
}

function unscaledScore() {
  return state.score / SCORE_SCALE;
}

function levelProgress() {
  if (!state) return 0;
  if (state.boss) return clamp(state.boss.gas, 0, 1);
  return clamp(state.levelTime / LEVEL_DURATION, 0, 1);
}

function updateHud() {
  const score = state ? state.score : 0;
  const bossActive = Boolean(state?.boss);
  const newHighScoreRun = Boolean(state && score > best);
  scoreEl.textContent = String(score);
  bestEl.textContent = String(Math.max(best, score));
  levelEl.textContent = state?.levelConfig?.label || "1-1";
  renderLives(state?.lives ?? STARTING_LIVES);
  const progress = levelProgress().toFixed(3);
  levelProgressEl.style.setProperty("--progress", progress);
  gameWrap.classList.toggle("boss-level-active", bossActive);
  gameWrap.classList.toggle("new-high-score-run", newHighScoreRun);
  bossGasMeter.classList.toggle("hidden", !bossActive);
  if (bossActive) {
    bossGasFill.style.setProperty("--boss-gas", progress);
  }
}

function renderLives(lives) {
  if (!livesEl) return;
  const clampedLives = clamp(Math.round(lives), 0, STARTING_LIVES);
  livesEl.innerHTML = "";
  for (let i = 0; i < STARTING_LIVES; i += 1) {
    const heart = document.createElement("span");
    heart.className = `life-heart${i >= clampedLives ? " empty" : ""}`;
    heart.textContent = "♥";
    heart.setAttribute("aria-hidden", "true");
    livesEl.appendChild(heart);
  }
}

function slowMoFactor() {
  if (state.slowMo <= 0) return 1;
  return 0.48;
}

function isStageInvulnerable() {
  return Boolean(state?.stageInvulnerable > 0);
}

function coolChaos(s, amount) {
  s.effects.wobble *= 1 - amount;
  s.effects.trip *= 1 - amount;
  s.effects.jitter *= 1 - amount;
  s.effects.snap *= 1 - amount;
}

function fullCleanse(s) {
  for (const key of Object.keys(s.effects)) {
    s.effects[key] = 0;
  }
  s.speedBoost = Math.min(s.speedBoost, 20);
}

function chaosLevel() {
  const e = state.effects;
  return e.wobble + e.trip + e.stim * 0.55 + e.jitter + e.snap;
}

function currentInfluence() {
  return clamp(chaosLevel() / 2.7, 0, 1);
}

function updateFrameGlow() {
  const influence = Math.max(currentInfluence(), state.influenceMemory);
  const bossBackdropPulse = isBossLevel()
    ? 0.38 + (Math.sin(state.time * 1.28) * 0.5 + 0.5) * 0.34
    : 0;
  const visualInfluence = Math.max(influence, bossBackdropPulse);
  const slowMoFocus = state.slowMo > 0 ? clamp(state.slowMo / 0.55, 0, 1) : 0;
  const chaos = chaosLevel();
  const shouldEnterBackgroundB = influence > 0.76 || chaos > 1.95;
  const shouldExitBackgroundB = influence < 0.42 && chaos < 1.05;

  if (DEBUG_BACKGROUND_B) {
    state.backgroundBActive = true;
  } else if (state.backgroundBActive) {
    state.backgroundBActive = !shouldExitBackgroundB;
  } else {
    state.backgroundBActive = shouldEnterBackgroundB;
  }

  const snakeState = state.backgroundBActive ? 1 : 0;
  gameWrap.style.setProperty("--influence-glow", visualInfluence.toFixed(3));
  gameWrap.style.setProperty("--snake-state", snakeState.toFixed(3));
  gameWrap.style.setProperty("--slowmo-focus", slowMoFocus.toFixed(3));
  gameWrap.classList.toggle("background-b", state.backgroundBActive);
  updateSlowMoAudio(slowMoFocus);
}

function targetItemCount() {
  const score = unscaledScore();
  if (score > 900) return 5;
  if (score > 250) return 4;
  return 3;
}

function normalItemCount() {
  return state.items.filter((item) => item.type.kind !== "exit").length;
}

function nextSpawnDelay() {
  return SPAWN_DELAY.min + Math.random() * (SPAWN_DELAY.max - SPAWN_DELAY.min);
}

function wrap(value, max) {
  if (value < 0) return value + max;
  if (value >= max) return value - max;
  return value;
}

function wrappedDistance(a, b) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  const wx = Math.min(dx, WORLD.w - dx);
  const wy = Math.min(dy, WORLD.h - dy);
  return Math.hypot(wx, wy);
}

function moveToward(value, target, amount) {
  if (value < target) return Math.min(value + amount, target);
  return Math.max(value - amount, target);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundedRectPath(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function hexToRgba(hex, alpha) {
  const raw = hex.replace("#", "");
  const value = Number.parseInt(raw, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function steppedNoise(value) {
  return Math.sin(Math.floor(value) * 12.9898) * 0.5 + Math.sin(Math.floor(value * 0.47) * 78.233) * 0.5;
}

function isSnapMode() {
  return running && state && state.effects.snap > SNAP_MODE_THRESHOLD;
}

function snapTurn(direction) {
  const randomTurn = SNAP_TURN_MIN + Math.random() * (SNAP_TURN_MAX - SNAP_TURN_MIN);
  state.angle = normalizeAngle(state.angle + direction * randomTurn);
  state.steerLag = 0;
}

function normalizeAngle(angle) {
  const fullTurn = Math.PI * 2;
  return ((angle % fullTurn) + fullTurn) % fullTurn;
}

function resizeCanvas() {
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = WORLD.w * dpr;
  canvas.height = WORLD.h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawStartScreen();
}

function drawStartScreen() {
  if (running || state) return;
  drawGroundPlane(0);
}

window.addEventListener("keydown", (event) => {
  if (!cinematicOverlay.classList.contains("hidden")) {
    if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      advanceCinematic();
    }
    return;
  }
  if (running) {
    resumeGameMusicFromInput();
  }
  if (event.code === "Space") {
    event.preventDefault();
    if (briefingPending) {
      beginBriefedGame();
    } else if (!running) {
      advanceFromRecap();
    }
    return;
  }
  if (!running) return;
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    if (isSnapMode()) {
      if (!event.repeat) snapTurn(-1);
      keys.left = false;
      return;
    }
    keys.left = true;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    if (isSnapMode()) {
      if (!event.repeat) snapTurn(1);
      keys.right = false;
      return;
    }
    keys.right = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = false;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = false;
  }
});

canvas.addEventListener("pointerdown", (event) => {
  if (!running) return;
  resumeGameMusicFromInput();
  canvas.setPointerCapture(event.pointerId);
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  if (isSnapMode()) {
    snapTurn(x < rect.width / 2 ? -1 : 1);
    keys.left = false;
    keys.right = false;
    return;
  }
  keys.left = x < rect.width / 2;
  keys.right = !keys.left;
});

canvas.addEventListener("pointermove", (event) => {
  if (!running) return;
  if (isSnapMode()) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  keys.left = x < rect.width / 2;
  keys.right = !keys.left;
});

canvas.addEventListener("pointerup", () => {
  keys.left = false;
  keys.right = false;
});

canvas.addEventListener("pointercancel", () => {
  keys.left = false;
  keys.right = false;
});

window.addEventListener("keydown", () => {
  if (!running && !overlay.classList.contains("hidden")) {
    startMenuMusic();
  }
});
window.addEventListener("pointerdown", () => {
  if (!running && !overlay.classList.contains("hidden")) {
    startMenuMusic();
  }
});
startButton.addEventListener("click", () => startGame(DEBUG_LEVEL, 0, STARTING_LIVES));
briefingStartButton.addEventListener("pointerdown", () => {
  startMusic();
});
briefingStartButton.addEventListener("click", beginBriefedGame);
musicOnButton.addEventListener("click", () => setMusicEnabled(true));
musicOffButton.addEventListener("click", () => setMusicEnabled(false));
soundOnButton.addEventListener("click", () => setSoundEnabled(true));
soundOffButton.addEventListener("click", () => setSoundEnabled(false));
restartButton.addEventListener("click", advanceFromRecap);
cinematicContinueButton.addEventListener("click", advanceCinematic);
scoreEntryEl.addEventListener("submit", (event) => {
  event.preventDefault();
  submitScoreEntry();
});
scoreNameInput.addEventListener("input", () => {
  const clean = sanitizeScoreName(scoreNameInput.value);
  if (scoreNameInput.value !== clean) {
    scoreNameInput.value = clean;
  }
});
scoreNameInput.addEventListener("keydown", (event) => {
  event.stopPropagation();
  if (event.key === "Enter") {
    event.preventDefault();
    submitScoreEntry();
  }
});
if (DEBUG_DEATH) {
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "k" && running) {
      gameOver();
    }
  });
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
updateMusicMenu();
updateSoundMenu();
primeMenuMusic();
if (DEBUG_CINEMATIC) {
  overlay.classList.add("hidden");
  showCinematic();
}
