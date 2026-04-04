// ==========================================================
//  PASSAGES
// ==========================================================

const passages = {};


// ---------- TITLE ----------
passages['title'] = async function() {
    setTheme('ice-theme');
    emberContainer.style.display = 'none';
    flameBarContainer.style.display = 'none';
    journalContainer.style.display = 'none';
    state.flameAlive = false;

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ('ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches);

    if (isMobile) {
        await delay(500);
        await showText('<div style="font-size:2em; font-weight:bold; margin: 0.5em 0; color:#c8dde8;">Ember of Self</div>', passageEl);
        const msg = document.createElement('div');
        msg.style.cssText = 'font-size:0.7em; color:#7a4a1e; line-height:1.6; max-width:340px; margin: 0 auto;';
        msg.innerHTML = 'This game requires a mouse and is not playable on mobile.<br><br>Please open it on a desktop or laptop.';
        choicesArea.appendChild(msg);
        return;
    }

    // ── STEP 1: Text advance option fades in before anything else ──
    await new Promise(resolve => {
        const wrapper = document.createElement('div');
        wrapper.className = 'dissolve';
        wrapper.style.cssText = 'text-align:center;';

        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:0.7em; color:#667; margin-bottom:0.7em; letter-spacing:0.08em;';
        lbl.textContent = 'Text Advance';
        wrapper.appendChild(lbl);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex; gap:1.8em; justify-content:center; margin-bottom:0.5em;';
        wrapper.appendChild(btnRow);

        const desc = document.createElement('div');
        desc.style.cssText = 'font-size:0.65em; color:#556; min-height:1.4em; margin-top:0.3em;';
        wrapper.appendChild(desc);

        const hint2 = document.createElement('div');
        hint2.style.cssText = 'font-size:0.52em; color:#3a4a55; margin-top:1.1em; line-height:1.6;';
        hint2.textContent = 'You can change this and view previous text in the transcript button at the top right.';
        wrapper.appendChild(hint2);

        const opts = [
            { label: 'Auto',   val: true,  hint: 'Text advances on its own. Click to skip ahead.' },
            { label: 'Manual', val: false, hint: 'Text waits for a click before continuing.' },
        ];

        function select(val) {
            autoText = val;
            btnRow.querySelectorAll('span').forEach(b => {
                b.style.opacity = (b.dataset.val === String(val)) ? '1' : '0.35';
            });
            desc.textContent = opts.find(o => o.val === val).hint;
        }

        opts.forEach(o => {
            const btn = document.createElement('span');
            btn.className = 'choice-link';
            btn.textContent = o.label;
            btn.dataset.val = String(o.val);
            btn.addEventListener('click', () => select(o.val));
            btn.style.opacity = autoText === o.val ? '1' : '0.35';
            btnRow.appendChild(btn);
        });
        desc.textContent = opts.find(o => o.val === autoText).hint;

        textArea.appendChild(wrapper);

        const confirmBtn = document.createElement('span');
        confirmBtn.className = 'choice-link dissolve';
        confirmBtn.textContent = 'Confirm';
        confirmBtn.addEventListener('click', () => resolve());
        choicesArea.appendChild(confirmBtn);
    });

    // ── STEP 2: Dissolve out the selector ──
    choicesArea.innerHTML = '';
    Array.from(textArea.children).forEach(el => {
        el.classList.remove('dissolve');
        el.classList.add('dissolve-out');
    });
    await new Promise(r => setTimeout(r, 400));
    textArea.innerHTML = '';

    // ── STEP 3: Title text ──
    await delay(300);
    await showText('<div style="font-size:0.6em; color:#556;">A flame carried in silence</div>', passageEl);
    await showText('<div style="font-size:2em; font-weight:bold; margin: 0.5em 0; color:#c8dde8;">Ember of Self</div><div style="font-size:0.5em; color:#7a4a1e; margin-top:0.5em; letter-spacing:0.04em;">requires a mouse to play</div>', passageEl);



    addChoiceLink('Begin', 'awakening', passageEl);
};

// ---------- NODE 1: THE AWAKENING ----------
passages['awakening'] = async function() {
    setTheme('ice-theme');
    state.stressEnabled = false;   // stress starts AFTER "Breathe" is chosen
    journalContainer.style.display = 'flex';
    emberContainer.style.display = '';
    state.flameAlive = true;
    state.flameIntensity = 30;
    state.maxFlameIntensity = 100;
    flameCanvas.classList.remove('dead');
    windStress = 0;
    heatStress = 0;
    state.currentStats = state.maxIdentityStats;
    updateEmberVisual();
    // Pips not shown yet — appear after "Breathe"

    await delay(400);
    await showText('You wake in a cold, ice-blue void.', passageEl);
    await showText('<br><br>A tiny, dim ember hovers near your chest.', passageEl);
    await showText('<br><br>Your robe is dark blue - intricate patterns trace the hem.', passageEl);
    await showText('<br><br>Silence.', passageEl);
    await showText('<br><br><em style="color:#7a6040; font-size:0.85em;">Do not let the flame die.</em><br><span style="font-size:0.65em; color:#445566; display:block; margin-top:0.5em; line-height:1.6;">Move your mouse gently and keep moving forward to keep it alive.</span>', passageEl);
    await showText('<br><br><span class="breathing-prompt">Breathe to stabilize the spark...</span>', passageEl);

    startIdleReminder();


    state.optionsShownTime = Date.now();
    addChoiceLink('Breathe', 'breathing_ritual', passageEl);
};

passages['breathing_ritual'] = async function() {
    stopIdleReminder();
    state.hasBreathed = true;
    state.flameIntensity = 45;
    state.playerMoved = true;
    state.stressEnabled = true;   // timer starts NOW
    windStress = 0;
    heatStress = 0;
    updateEmberVisual();

    // Pips appear here with the gold-shine entrance
    renderJournal(true);

    await showText('You breathe.', passageEl);
    await showText('<br><br>Slowly.', passageEl);
    await showText('<br><br>The ember steadies - a faint warmth against the cold.', passageEl);
    await showText('<br><br>It floats closer, as if it knows you.', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Look around the cave', 'cave_look', passageEl);
};

passages['cave_look'] = async function() {
    await showText('You scan the dim cavern.', passageEl);
    await showText('<br><br>Vines creep along the walls.', passageEl);
    await showText('<br><br>Something is half-hidden among them - a <em>clay pot</em>, ancient and cracked.', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Examine the clay pot', 'examine_pot', passageEl);
    addChoiceLink('Move toward the light', 'cave_threshold', passageEl);
};

passages['examine_pot'] = async function() {
    await showText('You kneel beside the pot.', passageEl);
    await showText('<br><br>The ember drifts down, illuminating its surface.', passageEl);
    await showText('<br><br>The patterns on the pot...', passageEl);
    await showText('<br><br>They match the embroidery on your sleeves.', passageEl);
    await showText('<br><br><em style="color:#6688aa;">You have been here before.</em>', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Move toward the light at the cave exit', 'cave_threshold', passageEl);
};

// ---------- NODE 2: THE HIGH COST OF RUSHING ----------
passages['cave_threshold'] = async function() {
    setTheme('threshold-theme');

    await showText('A bright light shines from the cave exit.', passageEl);
    await showText('<br><br>Instinct pulls you forward. This is the way out.', passageEl);
    await showText('<br><br>The light is warm. Inviting.', passageEl);
    await showText('<br><br><span style="color:#667;">The ember flickers - it senses your eagerness.</span>', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Sprint toward the exit', 'cave_exit_approach', passageEl, { canRush: true });
    addChoiceLink('Walk steadily toward the light', 'cave_exit_approach', passageEl, { canRush: false });
};

passages['cave_exit_approach'] = async function() {
    await showText('You walk toward the light.', passageEl);
    await showText('<br><br>Each step is measured. The ember hums softly.', passageEl);
    await showText('<br><br>The cold begins to loosen its grip.', passageEl);
    await showText('<br><br>You step through.', passageEl);

    goToPassage('forest_edge');
};

passages['rushed'] = async function() {
    await fadeToBlack();
    killFlame();

    await delay(1000);
    await fadeFromBlack();
    setTheme('ice-theme');

    await showText('The flame wavers...', passageEl);
    await showText('<br><br>and snuffs out.', passageEl);
    await showText('<br><br>Darkness. Complete.', passageEl);
    await showText('<br><br>You cannot proceed without light.', passageEl);


    await showText('<em style="color:#aa7744;">"Sacrifice a Fragment of Self to Reignite?"</em>', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Sacrifice', 'sacrifice_accept', passageEl);
    addChoiceLink('Refuse', 'sacrifice_decline', passageEl);
};

passages['sacrifice_accept'] = async function() {
    state.hasSacrificed = true;
    state.currentStats = Math.max(1, state.currentStats - 1);
    state.maxFlameIntensity = Math.max(30, state.maxFlameIntensity - 15);
    await animatePipLoss();

    reviveFlame(35);
    restoreTheme();

    await showText('You feel something leave you.', passageEl);
    await showText('<br><br>A page in your journal fades to nothing.', passageEl);
    await showText('<br><br>The ember returns - but dimmer than before.', passageEl);
    await showText('<br><br><span style="color:#776655; font-size:0.7em;">Maximum light intensity permanently reduced.</span>', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Continue toward the exit', 'cave_exit_approach', passageEl);
};

passages['sacrifice_decline'] = async function() {
    await showText('You refuse.', passageEl);
    await showText('<br><br>The darkness presses in.', passageEl);
    await showText('<br><br>Without light, there is no path.', passageEl);
    await showText('<br><br>...', passageEl);
    await showText('<br><br>The silence grows heavier.', passageEl);
    await showText('<br><br><em style="color:#556;">"The ember does not beg. But it waits."</em>', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('...Sacrifice', 'sacrifice_accept', passageEl);
};

passages['wind_killed'] = async function() {
    await flashPipsOnDeath();
    await delay(700);
    setTheme('death-theme');

    await showText('You moved too fast.', passageEl);
    await showText('The rush of air tore through it.', passageEl);
    await showText('The flame goes out.', passageEl);

    if (!state.hasSeenFlameHelp) {
        await showFlameHelp('wind');
    }

    await showText('<em style="color:#aa7744;">"Sacrifice a Fragment of Self to Reignite?"</em>', passageEl);

    state.optionsShownTime = Date.now();
    addChoiceLink('Sacrifice', 'sacrifice_accept_return', passageEl);
    addChoiceLink('Refuse', 'sacrifice_decline', passageEl);
};

passages['brightness_killed'] = async function() {
    await flashPipsOnDeath();
    setTheme('death-theme');
    await delay(500);

    await showText('Too bright. Too long.', passageEl);
    await showText('The flame burned itself out.', passageEl);
    await showText('Nothing left to sustain it.', passageEl);

    if (!state.hasSeenFlameHelp) {
        await showFlameHelp('bright');
    }

    await showText('<em style="color:#aa7744;">"Sacrifice a Fragment of Self to Reignite?"</em>', passageEl);

    state.optionsShownTime = Date.now();
    addChoiceLink('Sacrifice', 'sacrifice_accept_return', passageEl);
    addChoiceLink('Refuse', 'sacrifice_decline', passageEl);
};

passages['no_movement_killed'] = async function() {
    await flashPipsOnDeath();
    await delay(700);
    setTheme('death-theme');

    await showText('You stopped moving.', passageEl);
    await showText('The flame lost its air.', passageEl);
    await showText('It faded, quietly, to nothing.', passageEl);

    if (!state.hasSeenFlameHelp) {
        await showFlameHelp('still');
    }

    await showText('<em style="color:#aa7744;">"Sacrifice a Fragment of Self to Reignite?"</em>', passageEl);

    state.optionsShownTime = Date.now();
    addChoiceLink('Sacrifice', 'sacrifice_accept_return', passageEl);
    addChoiceLink('Refuse', 'sacrifice_decline', passageEl);
};

passages['sacrifice_accept_return'] = async function() {
    state.hasSacrificed = true;
    state.currentStats = Math.max(1, state.currentStats - 1);
    state.maxFlameIntensity = Math.max(30, state.maxFlameIntensity - 15);
    await animatePipLoss();

    reviveFlame(35);
    restoreTheme();

    await showText('You feel something leave you.', passageEl);
    await showText('A page in your journal fades to nothing.', passageEl);
    await showText('The ember returns - but dimmer than before.', passageEl);
    await showText('<span style="color:#776655; font-size:0.7em;">Maximum light intensity permanently reduced.</span>', passageEl);
    await showText('<span style="color:#667; font-size:0.7em;">Be mindful of the balance between stillness and motion.</span>', passageEl);

    state.optionsShownTime = Date.now();
    const returnTo = state.lastPassageBeforeDeath || 'awakening';
    addChoiceLink('Continue', returnTo, passageEl);
};

// ---------- NODE 3: THE FOREST EDGE ----------
passages['forest_edge'] = async function() {
    setTheme('forest-theme');
    state.thermalThreshold = 0;
    state.flameIntensity = Math.min(state.flameIntensity, 50);
    updateEmberVisual();

    await delay(300);
    await showText('You emerge into a rocky, frozen forest.', passageEl);
    await showText('<br><br>The trees are skeletal, coated in frost.', passageEl);
    await showText('<br><br>Scattered among the rocks - <em>unlit fire pits</em>. Dozens of them.', passageEl);
    await showText('<br><br>A culture was here once. They kept fires burning.', passageEl);
    await showText('<br><br>Now everything is cold.', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Investigate the stone ruin ahead', 'mural_discovery', passageEl);
    addChoiceLink('Search for remnants among the fire pits', 'find_bowl', passageEl);
};

passages['mural_discovery'] = async function() {
    await showText('You approach a crumbling stone wall.', passageEl);
    await showText('<br><br>A weathered mural stretches across its face.', passageEl);
    await showText('<br><br>Figures - standing in a circle around a great bonfire.', passageEl);
    await showText('<br><br>Their hands are raised. Not in worship. In warmth.', passageEl);
    await showText('<br><br><em style="color:#7799aa;">The goal is not the flame. It is the circle.</em>', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Search the fire pits', 'find_bowl', passageEl);
    addChoiceLink('Press onward through the forest', 'silent_encounter', passageEl);
};

passages['find_bowl'] = async function() {
    startThermalTimer();

    await showText('Among the ash and stone, something catches the light.', passageEl);
    await showText('<br><br>A <em>chipped porcelain bowl</em>. Painted with fine brushwork.', passageEl);
    await showText('<br><br>You pick it up carefully. The ember leans toward it, curious.', passageEl);
    await showText('<br><br><span style="color:#667; font-size:0.75em;">The flame grows warmer the longer you hold still...</span>', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Set it down and keep moving', 'after_bowl_safe', passageEl, {
        onSelect: () => { stopThermalTimer(); }
    });
    addChoiceLink('Study it closely', 'study_bowl', passageEl);
};

passages['study_bowl'] = async function() {
    await showText('You turn the bowl in your hands.', passageEl);
    await showText('<br><br>Delicate flowers, painted by someone who knew patience.', passageEl);
    await showText('<br><br>The ember pulses brighter... too bright.', passageEl);
    await showText('<br><br><span style="color:#aa7744; font-size:0.8em;">The warmth is becoming uncomfortable.</span>', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Put it down - now', 'after_bowl_safe', passageEl, {
        onSelect: () => { stopThermalTimer(); }
    });
    addChoiceLink('Just a moment longer...', 'linger_more', passageEl);
};

passages['linger_more'] = async function() {
    await showText('Just a moment...', passageEl);
    await showText('<br><br>The heat swells.', passageEl);

    state.thermalThreshold = Math.max(state.thermalThreshold, 85);
    updateFlameBar();

    await showText('<br><br><span style="color:#cc5500;">The ember is burning too hot...</span>', passageEl);

    await delay(2000);
    if (state.currentPassage === 'linger_more') {
        stopThermalTimer();
        goToPassage('lingered_too_long');
    }
};

passages['lingered_too_long'] = async function() {
    stopThermalTimer();
    heatOverlay.classList.add('active');

    await showText('A heat shimmer fills your vision.', passageEl);
    await showText('<br><br>You recoil...', passageEl);

    dissolveText('<br><br>The ember falls from your grasp.', passageEl);
    killFlame();
    heatOverlay.classList.remove('active');
    await delay(readingDelay('The ember falls from your grasp.'));

    await showText('<br><br>It dies on the frozen ground.', passageEl);
    await showText('<br><br>Ash.', passageEl);
    await showText('<br><br><span class="breathing-prompt">Breathe... slowly... deeply...</span>', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Breathe', 'breathing_revival', passageEl);
};

passages['breathing_revival'] = async function() {
    await showText('You kneel in the cold.', passageEl);
    await showText('<br><br>Breathe.', passageEl);
    await showText('<br><br>Breathe.', passageEl);
    await showText('<br><br>Breathe.', passageEl);
    await showText('<br><br>From the ashes - a tiny new spark.', passageEl);

    reviveFlame(25);

    await showText('<br><br>Smaller. Fragile. But alive.', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Rise and continue', 'after_bowl_safe', passageEl);
};

passages['after_bowl_safe'] = async function() {
    stopThermalTimer();
    await showText('You leave the remnants behind and press forward.', passageEl);
    await showText('<br><br>The forest thins. The frost loosens.', passageEl);
    await showText('<br><br>Something ahead feels... different.', passageEl);

    goToPassage('silent_encounter');
};

// ---------- NODE 4: THE SILENT ENCOUNTER ----------
passages['silent_encounter'] = async function() {
    setTheme('gold-shift-theme');
    state.worldThaw = 0.3;

    await delay(300);
    await showText('The light shifts.', passageEl);
    await showText('<br><br>Where everything was ice-blue, a pale <span style="color:#ddc070;">gold</span> now bleeds into the edges.', passageEl);
    await showText('<br><br>And then you see it...', passageEl);
    await showText('<br><br>A <em>silhouette</em>. Distant. Another traveler.', passageEl);
    await showText('<br><br>They pause - then disappear behind a frost-covered ridge.', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Follow', 'follow_silhouette', passageEl);
};

passages['follow_silhouette'] = async function() {
    state.worldThaw = 0.6;

    await showText('You follow.', passageEl);
    await showText('<br><br>The wind, which has been your only companion, shifts.', passageEl);
    await showText('<br><br>Layered into its howl - a single note. A <em>flute</em>.', passageEl);
    await showText('<br><br>Or perhaps a <em>tabla</em>, somewhere far below the wind.', passageEl);
    await showText('<br><br>You are not alone.', passageEl);
    await showText('<br><br>Ahead - a small, dormant <em>brazier</em> sits in a clearing.', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Light the brazier', 'light_brazier', passageEl);
};

passages['light_brazier'] = async function() {
    state.worldThaw = 1.0;
    setTheme('thaw-theme');

    await showText('You hold the ember to the brazier.', passageEl);
    await showText('<br><br>For a moment - nothing.', passageEl);
    await showText('<br><br>Then...', passageEl);

    state.flameIntensity = Math.min(state.maxFlameIntensity, 70);
    updateEmberVisual();

    await showText('<br><br><span style="color:#ffd700; font-size:1.2em;">Light.</span>', passageEl);
    await showText('<br><br>The frost around the brazier retreats.', passageEl);
    await showText('<br><br>Grey stone turns to <span style="color:#daa520;">warm gold</span>.', passageEl);
    await showText('<br><br>The cold releases its grip on this small circle of earth.', passageEl);


    state.optionsShownTime = Date.now();
    addChoiceLink('Sit and meditate', 'meditation', passageEl);
};

passages['meditation'] = async function() {
    state.fragmentsUnlocked.push('Fragment of Self: The Circle');

    await showText('You sit beside the brazier.', passageEl);
    await showText('<br><br>The ember rests.', passageEl);
    await showText('<br><br>For the first time, the silence is not empty.', passageEl);
    await showText('<br><br>It is warm.', passageEl);

    if (state.hasSacrificed) {
        await showText('<br><br><span style="color:#887766; font-size:0.75em;">The light is dimmer than it should be. You remember what you gave up.</span>', passageEl);
    }

    await showText('<br><br><em style="color:#daa520;">Fragment of Self unlocked.</em>', passageEl);



    const statsLost = state.maxIdentityStats - state.currentStats;
    if (statsLost > 0) {
        await showText('<br><span style="color:#776655; font-size:0.65em;">Fragments sacrificed: ' + statsLost + '</span>', passageEl);
    }

    await showText('<br><span style="color:#776655; font-size:0.65em;">Maximum flame intensity: ' + state.maxFlameIntensity + '%</span>', passageEl);

    await fadeToBlack();
    await delay(1000);
    textArea.innerHTML = '';
    choicesArea.innerHTML = '';
    await fadeFromBlack();

    goToPassage('survey_outro');
};

// ---------- SURVEY OUTRO ----------
passages['survey_outro'] = async function() {
    setTheme('ember-end-theme');

    // Hide game UI elements - this is a liminal rest space
    journalContainer.style.display = 'none';
    flameBarContainer.style.display = 'none';

    // Let the flame burn low and quiet
    state.flameIntensity = Math.min(state.flameIntensity, 35);

    await delay(800);

    await showText(
        '<div style="font-size:0.9em; color:#c8a050; letter-spacing:0.06em;">End of Vertical Slice</div>',
        passageEl
    );

    await showText(
        '<span style="font-size:0.65em; color:#8a7050; font-style:italic; letter-spacing:0.03em;">The fire remembers what the mind forgets.</span>',
        passageEl
    );

    await showText(
        '<span style="font-size:0.8em; color:#b09060;">Thank you for carrying the ember this far.</span>',
        passageEl
    );

    await showText(
        '<span style="font-size:0.72em; color:#7a6848;">Your journey leaves traces — impressions, questions, small warmths and frictions. If you are willing, I would hear them.</span>',
        passageEl
    );

    // Final lingering screen — survey link + restart, both fade in together
    const existing = textArea.querySelector('.active-text');
    if (existing) {
        existing.classList.remove('dissolve');
        existing.classList.add('dissolve-out');
        await delay(350);
        existing.remove();
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'dissolve active-text';
    wrapper.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:1.4em;';

    const prompt = document.createElement('div');
    prompt.style.cssText = 'font-size:0.68em; color:#9a8460; font-style:italic; letter-spacing:0.04em; line-height:1.6;';
    prompt.innerHTML = 'Leave your tale in the embers.';

    const surveyBtn = document.createElement('a');
    surveyBtn.href = 'https://forms.gle/d5yhjR1wPwA7MVoL6';
    surveyBtn.target = '_blank';
    surveyBtn.rel = 'noopener noreferrer';
    surveyBtn.className = 'survey-link';
    surveyBtn.textContent = 'Open the Scroll of Testimony';

    const divider = document.createElement('div');
    divider.style.cssText = 'width:32px; height:1px; background:rgba(160,130,80,0.2); margin:0.2em auto;';

    const restart = document.createElement('span');
    restart.className = 'choice-link';
    restart.style.cssText = 'font-size:0.72em; color:#5a6870; font-weight:normal; margin-top:0.2em;';
    restart.textContent = 'Begin again';
    restart.addEventListener('click', () => goToPassage('title'));

    wrapper.appendChild(prompt);
    wrapper.appendChild(surveyBtn);
    wrapper.appendChild(divider);
    wrapper.appendChild(restart);
    textArea.appendChild(wrapper);
};

// ==========================================================
//  PASSAGE NAVIGATION
// ==========================================================
// Clears all timers/state, wipes the text + choices areas, then runs
// the named passage function. Every scene transition goes through here.
function goToPassage(name) {
    clearAllTimers();
    cancelAdvanceClick();
    _clickPending = false;
    stopIdleReminder();
    // Close history drawer on any navigation
    if (isPaused) closeHistory();
    state.currentPassage = name;
    textArea.innerHTML = '';
    choicesArea.innerHTML = '';

    // Show history button once in actual game (not on title)
    if (name !== 'title') {
        historyBtn.style.display = 'block';
    } else {
        historyBtn.style.display = 'none';
    }

    if (passages[name]) {
        passages[name]();
    } else {
        dissolveText('<em>Passage "' + name + '" not found.</em>', passageEl);
    }
}

// ==========================================================
//  START
// ==========================================================
const GAME_UPDATING = false;   // ← set to false to re-enable the game

if (GAME_UPDATING) {
    stopFlameAnimation();
    state.flameAlive = false;
    flameCanvas.classList.add('dead');
    emberBarFill.style.width = '0%';
    textArea.innerHTML = '';
    choicesArea.innerHTML = '';
    historyBtn.style.display = 'none';
    const msg = document.createElement('div');
    msg.style.cssText = 'font-size:0.65em; color:#445566; font-style:italic; letter-spacing:0.08em; line-height:2;';
    msg.textContent = 'Game is updating. please come back later.';
    textArea.appendChild(msg);
} else {
    goToPassage('title');
}
