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

const gameWrap = document.querySelector(".game-wrap");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const levelEl = document.querySelector("#level");
const levelProgressEl = document.querySelector("#levelProgress");
const titleBestEl = document.querySelector("#titleBest");
const deathOverlay = document.querySelector("#deathOverlay");
const deathScoreEl = document.querySelector("#deathScore");
const deathBestEl = document.querySelector("#deathBest");
const restartButton = document.querySelector("#restartButton");
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
const SCORE_SCALE = 100;
const LEVEL_ONE_TARGET = 1000;
const MENU_MUSIC_SRC = "./assets/audio/menu-coin-clash.mp3";
const GAME_MUSIC_SRC = "./assets/audio/coin-clash.mp3";
const MENU_MUSIC_LOOP_START = 0;
const GAME_MUSIC_LOOP_START = 51;
const MUSIC_VOLUME = 0.35;
const MUSIC_NORMAL_RATE = 1;
const MUSIC_SLOWMO_RATE = 0.8;
const MUSIC_NORMAL_CUTOFF = 18000;
const MUSIC_SLOWMO_CUTOFF = 680;
const PICKUP_SOUND_SRC = "./assets/audio/gather-point-regular.wav";
const PICKUP_SOUND_VOLUME = 1;
const BITE_SOUND_VOLUME = 0.247;
const PICKUP_SOUND_DELAY = 35;
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
const X_ITEM_UNLOCK = {
  score: 180,
  length: 340,
  speed: 190,
};
const HELP_COLOR = "#42cafd";
const HARM_COLOR = "#ef4d5a";
const X_HELP_COLOR = "#9df7ff";
const X_HARM_COLOR = "#ff2a8a";
const HEAD_SPRITE_SIZE = 68;
const BODY_TEXTURE_WIDTH = 24;
const BODY_TEXTURE_LENGTH = 46;
const BODY_TEXTURE_STEP = 13;
const BODY_TEXTURE_WRAP_INSET = 8;
const FLOOR_TILE_PATTERN_SIZE = 360;
const ITEM_SPRITE_HEIGHT = 43;
const MOUTH_PREP_DISTANCE = 96;
const MOUTH_BITE_TIME = 0.18;
const SPAWN_DELAY = { min: 0.85, max: 1.75 };
const SNAP_MODE_THRESHOLD = 0.08;
const SNAP_TURN = Math.PI / 4;
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

loadItemSprite("blue1", "./assets/item-blue1-coffee.png?v=blue1-coffee-v1");
loadItemSprite("blue2", "./assets/item-blue2-donut.png?v=blue2-donut-v2");
loadItemSprite("blue3", "./assets/item-blue3-pizza.png?v=blue3-pizza-v1");
loadItemSprite("bluex", "./assets/item-bluex-bottle.png?v=bluex-bottle-v1");
loadItemSprite("red1", "./assets/item-red1-gummy.png?v=red1-gummy-v4");
loadItemSprite("red2", "./assets/item-red2-mushroom.png?v=red2-mushroom-v1");
loadItemSprite("red3", "./assets/item-red3-capsule.png?v=red3-capsule-v1");
loadItemSprite("redx", "./assets/item-redx-bottle.png?v=redx-bottle-v1");

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
let pickupSoundIndex = 0;
let biteSoundIndex = 0;
let deathBoomSoundIndex = 0;
let heroItemSpawnSoundIndex = 0;

let musicStarted = false;
let musicStatus = "waiting";
let musicNeedsCue = false;
let musicEnabled = true;
let musicMode = "menu";
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
  return musicMode === "game" ? GAME_MUSIC_LOOP_START : MENU_MUSIC_LOOP_START;
}

function musicSourceForMode(mode) {
  return mode === "game" ? GAME_MUSIC_SRC : MENU_MUSIC_SRC;
}

