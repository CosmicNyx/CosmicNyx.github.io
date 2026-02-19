# Usability Testing & Redesign Report – Ibis Paint Workspace Clone

## 1. Introduction & Project Background

This project is a browser-based drawing workspace inspired by Ibis Paint, built with vanilla JavaScript, HTML, and CSS. The goal is to recreate a touch-first, layer-based illustration app that works well on desktop, tablet, and mobile, while simplifying the UI and interaction model.

The recent iteration focused on **usability testing and targeted redesigns**. Several users tested the app on different devices (laptop trackpads, tablets, and touch-screen laptops). Their feedback highlighted specific pain points around **touch interaction**, **discoverability of tools**, and **access to core controls** (layers, color, undo/redo). The redesign work you see in this build is directly based on those findings.

## 2. Research Methods and Process

### 2.1 Research Methods

- **Moderated usability sessions**  
  - Users were asked to perform core tasks: create layers, move layers, change colors, erase, undo/redo, and navigate the canvas.  
  - Sessions were screen-recorded and notes were taken on hesitation, errors, and verbal comments.

- **Device-variation testing**  
  - The same tasks were repeated on:  
    - Desktop with mouse  
    - Laptop with trackpad  
    - Touch-screen laptop / tablet (finger input)  
  - This exposed differences between pointer and touch interaction.

- **Think-aloud protocol**  
  - Participants were encouraged to narrate what they expected buttons to do, and when something felt confusing or “off”.

- **Post-task interviews**  
  - Short follow-up questions to understand what felt confusing, which features were hard to find, and what they wanted to do but couldn’t.

### 2.2 Research Process & Data Gathering

1. **Task Scenarios**  
   - Example tasks:
     - “Create three layers, name them, and reorder them.”
     - “Change the color and draw a line.”
     - “Erase part of your drawing.”
     - “Undo and redo several steps.”
     - “Zoom/pan/rotate and then reset your view.”

2. **Observation & Event Logging**  
   - Observed where users:
     - Long-pressed or tapped without response
     - Clicked on the wrong icons
     - Opened panels accidentally or couldn’t close them
   - Logged interaction errors (e.g., trying to open color from the bottom button and nothing happening).

3. **Pattern Synthesis**  
   - After multiple sessions, similar issues were clustered:
     - Touch-only problems
     - Icon meaning / label confusion
     - Missing or hidden features (e.g., no obvious place to see shortcuts)
   - Each cluster turned into a **design problem statement**, which then guided the redesign work.

## 3. Research Insights

### Insight 1 – Touch users struggled to move layers and access undo/redo

**What we saw:**  
- On touch devices, users had trouble:
  - Dragging layers in the layer list precisely with a finger.
  - Reaching the small undo/redo buttons at the bottom while drawing.
- Several testers explicitly said they expected **touch gestures** (e.g., two-finger tap to undo).

**Evidence:**  
- Multiple failed attempts to drag layers: fingers covered the entire row, and drag didn’t always start.
- Verbal feedback: “On my tablet I always use two-finger tap for undo” and “It’s hard to grab these lines with my thumb.”

**Design changes based on this insight:**  
- Added a **dedicated drag handle** on the left side of each layer/folder row.  
  - The handle is a clear vertical “⋮⋮” grip that’s easy to touch.  
  - Dragging now feels more intentional and less error-prone.
- Implemented **two-finger tap = Undo** and **three-finger tap = Redo** on the canvas.  
  - Gesture detection was tuned (400ms timeout, 20px movement threshold) to distinguish taps from pinch/zoom.

### Insight 2 – Color panel was “invisible” or felt broken for some users

**What we saw:**  
- Some users clicked the color button and **nothing seemed to happen**, especially on certain browsers.  
- The original color picker relied on a hidden `<input type="color">` and programmatic `.click()`, which is blocked or inconsistent in some environments.

