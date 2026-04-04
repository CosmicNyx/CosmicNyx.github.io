// ==========================================================
//  EMBER OF TRUTH - Twine-style engine (Equivocal coding style)
// ==========================================================

// ===== GAME STATE =====
const state = {
    maxIdentityStats: 5,        // total journal pips displayed
    currentStats: 5,            // pips currently alive (decrements on sacrifice)
    thermalThreshold: 0,        // 0-100; ticks up while player lingers in certain passages
    worldThaw: 0,               // 0-1; shifts environment palette from ice to gold as game progresses
    flameAlive: true,
    flameIntensity: 50,         // 0-100; drives particle density and glow
    maxFlameIntensity: 100,     // permanently reduced each time the player sacrifices
    hasBreathed: false,         // tracks whether breathing ritual was completed
    hasSacrificed: false,
    optionsShownTime: null,     // timestamp when choices appeared — used for rush detection
    rushCount: 0,               // number of times player clicked a choice too quickly
    currentPassage: null,
    timers: [],                 // all active setTimeout/setInterval IDs — cleared on passage change
    idleTimer: null,
    thermalTimer: null,
    lastPassageBeforeDeath: null, // passage to return to after reigniting
    hasSeenFlameHelp: false,    // gates the first-death help scene (shows once ever)
    stressEnabled: false,       // disabled on title; enabled once game begins
};

// ===== DOM REFS =====
const passageEl = document.getElementById('passage-container');
const textArea = document.getElementById('text-area');
const choicesArea = document.getElementById('choices-area');
const flameCanvas = document.getElementById('flame-canvas');
const flameCtx = flameCanvas.getContext('2d');
const emberBarFill = document.getElementById('ember-bar-fill');
const emberContainer = document.getElementById('ember-container');
const flameBarContainer = document.getElementById('flame-bar-container');
const flameBar = document.getElementById('flame-bar');
const heatOverlay = document.getElementById('heat-overlay');
const screenFade = document.getElementById('screen-fade');
const journalContainer = document.getElementById('journal-container');
const historyBtn = document.getElementById('history-btn');
const historyDrawer = document.getElementById('history-drawer');
const historyClose = document.getElementById('history-close');
const historyLog = document.getElementById('history-log');

// ===== TEXT ADVANCE MODE =====
// autoText=true: text advances on its own (click also works). false: must click.
let autoText = true;
let _advanceHandler = null;
let _clickPending = false; // manual mode: click was earned by last showText, consume before next

// ===== DEV MODE (Shift+Click to toggle) =====
let devMode = false;
const devIndicator = document.getElementById('dev-indicator');
document.addEventListener('click', (e) => {
    if (e.shiftKey) {
        devMode = !devMode;
        devIndicator.style.opacity = devMode ? '1' : '0';
    }
});

// ===== HISTORY LOG =====
const textHistory = [];   // plain-text entries of all shown lines
let isPaused = false;
let _pauseResolvers = [];

function addToHistory(html) {
    const plain = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (plain.length > 1) textHistory.push(plain);
}

function openHistory() {
    isPaused = true;
    state._stressWas = state.stressEnabled;
    state.stressEnabled = false;
    stopFlameAnimation();
    historyDrawer.classList.add('open');
    historyBtn.classList.add('paused');
    historyBtn.textContent = 'resume';

    // Rebuild advance control
    const historyAdvance = document.getElementById('history-advance');
    historyAdvance.classList.remove('visible');
    historyAdvance.innerHTML = '';
    const advLbl = document.createElement('span');
    advLbl.className = 'adv-label';
    advLbl.textContent = 'text:';
    historyAdvance.appendChild(advLbl);
    [{ label: 'Auto', val: true }, { label: 'Manual', val: false }].forEach(opt => {
        const btn = document.createElement('span');
        btn.className = 'adv-btn';
        btn.textContent = opt.label;
        btn.style.opacity = autoText === opt.val ? '1' : '0.35';
        btn.addEventListener('click', () => {
            autoText = opt.val;
            historyAdvance.querySelectorAll('.adv-btn').forEach(b => {
                b.style.opacity = b.textContent === opt.label ? '1' : '0.35';
            });
        });
        historyAdvance.appendChild(btn);
    });

    // Rebuild log
    historyLog.innerHTML = '';
    textHistory.forEach(entry => {
        const d = document.createElement('div');
        d.className = 'history-entry';
        d.textContent = entry;
        historyLog.appendChild(d);
    });
    // Scroll to bottom (most recent)
    historyLog.scrollTop = historyLog.scrollHeight;

    // Fade in the advance control after the drawer slides in
    requestAnimationFrame(() => requestAnimationFrame(() => historyAdvance.classList.add('visible')));
}

