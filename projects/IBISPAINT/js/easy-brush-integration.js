// Easy-Brush Integration Module
// Integrates easy-brush library with the IbisPaint workspace

class EasyBrushIntegration {
    constructor(workspace) {
        this.workspace = workspace;
        this.isInitialized = false;
        this.brush = null;
        this.brushCanvas = null;
        this.brushCtx = null;
        this.isDrawing = false;
        this.lastPoint = null;
        this.strokeStartImageData = null; // Store layer state at stroke start
        
        // Brush configuration
        this.brushConfig = {
            color: "#000000",
            size: 8,
            flow: 0.8,
            opacity: 0.5,
            spacing: 0.15,
            roundness: 1.00,
            angle: 0.00
        };
    }
    
    initialize() {
        if (this.isInitialized) return true;
        
        // Check if Brush is available (from browserify bundle)
        // Browserify exposes the module exports, so it might be window.Brush.Brush
        let BrushClass = null;
        if (typeof window !== 'undefined') {
            if (window.Brush && typeof window.Brush.Brush === 'function') {
                // Module exports object with Brush property
                BrushClass = window.Brush.Brush;
            } else if (typeof window.Brush === 'function') {
                // Direct export
                BrushClass = window.Brush;
            }
        }
        
        if (!BrushClass || typeof BrushClass !== 'function') {
            console.warn('easy-brush library not loaded or Brush is not a constructor');
            console.log('window.Brush:', typeof window !== 'undefined' ? window.Brush : 'window not available');
            if (typeof window !== 'undefined' && window.Brush) {
                console.log('window.Brush type:', typeof window.Brush);
                console.log('window.Brush keys:', Object.keys(window.Brush));
            }
            return false;
        }
        
        // Create a hidden canvas for easy-brush to use
        this.brushCanvas = document.createElement('canvas');
        this.brushCanvas.width = this.workspace.canvasWidth || 500;
        this.brushCanvas.height = this.workspace.canvasHeight || 500;
        this.brushCtx = this.brushCanvas.getContext('2d');
        
        // Initialize the brush
        try {
            this.brush = new BrushClass(this.brushCanvas);
            this.brush.bindConfig(this.brushConfig);
        } catch (e) {
            console.error('Error initializing easy-brush:', e);
            return false;
        }
        
        this.isInitialized = true;
        return true;
    }
    
    // Update canvas size when canvas resizes
    updateCanvasSize(width, height) {
        if (this.brushCanvas) {
            this.brushCanvas.width = width;
            this.brushCanvas.height = height;
        }
    }
    
    // Start a new stroke
    startStroke(coords) {
        if (!this.isInitialized || !this.brush) return;
        
        // Update brush canvas size if needed
        const canvasWidth = this.workspace.canvasWidth || 500;
        const canvasHeight = this.workspace.canvasHeight || 500;
        
        if (this.brushCanvas.width !== canvasWidth || 
            this.brushCanvas.height !== canvasHeight) {
            this.brushCanvas.width = canvasWidth;
            this.brushCanvas.height = canvasHeight;
        }
        
        // Clear the brush canvas for new stroke
        this.brushCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Save the current layer state before starting new stroke
        const layerCtx = this.workspace.getActiveLayerContext();
        if (layerCtx) {
            // Save the current layer content to a temporary canvas
            this.strokeStartImageData = layerCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        }
        
        // Convert coordinates from our system (center origin) to canvas coordinates (top-left origin)
        const halfWidth = canvasWidth / 2;
        const halfHeight = canvasHeight / 2;
        
        const x = coords.x + halfWidth;
        const y = coords.y + halfHeight;
        
        // Start drawing
        this.isDrawing = true;
        this.lastPoint = { x, y };
        
        // Put first point
        const pressure = 0.5; // Default pressure
        this.brush.putPoint(x, y, pressure);
    }
    