**Evidence:**  
- Multiple comments like “Is the color button broken?” and “I don’t see any color window.”  
- On some devices, the hidden color input never surfaced the native color picker.

**Design changes based on this insight:**  
- Introduced a **visible, dedicated color panel**:  
  - Docked panel with:
    - Native color input
    - Hex input with validation
    - A preset color grid
  - The panel can be opened from:
    - The bottom color button
    - The layer color button
  - Closing the panel works via **Esc or close button**, similar to other panels.
- Kept the native color input, but made it visually accessible and consistent across devices.

### Insight 3 – Users didn’t know what tools and shortcuts existed

**What we saw:**  
- New users hovered over icons trying to guess their meaning.  
- Many were unaware of keyboard shortcuts and only discovered them when told.
- The top-right “star” navigation icon and bottom switch button were particularly confusing.

**Evidence:**  
- Think-aloud comments like:
  - “I don’t know what this star does.”
  - “Is this button the brush or the eraser?” (regarding the switch button)
  - “I only found out there were shortcuts when you mentioned it.”

**Design changes based on this insight:**  
- Added **tool hover tooltips** on the right toolbar:
  - Each tool tile shows a tooltip with the full name (e.g., “Magic Wand”, “Transform”).
- Added a **Help button** (`?`) in the top-left:
  - Opens a **shortcuts panel** styled like other floating panels.
  - Lists general shortcuts, layer shortcuts, canvas shortcuts, and touch gestures.
  - Non-blocking: users can still draw and use tools with the panel open.
- Updated key icons:
  - Navigation icon → grid/overview icon that better suggests “navigation/overview”.
  - Undo/Redo → standard curved arrows left/right.
  - Switch button → dedicated swap icon (double arrows) instead of changing between brush/eraser glyphs.
  - “Ruler” button retitled to **Options**, matching its actual function.

---

These three insights were the most impactful because they directly affected **core workflows** (drawing, layering, color, undo/redo) and **onboarding** (discovering tools and shortcuts). All major UI and interaction changes in this iteration are traceable back to these usability findings.

## 4. Reflection

Working through this usability cycle changed how I think about when an interface is “done.” At first, a lot of my original decisions (like hiding the color input off-screen or using a star for navigation) felt fine because they made sense to me and roughly matched other apps I’d seen. Watching real people struggle with those same elements made it obvious that **familiar-to-the-designer is not the same as intuitive-to-the-user**. The sessions pushed me to measure success not by how “clean” the UI looked, but by how easily someone who’d never seen the project could complete real drawing tasks.

I also realized how different the app feels across devices. On a desktop with a mouse, grabbing tiny layer rows and tapping small buttons is acceptable; on a tablet, it’s frustrating. That gap forced me to treat touch as a first-class input method instead of a quick add-on. Features like drag handles on layers and two-/three-finger undo/redo came directly from watching touch users miss taps or complain about having to move their hand down to the toolbar. In future projects, I’d like to prototype and test on touch hardware from day one rather than retrofitting touch interactions at the end.

Another big lesson was the power of **small, targeted changes**. Many of the most effective improvements—renaming “Ruler” to “Options,” adding a `?` help button, or swapping icon shapes—were only a few lines of code but noticeably reduced confusion. The research helped me prioritize which small adjustments would have the largest impact, instead of trying to redesign everything at once. Going forward, I want to build in regular, low-effort testing (even quick hallway tests) so I can ship a steady stream of small fixes rather than waiting for a big “usability phase.”

Finally, writing up the **Improvements** and this **Research Report** turned out to be part of the design process, not just documentation. Having to explain *why* each change exists made it easier to see patterns, justify decisions, and spot gaps I’d missed. It also means that if someone new joins the project—or if I come back to it months later—there’s a clear story from problem → evidence → design response. Next time, I’d like to bring in a more diverse set of participants (different experience levels, left-handed vs. right-handed users, etc.) and add some lightweight quantitative measures (task times, error counts) to complement the qualitative insights that drove this round.

