// Brush Implementations - Adapted from p5.js code
// Color and size are handled by the existing system

// Pen Brush - Simple line
function penBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    const config = this.currentBrushConfig || {};
    const roundness = Math.max(0.1, config.roundness !== undefined ? config.roundness : 1);
    const angleRad = ((config.angle !== undefined ? config.angle : 0) * Math.PI) / 180;
    const midpointX = (fromCoords.x + toCoords.x) / 2;
    const midpointY = (fromCoords.y + toCoords.y) / 2;
    
    this.ctx.save();
    if (angleRad !== 0) {
        this.ctx.translate(midpointX, midpointY);
        this.ctx.rotate(angleRad);
        this.ctx.translate(-midpointX, -midpointY);
    }
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = size * roundness;
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
    const config = this.currentBrushConfig || {};
    const intensity = config.intensity !== undefined ? config.intensity : 0.4;
    const roundness = Math.max(0.1, config.roundness !== undefined ? config.roundness : 1);
    const angleRad = ((config.angle !== undefined ? config.angle : 0) * Math.PI) / 180;
    const radiusX = Math.max(0.1, (size / 2) * roundness);
    const radiusY = Math.max(0.1, (size / 2) / roundness);
    
    this.ctx.save();
    this.ctx.translate(toCoords.x, toCoords.y);
    if (angleRad !== 0) {
        this.ctx.rotate(angleRad);
    }
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = (opacity / 100) * intensity;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
}

// Beads Brush - Circle at midpoint with distance as diameter
function beadsBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    const config = this.currentBrushConfig || {};
    const intensity = config.intensity !== undefined ? config.intensity : 0.7;
    const roundness = Math.max(0.1, config.roundness !== undefined ? config.roundness : 1);
    const angleRad = ((config.angle !== undefined ? config.angle : 0) * Math.PI) / 180;
    
    const distance = this.dist(fromCoords.x, fromCoords.y, toCoords.x, toCoords.y);
    const midX = (fromCoords.x + toCoords.x) / 2;
    const midY = (fromCoords.y + toCoords.y) / 2;
    const baseRadius = Math.max(distance / 2, size / 4);
    const radiusX = Math.max(0.1, baseRadius * roundness);
    const radiusY = Math.max(0.1, baseRadius / roundness);
    
    this.ctx.save();
    this.ctx.translate(midX, midY);
    if (angleRad !== 0) {
        this.ctx.rotate(angleRad);
    }
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = (opacity / 100) * intensity;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
}

// Calligraphy Brush - Slanted lines with lerping
function calligraphyBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    const config = this.currentBrushConfig || {};
    const lerps = config.lerps !== undefined ? config.lerps : 16;
    const lineWidth = config.lineWidth !== undefined ? config.lineWidth : 1;
    const roundness = Math.max(0.1, config.roundness !== undefined ? config.roundness : 1);
    const angleRad = (Math.PI / 4) + ((config.angle !== undefined ? config.angle : 0) * Math.PI / 180);
    const offsetX = (size / 2) * roundness * Math.cos(angleRad);
    const offsetY = (size / 2) * roundness * Math.sin(angleRad);
    
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.globalAlpha = opacity / 100;
    
    for (let i = 0; i <= lerps - 1; i++) {
        const x = this.lerp(fromCoords.x, toCoords.x, i / lerps);
        const y = this.lerp(fromCoords.y, toCoords.y, i / lerps);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x - offsetX, y - offsetY);
        this.ctx.lineTo(x + offsetX, y + offsetY);
        this.ctx.stroke();
    }
    this.ctx.restore();
}

// Hatching Brush - Lines with vector inversion
function hatchingBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    const config = this.currentBrushConfig || {};
    const lerps = config.lerps !== undefined ? config.lerps : 3;
    const lineWidth = config.lineWidth !== undefined ? config.lineWidth : 1;
    const roundness = Math.max(0.1, config.roundness !== undefined ? config.roundness : 1);
    const angleRad = ((config.angle !== undefined ? config.angle : 0) * Math.PI) / 180;
    
    const speed = this.getSpeed(fromCoords, toCoords);
    const vectorX = toCoords.y - fromCoords.y;
    const vectorY = toCoords.x - fromCoords.x;
    const magnitude = speed / 2;
    const vectorLength = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
    const normalizedX = vectorLength > 0 ? (vectorX / vectorLength) * magnitude : 0;
    const normalizedY = vectorLength > 0 ? (vectorY / vectorLength) * magnitude : 0;
    const scaledX = normalizedX * roundness;
    const scaledY = normalizedY * roundness;
    const rotatedX = scaledX * Math.cos(angleRad) - scaledY * Math.sin(angleRad);
    const rotatedY = scaledX * Math.sin(angleRad) + scaledY * Math.cos(angleRad);
    
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.globalAlpha = opacity / 100;
    
    for (let i = 0; i < lerps; i++) {
        const x = this.lerp(fromCoords.x, toCoords.x, i / lerps);
        const y = this.lerp(fromCoords.y, toCoords.y, i / lerps);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x - rotatedX, y - rotatedY);
        this.ctx.lineTo(x + rotatedX, y + rotatedY);
        this.ctx.stroke();
    }
    this.ctx.restore();
}