function closeHistory() {
    isPaused = false;
    state.stressEnabled = state._stressWas !== undefined ? state._stressWas : state.stressEnabled;
    startFlameAnimation();
    historyDrawer.classList.remove('open');
    document.getElementById('history-advance').classList.remove('visible');
    historyBtn.classList.remove('paused');
    historyBtn.textContent = 'transcript';
    const resolvers = _pauseResolvers.splice(0);
    resolvers.forEach(r => r());
}

historyBtn.addEventListener('click', () => {
    if (isPaused) closeHistory(); else openHistory();
});
historyClose.addEventListener('click', closeHistory);

// ==========================================================
//  PARTICLE FLAME SYSTEM
// ==========================================================
const FLAME_W = 160, FLAME_H = 210;
const FLAME_CX = FLAME_W / 2, FLAME_BASE_Y = FLAME_H - 20;
let particles = [];
let sparks = [];
let flameAnimId = null;

// A single flame particle — spawned each frame based on flame intensity.
// More intense flame = wider spread, faster rise, larger size.
class FlameParticle {
    constructor(intensity, maxIntensity) {
        const ratio = Math.max(0.05, intensity / maxIntensity);
        const spread = 6 + ratio * 14;
        this.x = FLAME_CX + (Math.random() - 0.5) * spread;
        this.y = FLAME_BASE_Y;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = -(0.8 + Math.random() * 1.5) * (0.5 + ratio * 0.8);
        this.life = 1.0;          // 1=fresh (base), 0=dead (tip)
        this.decay = 0.015 + Math.random() * 0.025;
        this.size = (2 + Math.random() * 4) * (0.4 + ratio * 0.8);
        this.edgeFactor = Math.abs(this.x - FLAME_CX) / Math.max(1, spread * 0.5); // 0=center, 1=edge
    }
    update() {
        this.x += this.vx + (Math.random() - 0.5) * 0.3;
        this.y += this.vy;
        this.vy *= 0.99;
        this.vx *= 0.98;
        this.life -= this.decay;
        this.size *= 0.995;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = this.life * 0.85;
        const t = this.life;
        const e = Math.min(1, this.edgeFactor);
        // Edge particles look cooler/dimmer — subtract edge influence from life before picking color
        const effective = Math.max(0, t - e * 0.35);
        // Four color zones by 'effective' (life adjusted for edge distance):
        //   >0.75  blue-white  — hottest base center
        //   0.45-0.75  yellow-orange  — mid flame body
        //   0.2-0.45  orange-red  — outer body / tips
        //   <0.2   dark red  — dying sparks at edges
        let r, g, b;
        if (effective > 0.75) {
            const f = (effective - 0.75) / 0.25;
            r = Math.floor(180 + f * 75);
            g = Math.floor(200 + f * 55);
            b = Math.floor(220 + f * 35);
        } else if (effective > 0.45) {
            const f = (effective - 0.45) / 0.3;
            r = 255;
            g = Math.floor(180 + f * 20);
            b = Math.floor(20 + f * 200);
        } else if (effective > 0.2) {
            const f = (effective - 0.2) / 0.25;
            r = 255;
            g = Math.floor(80 + f * 100);
            b = Math.floor(5 + f * 15);
        } else {
            const f = effective / 0.2;
            r = Math.floor(150 + f * 105);
            g = Math.floor(20 + f * 60);
            b = Math.floor(f * 5);
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
    }
}

class Spark {
    constructor(intensity, maxIntensity) {
        const ratio = Math.max(0.05, intensity / maxIntensity);
        this.x = FLAME_CX + (Math.random() - 0.5) * (4 + ratio * 10);
        this.y = FLAME_BASE_Y - Math.random() * 10;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -(1.5 + Math.random() * 3) * (0.4 + ratio * 0.6);
        this.life = 1.0;
        this.decay = 0.03 + Math.random() * 0.04;
        this.size = 0.8 + Math.random() * 1.5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02;
        this.life -= this.decay;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = this.life * 0.9;
        const r = 255;
        const g = Math.floor(120 + this.life * 135);
        const b = Math.floor(this.life * 180);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
    }
}

class AshParticle {
    constructor() {
        this.x = FLAME_CX + (Math.random() - 0.5) * 12;
        this.y = FLAME_BASE_Y;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(0.1 + Math.random() * 0.4);
        this.life = 1.0;
        this.decay = 0.008 + Math.random() * 0.01;
        this.size = 1 + Math.random() * 2;
    }
    update() {
        this.x += this.vx + (Math.random() - 0.5) * 0.2;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.998;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        const alpha = this.life * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 100, 80, ${alpha})`;
        ctx.fill();
    }
}

let ashParticles = [];

let mouseX = 0, mouseY = 0, prevMouseX = 0, prevMouseY = 0;
let mouseSpeed = 0;
let mouseSpeedRaw = 0;
const MOUSE_SMOOTH = 0.22;

let windStress = 0;
let heatStress = 0;   // builds when flame is at max brightness too long
const WIND_BUILD_RATE      = 0.6;
const WIND_DECAY_RATE      = 0.08;
const INTENSITY_RISE_RATE  = 0.22;   // gentle movement feeds oxygen → brighter
const INTENSITY_DRAIN_RATE = 0.022;  // stillness starves oxygen → dimmer
const HEAT_BUILD_RATE      = 0.18;   // rate heatStress rises when at max brightness
const HEAT_DECAY_RATE      = 0.09;
const STRESS_KILL_THRESHOLD = 100;
const SPUTTER_REVIVE_MS  = 3000;

let sputterRecoveryActive = false;
let sputterRecoveryStart = 0;
let sputterTargetIntensity = 50;
let overheatFlash = 0;  // 0-1, drives white burst on flame canvas

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
});

function updateMouseSpeed() {
    const dx = mouseX - prevMouseX;
    const dy = mouseY - prevMouseY;
    mouseSpeedRaw = Math.sqrt(dx * dx + dy * dy);
    mouseSpeed = mouseSpeed + (mouseSpeedRaw - mouseSpeed) * MOUSE_SMOOTH;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

// Returns 0 (completely still) to 1 (very fast movement)
function getMouseInfluence() {
    return Math.min(1, mouseSpeed / 40);
}

let flameOpacity = 1;   // 0-1, drives canvas CSS opacity for wind-kill fade

function updateStressMeters() {
    if (!state.stressEnabled) return;
    if (!state.flameAlive) return;

    const mi = getMouseInfluence();

    // WIND: too fast builds wind stress
    if (mi > 0.5) {
        const excess = (mi - 0.5) / 0.5;
        windStress = Math.min(STRESS_KILL_THRESHOLD, windStress + WIND_BUILD_RATE * excess);
    } else {
        windStress = Math.max(0, windStress - WIND_DECAY_RATE);
    }

    // INTENSITY: gentle movement feeds oxygen (rises), stillness or excess speed drains it
    if (mi < 0.02) {
        // No movement — flame suffocates, slowly dims
        state.flameIntensity = Math.max(0, state.flameIntensity - INTENSITY_DRAIN_RATE);
    } else if (mi <= 0.5) {
        // Gentle movement — oxygen feeds the flame, grows brighter
        state.flameIntensity = Math.min(state.maxFlameIntensity,
            state.flameIntensity + INTENSITY_RISE_RATE * (mi / 0.5));
    } else if (mi > 0.5) {
        // Too fast — wind steals heat quickly, but only while actively fast
        const excess = (mi - 0.5) / 0.5;
        state.flameIntensity = Math.max(0, state.flameIntensity - INTENSITY_DRAIN_RATE * 2.5 * excess);
    }

    // HEAT STRESS: flame held at max brightness too long → burns out
    if (state.flameIntensity >= state.maxFlameIntensity) {
        heatStress = Math.min(STRESS_KILL_THRESHOLD, heatStress + HEAT_BUILD_RATE);
    } else {
        heatStress = Math.max(0, heatStress - HEAT_DECAY_RATE);
    }

    // DEATH — no movement: flame starves of oxygen
    if (state.flameIntensity <= 0 && state.flameAlive) {
        windStress = 0; heatStress = 0;
        state.lastPassageBeforeDeath = state.currentPassage;
        killFlame();
        flameCanvas.classList.add('dead');
        const t = setTimeout(() => goToPassage('no_movement_killed'), 900);
        state.timers.push(t);
    }

    // DEATH — too bright: white flash on canvas then burns out
    if (heatStress >= STRESS_KILL_THRESHOLD) {
        windStress = 0; heatStress = 0;
        state.lastPassageBeforeDeath = state.currentPassage;
        overheatFlash = 1.0;
        state.flameAlive = false;
        heatOverlay.classList.remove('active');
        const t1 = setTimeout(() => {
            particles = []; sparks = [];
            flameCanvas.classList.add('dead');
            const t2 = setTimeout(() => goToPassage('brightness_killed'), 900);
            state.timers.push(t2);
        }, 350);
        state.timers.push(t1);
    }

    // DEATH — too fast: wind blows it out
    if (windStress >= STRESS_KILL_THRESHOLD) {
        windStress = 0; heatStress = 0;
        state.lastPassageBeforeDeath = state.currentPassage;
        killFlame();
        flameCanvas.classList.add('dead');
        const t = setTimeout(() => goToPassage('wind_killed'), 900);
        state.timers.push(t);
    }
}

function flameLoop() {
    updateMouseSpeed();
    updateStressMeters();

    // Sputter recovery: slowly grow flame from tiny spark back to normal
    if (sputterRecoveryActive && state.flameAlive) {
        const progress = Math.min(1, (Date.now() - sputterRecoveryStart) / SPUTTER_REVIVE_MS);
        state.flameIntensity = 5 + (sputterTargetIntensity - 5) * progress;
        if (progress >= 1) sputterRecoveryActive = false;
    }

    flameCtx.clearRect(0, 0, FLAME_W, FLAME_H);

    // Always render flame particles while flameAlive
    // (when dead, canvas fades via CSS opacity — we just stop spawning)
    if (state.flameAlive) {
        const intensity = state.flameIntensity;
        const maxI = state.maxFlameIntensity;
        const ratio = Math.max(0.05, intensity / maxI);
        const mi = getMouseInfluence();   // 0=still, 1=fast
        const calm = 1 - mi;             // 1=still, 0=fast

        // Lateral jitter — fast mouse shakes the flame side to side
        const flickerX = mi * mi * (Math.random() - 0.5) * 20;
        const flickerY = mi * (Math.random() - 0.5) * 8;

        // calm² gives a steeper curve: slight movement barely dims it,
        // but fast movement collapses brightness sharply
        const visBrightness = calm * calm;
        // effRatio combines actual intensity with visual suppression from speed
        const effRatio = ratio * (0.12 + visBrightness * 0.88);

        // Spawn particles — more when still (tall column), fewer+shorter when fast (flicker)
        const spawnCount = Math.max(0, Math.floor((1 + effRatio * 7) * (0.05 + calm * 0.95)));
        for (let i = 0; i < spawnCount; i++) {
            const p = new FlameParticle(intensity, maxI);
            p.x += flickerX * 0.5 + (Math.random() - 0.5) * mi * 20;
            p.y += flickerY * 0.4;
            p.vx += (Math.random() - 0.5) * mi * 3.5;
            // Still = tall rise; fast = barely rises (gets blown sideways)
            p.vy *= (0.25 + calm * 1.1);
            p.size *= (0.25 + calm * 1.05);
            p.decay += mi * 0.05;
            // Fast: particles start dim (skip hot blue-white base zone)
            if (mi > 0.25) p.life = Math.max(0.12, 1.0 - mi * 0.7);
            particles.push(p);
        }

        // Still: steady upward sparks. Fast: desperate sideways sputters
        if (calm > 0.55 && Math.random() < 0.08 + effRatio * 0.12) {
            const s = new Spark(intensity, maxI);
            s.vx *= 0.3;
            sparks.push(s);
        }
        if (mi > 0.45 && Math.random() < mi * 0.28) {
            const s = new Spark(intensity, maxI);
            s.vx = (Math.random() - 0.5) * 6;
            s.vy *= 0.3;
            s.decay += 0.04;
            sparks.push(s);
        }

        // Glow halo — large + warm when still, tiny + dim when fast
        const glowRadius = (8 + effRatio * 35) * (0.2 + calm * 0.8);
        const glowAlpha  = (0.04 + effRatio * 0.28) * (0.08 + calm * 0.92);
        const glowCX = FLAME_CX + flickerX * 0.25;
        const glow = flameCtx.createRadialGradient(glowCX, FLAME_BASE_Y, 0, glowCX, FLAME_BASE_Y, Math.max(1, glowRadius));
        glow.addColorStop(0,    `rgba(210, 230, 255, ${Math.max(0, glowAlpha * 0.85)})`);
        glow.addColorStop(0.25, `rgba(255, 240, 180, ${Math.max(0, glowAlpha * 0.6)})`);
        glow.addColorStop(0.6,  `rgba(255, 120, 20,  ${Math.max(0, glowAlpha * 0.3)})`);
        glow.addColorStop(1,    'rgba(150, 30, 0, 0)');
        flameCtx.fillStyle = glow;
        flameCtx.fillRect(0, 0, FLAME_W, FLAME_H);

        // Hot core — blue-white when calm, dim orange smudge when fast
        const coreSize = Math.max(0.5, (2 + effRatio * 7) * (0.1 + calm * 0.9));
        const coreCX = FLAME_CX + flickerX * 0.12;
        const coreCY = FLAME_BASE_Y + flickerY * 0.12;
        const coreGlow = flameCtx.createRadialGradient(coreCX, coreCY, 0, coreCX, coreCY, coreSize);
        if (calm > 0.65) {
            coreGlow.addColorStop(0,   `rgba(215, 235, 255, ${0.92 * calm})`);
            coreGlow.addColorStop(0.3, `rgba(255, 252, 200, ${0.7  * calm})`);
            coreGlow.addColorStop(0.7, `rgba(255, 150, 40,  ${0.4  * calm})`);
            coreGlow.addColorStop(1,   'rgba(200, 60, 0, 0)');
        } else if (calm > 0.25) {
            coreGlow.addColorStop(0,   `rgba(255, 220, 120, ${0.45 * calm})`);
            coreGlow.addColorStop(0.5, `rgba(255, 120, 30,  ${0.28 * calm})`);
            coreGlow.addColorStop(1,   'rgba(180, 40, 0, 0)');
        } else {
            coreGlow.addColorStop(0,   `rgba(170, 55, 10, ${0.18 + calm * 0.25})`);
            coreGlow.addColorStop(1,   'rgba(90, 15, 0, 0)');
        }
        flameCtx.beginPath();
        flameCtx.arc(coreCX, coreCY, coreSize, 0, Math.PI * 2);
        flameCtx.fillStyle = coreGlow;
        flameCtx.fill();

        // Ash when moving very fast or near heat-death
        if (mi > 0.65 && Math.random() < mi * 0.2) ashParticles.push(new AshParticle());
        if (heatStress > 70 && Math.random() < 0.15) ashParticles.push(new AshParticle());

        // Heat overlay when approaching brightness-death
        if (heatStress > 65) {
            heatOverlay.classList.add('active');
        } else if (heatStress < 45 && windStress < 45) {
            heatOverlay.classList.remove('active');
        }

        if (mi > 0.1) ashParticles = ashParticles.filter(a => a.life > 0.5); // clear ash when moving again
    }
    // (dead: canvas fades via CSS, we just stop adding particles)

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(flameCtx);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
        sparks[i].update();
        sparks[i].draw(flameCtx);
        if (sparks[i].life <= 0) sparks.splice(i, 1);
    }
    for (let i = ashParticles.length - 1; i >= 0; i--) {
        ashParticles[i].update();
        ashParticles[i].draw(flameCtx);
        if (ashParticles[i].life <= 0) ashParticles.splice(i, 1);
    }

    // Overheat canvas flash — white burst on the flame canvas only, not the screen
    if (overheatFlash > 0) {
        const fa = overheatFlash * 0.92;
        const burst = flameCtx.createRadialGradient(FLAME_CX, FLAME_BASE_Y - 12, 0, FLAME_CX, FLAME_BASE_Y, 58);
        burst.addColorStop(0,   `rgba(255, 255, 255, ${fa})`);
        burst.addColorStop(0.2, `rgba(255, 245, 210, ${fa * 0.75})`);
        burst.addColorStop(0.6, `rgba(255, 160, 40,  ${fa * 0.35})`);
        burst.addColorStop(1,   'rgba(200, 60, 0, 0)');
        flameCtx.fillStyle = burst;
        flameCtx.fillRect(0, 0, FLAME_W, FLAME_H);
        overheatFlash = Math.max(0, overheatFlash - 0.045);
    }

    updateEmberVisual();
    flameAnimId = requestAnimationFrame(flameLoop);
}

function startFlameAnimation() {
    if (!flameAnimId) flameLoop();
}
function stopFlameAnimation() {
    if (flameAnimId) { cancelAnimationFrame(flameAnimId); flameAnimId = null; }
}

startFlameAnimation();

// ===== UTILITY FUNCTIONS =====
function clearAllTimers() {
    state.timers.forEach(t => clearTimeout(t));
    state.timers = [];
    if (state.idleTimer) { clearInterval(state.idleTimer); state.idleTimer = null; }
    if (state.thermalTimer) { clearInterval(state.thermalTimer); state.thermalTimer = null; }
    sputterRecoveryActive = false;
    overheatFlash = 0;
    windStress = 0;
    heatStress = 0;
}

function waitIfPaused() {
    if (!isPaused) return Promise.resolve();
    return new Promise(resolve => _pauseResolvers.push(resolve));
}

function delay(ms) {
    if (devMode) ms = Math.min(ms, 300);
    return new Promise(resolve => {
        const t = setTimeout(async () => {
            await waitIfPaused();
            resolve();
        }, ms);
        state.timers.push(t);
    });
}

// How long a line stays on screen before fading — scales with word count.
// ~160ms per word, clamped between 1.4s and 5.5s.
function readingDelay(html) {
    const plain = html.replace(/<[^>]*>/g, '').trim();
    const words = plain.split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1400, Math.min(5500, 1000 + words * 160));
}

function cancelAdvanceClick() {
    if (_advanceHandler) {
        document.removeEventListener('click', _advanceHandler);
        _advanceHandler = null;
    }
    document.body.style.cursor = '';
}

function waitForAdvanceClick() {
    cancelAdvanceClick();
    if (!autoText) document.body.style.cursor = 'pointer';
    return new Promise(resolve => {
        _advanceHandler = (e) => {
            if (isPaused) return;
            if (e.button !== 0) return;
            if (e.shiftKey) return;
            if (e.target.closest('.choice-link')) return;
            if (e.target.closest('#history-drawer')) return;
            if (e.target.closest('#history-btn')) return;
            const h = _advanceHandler;
            _advanceHandler = null;
            document.removeEventListener('click', h);
            document.body.style.cursor = '';
            resolve();
        };
        document.addEventListener('click', _advanceHandler);
    });
}

// Fades out the current text, fades in the new text, then waits.
// Auto mode: waits readingDelay (or a click, whichever comes first).
// Manual mode: waits for a click before showing each new line.
async function showText(text, _container) {
    // Manual mode: consume the pending click BEFORE showing the next text.
    // This means choices after the last showText appear immediately — no click needed.
    if (!autoText && _clickPending) {
        _clickPending = false;
        await waitForAdvanceClick();
    } else {
        cancelAdvanceClick();
    }

    const existing = textArea.querySelector('.active-text');
    if (existing) {
        existing.classList.remove('dissolve');
        existing.classList.add('dissolve-out');
        await delay(350);
        existing.remove();
    }
    const span = document.createElement('span');
    span.className = 'dissolve active-text';
    span.innerHTML = text.replace(/^(<br\s*\/?>)+/g, '');
    textArea.appendChild(span);
    addToHistory(text);

    if (autoText) {
        const clickRace = waitForAdvanceClick();
        await Promise.race([delay(readingDelay(text)), clickRace]);
        cancelAdvanceClick();
    } else {
        _clickPending = true; // next showText (or goToPassage) will consume this
    }
    return span;
}

function dissolveText(text, _container) {
    const existing = textArea.querySelector('.active-text');
    if (existing) existing.remove();
    const span = document.createElement('span');
    span.className = 'dissolve active-text';
    span.innerHTML = text.replace(/^(<br\s*\/?>)+/g, '');
    textArea.appendChild(span);
    addToHistory(text);
    return span;
}

async function showFlameHelp(deathType) {
    state.hasSeenFlameHelp = true;
    const dim = 'color:rgba(180,205,225,0.48);';
    await showText(`<span style="${dim}">The flame follows your hand.</span>`, passageEl);
    if (deathType === 'wind') {
        await showText(`<span style="${dim}">Moving too fast steals the air — it blows out.</span>`, passageEl);
    } else if (deathType === 'bright') {
        await showText(`<span style="${dim}">The flame burned too bright for too long and consumed itself.</span>`, passageEl);
    } else {
        await showText(`<span style="${dim}">No movement, no oxygen — the flame starved.</span>`, passageEl);
    }
    await showText(`<span style="${dim}">Keep moving. Keep it fed. Keep it alive.</span>`, passageEl);

    await new Promise(resolve => {
        const link = document.createElement('span');
        link.className = 'choice-link dissolve';
        link.textContent = 'Open Your Palm';
        link.addEventListener('click', () => {
            link.remove();
            resolve();
        });
        choicesArea.appendChild(link);
    });

    choicesArea.innerHTML = '';
}


// Creates a clickable choice link. If opts.canRush is true and the player clicks
// within 1.5s of the options appearing, it redirects to the 'rushed' passage.
function addChoiceLink(text, targetPassage, _container, opts = {}) {
    _clickPending = false;
    cancelAdvanceClick();
    const link = document.createElement('span');
    link.className = 'choice-link dissolve';
    link.textContent = text;
    link.addEventListener('click', () => {
        const now = Date.now();
        const responseTime = state.optionsShownTime ? (now - state.optionsShownTime) / 1000 : 999;

        if (opts.canRush && responseTime < 1.5) {
            state.rushCount++;
            goToPassage('rushed');
            return;
        }

        if (opts.onSelect) opts.onSelect(responseTime);

        goToPassage(targetPassage);
    });
    choicesArea.appendChild(link);
}

// ===== EMBER VISUALS =====
function updateEmberVisual() {
    if (!state.flameAlive) {
        emberBarFill.style.width = '0%';
        return;
    }
    const ratio = state.flameIntensity / state.maxFlameIntensity;
    emberBarFill.style.width = (ratio * 100) + '%';
    if (ratio < 0.3) {
        emberBarFill.style.background = 'linear-gradient(to right, #661100, #cc3300)';
    } else if (ratio < 0.65) {
        emberBarFill.style.background = 'linear-gradient(to right, #cc3300, #ff8800)';
    } else {
        emberBarFill.style.background = 'linear-gradient(to right, #ff6600, #ffcc00)';
    }
}

function killFlame() {
    state.flameAlive = false;
    state.flameIntensity = 0;
    particles = [];
    sparks = [];
    heatOverlay.classList.remove('active');
    // canvas fade is handled by callers via flameCanvas.classList
}

function reviveFlame(intensity) {
    state.flameAlive = true;
    state.flameIntensity = intensity || 40;
    ashParticles = [];
    flameCanvas.classList.remove('dead');
    windStress = 0;
    heatStress = 0;
    heatOverlay.classList.remove('active');
}

// ===== FLAME BAR =====
function updateFlameBar() {
    flameBar.style.height = state.thermalThreshold + '%';
    if (state.thermalThreshold > 75) {
        flameBar.className = 'danger';
    } else {
        flameBar.className = '';
    }
}

// ===== JOURNAL PIPS =====
// Renders pips horizontally; if animate=true, each pip shines gold then settles
function renderJournal(animate) {
    journalContainer.innerHTML = '';
    for (let i = 0; i < state.maxIdentityStats; i++) {
        const pip = document.createElement('div');
        const isLost = i >= state.currentStats;
        pip.className = 'journal-pip' + (isLost ? ' lost' : '');
        if (animate && !isLost) {
            pip.classList.add('entering');
            pip.style.animationDelay = (i * 110) + 'ms';
        }
        journalContainer.appendChild(pip);
    }
}

async function flashPipsOnDeath() {
    const pips = [...journalContainer.querySelectorAll('.journal-pip:not(.lost)')];
    pips.forEach(p => p.classList.add('flash'));
    await delay(300);
    pips.forEach(p => p.classList.remove('flash'));
}

// Only the pip being lost lights up gold, bursts, then collapses to grey
async function animatePipLoss() {
    const pips = [...journalContainer.querySelectorAll('.journal-pip')];
    const dyingPip = pips[state.currentStats]; // index = new value = pip just lost
    if (!dyingPip || dyingPip.classList.contains('lost')) {
        renderJournal(false);
        return;
    }

    // Run the keyframe animation — starts from pip's current colour,
    // swells gold, bursts, then collapses to grey. 'forwards' keeps final frame.
    dyingPip.classList.add('sacrificing');
    await delay(1120);

    // Lock in as lost. The lost class matches the animation's 100% frame
    // (background #2a2a3a, opacity 0.35) so there is no visual snap.
    dyingPip.classList.add('lost');
}

// ===== THERMAL SYSTEM =====
// Used in passages where lingering is dangerous (e.g. light_brazier).
// Ticks up thermalThreshold every 500ms — hits 100 in ~25s → lingered_too_long.
function startThermalTimer() {
    flameBarContainer.style.display = 'block';
    state.thermalThreshold = 0;
    updateFlameBar();

    state.thermalTimer = setInterval(() => {
        if (!state.flameAlive || isPaused) return;
        state.thermalThreshold += 2;
        state.flameIntensity = Math.min(state.maxFlameIntensity, state.flameIntensity + 1);
        updateEmberVisual();
        updateFlameBar();

        if (state.thermalThreshold >= 60) {
            heatOverlay.classList.add('active');
        }

        if (state.thermalThreshold >= 100) {
            clearInterval(state.thermalTimer);
            state.thermalTimer = null;
            heatOverlay.classList.remove('active');
            goToPassage('lingered_too_long');
        }
    }, 500);
}

function stopThermalTimer() {
    if (state.thermalTimer) {
        clearInterval(state.thermalTimer);
        state.thermalTimer = null;
    }
    heatOverlay.classList.remove('active');
    flameBarContainer.style.display = 'none';
}

// ===== IDLE REMINDER =====
function startIdleReminder() {
    if (state.idleTimer) clearTimeout(state.idleTimer);
    emberContainer.classList.remove('pulsing');
    state.idleTimer = setTimeout(() => {
        emberContainer.classList.add('pulsing');
    }, 10000);
}

function stopIdleReminder() {
    if (state.idleTimer) clearTimeout(state.idleTimer);
    emberContainer.classList.remove('pulsing');
}

// ===== BODY THEME =====
let _lastLivingTheme = 'ice-theme';
function setTheme(theme) {
    if (theme !== 'death-theme') _lastLivingTheme = theme;
    document.body.className = theme;
}

function restoreTheme() {
    document.body.className = _lastLivingTheme;
}

// ===== SCREEN FADE =====
function fadeToBlack() {
    return new Promise(resolve => {
        screenFade.classList.add('active');
        const t = setTimeout(resolve, 800);
        state.timers.push(t);
    });
}
function fadeFromBlack() {
    return new Promise(resolve => {
        screenFade.classList.remove('active');
        const t = setTimeout(resolve, 800);
        state.timers.push(t);
    });
}
