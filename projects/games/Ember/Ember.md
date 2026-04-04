# Ember of Self

*A flame carried in silence.*

## Overview

Ember of Self is a narrative browser game built as a single HTML file with a custom JavaScript engine inspired by Twine/Harlowe. The player carries a fragile ember through a frozen, quiet world — and the way they interact with the game (their pacing, stillness, and urgency) directly shapes the flame, the story, and what they lose along the way.

The game explores themes of **patience**, **identity**, **sacrifice**, and **indirect storytelling** — the world reveals itself through objects and environment rather than exposition.

---

## Story Path

The vertical slice spans **four nodes**, progressing from a frozen void toward warmth.

### Node 1: The Awakening

You wake in a cold, ice-blue void. A tiny ember hovers near your chest. Your robe has intricate patterns on its hem. The world is silent.

- **Breathe** → The Breathing Ritual stabilizes the ember (flame intensity rises from 20 → 45).
- **Look around the cave** → You discover a clay pot with patterns matching your robe's embroidery — *you have been here before*.
  - **Examine the clay pot** → Lore moment. The patterns match your sleeves. A hint of a cyclical past.
  - **Move toward the light** → Proceed to Node 2.

### Node 2: The High Cost of Rushing

A bright light shines from the cave exit. Two choices appear:

| Choice | What Happens |
|--------|-------------|
| **Sprint toward the exit** | If clicked within 1.5 seconds → **RUSHING DETECTED**. The flame snuffs out. You're forced into a sacrifice decision. |
| **Walk steadily toward the light** | Safe passage. The ember hums. You exit the cave. |

#### The Sacrifice Branch (if rushed)

The flame dies. Darkness. You're offered a choice:

- **Sacrifice a Fragment of Self** → One journal pip is permanently lost. Max flame intensity drops by 15%. The ember reignites, but dimmer.
- **Refuse** → The darkness presses in. Silence grows. Eventually you're presented with the sacrifice again — there is no other way forward.

### Node 3: The Forest Edge

You emerge into a frozen, skeletal forest. Unlit fire pits dot the landscape — evidence of a culture that once kept fires burning. Two paths:

- **Investigate the stone ruin** → A mural showing figures standing in a circle around a bonfire. *"The goal is not the flame. It is the circle."*
- **Search the fire pits** → You find a chipped porcelain bowl. This triggers the **Thermal/Lingering mechanic**.

#### The Bowl & Lingering Branch

A thermal timer begins. The flame grows hotter the longer you hold still:

| Choice | Outcome |
|--------|---------|
| **Set it down and keep moving** | Safe. Timer stops. Continue to Node 4. |
| **Study it closely** | Timer keeps running. The warmth becomes uncomfortable. |
| **Just a moment longer...** | Thermal threshold forced to 85%+. The ember overheats and dies. |

If the ember overheats (thermal reaches 100%): heat shimmer fills the screen, the ember falls and dies. You must **breathe it back to life** — but the revived flame is smaller and weaker (intensity 25 vs original 45).

### Node 4: The Silent Encounter

The color palette shifts from ice-blue to pale gold. You see a silhouette — another traveler — who disappears behind a ridge.

- **Follow** → The wind carries a distant flute (or tabla). You find a dormant brazier in a clearing.
- **Light the brazier** → The frost retreats. Stone turns to warm gold. The world thaws around you.
- **Sit and meditate** → The silence becomes warm. *Fragment of Self: The Circle* is unlocked.

#### Ending

Final stats are displayed:
- Fragments sacrificed (if any)
- Maximum flame intensity remaining

The screen fades to gold with the closing line:  
> *"The fire remembers what the mind forgets."*

The player can choose to **Begin again**.

---

## Mechanics

### The Ember (Particle Flame System)

The flame is rendered on a `<canvas>` element using a real-time particle system with three particle types:

- **FlameParticle** — Main flame body. Color varies by life and position:
  - **Center/base (hottest):** Blue-white
  - **Mid-flame:** Bright yellow
  - **Edges/tips (coolest):** Orange to deep red
- **Spark** — Small bright particles that shoot upward or sideways.
- **AshParticle** — Grey drifting particles emitted when the flame is dead or nearly extinguished.

### Mouse Speed → Flame Behavior

The game tracks mouse (and touch) movement speed in real time:

| Mouse State | Flame Behavior |
|-------------|---------------|
| **Still / slow** | Burns brighter and taller. Tight particle column, large blue-white core, warm glow. Ash clears away. |
| **Fast movement** | Flame flickers out. Particles scatter sideways, barely rise, die quickly. Core shrinks to a dim smudge. Desperate sputter sparks. Ash appears. |

