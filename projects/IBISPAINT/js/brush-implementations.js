// Brush Implementations - Adapted from p5.js code
// Color and size are handled by the existing system

// Pen Brush - Simple line
function penBrush(from, to, color, size, opacity) {
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

// Marker Brush - Filled circle
function markerBrush(from, to, color, size, opacity) {
    const toCoords = this.convertCoords(to);
    
    // Get config from workspace
    const config = this.workspace ? this.workspace.getBrushConfig('marker') : {};
    const intensity = config.intensity !== undefined ? config.intensity : 0.4;
    
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity / 100 * intensity;
    this.ctx.beginPath();
    this.ctx.arc(toCoords.x, toCoords.y, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
}

// Beads Brush - Circle at midpoint with distance as diameter
function beadsBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    
    // Get config from workspace
    const config = this.workspace ? this.workspace.getBrushConfig('beads') : {};
    const intensity = config.intensity !== undefined ? config.intensity : 0.7;
    
    // Find distance between points
    const distance = this.dist(fromCoords.x, fromCoords.y, toCoords.x, toCoords.y);
    
    // Find midpoint
    const midX = (fromCoords.x + toCoords.x) / 2;
    const midY = (fromCoords.y + toCoords.y) / 2;
    
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity / 100 * intensity;
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, Math.max(distance / 2, size / 4), 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
}

// Calligraphy Brush - Slanted lines with lerping
function calligraphyBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    
    // Get config from workspace
    const config = this.workspace ? this.workspace.getBrushConfig('calligraphy') : {};
    const lerps = config.lerps !== undefined ? config.lerps : 16;
    const lineWidth = config.lineWidth !== undefined ? config.lineWidth : 1;
    const width = size / 2;
    
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.globalAlpha = opacity / 100;
    
    for (let i = 0; i <= lerps - 1; i++) {
        const x = this.lerp(fromCoords.x, toCoords.x, i / lerps);
        const y = this.lerp(fromCoords.y, toCoords.y, i / lerps);
        
        // Draw slanted line
        this.ctx.beginPath();
        this.ctx.moveTo(x - width, y - width);
        this.ctx.lineTo(x + width, y + width);
        this.ctx.stroke();
    }
    this.ctx.restore();
}

// Hatching Brush - Lines with vector inversion
function hatchingBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    
    // Get config from workspace
    const config = this.workspace ? this.workspace.getBrushConfig('hatching') : {};
    const lerps = config.lerps !== undefined ? config.lerps : 3;
    const lineWidth = config.lineWidth !== undefined ? config.lineWidth : 1;
    
    // Calculate speed
    const speed = this.getSpeed(fromCoords, toCoords);
    
    // Create vector by inverting X and Y values
    const vectorX = toCoords.y - fromCoords.y;
    const vectorY = toCoords.x - fromCoords.x;
    
    // Set vector magnitude based on speed
    const magnitude = speed / 2;
    const vectorLength = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
    const normalizedX = vectorLength > 0 ? (vectorX / vectorLength) * magnitude : 0;
    const normalizedY = vectorLength > 0 ? (vectorY / vectorLength) * magnitude : 0;
    
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.globalAlpha = opacity / 100;
    
    for (let i = 0; i < lerps; i++) {
        const x = this.lerp(fromCoords.x, toCoords.x, i / lerps);
        const y = this.lerp(fromCoords.y, toCoords.y, i / lerps);
        
        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(x - normalizedX, y - normalizedY);
        this.ctx.lineTo(x + normalizedX, y + normalizedY);
        this.ctx.stroke();
    }
    this.ctx.restore();
}

// Spray Paint Brush - Random points in circle
function sprayPaintBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    
    // Get config from workspace
    const config = this.workspace ? this.workspace.getBrushConfig('sprayPaint') : {};
    const density = config.density !== undefined ? config.density : 10;
    const minRadiusRatio = config.minRadius !== undefined ? config.minRadius : 0.5;
    
    // Calculate speed
    const speed = this.getSpeed(fromCoords, toCoords);
    
    // Set minimum radius and spray density
    const minRadius = size * minRadiusRatio;
    const sprayDensity = density;
    const r = Math.min(speed + minRadius, size);
    const rSquared = r * r;
    
    const lerps = 10;
    
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity / 100;
    
    for (let i = 0; i < lerps; i++) {
        const lerpX = this.lerp(fromCoords.x, toCoords.x, i / lerps);
        const lerpY = this.lerp(fromCoords.y, toCoords.y, i / lerps);
        
        // Draw random points within circle
        for (let j = 0; j < sprayDensity; j++) {
            // Pick random position within circle
            const randX = (Math.random() * 2 - 1) * r;
            const randY = (Math.random() * 2 - 1) * Math.sqrt(rSquared - randX * randX);
            
            // Draw point
            this.ctx.fillRect(lerpX + randX, lerpY + randY, 1, 1);
        }
    }
    this.ctx.restore();
}


// Realistic Sketching Pencil - Creates brush from path of points with bristles
// This brush needs to track state across multiple draw calls
let bristleBrushState = {
    pathPoints: [],
    bristlePoints: [],
    time: 0,
    canvasGrid: null,
    gridSize: 4 // Size of canvas texture grid for snapping
};

