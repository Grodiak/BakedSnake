# Baked Snake - First Design

## Core Pitch

Baked Snake is a quirky, slightly adult arcade snake game about chasing a high score through increasingly bad snack decisions. The snake moves smoothly in 360 degrees instead of classic grid steps. Risky pickups give more points and growth, but they make the snake harder to control. Cleansing pickups help reduce the chaos, but they also make the snake faster.

The emotional loop is:

> I can probably survive one more bad idea.

## Design Locks

- Smooth continuous steering.
- Keyboard prototype first, iPhone-friendly later.
- Multiple items visible at once.
- Cartoon-coded substances instead of literal names.
- Risky items give higher score, more growth, and stronger control effects.
- Cleansing items give low score, tiny growth, and reduce chaos.
- Cleansing items also increase speed.
- Cleanses are intentionally rare so they feel like relief when they appear.
- Harmful effects fade over time, so the player can sometimes ride out the chaos instead of cleansing.
- The world starts empty, then pickups appear one at a time.
- Pickups expire after a short time, so the player can avoid a bad board and wait for a better set.
- More valuable pickups expire faster than lower-value pickups.
- Arena wraps at the edges.
- Death happens only by self-collision.
- HUD uses playful labels instead of technical meters.
- Local high score first.
- Global or friend leaderboards can come later through iPhone/Game Center support.
- Same-item risky pickup combos are in the prototype now and can be tuned later.
- Background music starts on player input, jumps to the beat drop, and loops back to that point when the track ends.

## Current Item Set

For the early prototype, item visuals are intentionally plain:

- Blue pickups are help/cleanse items.
- Red pickups are harm/risk items.
- Numbers show strength inside each category: 1 is mild, 3 is strongest.

| Item | Type | Points | Growth | Effect |
| --- | --- | ---: | ---: | --- |
| Blue 1 / Bean Shot | Cleanse | 500 | Medium | Reduces chaos slightly, adds a noticeable permanent speed bump |
| Blue 2 / Zap Can | Cleanse | 800 | Medium | Reduces more chaos, adds a larger permanent speed bump |
| Blue 3 / Buzz Tabs | Cleanse | 1000 | Large | Strong cleanse, adds a major permanent speed bump and slight twitch |
| Blue X | Ultra-rare Cleanse | 2500 | Shrinks snake | Fully cleanses effects, cuts snake size, and gives a 7-10 second slow-mo window |
| Red 1 / Wobble Juice | Risk | 2500 | Huge | Adds stacking side-to-side wobble |
| Red 2 / Rainbow Tabs | Risk | 6000 | Massive | Adds wave steering, trippy color bands, and visual distortion |
| Red 3 / Zoom Dust | Risk | 7500 | Massive | Adds a strong speed bump and jitter, then temporarily switches controls to 45-degree tap turns |
| Red X | Ultra-rare Risk | 24000 | Extreme | Mega points, huge growth, and stacks multiple harsh effects at once |

Same-item risky pickups can earn combo multipliers when collected while the matching effect is still active. Repeating the same red item can build from x2 up to x5.

X items are ultra rare and only start spawning once the run has matured: the score, snake length, and game speed must all be high enough. This keeps Blue X from becoming an early-run trap before there is enough snake body to safely shrink.

## Visual Frame

The prototype uses a neon arcade frame image as the first UI direction. Live score, highscore, condition text, and the game canvas are positioned over the frame so the data remains dynamic while the style comes from the artwork.

The current frame has a normal and heavily influenced snake-art variant. Only the left snake-art region crossfades to the influenced variant so the full background does not visibly jump.

The title screen is a separate full-art overlay with a clickable start region over the artwork's "Press Start" menu. It keeps the full title composition visible instead of forcing it into the wider gameplay cabinet aspect ratio. The title screen also shows the current local high score, removes the unused "Insert Coin" prompt, and uses slow neon pulse layers so the menu feels alive before the run starts.

The left cabinet snake also has a transparent foreground cutout layer generated from the real background art. This keeps the snake head/tongue above the playfield without using a hand-drawn approximation or exposing the source placeholder/checker pixels.

The main menu covers the baked menu-board text and redraws the button labels as controlled neon text. Hovering "Press Start" adds a text-shaped glow and clicking it starts the game. Music defaults to ON, with ON/OFF acting as a real toggle; the active word glows and OFF pauses the background track. Sound FX has matching menu toggle behavior as a visual placeholder until effects are added.

After a crash, the game does not return to the title screen. It shows a neon death panel directly over the playfield with the run score, high score, and a quick Play Again prompt so the player stays in the run/retry flow.

## Audio Direction

The current prototype uses "Coin Clash" as background music. It begins around 51 seconds when the beat drops, then loops back to that same beat-drop point after the song ends so the intro does not replay every cycle.

The menu attempts to start music immediately on the title screen. If the browser blocks automatic audio, any title-screen click or key press unlocks the music before or while starting the game.

## HUD Style

The game should not show clinical meters like "drunk 70%" or "speed 1.4x".

The HUD should sit outside the playable arena so the world boundary belongs to the game area, not the score UI.

It should show:

- Score
- Highscore
- Current Level
- Level progress bar

Example:

```text
Score
124000

Highscore
226600

Current Level
1 [======----]
```

The first pass treats Level 1 as the whole current game. The progress bar fills over the first 100,000 displayed points, and dying resets the run back to Level 1 while the highscore remains.

## Retired HUD Condition Labels

The older condition labels were useful for prototyping the vibe, but the HUD is moving toward a cleaner arcade layout. Influence is now communicated mostly through motion, background pulse, item behavior, and player feel rather than status text.

## First Prototype Goals

The first prototype should answer these questions:

1. Is smooth snake steering fun?
2. Does wrapping make recovery more interesting?
3. Do risky pickups feel tempting?
4. Do cleansing pickups feel helpful but not free?
5. Does the game naturally escalate into funny disaster?

If those answers are mostly yes, the next phase can add stronger visual identity, sound, combo effects, and eventually mobile controls.