The transition is smooth and continuous — the flame responds like a real candle to wind.

### Rushing Detection

When choice options appear, a timestamp is recorded. If the player clicks within **1.5 seconds**, it's detected as rushing:

- The flame **snuffs out** immediately.
- The player must **sacrifice a Fragment of Self** (a journal pip) to reignite it.
- Sacrificing permanently reduces **max flame intensity** by 15%.

### Thermal / Lingering System

During the bowl examination in Node 3, a thermal timer runs every 500ms:

- `thermalThreshold` increases by 2 each tick (0 → 100).
- Flame intensity also rises by 1 each tick.
- At **60%**: A heat shimmer overlay appears.
- At **100%**: The ember **overheats and dies**. The player must breathe it back to life (long revival sequence), and the revived flame is significantly weaker.

A **flame bar** UI element shows the thermal threshold in real time. It turns red/danger above 75%.

### Idle Reminder

If the player does nothing for **10 seconds**, the ember container begins pulsing — a gentle visual nudge to act without breaking immersion.

### Identity Stats (Journal Pips)

Five dots displayed in the top-left corner represent `maxIdentityStats`. These are **Fragments of Self** — pieces of the player's identity:

- Start at **5/5**.
- Each sacrifice costs **1 pip** (permanently lost).
- Losing pips also reduces the **maximum flame intensity** ceiling.
- The final meditation passage reflects on how many were lost.

### Breathing Ritual

At key moments the player is prompted to "Breathe." This is not a timer or QTE — it's a deliberate pause. Clicking "Breathe" stabilizes or revives the ember and advances the story.

### World Thaw

A `worldThaw` variable (0 → 1) tracks environmental progression:

| Value | Visual State |
|-------|-------------|
| 0 | Ice-blue, frozen, silent |
| 0.3 | Pale gold bleeds into edges |
| 0.6 | Wind shifts, music hints |
| 1.0 | Full thaw — warm gold, frost retreats |

CSS themes (`ice-theme`, `threshold-theme`, `forest-theme`, `gold-shift-theme`, `thaw-theme`) are applied to the `<body>` to shift the entire color palette.

### Text System

- Text appears one line at a time with a **dissolve-in animation** (0.8s ease).
- Each new line **fades out the previous** and **fades in** at the same fixed position — no scrolling or stacking.
- Reading delay is **automatically calculated** from word count: `800ms base + 120ms per word`, clamped between 1000ms–4000ms.
- Choice buttons appear in a **fixed area** below the text, always in the same spot.

### Screen Transitions

- **Fade to black / fade from black**: Used between major scene changes (0.8s transition).
- **Heat overlay**: A semi-transparent orange shimmer that activates during thermal danger.

---

## Story Flow Diagram

```
[Title]
  │
  ▼
[Awakening] ─── Breathe ──→ [Breathing Ritual]
                                    │
                                    ▼
                              [Cave Look]
                              ┌─────┴─────┐
                              ▼           ▼
                        [Examine Pot]  [Cave Threshold]
                              │           │
                              └─────┬─────┘
                                    ▼
                           [Cave Threshold]
                           ┌───────┴───────┐
                           ▼               ▼
                    [Sprint/Rush]    [Walk Steady]
                        │               │
                        ▼               │
                    [Rushed]            │
                  ┌────┴────┐          │
                  ▼         ▼          │
            [Sacrifice] [Refuse]       │
                  │         │          │
                  │    (loops back)    │
                  ▼                    │
            [Cave Exit] ◄─────────────┘
                  │
                  ▼
            [Forest Edge]
            ┌─────┴──────┐
            ▼            ▼
      [Mural]      [Find Bowl]
            │       ┌────┴────┐
            │       ▼         ▼
            │  [Set Down]  [Study Bowl]
            │       │      ┌────┴─────┐
            │       │      ▼          ▼
            │       │  [Put Down]  [Linger More]
            │       │      │          │
            │       │      │          ▼
            │       │      │  [Lingered Too Long]
            │       │      │          │
            │       │      │          ▼
            │       │      │  [Breathing Revival]
            │       │      │          │
            └───┬───┴──────┴──────────┘
                ▼
        [Silent Encounter]
                │
                ▼
        [Follow Silhouette]
                │
                ▼
        [Light Brazier]
                │
                ▼
          [Meditation]
                │
                ▼
         End of Vertical Slice
              (loop)
```

---

## Tech Stack

- **Single HTML file** — no dependencies, no build step
- **Vanilla JavaScript** — custom passage engine, async/await flow
- **Canvas 2D** — real-time particle flame with ~60fps animation loop
- **CSS themes** — body class swaps for environment shifts
- **Pointer tracking** — mousemove/touchmove for flame reactivity