function switchMusicMode(mode) {
  if (musicMode === mode) return;

  const wasPaused = music.paused;
  musicMode = mode;
  musicNeedsCue = true;
  music.loop = mode === "menu";
  music.playbackRate = MUSIC_NORMAL_RATE;
  music.src = musicSourceForMode(mode);
  music.dataset.loopStart = String(musicLoopStart());
  music.load();
  cueMusicLoopPoint();

  if (!wasPaused && musicEnabled) {
    playMusic();
  }
}

function cueMusicLoopPoint() {
  if (musicMode === "menu") {
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
  if (musicMode === "menu") {
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
  music.play().then(() => {
    if (audioContext?.state === "suspended") {
      audioContext.resume();
    }
    confirmMusicCue();
    musicStatus = music.muted ? "playing-muted" : "playing";
  }).catch((error) => {
    musicStatus = error?.name || "blocked";
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
  switchMusicMode("game");
  music.loop = false;

  if (!musicStarted) {
    musicStarted = true;
    musicNeedsCue = true;
    music.load();
    cueMusicLoopPoint();
  }

  music.muted = false;
  music.volume = MUSIC_VOLUME;
  ensureMusicEffects();
  loadPickupSoundBuffer();
  loadRedXShout();
  loadBlueXShout();

  if (music.paused) {
    playMusic();
  } else {
    confirmMusicCue();
    musicStatus = "playing";
  }
}

function setMusicEnabled(enabled) {
  musicEnabled = enabled;
  updateMusicMenu();

  if (!musicEnabled) {
    music.pause();
    music.muted = true;
    musicStatus = "off";
    return;
  }

  if (running) {
    startMusic();
  } else {
    startMenuMusic();
  }
}

function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  updateSoundMenu();
}

function playSoundFromPool(sounds, index, volume, playbackRate = 1) {
  const sound = sounds[index];
  sound.volume = volume;
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
  gain.gain.value = volume;
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
    fallback.volume = volume;
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
  dryGain.gain.value = volume * 0.62;
  wetGain.gain.value = volume * 0.72;
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

music.addEventListener("ended", () => {
  if (musicMode === "menu") return;

  musicNeedsCue = true;
  cueMusicLoopPoint();
  music.play().then(() => {
    confirmMusicCue();
    musicStatus = music.muted ? "playing-muted" : "playing";
  }).catch((error) => {
    musicStatus = error?.name || "blocked";
    musicStarted = false;
  });
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
  confirmMusicCue();
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
    points: 25,
    growth: 82,
    radius: 15,
    ttl: 7.2,
    apply: (s) => {
      s.effects.wobble += 0.68;
    },
  },
  {
    id: "rainbow",
    name: "Rainbow Tabs",
    glyph: "2",
    kind: "risk",
    color: HARM_COLOR,
    sprite: "red2",
    points: 60,
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
      s.speedBoost += 190;
      s.screenPulse = 1.5;
    },
  },
];

const keys = {
  left: false,
  right: false,
};

let state;
let lastTime = 0;
let running = false;
let briefingPending = false;
let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
bestEl.textContent = String(best);
titleBestEl.textContent = String(best);
deathBestEl.textContent = String(best);
updateHud();

function newState() {
  const startX = WORLD.w * 0.5;
  const startY = WORLD.h * 0.5;
  return {
    score: 0,
    baseSpeed: 172,
    speedBoost: 0,
    angle: -Math.PI * 0.2,
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
    influenceMemory: 0,
    combo: {
      itemId: null,
      count: 0,
    },
    spawnDelay: 0.7,
    alive: true,
    backgroundBActive: false,
    mouthOpen: 0,
    mouthBiteTimer: 0,
    screenPulse: 0,
  };
}

function startGame() {
  state = newState();
  running = false;
  briefingPending = true;
  keys.left = false;
  keys.right = false;
  lastTime = performance.now();
  updateHud();
  updateFrameGlow();
  startMusic();
  overlay.classList.remove("game-over");
  overlay.classList.add("hidden");
  deathOverlay.classList.add("hidden");
  briefingOverlay.classList.remove("hidden");
  draw();
  briefingStartButton.focus({ preventScroll: true });
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

function gameOver() {
  running = false;
  briefingPending = false;
  state.alive = false;
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
  playDeathBoomSound();
  briefingOverlay.classList.add("hidden");
  deathOverlay.classList.remove("hidden");
  restartButton.focus({ preventScroll: true });
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
  if (state.items.length < targetItemCount() && state.spawnDelay <= 0) {
    spawnItem(state);
    state.spawnDelay = nextSpawnDelay();
  }

  if (hitsSelf()) {
    gameOver();
  }

  updateHud();
  updateFrameGlow();
}

function draw() {
  const trip = clamp(state.effects.trip, 0, 1.25);
  ctx.clearRect(0, 0, WORLD.w, WORLD.h);
  ctx.save();

  drawGroundPlane(trip);
  drawTripBackdrop(trip);

  for (const item of state.items) {
    drawItem(item);
  }

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
  ctx.globalAlpha = 0.65;
  ctx.stroke();
  ctx.globalAlpha = 1;

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
  const lifeRatio = clamp(item.life / item.ttl, 0, 1);
  const warningBlink = lifeRatio < 0.22 ? 0.62 + Math.sin(state.time * 18) * 0.28 : 1;
  const isXItem = item.type.kind === "x-cleanse" || item.type.kind === "x-risk";
  const sprite = item.type.sprite ? itemSprites[item.type.sprite] : null;
  ctx.save();
  ctx.translate(item.x, item.y + bob);
  ctx.globalAlpha = clamp(0.35 + lifeRatio * 0.65, 0.35, 1) * warningBlink;
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

function expireItems(dt) {
  for (let i = state.items.length - 1; i >= 0; i -= 1) {
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

  if (state.combo.itemId === type.id) {
    state.combo.count = Math.min(state.combo.count + 1, 5);
  } else {
    state.combo.itemId = type.id;
    state.combo.count = 1;
  }

  return state.combo.count;
}

function isHarmItem(type) {
  return type.kind === "risk" || type.kind === "x-risk";
}

function isUnderMatchingInfluence(type) {
  const e = state.effects;
  if (type.id === "wobble") return e.wobble > 0.18;
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
  s.items.push(item);
  if (isXItemType(type)) {
    playHeroItemSpawnSound();
  }
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
  for (const p of state.trail) {
    if (wrappedDistance(p, item) < 34) return false;
  }
  for (const existing of state.items) {
    if (wrappedDistance(existing, item) < 54) return false;
  }
  return true;
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
  return clamp(unscaledScore() / LEVEL_ONE_TARGET, 0, 1);
}

function updateHud() {
  const score = state ? state.score : 0;
  scoreEl.textContent = String(score);
  levelEl.textContent = "1";
  levelProgressEl.style.setProperty("--progress", levelProgress().toFixed(3));
}

function slowMoFactor() {
  if (state.slowMo <= 0) return 1;
  return 0.48;
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
  gameWrap.style.setProperty("--influence-glow", influence.toFixed(3));
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

function steppedNoise(value) {
  return Math.sin(Math.floor(value) * 12.9898) * 0.5 + Math.sin(Math.floor(value * 0.47) * 78.233) * 0.5;
}

function isSnapMode() {
  return running && state && state.effects.snap > SNAP_MODE_THRESHOLD;
}

function snapTurn(direction) {
  state.angle = normalizeAngle(Math.round(state.angle / SNAP_TURN) * SNAP_TURN + direction * SNAP_TURN);
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
  if (event.code === "Space") {
    event.preventDefault();
    if (briefingPending) {
      beginBriefedGame();
    } else if (!running) {
      startGame();
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
startButton.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
  startMusic();
});
startButton.addEventListener("click", startGame);
briefingStartButton.addEventListener("click", beginBriefedGame);
musicOnButton.addEventListener("click", () => setMusicEnabled(true));
musicOffButton.addEventListener("click", () => setMusicEnabled(false));
soundOnButton.addEventListener("click", () => setSoundEnabled(true));
soundOffButton.addEventListener("click", () => setSoundEnabled(false));
restartButton.addEventListener("click", startGame);
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
