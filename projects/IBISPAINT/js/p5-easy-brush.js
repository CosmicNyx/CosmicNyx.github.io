// P5 Easy Brush - Recreates easy-brush functionality using p5.js
// Configurable brush with flow, opacity, spacing, roundness, and angle settings

// Global config for p5 easy brush
let p5EasyBrushConfig = {
    color: "#000000",
    size: 8,
    flow: 0.8,
    opacity: 0.5,
    spacing: 0.15,
    roundness: 1.00,
    angle: 0.00
};

// Stroke state for p5 easy brush
let p5EasyBrushState = {
    lastPoint: null,
    lastDistance: 0,
    accumulatedDistance: 0
};

// P5 Easy Brush Implementation
function p5EasyBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    
    // Get config from workspace if available, otherwise use global config
    let config = {};
    if (this.workspace) {
        config = this.workspace.getBrushConfig('p5EasyBrush');
    } else {
        config = p5EasyBrushConfig;
    }
    
    // Use workspace size and opacity (passed as parameters), not config
    // Config only controls flow, spacing, roundness, and angle
    const brushSize = size || 8;
    const brushOpacity = (opacity !== undefined ? opacity / 100 : 0.5);
    const brushColor = color || p5EasyBrushConfig.color;
    const flow = config.flow !== undefined ? config.flow : 0.8;
    const spacing = config.spacing !== undefined ? config.spacing : 0.15;
    const roundness = config.roundness !== undefined ? config.roundness : 1.00;
    const angle = config.angle !== undefined ? config.angle : 0.00;
    
    // Update config color if provided (so it persists)
    if (color) {
        p5EasyBrushConfig.color = color;
    }
    
    // Calculate distance between points
    const distance = this.dist(fromCoords.x, fromCoords.y, toCoords.x, toCoords.y);
    
    // Initialize last point if needed
    if (!p5EasyBrushState.lastPoint) {
        p5EasyBrushState.lastPoint = { x: fromCoords.x, y: fromCoords.y };
        p5EasyBrushState.accumulatedDistance = 0;
    }
    
    // Add to accumulated distance
    p5EasyBrushState.accumulatedDistance += distance;
    
    // Calculate spacing threshold (spacing is a ratio of brush size)
    const spacingThreshold = brushSize * spacing;
    
    // Draw points along the path based on spacing
    const steps = Math.max(1, Math.floor(p5EasyBrushState.accumulatedDistance / spacingThreshold));
    
    this.ctx.save();
    
    // Convert hex color to RGB
    const rgb = hexToRgb(brushColor);
    if (!rgb) {
        this.ctx.fillStyle = brushColor;
        this.ctx.strokeStyle = brushColor;
    } else {
        this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brushOpacity * flow})`;
        this.ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brushOpacity * flow})`;
    }
    
    // Draw brush stamps along the path
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = this.lerp(p5EasyBrushState.lastPoint.x, toCoords.x, t);
        const y = this.lerp(p5EasyBrushState.lastPoint.y, toCoords.y, t);
        
        // Calculate pressure based on speed (optional enhancement)
        const pressure = 1.0; // Can be enhanced later
        
        // Calculate brush dimensions based on roundness
        const brushWidth = brushSize * roundness * pressure;
        const brushHeight = brushSize / roundness * pressure;
        
        // Draw brush stamp
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle * Math.PI / 180); // Convert angle to radians
        
        // Draw elliptical brush stamp
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, brushWidth / 2, brushHeight / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // Reset accumulated distance if we've drawn enough
    if (p5EasyBrushState.accumulatedDistance >= spacingThreshold) {
        p5EasyBrushState.accumulatedDistance = 0;
    }
    
    // Update last point
    p5EasyBrushState.lastPoint = { x: toCoords.x, y: toCoords.y };
    
    this.ctx.restore();
}

// Reset p5 easy brush state (call when starting new stroke)
function resetP5EasyBrush() {
    p5EasyBrushState.lastPoint = null;
    p5EasyBrushState.accumulatedDistance = 0;
}

// Update p5 easy brush config
function updateP5EasyBrushConfig(config) {
    Object.assign(p5EasyBrushConfig, config);
}

// Get p5 easy brush config
function getP5EasyBrushConfig() {
    return { ...p5EasyBrushConfig };
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Register p5 easy brush
if (typeof brushRegistry !== 'undefined') {
    brushRegistry.register('p5EasyBrush', p5EasyBrush, { 
        name: 'Brush', 
        category: 'basic',
        preview: 'pen'
    });
}