    // Continue drawing stroke
    drawStroke(from, to) {
        if (!this.isInitialized || !this.brush || !this.isDrawing) return;
        
        // Convert coordinates from our system (center origin) to canvas coordinates (top-left origin)
        const canvasWidth = this.workspace.canvasWidth || 500;
        const canvasHeight = this.workspace.canvasHeight || 500;
        const halfWidth = canvasWidth / 2;
        const halfHeight = canvasHeight / 2;
        
        const toX = to.x + halfWidth;
        const toY = to.y + halfHeight;
        
        // Calculate pressure based on speed (faster = lower pressure, slower = higher pressure)
        const distance = Math.sqrt((toX - this.lastPoint.x) ** 2 + (toY - this.lastPoint.y) ** 2);
        const pressure = Math.max(0.1, Math.min(1.0, 1.0 - (distance / 100))); // Inverse relationship with speed
        
        // Save brush canvas state before adding new point
        const brushBefore = this.brushCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        
        // Put point and render on brush canvas
        this.brush.putPoint(toX, toY, pressure);
        this.brush.render();
        
        // Get brush canvas state after rendering
        const brushAfter = this.brushCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        
        // Calculate only the new pixels by comparing before and after
        const layerCtx = this.workspace.getActiveLayerContext();
        if (layerCtx && this.strokeStartImageData) {
            // Create a canvas to extract only new pixels
            const newPixelsCanvas = document.createElement('canvas');
            newPixelsCanvas.width = canvasWidth;
            newPixelsCanvas.height = canvasHeight;
            const newPixelsCtx = newPixelsCanvas.getContext('2d');
            
            // Draw the after state
            newPixelsCtx.putImageData(brushAfter, 0, 0);
            
            // Use destination-out to remove the before state, leaving only new pixels
            newPixelsCtx.globalCompositeOperation = 'destination-out';
            newPixelsCtx.putImageData(brushBefore, 0, 0);
            
            // Now newPixelsCanvas contains only the new pixels
            // Restore the layer to its state before this stroke
            layerCtx.putImageData(this.strokeStartImageData, 0, 0);
            
            // Draw only the new pixels onto the layer
            layerCtx.save();
            layerCtx.globalCompositeOperation = 'source-over';
            layerCtx.drawImage(newPixelsCanvas, 0, 0);
            layerCtx.restore();
        }
        
        this.lastPoint = { x: toX, y: toY };
    }
    
    // End the current stroke
    endStroke() {
        if (!this.isInitialized || !this.brush || !this.isDrawing) return;
        
        // Finalize the stroke in easy-brush
        this.brush.finalizeStroke();
        
        // Copy the final stroke to the layer
        const layerCtx = this.workspace.getActiveLayerContext();
        if (layerCtx && this.brushCanvas && this.strokeStartImageData) {
            // Restore the layer to its state before this stroke
            layerCtx.putImageData(this.strokeStartImageData, 0, 0);
            
            // Draw the final stroke
            layerCtx.save();
            layerCtx.globalCompositeOperation = 'source-over';
            layerCtx.drawImage(this.brushCanvas, 0, 0);
            layerCtx.restore();
        }
        
        // Clear brush canvas for next stroke
        if (this.brushCanvas) {
            this.brushCtx.clearRect(0, 0, this.brushCanvas.width, this.brushCanvas.height);
        }
        
        // Clear the saved image data
        this.strokeStartImageData = null;
        
        this.isDrawing = false;
        this.lastPoint = null;
    }
    
    // Update brush configuration
    updateConfig(config) {
        if (!this.brushConfig) return;
        
        Object.assign(this.brushConfig, config);
        
        // The brush is bound to config, so changes should be automatic
        // But we can also explicitly update if needed
        if (this.brush && this.brush.bindConfig) {
            this.brush.bindConfig(this.brushConfig);
        }
    }
    
    // Get current configuration
    getConfig() {
        return { ...this.brushConfig };
    }
}

