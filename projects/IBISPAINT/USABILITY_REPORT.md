# Usability Test Report – Ibis Paint Workspace Clone

## 1. Introduction & Project Background

This project recreates a touch-first drawing workspace inspired by Ibis Paint, built in the browser with HTML, CSS, and vanilla JavaScript. The goal is to support layer-based illustration on desktop, laptop, and tablet while keeping the interface clean and approachable. After building an initial prototype, we conducted usability testing to understand how real users interacted with the app and to guide a focused redesign.

The primary objectives of the usability work were to (1) validate whether core tasks (drawing, layer management, color changes, undo/redo, and navigation) were discoverable and efficient, and (2) identify specific pain points for touch users. The redesign you see in the current prototype is directly driven by these findings.

## 2. Research Methods and Process

We ran **moderated usability sessions** where participants were asked to complete realistic tasks: creating and reordering layers, changing color and drawing, erasing content, using undo/redo, and zooming/panning the canvas. Sessions were recorded and we used a **think‑aloud protocol**, encouraging users to narrate what they expected each control to do.

To capture differences between input methods, the same tasks were performed on a desktop with mouse, a laptop with trackpad, and a touch‑screen laptop/tablet. During each session we logged:
- Where users hesitated or tapped/clicked on the wrong controls
- Errors (e.g., failing to move a layer, thinking the color button was “broken”)
- Verbatim comments after each task

Afterwards, we performed a light **affinity clustering** of observations into themes (touch-only issues, icon/label confusion, hidden features). Each theme became a design problem statement that informed the redesign.

## 3. Key Research Insights & Design Changes

### Insight 1 – Touch users struggled to move layers and access undo/redo

Touch participants frequently failed to drag layers in the list: their thumbs obscured the row and drag‑start was inconsistent. They also complained that the small undo/redo buttons at the bottom were hard to reach while drawing, and several explicitly said they expected two‑finger tap for undo.

**Changes:**
- Added a **dedicated drag handle** (⋮⋮) at the left of each layer/folder row, giving users a clear, finger‑friendly target for reordering.
- Implemented **two‑finger tap = Undo** and **three‑finger tap = Redo** on the canvas, with tuned gesture detection (time and movement thresholds) to avoid conflicts with pinch/zoom.

### Insight 2 – The color panel felt broken or hidden

On some devices, clicking the bottom color button appeared to do nothing. The original implementation relied on a hidden `<input type="color">` and programmatic `.click()`, which certain browsers and OS combinations suppressed.

**Changes:**
- Introduced a **visible color panel** styled like other floating panels, containing:
  - Native color input
  - Hex input with validation
  - A preset color grid
- Made the panel open from both the bottom color button and the layer color button, with consistent close behavior via Esc or a close icon.

### Insight 3 – Users didn’t know what tools and shortcuts existed

Participants hovered over icons trying to guess their meaning, and most were unaware of keyboard shortcuts until told. The star‑shaped navigation icon and the brush/eraser switch button were especially confusing.

**Changes:**
- Added **hover tooltips** to the right toolbar, showing full tool names (e.g., “Magic Wand”, “Transform”).
- Added a **Help (`?`) button** that opens a non‑blocking **shortcuts panel** listing general, layer, canvas, and touch gestures.
- Updated key icons and labels:
  - Navigation icon → grid/overview icon
  - Undo/Redo → standard curved arrows
  - Switch button → dedicated swap icon (double arrows)
  - “Ruler” renamed to **Options** to match its behavior.

Overall, the usability testing revealed specific, actionable issues rather than generic “confusion.” The redesign focused on small but high‑impact changes—improving touch interactions, making hidden functionality visible, and clarifying icons/labels—which together made the workspace feel more predictable and easier to learn for both mouse and touch users.