// Initialize canvas texture grid for nearest point snapping
function initCanvasGrid(canvasWidth, canvasHeight, gridSize) {
    if (!bristleBrushState.canvasGrid || 
        bristleBrushState.canvasGrid.width !== canvasWidth || 
        bristleBrushState.canvasGrid.height !== canvasHeight) {
        bristleBrushState.canvasGrid = {
            width: canvasWidth,
            height: canvasHeight,
            gridSize: gridSize,
            points: []
        };
        
        // Create grid points for canvas texture
        for (let x = 0; x < canvasWidth; x += gridSize) {
            for (let y = 0; y < canvasHeight; y += gridSize) {
                // Add slight random offset for natural texture
                const offsetX = (Math.random() - 0.5) * gridSize * 0.3;
                const offsetY = (Math.random() - 0.5) * gridSize * 0.3;
                bristleBrushState.canvasGrid.points.push({
                    x: x + offsetX,
                    y: y + offsetY
                });
            }
        }
    }
}

// Find nearest grid point for snapping
function findNearestGridPoint(x, y, maxDistance) {
    if (!bristleBrushState.canvasGrid) return null;
    
    let nearest = null;
    let minDist = maxDistance;
    
    for (const point of bristleBrushState.canvasGrid.points) {
        const dist = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        if (dist < minDist) {
            minDist = dist;
            nearest = point;
        }
    }
    
    return nearest;
}

// Simple noise function for skip mask
function noise(x, y, time) {
    // Simple hash-based noise
    const n = Math.sin(x * 12.9898 + y * 78.233 + time * 0.1) * 43758.5453;
    return n - Math.floor(n);
}

// Realistic Sketching Pencil Brush
function realisticSketchingPencil(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    
    // Get config from workspace
    const config = this.workspace ? this.workspace.getBrushConfig('realisticSketchingPencil') : {};
    const gridSize = config.gridSize !== undefined ? config.gridSize : 4;
    const bristleCount = config.bristleCount !== undefined ? config.bristleCount : 5;
    const skipThreshold = config.skipThreshold !== undefined ? config.skipThreshold : 0.3;
    
    // Initialize canvas grid if needed
    initCanvasGrid(this.canvasWidth, this.canvasHeight, gridSize);
    
    // Add points to path
    bristleBrushState.pathPoints.push({
        x: toCoords.x,
        y: toCoords.y,
        time: bristleBrushState.time
    });
    
    // Increment time
    bristleBrushState.time += 0.1;
    
    // Limit path length to prevent memory issues
    if (bristleBrushState.pathPoints.length > 100) {
        bristleBrushState.pathPoints.shift();
    }
    
    // Create bristle points for this segment
    const distance = this.dist(fromCoords.x, fromCoords.y, toCoords.x, toCoords.y);
    const steps = Math.max(2, Math.floor(distance / 2));
    const actualBristleCount = Math.max(3, Math.floor(size * 0.8 * (bristleCount / 5)));
    
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    
    // Draw bristles along the path
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = this.lerp(fromCoords.x, toCoords.x, t);
        const y = this.lerp(fromCoords.y, toCoords.y, t);
        
        // Apply nearest point snapping for canvas texture
        const snapped = findNearestGridPoint(x, y, size * 0.2);
        const drawX = snapped ? snapped.x : x;
        const drawY = snapped ? snapped.y : y;
        
        // Noise mask for skips in strokes
        const noiseValue = noise(drawX, drawY, bristleBrushState.time);
        if (noiseValue < skipThreshold) continue; // Skip this point based on noise
        
        // Create bristles at this point
        for (let j = 0; j < actualBristleCount; j++) {
            // Bristle position within brush radius
            const angle = (j / actualBristleCount) * Math.PI * 2;
            const radius = size * 0.3 * (0.3 + Math.random() * 0.7);
            const bristleX = drawX + Math.cos(angle) * radius;
            const bristleY = drawY + Math.sin(angle) * radius;
            
            // Bristle size and opacity (no fade over time)
            const bristleSize = (0.3 + Math.random() * 0.7) * size * 0.15;
            const bristleOpacity = opacity * (0.4 + Math.random() * 0.4);
            
            // Add to bristle points for tracking
            bristleBrushState.bristlePoints.push({
                x: bristleX,
                y: bristleY,
                size: bristleSize,
                opacity: bristleOpacity,
                time: bristleBrushState.time,
                color: color
            });
            
            // Draw bristle point
            this.ctx.globalAlpha = bristleOpacity / 100;
            this.ctx.fillRect(bristleX - bristleSize/2, bristleY - bristleSize/2, bristleSize, bristleSize);
        }
    }
    
    // Clean up old bristle points
    const currentTime = bristleBrushState.time;
    bristleBrushState.bristlePoints = bristleBrushState.bristlePoints.filter(bristle => {
        const age = currentTime - bristle.time;
        return age < 0.2; // Keep bristles for current stroke only
    });
    
    this.ctx.restore();
}

// Reset sketching pencil brush state (call when starting new stroke)
function resetBristleBrush() {
    bristleBrushState.pathPoints = [];
    bristleBrushState.bristlePoints = [];
    bristleBrushState.time = 0;
}

// Register all brushes
if (typeof brushRegistry !== 'undefined') {
    brushRegistry.register('pen', penBrush, { name: 'Pen', category: 'basic' });
    brushRegistry.register('marker', markerBrush, { name: 'Marker', category: 'basic' });
    brushRegistry.register('beads', beadsBrush, { name: 'Beads', category: 'custom' });
    brushRegistry.register('calligraphy', calligraphyBrush, { name: 'Calligraphy', category: 'custom' });
    brushRegistry.register('hatching', hatchingBrush, { name: 'Hatching', category: 'custom' });
    brushRegistry.register('sprayPaint', sprayPaintBrush, { name: 'Spray Paint', category: 'special' });
    brushRegistry.register('realisticSketchingPencil', realisticSketchingPencil, { name: 'Realistic Sketching Pencil', category: 'custom' });
}

