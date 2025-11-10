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
    
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity / 100 * 0.4; // Marker has transparency
    this.ctx.beginPath();
    this.ctx.arc(toCoords.x, toCoords.y, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
}

// Beads Brush - Circle at midpoint with distance as diameter
function beadsBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    
    // Find distance between points
    const distance = this.dist(fromCoords.x, fromCoords.y, toCoords.x, toCoords.y);
    
    // Find midpoint
    const midX = (fromCoords.x + toCoords.x) / 2;
    const midY = (fromCoords.y + toCoords.y) / 2;
    
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = opacity / 100 * 0.7; // Beads have some transparency
    this.ctx.beginPath();
    this.ctx.arc(midX, midY, Math.max(distance / 2, size / 4), 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
}

// Calligraphy Brush - Slanted lines with lerping
function calligraphyBrush(from, to, color, size, opacity) {
    const fromCoords = this.convertCoords(from);
    const toCoords = this.convertCoords(to);
    
    const lerps = 16;
    const width = size / 2;
    
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
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
    
    const lerps = 3;
    
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
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
    
    // Calculate speed
    const speed = this.getSpeed(fromCoords, toCoords);
    
    // Set minimum radius and spray density
    const minRadius = size / 2;
    const sprayDensity = Math.max(10, Math.floor(size / 2));
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

// Register all brushes
if (typeof brushRegistry !== 'undefined') {
    brushRegistry.register('pen', penBrush, { name: 'Pen', category: 'basic' });
    brushRegistry.register('marker', markerBrush, { name: 'Marker', category: 'basic' });
    brushRegistry.register('beads', beadsBrush, { name: 'Beads', category: 'custom' });
    brushRegistry.register('calligraphy', calligraphyBrush, { name: 'Calligraphy', category: 'custom' });
    brushRegistry.register('hatching', hatchingBrush, { name: 'Hatching', category: 'custom' });
    brushRegistry.register('sprayPaint', sprayPaintBrush, { name: 'Spray Paint', category: 'special' });
}