// Spray Paint Brush - Random points in circle
function sprayPaintBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    const config = this.currentBrushConfig || {};
    const density = config.density !== undefined ? config.density : 10;
    const minRadiusRatio = config.minRadius !== undefined ? config.minRadius : 0.5;
    const roundness = Math.max(0.1, config.roundness !== undefined ? config.roundness : 1);
    const angleRad = ((config.angle !== undefined ? config.angle : 0) * Math.PI) / 180;
    
    const speed = this.getSpeed(fromCoords, toCoords);
    const minRadius = size * minRadiusRatio;
    const sprayDensity = density;
    const r = Math.min(speed + minRadius, size);
    
    const lerps = 10;
    
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity / 100;
    
    for (let i = 0; i < lerps; i++) {
        const lerpX = this.lerp(fromCoords.x, toCoords.x, i / lerps);
        const lerpY = this.lerp(fromCoords.y, toCoords.y, i / lerps);
        
        for (let j = 0; j < sprayDensity; j++) {
            const theta = Math.random() * Math.PI * 2;
            const radius = Math.sqrt(Math.random()) * r;
            let offsetX = Math.cos(theta) * radius * roundness;
            let offsetY = Math.sin(theta) * radius / roundness;
            
            if (angleRad !== 0) {
                const rotatedX = offsetX * Math.cos(angleRad) - offsetY * Math.sin(angleRad);
                const rotatedY = offsetX * Math.sin(angleRad) + offsetY * Math.cos(angleRad);
                offsetX = rotatedX;
                offsetY = rotatedY;
            }
            
            this.ctx.fillRect(lerpX + offsetX, lerpY + offsetY, 1, 1);
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
    const config = this.currentBrushConfig || {};
    const gridSize = config.gridSize !== undefined ? config.gridSize : 4;
    const bristleCount = config.bristleCount !== undefined ? config.bristleCount : 5;
    const skipThreshold = config.skipThreshold !== undefined ? config.skipThreshold : 0.3;
    const roundness = Math.max(0.1, config.roundness !== undefined ? config.roundness : 1);
    const angleRad = ((config.angle !== undefined ? config.angle : 0) * Math.PI) / 180;
    
    initCanvasGrid(this.canvasWidth, this.canvasHeight, gridSize);
    
    bristleBrushState.pathPoints.push({
        x: toCoords.x,
        y: toCoords.y,
        time: bristleBrushState.time
    });
    
    bristleBrushState.time += 0.1;
    
    if (bristleBrushState.pathPoints.length > 100) {
        bristleBrushState.pathPoints.shift();
    }
    
    const distance = this.dist(fromCoords.x, fromCoords.y, toCoords.x, toCoords.y);
    const steps = Math.max(2, Math.floor(distance / 2));
    const actualBristleCount = Math.max(3, Math.floor(size * 0.8 * (bristleCount / 5)));
    
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = this.lerp(fromCoords.x, toCoords.x, t);
        const y = this.lerp(fromCoords.y, toCoords.y, t);
        
        const snapped = findNearestGridPoint(x, y, size * 0.2);
        const drawX = snapped ? snapped.x : x;
        const drawY = snapped ? snapped.y : y;
        
        const noiseValue = noise(drawX, drawY, bristleBrushState.time);
        if (noiseValue < skipThreshold) continue;
        
        for (let j = 0; j < actualBristleCount; j++) {
            const theta = (j / actualBristleCount) * Math.PI * 2 + angleRad;
            const radius = size * 0.3 * (0.3 + Math.random() * 0.7);
            const offsetX = Math.cos(theta) * radius * roundness;
            const offsetY = Math.sin(theta) * radius / roundness;
            const bristleX = drawX + offsetX;
            const bristleY = drawY + offsetY;
            
            const bristleSize = (0.3 + Math.random() * 0.7) * size * 0.15;
            const bristleOpacity = opacity * (0.4 + Math.random() * 0.4);
            
            bristleBrushState.bristlePoints.push({
                x: bristleX,
                y: bristleY,
                size: bristleSize,
                opacity: bristleOpacity,
                time: bristleBrushState.time,
                color: color
            });
            
            this.ctx.globalAlpha = bristleOpacity / 100;
            this.ctx.fillRect(bristleX - bristleSize / 2, bristleY - bristleSize / 2, bristleSize, bristleSize);
        }
    }
    
    const currentTime = bristleBrushState.time;
    bristleBrushState.bristlePoints = bristleBrushState.bristlePoints.filter(bristle => {
        const age = currentTime - bristle.time;
        return age < 0.2;
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
    brushRegistry.register('realisticSketchingPencil', realisticSketchingPencil, { name: 'Crayon', category: 'custom' });

}

