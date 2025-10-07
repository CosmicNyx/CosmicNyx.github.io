# Ibis Paint Workspace - Clean UI

A professional digital art workspace built with vanilla JavaScript, featuring a clean UI with floating toolbars and touch-first design.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   # or
   node server.js
   ```

3. **Open your browser:**
   - Application: http://localhost:3001

## Features

### Workspace
- **500x500 White Canvas** - Centered drawing area with dark void space
- **Touch Gestures** - Two-finger zoom, pan, and rotate with snap-to-angle
- **Responsive Layout** - Adapts to all screen sizes, hides right toolbar on mobile
- **Floating UI** - Transparent toolbars that don't interfere with drawing

### Right Toolbar
- **15 Tools** - Transform, Magic Wand, Lasso, Filter, Brush, Eraser, Smudge, Blur, Special, Bucket, Vector, Text, Frame, Eyedropper, Canvas
- **Labeled Icons** - Each tool has a clear text label underneath
- **Active State** - Currently selected tool is highlighted
- **Thin Scrollbar** - Custom scrollbar for smaller screens

### Bottom Toolbar
- **8 Buttons** - Switch (Brush↔Eraser), Brush, Color, Hide, Undo, Redo, Layers, Back
- **Color Swatch** - Live color preview that updates as you change colors
- **Collapsible** - Hide arrow to slide toolbar out of view
- **Touch Optimized** - Designed for finger interaction

### Core Functionality
- **Layer Management** - Add, delete, toggle visibility, change opacity
- **Undo/Redo** - Full history management with keyboard shortcuts
- **Color Picker** - Hidden but functional color selection
- **Export PNG** - Save artwork functionality

## Technical Details

### Architecture
- **Pure Vanilla JavaScript** - No frameworks or libraries
- **ES6+ Classes** - Modern JavaScript patterns
- **Canvas API** - Native HTML5 canvas with offscreen rendering
- **Touch Events** - Two-finger gesture recognition

### File Structure
```
├── index.html           # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── app.js          # Main application logic
│   └── icons.js        # SVG icon definitions
├── server.js           # Express server
└── README.md           # This file
```

### Key Classes
- **IbisPaintWorkspace** - Main application class
- **Canvas Management** - Touch gestures and transformations
- **Layer System** - Layer management and UI
- **Tool System** - Right toolbar tool selection
- **Bottom Toolbar** - Quick access controls

## Performance Benefits

- **Lightweight** - Minimal dependencies, only Express for serving
- **Fast Load Time** - No framework overhead
- **Direct DOM Access** - No virtual DOM
- **Touch Optimized** - Native touch event handling

## Development

### Adding New Tools
1. Add tool to right toolbar in `index.html`
2. Add icon mask in `css/styles.css`
3. Implement tool logic in `js/app.js`

### Adding New Features
1. Extend the `IbisPaintWorkspace` class
2. Add event listeners in `setupEventListeners()`
3. Update UI in `updateUI()` method

### Styling
- Pure CSS with dark greyscale theme
- Responsive design with CSS Grid/Flexbox
- Custom scrollbars and floating panels

## Browser Support

- **Modern Browsers** - Chrome, Firefox, Safari, Edge
- **Mobile Support** - iOS Safari, Chrome Mobile
- **Touch Events** - Two-finger gestures, single-touch drawing
- **High DPI** - Retina display support

## Usage

1. **Select a tool** from the right floating toolbar
2. **Use touch gestures** to zoom, pan, and rotate the canvas
3. **Choose colors** by tapping the color swatch
4. **Switch tools** with the brush/eraser toggle
5. **Manage layers** via the layers button
6. **Hide toolbar** for more drawing space

## Future Enhancements

- **Drawing Engine** - Enable brush and eraser functionality
- **Brush Types** - Pen, marker, airbrush, watercolor
- **Advanced Layers** - Blending modes, filters
- **Popup Panels** - Brush settings, color picker, layers panel
- **File I/O** - Save/load projects
- **Animation** - Timeline and keyframes

## License

MIT License - Feel free to use and modify as needed.

---

**Built with vanilla JavaScript for maximum performance and touch-first design.**