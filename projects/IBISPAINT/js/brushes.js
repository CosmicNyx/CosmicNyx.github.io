// Brush Engine - Modular and Extensible System
// Supports brushes from different libraries (p5.js, native Canvas, etc.)

class BrushEngine {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Initialize p5.js if available
        this.p5 = null;
        if (typeof p5 !== 'undefined') {
            this.p5 = p5;
        }
    }

    // Helper function to convert coordinates
    convertCoords(coords) {
        const halfWidth = this.canvasWidth / 2;
        const halfHeight = this.canvasHeight / 2;
        return {
            x: coords.x + halfWidth,
            y: coords.y + halfHeight
        };
    }

    // Helper function to calculate distance
    dist(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    // Helper function for linear interpolation
    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    // Helper function to calculate speed
    getSpeed(from, to) {
        return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
    }

    // Helper function to calculate angle
    getAngle(from, to) {
        return Math.atan2(to.y - from.y, to.x - from.x);
    }

    // Register brush implementations
    // This allows adding brushes from different libraries
    registerBrush(name, brushFunction) {
        if (!this.brushes) {
            this.brushes = {};
        }
        this.brushes[name] = brushFunction;
    }

    // Draw with selected brush
    draw(from, to, brushType, color, size, opacity) {
        // Check if brush is registered
        if (this.brushes && this.brushes[brushType]) {
            // Use registered brush
            this.brushes[brushType].call(this, from, to, color, size, opacity);
        } else {
            // Default: simple line drawing
            const fromCoords = this.convertCoords(from);
            const toCoords = this.convertCoords(to);
            
            this.ctx.save();
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = size;
            this.ctx.globalAlpha = opacity / 100;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(fromCoords.x, fromCoords.y);
            this.ctx.lineTo(toCoords.x, toCoords.y);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }
}

// Brush Registry - Central place to register all brushes
class BrushRegistry {
    constructor() {
        this.brushes = {};
    }

    // Register a brush from any library
    register(name, brushFunction, metadata = {}) {
        this.brushes[name] = {
            function: brushFunction,
            metadata: metadata
        };
    }

    // Get a brush by name
    get(name) {
        return this.brushes[name];
    }

    // Get all registered brushes
    getAll() {
        return this.brushes;
    }

    // Initialize brushes on a brush engine instance
    initialize(brushEngine) {
        for (const [name, brush] of Object.entries(this.brushes)) {
            brushEngine.registerBrush(name, brush.function);
        }
    }
}

// Global brush registry instance
const brushRegistry = new BrushRegistry();
