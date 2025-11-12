/**
 * Main application controller for the Ibis Paint workspace.
 * Handles initialization, UI wiring, drawing logic, history, layers,
 * and the various panels and tool interactions that make up the app experience.
 */
// Ibis Paint Workspace - Clean UI with Core Functionality
class IbisPaintWorkspace {
    constructor() {
        // Workspace state
        this.currentTool = 'brush';
        this.brushSize = 20;
        this.brushOpacity = 100;
        this.currentColor = '#000000';
        this.stabilizer = 25;
        
        // Brush settings per brush ID (size and opacity)
        this.brushSettings = {};
        
        // Brush configs per brush ID (additional parameters like flow, spacing, etc.)
        this.brushConfigs = {};
        this.isBrushConfigOpen = false;
        this.activeBrushConfigBrushId = null;
        
        // Layer management
        this.layers = [
            { id: 'layer-1', name: '1', visible: true, opacity: 100, blendMode: 'normal', isActive: true, thumbnail: null, color: '#feca57', type: 'layer', parentId: null, canvas: null, ctx: null },
        ];
        this.activeLayerId = 'layer-1';
        this.selectedLayerIds = new Set(['layer-1']); // Multi-select support
        this.nextLayerId = 2;
        this.nextFolderId = 1;
        
        // Multi-select mode state
        this.isMultiSelectMode = false;
        this.longPressTimer = null;
        this.longPressDelay = 500; // 500ms for long press
        this.longPressStartPos = null;
        this.longPressThreshold = 10; // pixels - allow small movement during long press
        this.isDragging = false; // Track if we're currently dragging
        
        // History for undo/redo
        // History entries can be:
        // - { type: 'canvas', imageData: ImageData } - canvas drawing state
        // - { type: 'layers', layers: Array } - layer structure state
        this.history = [];
        this.historyStep = -1;
        
        // Canvas reference
        this.canvas = null;
        this.ctx = null;
        
        // Zoom, pan, and rotation state
        this.zoom = 1;
        this.minZoom = 0.1;
        this.maxZoom = 5;
        this.zoomStep = 0.1;
        this.panX = 0;
        this.panY = 0;
        this.rotation = 0; // in radians
        this.isPanning = false;
        this.isRotating = false;
        this.lastPanX = 0;
        this.lastPanY = 0;
        this.lastRotateX = 0;
        this.lastRotateY = 0;
        this.initialRotation = 0;
        
        // Drawing area (white square)
        this.drawingAreaSize = 500;
        this.canvasWidth = 500;
        this.canvasHeight = 500;
        
        // Thumbnail display mode: 'full' (show whole canvas) or 'zoomed' (show zoomed strokes)
        this.thumbnailMode = 'full';
        
        // Project management
        this.currentProjectId = null;
        
        // Drawing state (disabled)
        this.isDrawing = false;
        this.lastPoint = null;
        this.drawingData = [];
        
        // Layer canvases are now stored in each layer object
        
        this.init();
    }
    
    init() {
        // Force cache clear on load
        this.clearCache();
        
        this.setupWorkspace();
        this.setupEventListeners();
        this.setupLayers();
        this.setupLayerControls();
        this.setupColorPicker();
        this.setupTopToolbar();
        this.setupBrushPanel();
        this.setupReferenceImages();
        this.setupHomepage();
        
        // Disable persistence: always start with a fresh canvas in workspace
        this.currentProjectId = null;
        this.resetWorkspace();
        this.showWorkspace();
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 150);
        
        this.updateUI();
        this.updateToolSelectionByTool(); // Set initial tool selection
        this.updateBrushSlidersVisibility(); // Show/hide brush sliders based on initial tool
        this.updateToolButtonIcon(); // Update tool button icon to match initial tool
        
        // Save initial canvas state for undo/redo
        this.saveInitialCanvasState();
        this.updateUndoRedoButtons(); // Update undo/redo button states
        
        // Dev access in console
        window.workspace = this;
    }
    
    // ===== CACHE CLEARING =====
    clearCache() {
        // Force reload CSS to bypass cache
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            const href = link.href.split('?')[0];
            const newHref = href + '?t=' + Date.now();
            
            // Remove old link
            const parent = link.parentNode;
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = newHref;
            newLink.type = 'text/css';
            
            // Replace the old link with new one
            parent.removeChild(link);
            parent.appendChild(newLink);
        });
        
        // Clear browser cache if possible
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        
        console.log('Cache cleared - CSS reloaded');
    }
    
    // ===== WORKSPACE SETUP =====
    setupWorkspace() {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Create canvas for each layer
        this.initializeLayerCanvases();
        
        // Simple canvas setup for workspace display
        this.setupCanvasDisplay();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    initializeLayerCanvases() {
        // Create a canvas for each layer
        this.layers.forEach(layer => {
            if (layer.type === 'layer' && !layer.canvas) {
                layer.canvas = document.createElement('canvas');
                layer.canvas.width = this.canvasWidth || this.drawingAreaSize;
                layer.canvas.height = this.canvasHeight || this.drawingAreaSize;
                layer.ctx = layer.canvas.getContext('2d');
                // Start with transparent background for each layer
                layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
            } else if (layer.type === 'layer' && layer.canvas) {
                // Update existing canvas size if it doesn't match
                const targetWidth = this.canvasWidth || this.drawingAreaSize;
                const targetHeight = this.canvasHeight || this.drawingAreaSize;
                if (layer.canvas.width !== targetWidth || layer.canvas.height !== targetHeight) {
                    // Preserve content
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = layer.canvas.width;
                    tempCanvas.height = layer.canvas.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.drawImage(layer.canvas, 0, 0);
                    
                    // Resize
                    layer.canvas.width = targetWidth;
                    layer.canvas.height = targetHeight;
                    layer.ctx.clearRect(0, 0, targetWidth, targetHeight);
                    layer.ctx.drawImage(tempCanvas, 0, 0);
                }
            }
        });
    }
    
    getActiveLayer() {
        return this.layers.find(l => l.id === this.activeLayerId);
    }
    
    getActiveLayerCanvas() {
        const activeLayer = this.getActiveLayer();
        return activeLayer ? activeLayer.canvas : null;
    }
    
    getActiveLayerContext() {
        const activeLayer = this.getActiveLayer();
        return activeLayer ? activeLayer.ctx : null;
    }
    
    setupCanvasDisplay() {
        const container = this.canvas.parentElement;
        if (container) {
            const rect = container.getBoundingClientRect();
            
            // Set canvas to fill the entire container (for the void space)
            this.canvas.width = Math.max(1, Math.floor(rect.width));
            this.canvas.height = Math.max(1, Math.floor(rect.height));
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            // Canvas fills the space but drawing area is a white square
            this.canvas.style.margin = '0';
            this.canvas.style.display = 'block';
            this.canvas.style.border = 'none';
            this.canvas.style.borderRadius = '0';
            this.canvas.style.boxShadow = 'none';
            
            // Apply zoom and pan transformations
            this.applyTransformations();
        }
    }
    
    applyTransformations() {
        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update navigation canvas if visible (but throttle to avoid too many updates)
        if (document.getElementById('navigation-panel')?.classList.contains('show')) {
            if (!this.navCanvasUpdatePending) {
                this.navCanvasUpdatePending = true;
                requestAnimationFrame(() => {
                    this.updateNavigationCanvas();
                    this.navCanvasUpdatePending = false;
                });
            }
        }
        
        // Fill background with void color from CSS variable
        const voidColor = getComputedStyle(document.documentElement).getPropertyValue('--void-color').trim() || '#383838';
        this.ctx.fillStyle = voidColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for transformations
        this.ctx.save();
        
        // Move to center of canvas
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        
        // Apply pan
        this.ctx.translate(this.panX, this.panY);
        
        // Apply rotation
        this.ctx.rotate(this.rotation);
        
        // Apply zoom
        this.ctx.scale(this.zoom, this.zoom);
        
        // Draw the drawing canvas (white square with content)
        this.drawDrawingArea();
        
        // Restore context
        this.ctx.restore();
        
        // Redraw preview if canvas settings popup is visible
        const popup = document.getElementById('canvas-settings-popup');
        if (popup && popup.classList.contains('is-visible')) {
            this.updateCanvasPreview();
        }
    }
    
    drawDrawingArea() {
        const canvasWidth = this.canvasWidth || this.drawingAreaSize;
        const canvasHeight = this.canvasHeight || this.drawingAreaSize;
        const halfWidth = canvasWidth / 2;
        const halfHeight = canvasHeight / 2;
        
        // Draw white background first
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(-halfWidth, -halfHeight, canvasWidth, canvasHeight);
        
        // Draw all visible layers from bottom to top
        // In the layers array, index 0 is at the bottom, higher indices are on top
        // So we draw from index 0 to length-1 (bottom to top)
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (layer.type === 'layer' && layer.visible && layer.canvas) {
                this.ctx.globalAlpha = layer.opacity / 100;
                this.ctx.globalCompositeOperation = layer.blendMode || 'source-over';
                this.ctx.drawImage(layer.canvas, -halfWidth, -halfHeight, canvasWidth, canvasHeight);
            }
        }
        
        // Reset composite operation
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Draw border using CSS variable (optional - set to 'none' in CSS to remove)
        const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--canvas-border-color').trim() || '#374151';
        if (borderColor !== 'none' && borderColor !== 'transparent') {
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 2 / this.zoom;
            this.ctx.strokeRect(-halfWidth, -halfHeight, canvasWidth, canvasHeight);
        }
    }
    
    handleResize() {
        this.setupCanvasDisplay();
    }
    
    // ===== ZOOM CONTROLS =====
    
    zoomIn() {
        const newZoom = Math.min(this.zoom + this.zoomStep, this.maxZoom);
        this.setZoom(newZoom);
    }
    
    zoomOut() {
        const newZoom = Math.max(this.zoom - this.zoomStep, this.minZoom);
        this.setZoom(newZoom);
    }
    
    resetZoom() {
        this.setZoom(1);
        this.panX = 0;
        this.panY = 0;
        this.rotation = 0;
        this.applyTransformations();
        // noop
    }
    
    rotateLeft() {
        this.rotation -= Math.PI / 4; // 45 degrees
        this.rotation = this.snapToAngle(this.rotation);
        this.applyTransformations();
        // noop
    }
    
    rotateRight() {
        this.rotation += Math.PI / 4; // 45 degrees
        this.rotation = this.snapToAngle(this.rotation);
        this.applyTransformations();
        // noop
    }
    
    // ===== KEYBOARD SHORTCUTS =====
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }
            
            // Ctrl+Z or Cmd+Z - Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.handleUndo();
                return;
            }
            
            // Shift+Ctrl+Z or Shift+Cmd+Z - Redo
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                this.handleRedo();
                return;
            }
            
            // H - Hand tool (pan/drag)
            if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                // Toggle hand tool or activate panning
                if (this.currentTool === 'hand') {
                    // Switch back to brush if already on hand
                    this.setCurrentTool('brush');
                } else {
                    this.setCurrentTool('hand');
                }
                return;
            }
            
            // R - Start rotation mode (hold and drag to rotate)
            if (e.key === 'r' || e.key === 'R') {
                if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
                    e.preventDefault();
                    this.isRotating = true;
                    this.initialRotation = this.rotation;
                    this.updateCanvasCursor();
                    return;
                }
            }
            
            // Z - Zoom in (only if not Ctrl/Cmd/Alt)
            if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                this.zoomIn();
                return;
            }
            
            // Alt+Z or Option+Z - Zoom out
            if (e.altKey && (e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.zoomOut();
                return;
            }
            
            // B - Brush tool
            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                this.setCurrentTool('brush');
                return;
            }
            
            // E - Eraser tool
            if (e.key === 'e' || e.key === 'E') {
                e.preventDefault();
                this.setCurrentTool('eraser');
                return;
            }
            
            // I - Eyedropper tool
            if (e.key === 'i' || e.key === 'I') {
                e.preventDefault();
                this.setCurrentTool('eyedropper');
                return;
            }
            
            // L - Layers panel toggle
            if (e.key === 'l' || e.key === 'L') {
                e.preventDefault();
                this.toggleLayersPanel();
                return;
            }
            
            // Delete or Backspace - Delete selected layer(s)
            if ((e.key === 'Delete' || e.key === 'Backspace') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (this.selectedLayerIds.size > 0) {
                    const layersToDelete = Array.from(this.selectedLayerIds);
                    layersToDelete.forEach(layerId => {
                        this.deleteLayer(layerId);
                    });
                }
                return;
            }
            
            // Escape - Close panels
            if (e.key === 'Escape') {
                const brushPanel = document.getElementById('brush-panel');
                const layersPanel = document.getElementById('layers-panel');
                const configPanel = document.getElementById('brush-config-panel');
                
                if (configPanel && configPanel.classList.contains('is-visible')) {
                    this.closeBrushConfigPanel();
                } else if (brushPanel && brushPanel.classList.contains('is-visible')) {
                    this.closeBrushPanel();
                } else if (layersPanel && layersPanel.classList.contains('is-visible')) {
                    this.toggleLayersPanel();
                }
                return;
            }
        });
        
        // Handle keyup for rotation mode
        document.addEventListener('keyup', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.isRotating = false;
                this.lastRotateX = 0;
                this.lastRotateY = 0;
                this.updateCanvasCursor();
            }
        });
        
    }
    
    setupTouchGestures() {
        let lastTouchDistance = 0;
        let lastTouchAngle = 0;
        let lastCenterX = 0;
        let lastCenterY = 0;
        let initialRotation = 0;
        let initialZoom = 1;
        let initialPanX = 0;
        let initialPanY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                // Two finger gesture - pinch to zoom, rotate, and pan
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                // Calculate center point between touches
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                const centerY = (touch1.clientY + touch2.clientY) / 2;
                lastCenterX = centerX;
                lastCenterY = centerY;
                
                // Calculate distance between touches
                const distance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) + 
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                lastTouchDistance = distance;
                
                // Calculate angle between touches
                const angle = Math.atan2(
                    touch2.clientY - touch1.clientY,
                    touch2.clientX - touch1.clientX
                );
                lastTouchAngle = angle;
                
                // Store initial values
                initialRotation = this.rotation;
                initialZoom = this.zoom;
                initialPanX = this.panX;
                initialPanY = this.panY;
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                // Two finger gesture
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                // Calculate current center point
                const currentCenterX = (touch1.clientX + touch2.clientX) / 2;
                const currentCenterY = (touch1.clientY + touch2.clientY) / 2;
                
                // Calculate current distance
                const currentDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) + 
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                // Calculate current angle
                const currentAngle = Math.atan2(
                    touch2.clientY - touch1.clientY,
                    touch2.clientX - touch1.clientX
                );
                
                // Pan based on center movement
                const deltaX = currentCenterX - lastCenterX;
                const deltaY = currentCenterY - lastCenterY;
                this.panX = initialPanX + deltaX;
                this.panY = initialPanY + deltaY;
                
                // Zoom based on distance change
                if (lastTouchDistance > 0) {
                    const scale = currentDistance / lastTouchDistance;
                    const newZoom = initialZoom * scale;
                    this.setZoom(Math.max(this.minZoom, Math.min(newZoom, this.maxZoom)));
                }
                
                // Rotate based on angle change
                const angleDiff = currentAngle - lastTouchAngle;
                let newRotation = initialRotation + angleDiff;
                
                // Snap to perfect angles (0, 90, 180, 270 degrees)
                newRotation = this.snapToAngle(newRotation);
                this.rotation = newRotation;
                
                this.applyTransformations();
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            // Reset touch tracking
            lastTouchDistance = 0;
            lastTouchAngle = 0;
            lastCenterX = 0;
            lastCenterY = 0;
        });
    }
    
    snapToAngle(angle) {
        // Convert angle to degrees for easier calculation
        const degrees = (angle * 180) / Math.PI;
        
        // Normalize angle to 0-360 range
        let normalizedDegrees = ((degrees % 360) + 360) % 360;
        
        // Define snap points (0, 90, 180, 270 degrees)
        const snapPoints = [0, 90, 180, 270];
        const snapThreshold = 5; // degrees
        
        // Find the closest snap point
        let closestSnap = 0;
        let minDistance = 360;
        
        for (const snapPoint of snapPoints) {
            let distance = Math.abs(normalizedDegrees - snapPoint);
            
            // Handle wraparound (e.g., 350 degrees is closer to 0 than 270 degrees)
            if (distance > 180) {
                distance = 360 - distance;
            }
            
            if (distance < minDistance) {
                minDistance = distance;
                closestSnap = snapPoint;
            }
        }
        
        // Only snap if within threshold
        if (minDistance <= snapThreshold) {
            // Convert back to radians
            return (closestSnap * Math.PI) / 180;
        }
        
        // Return original angle if not close enough to snap
        return angle;
    }
    
    setZoom(newZoom) {
        this.zoom = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));
        this.applyTransformations();
        this.updateZoomDisplay();
        // noop
    }
    
    fitCanvasToViewport() {
        // Calculate zoom level to fit canvas in viewport with void space around it
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const canvasWidth = this.canvasWidth || this.drawingAreaSize;
        const canvasHeight = this.canvasHeight || this.drawingAreaSize;
        
        // Leave some padding (void space) around the canvas - use 80% of viewport
        const paddingRatio = 0.8;
        const availableWidth = rect.width * paddingRatio;
        const availableHeight = rect.height * paddingRatio;
        
        // Calculate zoom to fit both width and height
        const zoomX = availableWidth / canvasWidth;
        const zoomY = availableHeight / canvasHeight;
        const fitZoom = Math.min(zoomX, zoomY);
        
        // Set zoom and center the canvas
        this.setZoom(fitZoom);
        this.panX = 0;
        this.panY = 0;
        this.rotation = 0;
        this.applyTransformations();
    }
    
    updateZoomDisplay() {
        const zoomDisplay = document.getElementById('zoom-display');
        if (zoomDisplay) {
            zoomDisplay.textContent = `${Math.round(this.zoom * 100)}%`;
        }
    }
    
    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Touch gesture controls
        this.setupTouchGestures();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Touch-only controls - no mouse pan
        
        // Hidden controls (still functional)
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        const bottomUndoBtn = document.getElementById('bottom-undo-btn');
        const bottomRedoBtn = document.getElementById('bottom-redo-btn');
        const playBtn = document.getElementById('play-btn');
        const addLayerBtn = document.getElementById('add-layer-btn');
        
        if (undoBtn) undoBtn.addEventListener('click', () => this.handleUndo());
        if (redoBtn) redoBtn.addEventListener('click', () => this.handleRedo());
        if (bottomUndoBtn) bottomUndoBtn.addEventListener('click', () => this.handleUndo());
        if (bottomRedoBtn) bottomRedoBtn.addEventListener('click', () => this.handleRedo());
        if (playBtn) playBtn.addEventListener('click', () => this.handlePlay());
        if (addLayerBtn) addLayerBtn.addEventListener('click', () => this.addLayer());
        
        // Right sidebar tool tiles
        const toolTiles = document.querySelectorAll('.tool-tile');
        toolTiles.forEach(tile => {
            tile.addEventListener('click', () => {
                const tool = tile.getAttribute('data-tool');
                this.setCurrentTool(tool);
                this.updateToolSelection(tile);
            });
        });

        // Bottom toolbar interactions
        const el = (id) => document.getElementById(id);
        const bottomBar = document.querySelector('.bottom-toolbar');
        const btnSwitch = el('btn-switch');
        const btnBrush = el('btn-brush');
        const btnColor = el('btn-color');
        const btnHide = el('btn-hidebar');
        const btnUndo2 = el('btn-undo');
        const btnRedo2 = el('btn-redo');
        const btnLayers = el('btn-layers');
        const btnBack = el('btn-back');

        if (btnSwitch) {
            btnSwitch.addEventListener('click', () => {
                if (this.currentTool === 'brush') {
                    this.setCurrentTool('eraser');
                    btnSwitch.classList.remove('icon-eraser');
                    btnSwitch.classList.add('icon-brush');
                } else {
                    this.setCurrentTool('brush');
                    btnSwitch.classList.remove('icon-brush');
                    btnSwitch.classList.add('icon-eraser');
                }
                this.updateUI();
            });
        }

        if (btnBrush) {
            btnBrush.addEventListener('click', () => {
                this.openToolSettings();
            });
        }

        if (btnColor) {
            btnColor.addEventListener('click', () => {
                const cp = document.getElementById('color-picker');
                if (cp) cp.click();
            });
        }

        if (btnHide && bottomBar) {
            btnHide.addEventListener('click', () => {
                const rightToolbar = document.querySelector('.right-float-toolbar');
                const topControls = document.querySelector('.top-right-controls');
                
                bottomBar.classList.toggle('is-collapsed');
                
                // Hide/show all UI elements
                if (bottomBar.classList.contains('is-collapsed')) {
                    // Hide all UI
                    if (rightToolbar) rightToolbar.style.display = 'none';
                    if (topControls) topControls.style.display = 'none';
                    btnHide.classList.remove('icon-chevron-down');
                    btnHide.classList.add('icon-chevron-up');
                } else {
                    // Show all UI
                    if (rightToolbar) rightToolbar.style.display = 'flex';
                    if (topControls) topControls.style.display = 'flex';
                    btnHide.classList.remove('icon-chevron-up');
                    btnHide.classList.add('icon-chevron-down');
                }
            });
        }

        if (btnUndo2) { btnUndo2.addEventListener('click', () => this.handleUndo()); }
        if (btnRedo2) { btnRedo2.addEventListener('click', () => this.handleRedo()); }
        if (btnLayers) {
            btnLayers.addEventListener('click', () => {
                this.toggleLayersPanel();
            });
        }
        // Back button - go to homepage
        if (btnBack) {
            btnBack.addEventListener('click', (e) => {
                e.stopPropagation();
                this.saveCurrentProject();
                this.showHomepage();
            });
        }
        
        // Clear canvas option
        const optionClearCanvas = document.getElementById('option-clear-canvas');
        if (optionClearCanvas) {
            optionClearCanvas.addEventListener('click', () => {
                this.clearCanvas();
                const optionsMenu = document.getElementById('options-menu');
                if (optionsMenu) optionsMenu.classList.remove('is-visible');
            });
        }
        
        // Thumbnail mode toggle option
        const optionThumbnailMode = document.getElementById('option-thumbnail-mode');
        if (optionThumbnailMode) {
            // Initialize menu text
            const textSpan = optionThumbnailMode.querySelector('span');
            if (textSpan) {
                textSpan.textContent = this.thumbnailMode === 'full' 
                    ? 'Thumbnails: Full Canvas' 
                    : 'Thumbnails: Zoomed Strokes';
            }
            
            optionThumbnailMode.addEventListener('click', () => {
                this.toggleThumbnailMode();
                // Don't close the menu, just toggle the mode
            });
        }
        
        // Canvas settings popup
        const canvasSettingsPopup = document.getElementById('canvas-settings-popup');
        const canvasSettingsClose = document.getElementById('canvas-settings-close');
        const canvasSettingsCancel = document.getElementById('canvas-settings-cancel');
        const canvasSettingsApply = document.getElementById('canvas-settings-apply');
        const canvasWidthInput = document.getElementById('canvas-width');
        const canvasHeightInput = document.getElementById('canvas-height');
        
        if (canvasSettingsClose) {
            canvasSettingsClose.addEventListener('click', () => {
                this.closeCanvasSettings();
            });
        }
        
        if (canvasSettingsCancel) {
            canvasSettingsCancel.addEventListener('click', () => {
                this.closeCanvasSettings();
            });
        }
        
        if (canvasWidthInput && canvasHeightInput) {
            // Update preview when inputs change
            const updatePreview = () => {
                this.updateCanvasPreview();
            };
            
            canvasWidthInput.addEventListener('input', updatePreview);
            canvasHeightInput.addEventListener('input', updatePreview);
        }
        
        if (canvasSettingsApply && canvasWidthInput && canvasHeightInput) {
            canvasSettingsApply.addEventListener('click', () => {
                const newWidth = parseInt(canvasWidthInput.value);
                const newHeight = parseInt(canvasHeightInput.value);
                
                if (newWidth >= 100 && newWidth <= 5000 && newHeight >= 100 && newHeight <= 5000) {
                    this.resizeCanvas(newWidth, newHeight);
                    this.closeCanvasSettings();
                    // Automatically select brush tool after applying canvas size
                    this.setCurrentTool('brush');
                } else {
                    alert('Canvas size must be between 100 and 5000 pixels');
                }
            });
        }
        
        // Close canvas settings when clicking outside
        if (canvasSettingsPopup) {
            document.addEventListener('click', (e) => {
                if (canvasSettingsPopup.classList.contains('is-visible')) {
                    // Don't close if clicking on the popup itself, the tool button, or a tool tile
                    const isClickOnPopup = canvasSettingsPopup.contains(e.target);
                    const isClickOnToolButton = document.getElementById('btn-brush')?.contains(e.target);
                    const isClickOnToolTile = e.target.closest('.tool-tile');
                    const isClickOnCanvasTool = isClickOnToolTile && isClickOnToolTile.getAttribute('data-tool') === 'canvas';
                    
                    // Only close if clicking outside and not on canvas tool tile
                    if (!isClickOnPopup && !isClickOnToolButton && !isClickOnCanvasTool) {
                        this.closeCanvasSettings();
                    }
                }
            });
        }
        
        // Brush controls
        const brushSizeSlider = document.getElementById('brush-size-slider');
        const brushOpacitySlider = document.getElementById('brush-opacity-slider');
        const stabilizerSlider = document.getElementById('stabilizer-slider');
        
        if (brushSizeSlider) {
            brushSizeSlider.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
                // noop
            });
        }
        
        if (brushOpacitySlider) {
            brushOpacitySlider.addEventListener('input', (e) => {
                this.brushOpacity = parseInt(e.target.value);
                // noop
            });
        }
        
        if (stabilizerSlider) {
            stabilizerSlider.addEventListener('input', (e) => {
                this.stabilizer = parseInt(e.target.value);
                // noop
            });
        }
        
        // Vertical brush control sliders (shown when brush is selected)
        const brushSizeVerticalSlider = document.getElementById('brush-size-vertical-slider');
        const brushOpacityVerticalSlider = document.getElementById('brush-opacity-vertical-slider');
        const brushSizeValue = document.getElementById('brush-size-value');
        const brushOpacityValue = document.getElementById('brush-opacity-value');
        
        if (brushSizeVerticalSlider) {
            brushSizeVerticalSlider.value = this.brushSize;
            const updateBrushSize = (e) => {
                const value = parseInt(e.target.value);
                this.brushSize = value;
                if (brushSizeValue) brushSizeValue.textContent = value;
                // Also update hidden slider if it exists
                if (brushSizeSlider) brushSizeSlider.value = value;
                
                // Save size to current brush settings
                if (this.selectedBrushId) {
                    if (!this.brushSettings[this.selectedBrushId]) {
                        this.brushSettings[this.selectedBrushId] = {};
                    }
                    this.brushSettings[this.selectedBrushId].size = value;
                    
                    // Update the brush value in the brush list
                    this.updateBrushValueInList(this.selectedBrushId, value);
                }
            };
            brushSizeVerticalSlider.addEventListener('input', updateBrushSize);
            brushSizeVerticalSlider.addEventListener('change', updateBrushSize);
        }
        
        if (brushOpacityVerticalSlider) {
            brushOpacityVerticalSlider.value = this.brushOpacity;
            const updateBrushOpacity = (e) => {
                const value = parseInt(e.target.value);
                this.brushOpacity = value;
                if (brushOpacityValue) brushOpacityValue.textContent = value;
                // Also update hidden slider if it exists
                if (brushOpacitySlider) brushOpacitySlider.value = value;
                
                // Save opacity to current brush settings
                if (this.selectedBrushId) {
                    if (!this.brushSettings[this.selectedBrushId]) {
                        this.brushSettings[this.selectedBrushId] = {};
                    }
                    this.brushSettings[this.selectedBrushId].opacity = value;
                }
            };
            brushOpacityVerticalSlider.addEventListener('input', updateBrushOpacity);
            brushOpacityVerticalSlider.addEventListener('change', updateBrushOpacity);
        }
        
        // Initialize slider values
        this.updateBrushSliders();
        
        // Canvas events (placeholder for future drawing functionality)
        this.setupCanvasEvents();
        
        // Initialize cursor
        this.updateCanvasCursor();
    }
    
    setupCanvasEvents() {
        // Mouse events for drawing, rotation, and hand tool
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isRotating) {
                // Rotation mode (R key held)
                e.preventDefault();
                this.lastRotateX = e.clientX;
                this.lastRotateY = e.clientY;
                this.initialRotation = this.rotation;
            } else if (this.currentTool === 'hand') {
                // Hand tool panning
                e.preventDefault();
                this.isPanning = true;
                this.lastPanX = e.clientX;
                this.lastPanY = e.clientY;
            } else if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
                this.handleCanvasMouseDown(e);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isRotating && (e.buttons === 1 || e.which === 1)) {
                // Rotation mode - calculate rotation based on mouse movement
                e.preventDefault();
                const rect = this.canvas.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                if (this.lastRotateX === 0 && this.lastRotateY === 0) {
                    this.lastRotateX = e.clientX;
                    this.lastRotateY = e.clientY;
                    return;
                }
                
                const angle1 = Math.atan2(this.lastRotateY - centerY, this.lastRotateX - centerX);
                const angle2 = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                const deltaAngle = angle2 - angle1;
                
                this.rotation = this.initialRotation + deltaAngle;
                this.rotation = this.snapToAngle(this.rotation);
                
                this.lastRotateX = e.clientX;
                this.lastRotateY = e.clientY;
                this.applyTransformations();
            } else if (this.currentTool === 'hand' && this.isPanning) {
                // Hand tool panning
                e.preventDefault();
                const deltaX = e.clientX - this.lastPanX;
                const deltaY = e.clientY - this.lastPanY;
                
                this.panX += deltaX / this.zoom;
                this.panY += deltaY / this.zoom;
                
                this.lastPanX = e.clientX;
                this.lastPanY = e.clientY;
                this.applyTransformations();
            } else if (this.isDrawing && (this.currentTool === 'brush' || this.currentTool === 'eraser')) {
                this.handleCanvasMouseMove(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (this.currentTool === 'hand') {
                this.isPanning = false;
            } else if (this.isDrawing) {
                this.handleCanvasMouseUp();
            }
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            if (this.currentTool === 'hand') {
                this.isPanning = false;
            }
        });
        
        // Touch-only canvas events for drawing
        this.canvas.addEventListener('touchstart', (e) => {
            // Only handle drawing if single touch (not gesture)
            if (e.touches.length === 1 && (this.currentTool === 'brush' || this.currentTool === 'eraser')) {
                this.handleCanvasTouchStart(e);
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            // Only handle drawing if single touch (not gesture)
            if (e.touches.length === 1 && this.isDrawing && (this.currentTool === 'brush' || this.currentTool === 'eraser')) {
                this.handleCanvasTouchMove(e);
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            if (this.isDrawing) {
                this.handleCanvasTouchEnd(e);
            }
        });
    }
    
    // ===== CANVAS EVENT HANDLERS (PLACEHOLDERS) =====
    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Get touch position relative to canvas center
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            // Touch event
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            // Mouse event (fallback)
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const touchX = clientX - rect.left - this.canvas.width / 2;
        const touchY = clientY - rect.top - this.canvas.height / 2;
        
        // Apply inverse transformations
        // 1. Remove pan
        const x = (touchX - this.panX) / this.zoom;
        const y = (touchY - this.panY) / this.zoom;
        
        // 2. Apply inverse rotation
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;
        
        return { x: rotatedX, y: rotatedY };
    }
    
    handleCanvasMouseDown(e) {
        const coords = this.getCanvasCoordinates(e);
        
        // Check if click is within drawing area
        if (this.isPointInDrawingArea(coords)) {
            this.isDrawing = true;
            this.lastPoint = coords;
            
            // Start drawing stroke
            this.startStroke(coords);
        }
    }
    
    handleCanvasMouseMove(e) {
        if (this.isDrawing && this.lastPoint) {
            const coords = this.getCanvasCoordinates(e);
            
            // Continue drawing stroke
            this.drawLine(this.lastPoint, coords);
            this.lastPoint = coords;
        }
    }
    
    handleCanvasMouseUp() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.lastPoint = null;
            this.endStroke();
        }
    }
    
    handleCanvasTouchStart(e) {
        e.preventDefault();
        const coords = this.getCanvasCoordinates(e);
        
        // Check if touch is within drawing area
        if (this.isPointInDrawingArea(coords)) {
            this.isDrawing = true;
            this.lastPoint = coords;
            
            // Start drawing stroke
            this.startStroke(coords);
        }
    }
    
    handleCanvasTouchMove(e) {
        e.preventDefault();
        const coords = this.getCanvasCoordinates(e);
        
        if (this.isDrawing && this.lastPoint) {
            // Continue drawing stroke
            this.drawLine(this.lastPoint, coords);
            this.lastPoint = coords;
        }
    }
    
    handleCanvasTouchEnd(e) {
        e.preventDefault();
        
        if (this.isDrawing) {
            this.isDrawing = false;
            this.lastPoint = null;
            this.endStroke();
        }
    }
    
    // ===== DRAWING ENGINE =====
    isPointInDrawingArea(coords) {
        const canvasWidth = this.canvasWidth || this.drawingAreaSize;
        const canvasHeight = this.canvasHeight || this.drawingAreaSize;
        const halfWidth = canvasWidth / 2;
        const halfHeight = canvasHeight / 2;
        return coords.x >= -halfWidth && coords.x <= halfWidth && 
               coords.y >= -halfHeight && coords.y <= halfHeight;
    }
    
    startStroke(coords) {
        // Block edits if the selected layer is hidden
        if (!this.canEditActiveLayer()) {
            return;
        }

        const layerCtx = this.getActiveLayerContext();
        if (!layerCtx) return;
        
        // Reset path-based bristle brush state when starting new stroke
        if (typeof resetBristleBrush === 'function') {
            resetBristleBrush();
        }
        
        // Handle bucket tool (fill on click)
        if (this.currentTool === 'bucket') {
            if (!this.isDrawing) {
        this.saveCanvasState();
                this.isDrawing = true;
                
                // Simple flood fill
                this.simpleFloodFill(coords.x, coords.y, this.currentColor);
                
                this.isDrawing = false;
                this.endStroke();
                return;
            }
        }
        
        // Save current drawing canvas state for undo (before drawing)
        // Only save if this is the start of a new stroke (not continuing)
        if (!this.isDrawing) {
            this.saveCanvasState();
        }
        
        // Set up drawing context on active layer canvas
        layerCtx.save();
        
        // Initialize brush engine if needed (always reinitialize with current context)
        if (this.currentTool === 'brush') {
            const canvasWidth = this.canvasWidth || this.drawingAreaSize;
            const canvasHeight = this.canvasHeight || this.drawingAreaSize;
            this.brushEngine = new BrushEngine(layerCtx, canvasWidth, canvasHeight, this);
            
            // Always initialize brushes
            if (typeof brushRegistry !== 'undefined') {
                brushRegistry.initialize(this.brushEngine);
            }
        }
        
        // For eraser, set up drawing style
        if (this.currentTool === 'eraser') {
            layerCtx.strokeStyle = '#000000';
        layerCtx.lineWidth = this.brushSize;
        layerCtx.lineCap = 'round';
        layerCtx.lineJoin = 'round';
        
        // Convert coordinates to drawing canvas coordinates
            const canvasWidth = this.canvasWidth || this.drawingAreaSize;
            const canvasHeight = this.canvasHeight || this.drawingAreaSize;
            const halfWidth = canvasWidth / 2;
            const halfHeight = canvasHeight / 2;
            const drawX = coords.x + halfWidth;
            const drawY = coords.y + halfHeight;
        
        // Start path
        layerCtx.beginPath();
        layerCtx.moveTo(drawX, drawY);
        }
    }
    
    // Simple flood fill (fallback for bucket tool)
    simpleFloodFill(x, y, fillColor) {
        const layerCtx = this.getActiveLayerContext();
        if (!layerCtx) return;
        
        const canvasWidth = this.canvasWidth || this.drawingAreaSize;
        const canvasHeight = this.canvasHeight || this.drawingAreaSize;
        const halfWidth = canvasWidth / 2;
        const halfHeight = canvasHeight / 2;
        const canvasX = x + halfWidth;
        const canvasY = y + halfHeight;
        
        // Get image data
        const imageData = layerCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        const data = imageData.data;
        const width = canvasWidth;
        const height = canvasHeight;
        
        // Get target color at click point
        const targetIndex = (Math.floor(canvasY) * width + Math.floor(canvasX)) * 4;
        const targetR = data[targetIndex];
        const targetG = data[targetIndex + 1];
        const targetB = data[targetIndex + 2];
        const targetA = data[targetIndex + 3];
        
        // Convert fill color to RGB
        const fill = this.hexToRgb(fillColor);
        if (!fill) return;
        
        // Flood fill algorithm
        const stack = [[Math.floor(canvasX), Math.floor(canvasY)]];
        const visited = new Set();
        
        while (stack.length > 0) {
            const [px, py] = stack.pop();
            const key = `${px},${py}`;
            
            if (visited.has(key)) continue;
            if (px < 0 || px >= width || py < 0 || py >= height) continue;
            
            const index = (py * width + px) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];
            
            // Check if pixel matches target color (with tolerance)
            if (Math.abs(r - targetR) < 10 && Math.abs(g - targetG) < 10 && 
                Math.abs(b - targetB) < 10 && Math.abs(a - targetA) < 10) {
                
                // Fill pixel
                data[index] = fill.r;
                data[index + 1] = fill.g;
                data[index + 2] = fill.b;
                data[index + 3] = 255;
                
                visited.add(key);
                
                // Add neighbors
                stack.push([px + 1, py]);
                stack.push([px - 1, py]);
                stack.push([px, py + 1]);
                stack.push([px, py - 1]);
            }
        }
        
        // Put image data back
        layerCtx.putImageData(imageData, 0, 0);
        this.applyTransformations();
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    drawLine(from, to) {
        const layerCtx = this.getActiveLayerContext();
        if (!layerCtx) return;
        
                if (this.currentTool === 'brush') {
                    // P5 Easy Brush is handled through the normal brush system
            
            // Always reinitialize brush engine with current context
            const canvasWidth = this.canvasWidth || this.drawingAreaSize;
            const canvasHeight = this.canvasHeight || this.drawingAreaSize;
            this.brushEngine = new BrushEngine(layerCtx, canvasWidth, canvasHeight, this);
            
            // Always initialize brushes
            if (typeof brushRegistry !== 'undefined') {
                brushRegistry.initialize(this.brushEngine);
            }
            
            // Get brush type from selected brush (if any)
            const brush = this.getBrushById(this.selectedBrushId);
            const brushType = brush ? brush.type : 'default';
            
            // Debug: Log brush drawing attempt
            if (!this.brushEngine) {
                console.error('BrushEngine not initialized');
                return;
            }
            
            // Draw with selected brush
            try {
                this.brushEngine.draw(from, to, brushType, this.currentColor, this.brushSize, this.brushOpacity);
            } catch (e) {
                console.error('Error drawing brush:', e, 'brushType:', brushType);
            }
            
            // Redraw the canvas to show the new stroke
            this.applyTransformations();
        } else if (this.currentTool === 'eraser') {
            // Convert coordinates to drawing canvas coordinates
            const canvasWidth = this.canvasWidth || this.drawingAreaSize;
            const canvasHeight = this.canvasHeight || this.drawingAreaSize;
            const halfWidth = canvasWidth / 2;
            const halfHeight = canvasHeight / 2;
            const fromX = from.x + halfWidth;
            const fromY = from.y + halfHeight;
            const toX = to.x + halfWidth;
            const toY = to.y + halfHeight;
            
            // Erase only from the layer canvas, not the white background
            layerCtx.globalCompositeOperation = 'destination-out';
            layerCtx.lineTo(toX, toY);
            layerCtx.stroke();
            layerCtx.globalCompositeOperation = 'source-over';
            
            // Redraw the canvas to show the new stroke
            this.applyTransformations();
        }
    }
    
    getBrushById(brushId) {
        // Search in all brush arrays
        const allBrushes = [...this.basicBrushes, ...this.customBrushes, ...this.specialBrushes];
        return allBrushes.find(brush => brush.id === brushId);
    }
    
    endStroke() {
                // P5 Easy Brush is handled through the normal brush system
                
        const layerCtx = this.getActiveLayerContext();
        if (layerCtx) {
            layerCtx.restore();
        }
        this.applyTransformations(); // Redraw the canvas with new stroke
                
                // Update navigation canvas if visible - do it immediately, not throttled
                const navPanel = document.getElementById('navigation-panel');
                if (navPanel && navPanel.classList.contains('show')) {
                    // Update immediately after stroke ends
                    this.updateNavigationCanvas();
                }
                
                // Update layer thumbnail after stroke
                const activeLayer = this.getActiveLayer();
                if (activeLayer) {
                    this.updateLayerThumbnail(activeLayer.id);
                }
                
                // Save canvas state after stroke is complete (undo/redo only)
                this.saveCanvasState();
            }
    
    saveInitialCanvasState() {
        // Save initial empty canvas state
        const layerCtx = this.getActiveLayerContext();
        if (!layerCtx) return;
        
        const canvasWidth = this.canvasWidth || this.drawingAreaSize;
        const canvasHeight = this.canvasHeight || this.drawingAreaSize;
        const imageData = layerCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        
        this.history = [{
            type: 'canvas',
            imageData: imageData
        }];
        this.historyStep = 0;
        
        // Update button states
        this.updateUndoRedoButtons();
    }
    
    saveCanvasState() {
        // Save current active layer canvas state for undo functionality
        const layerCtx = this.getActiveLayerContext();
        if (!layerCtx) return;
        
        const canvasWidth = this.canvasWidth || this.drawingAreaSize;
        const canvasHeight = this.canvasHeight || this.drawingAreaSize;
        const imageData = layerCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        
        // Remove any history after current step (when undoing and then drawing)
        if (this.historyStep < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyStep + 1);
        }
        
        this.history.push({ type: 'canvas', imageData: imageData });
        this.historyStep++;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyStep--;
        }
        
        // Update button states
        this.updateUndoRedoButtons();
    }
    
    saveLayerState() {
        // Save current layer structure state for undo functionality
        // Deep clone the layers array structure
        const layersSnapshot = this.layers.map(layer => {
            const layerCopy = { ...layer };
            // Don't clone canvas/ctx references, just the structure
            return layerCopy;
        });
        
        // Remove any history after current step (when undoing and then doing layer operations)
        if (this.historyStep < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyStep + 1);
        }
        
        this.history.push({ type: 'layers', layers: layersSnapshot });
        this.historyStep++;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyStep--;
        }
        
        // Update button states
        this.updateUndoRedoButtons();
    }
    
    // ===== LAYER MANAGEMENT (FULLY FUNCTIONAL) =====
    setupLayers() {
        this.renderLayers();
    }
    
    toggleLayersPanel() {
        const panel = document.getElementById('layers-panel');
        if (panel) {
            const isVisible = panel.classList.contains('is-visible');
            if (isVisible) {
                panel.classList.remove('is-visible');
                // Outside click closing disabled by request
                this.removeClickOutsideListener(); // ensure any existing listeners are removed
            } else {
                panel.classList.add('is-visible');
                this.updateLayersPanel();
                // Outside click closing disabled by request
                this.removeClickOutsideListener(); // ensure no outside listeners remain
            }
        }
    }
    
    addClickOutsideListener() {
        // Outside click closing disabled by request
        return;
    }
    
    removeClickOutsideListener() {
        if (this.clickOutsideHandler) {
            document.removeEventListener('mousedown', this.clickOutsideHandler);
            document.removeEventListener('click', this.clickOutsideHandler);
            document.removeEventListener('touchstart', this.clickOutsideHandler);
            this.clickOutsideHandler = null;
        }
        if (this.escapeKeyHandler) {
            document.removeEventListener('keydown', this.escapeKeyHandler);
            this.escapeKeyHandler = null;
        }
    }
    
    updateLayersPanel() {
        const layersList = document.getElementById('layers-list');
        const panel = document.getElementById('layers-panel');
        if (!layersList) return;
        
        // Update panel multi-select mode
        if (panel) {
            panel.classList.toggle('multi-select-mode', this.isMultiSelectMode);
        }
        
        // Clear existing layers
        layersList.innerHTML = '';
        
        // Separate folders and layers
        const topLevelFolders = this.layers.filter(item => item.type === 'folder' && !item.parentId);
        const topLevelLayers = this.layers.filter(item => item.type === 'layer' && !item.parentId);
        
        // Combine folders and top-level layers, then reverse for display order
        const allTopLevelItems = [...topLevelFolders, ...topLevelLayers].sort((a, b) => {
            const aIndex = this.layers.indexOf(a);
            const bIndex = this.layers.indexOf(b);
            return bIndex - aIndex; // Reverse order (top to bottom)
        });
        
        // Render top-level items
        allTopLevelItems.forEach((item, index) => {
            if (item.type === 'folder') {
                const folderElement = this.createFolderElement(item);
                layersList.appendChild(folderElement);
                
                // Add child items if folder is expanded
                if (item.isExpanded) {
                    const childItems = this.layers.filter(child => 
                        child.parentId === item.id
                    ).sort((a, b) => {
                        const aIndex = this.layers.indexOf(a);
                        const bIndex = this.layers.indexOf(b);
                        return bIndex - aIndex; // Reverse order
                    });
                    
                    childItems.forEach((childItem, childIndex) => {
                        if (childItem.type === 'folder') {
                            const childFolderElement = this.createFolderElement(childItem);
                            layersList.appendChild(childFolderElement);
                            
                            // Add drop zone after child folder
                            if (childIndex < childItems.length - 1) {
                                const dropZone = this.createDropZone();
                                layersList.appendChild(dropZone);
                            }
                            
                            // Add nested child items if nested folder is expanded
                            if (childItem.isExpanded) {
                                const nestedChildItems = this.layers.filter(nestedChild => 
                                    nestedChild.parentId === childItem.id
                                ).sort((a, b) => {
                                    const aIndex = this.layers.indexOf(a);
                                    const bIndex = this.layers.indexOf(b);
                                    return bIndex - aIndex;
                                });
                                
                                nestedChildItems.forEach((nestedChild, nestedIndex) => {
                                    if (nestedChild.type === 'folder') {
                                        const nestedFolderElement = this.createFolderElement(nestedChild);
                                        layersList.appendChild(nestedFolderElement);
                                    } else {
                                        const nestedLayerElement = this.createLayerElement(nestedChild);
                                        layersList.appendChild(nestedLayerElement);
                                    }
                                    
                                    // Add drop zone after nested child
                                    if (nestedIndex < nestedChildItems.length - 1) {
                                        const dropZone = this.createDropZone();
                                        layersList.appendChild(dropZone);
                                    }
                                });
                            }
                        } else {
                            const childElement = this.createLayerElement(childItem);
                            layersList.appendChild(childElement);
                            
                            // Add drop zone after child layer
                            if (childIndex < childItems.length - 1) {
                                const dropZone = this.createDropZone();
                                layersList.appendChild(dropZone);
                            }
                        }
                    });
                }
            } else {
                const layerElement = this.createLayerElement(item);
                layersList.appendChild(layerElement);
            }
            
            // Add drop zone after each top-level item
            if (index < allTopLevelItems.length - 1) {
                const dropZone = this.createDropZone();
                layersList.appendChild(dropZone);
            }
        });
        
        // Update active layer controls
        this.updateActiveLayerControls();
+
+        // Ensure thumbnails reflect latest layer canvases even if panel was closed during drawing
+        this.updateAllThumbnails();
     }
    
    generateLayerThumbnail(layer) {
        if (!layer.canvas) return null;
        
        // Create a thumbnail canvas (32x32 pixels for the thumbnail)
        const thumbSize = 32;
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = thumbSize;
        thumbCanvas.height = thumbSize;
        const thumbCtx = thumbCanvas.getContext('2d');
        
        // Draw white background
        thumbCtx.fillStyle = '#ffffff';
        thumbCtx.fillRect(0, 0, thumbSize, thumbSize);
        
        if (this.thumbnailMode === 'zoomed') {
            // Zoomed mode: find the bounding box of strokes and zoom in
            const ctx = layer.ctx || layer.canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
            const data = imageData.data;
            
            // Find bounding box of non-transparent pixels
            let minX = layer.canvas.width;
            let minY = layer.canvas.height;
            let maxX = 0;
            let maxY = 0;
            let hasContent = false;
            
            // Sample pixels to find content bounds (check every 4th pixel for speed)
            for (let y = 0; y < layer.canvas.height; y += 4) {
                for (let x = 0; x < layer.canvas.width; x += 4) {
                    const index = (y * layer.canvas.width + x) * 4;
                    const a = data[index + 3];
                    
                    if (a > 0) {
                        hasContent = true;
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            
            if (!hasContent) return null;
            
            // Add padding around the content
            const padding = 10;
            const contentWidth = maxX - minX + padding * 2;
            const contentHeight = maxY - minY + padding * 2;
            
            // Calculate scale to fit content in thumbnail
            const scaleX = thumbSize / contentWidth;
            const scaleY = thumbSize / contentHeight;
            const scale = Math.min(scaleX, scaleY, 2); // Limit max zoom to 2x
            
            // Calculate source dimensions
            const sourceX = Math.max(0, minX - padding);
            const sourceY = Math.max(0, minY - padding);
            const sourceWidth = Math.min(layer.canvas.width - sourceX, contentWidth);
            const sourceHeight = Math.min(layer.canvas.height - sourceY, contentHeight);
            
            // Calculate destination dimensions
            const destWidth = sourceWidth * scale;
            const destHeight = sourceHeight * scale;
            const destX = (thumbSize - destWidth) / 2;
            const destY = (thumbSize - destHeight) / 2;
            
            // Draw the zoomed content
            thumbCtx.drawImage(
                layer.canvas,
                sourceX, sourceY, sourceWidth, sourceHeight,
                destX, destY, destWidth, destHeight
            );
        } else {
            // Full mode: show whole canvas scaled down
            thumbCtx.drawImage(layer.canvas, 0, 0, thumbSize, thumbSize);
        }
        
        // Check if thumbnail has any non-white content (quick check by sampling)
        const thumbImageData = thumbCtx.getImageData(0, 0, thumbSize, thumbSize);
        const data = thumbImageData.data;
        let hasContent = false;
        
        // Sample every 4th pixel to check for content (much faster)
        for (let i = 0; i < data.length; i += 16) { // Check every 4th pixel (RGBA = 4 bytes, so 16 = 4 pixels)
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // If pixel is not white (255,255,255) or has transparency, there's content
            if (a < 255 || r < 255 || g < 255 || b < 255) {
                hasContent = true;
                break;
            }
        }
        
        if (!hasContent) return null;
        
        // Return as data URL
        return thumbCanvas.toDataURL();
    }
    
    updateLayerThumbnail(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (!layer || layer.type !== 'layer') return;
        
        // Find the layer element in the DOM
        const layerElement = document.querySelector(`[data-layer-id="${layerId}"]`);
        if (!layerElement) return;
        
        const thumbnail = layerElement.querySelector('.layer-thumbnail');
        if (!thumbnail) return;
        
        // Clear existing content
        thumbnail.innerHTML = '';
        
        // Generate new thumbnail
        const thumbnailDataUrl = this.generateLayerThumbnail(layer);
        if (thumbnailDataUrl) {
            const img = document.createElement('img');
            img.src = thumbnailDataUrl;
            img.alt = layer.name;
            thumbnail.appendChild(img);
        } else {
            // Use the stored color for this layer if no content
            thumbnail.style.background = layer.color || this.getRandomColor();
        }
    }
    
    updateAllThumbnails() {
        // Update all layer thumbnails when mode changes
        this.layers.forEach(layer => {
            if (layer.type === 'layer') {
                this.updateLayerThumbnail(layer.id);
            }
        });
    }
    
    toggleThumbnailMode() {
        // Toggle between 'full' and 'zoomed' modes
        this.thumbnailMode = this.thumbnailMode === 'full' ? 'zoomed' : 'full';
        
        // Update all thumbnails
        this.updateAllThumbnails();
        
        // Update the menu item text
        const menuItem = document.getElementById('option-thumbnail-mode');
        if (menuItem) {
            const textSpan = menuItem.querySelector('span');
            if (textSpan) {
                textSpan.textContent = this.thumbnailMode === 'full' 
                    ? 'Thumbnails: Full Canvas' 
                    : 'Thumbnails: Zoomed Strokes';
            }
        }
    }
    
    createLayerElement(layer) {
        const layerDiv = document.createElement('div');
        const isSelected = this.selectedLayerIds.has(layer.id);
        const isActive = layer.isActive;
        
        layerDiv.className = `layer-item ${isActive ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''} ${layer.parentId ? 'folder-child' : ''} ${this.isMultiSelectMode ? 'multi-selectable' : ''}`;
        layerDiv.dataset.layerId = layer.id;
        layerDiv.draggable = true; // Always enable dragging
        
        const thumbnail = document.createElement('div');
        thumbnail.className = 'layer-thumbnail';
        
        // Generate thumbnail from layer canvas if it exists and has content
        if (layer.canvas && layer.type === 'layer') {
            const thumbnailDataUrl = this.generateLayerThumbnail(layer);
            if (thumbnailDataUrl) {
                const img = document.createElement('img');
                img.src = thumbnailDataUrl;
                img.alt = layer.name;
                thumbnail.appendChild(img);
            } else {
                // Use the stored color for this layer if no content
                thumbnail.style.background = layer.color || this.getRandomColor();
            }
        } else if (layer.thumbnail) {
            // Use stored thumbnail if available
            const img = document.createElement('img');
            img.src = layer.thumbnail;
            img.alt = layer.name;
            thumbnail.appendChild(img);
        } else {
            // Use the stored color for this layer
            thumbnail.style.background = layer.color || this.getRandomColor();
        }
        
        const layerInfo = document.createElement('div');
        layerInfo.className = 'layer-info';
        
        const layerName = document.createElement('span');
        layerName.className = 'layer-name';
        layerName.textContent = layer.name;
        
        const layerControls = document.createElement('div');
        layerControls.className = 'layer-controls-inline';
        
        // Add "Remove from Folder" button if layer is in a folder
        if (layer.parentId) {
            const removeFromFolderBtn = document.createElement('button');
            removeFromFolderBtn.className = 'remove-from-folder';
            removeFromFolderBtn.textContent = '↗';
            removeFromFolderBtn.title = 'Remove from folder';
            removeFromFolderBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.removeLayerFromFolder(layer.id);
            });
            layerControls.appendChild(removeFromFolderBtn);
        }
        
        const visibilityBtn = document.createElement('button');
        visibilityBtn.className = `layer-visibility ${layer.visible ? '' : 'is-hidden'}`;
        visibilityBtn.textContent = layer.visible ? '👁' : '👁‍🗨';
        visibilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.toggleLayerVisibility(layer.id);
        });
        
        const opacitySpan = document.createElement('span');
        opacitySpan.className = 'layer-opacity';
        opacitySpan.textContent = `${layer.opacity}%`;
        
        const blendModeSpan = document.createElement('span');
        blendModeSpan.className = 'layer-blend-mode';
        blendModeSpan.textContent = layer.blendMode;
        
        layerControls.appendChild(visibilityBtn);
        layerControls.appendChild(opacitySpan);
        layerControls.appendChild(blendModeSpan);
        
        layerInfo.appendChild(layerName);
        layerInfo.appendChild(layerControls);
        
        layerDiv.appendChild(thumbnail);
        layerDiv.appendChild(layerInfo);
        
        // Add multi-select indicator if in multi-select mode
        if (this.isMultiSelectMode && isSelected) {
            const indicator = document.createElement('div');
            indicator.className = 'multi-select-indicator';
            indicator.textContent = this.selectedLayerIds.size;
            layerDiv.appendChild(indicator);
        }
        
        // Add touch and mouse event handlers
        this.addLayerEventHandlers(layerDiv, layer);
        
        return layerDiv;
    }
    
    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    addLayerEventHandlers(layerDiv, layer) {
        // Long press detection
        layerDiv.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only left mouse button
            this.startLongPress(layerDiv, layer, e);
        });
        
        layerDiv.addEventListener('touchstart', (e) => {
            this.startLongPress(layerDiv, layer, e);
        });
        
        layerDiv.addEventListener('mouseup', (e) => {
            this.cancelLongPress();
        });
        
        // Don't cancel on mouseleave - allow movement during long press
        // layerDiv.addEventListener('mouseleave', (e) => {
        //     this.cancelLongPress();
        // });
        
        layerDiv.addEventListener('touchend', (e) => {
            this.cancelLongPress();
        });
        
        layerDiv.addEventListener('touchcancel', (e) => {
            this.cancelLongPress();
        });
        
        // Prevent context menu on long press
        layerDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Add mouse move detection to cancel long press if moved too far
        layerDiv.addEventListener('mousemove', (e) => {
            if (this.longPressStartPos && this.longPressTimer) {
                const currentPos = {
                    x: e.clientX,
                    y: e.clientY
                };
                const distance = Math.sqrt(
                    Math.pow(currentPos.x - this.longPressStartPos.x, 2) +
                    Math.pow(currentPos.y - this.longPressStartPos.y, 2)
                );
                
                if (distance > this.longPressThreshold) {
                    this.cancelLongPress();
                }
            }
        });
        
        // Click handler
        layerDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            // Don't handle clicks during drag operations
            if (this.isDragging) return;
            
            if (this.isMultiSelectMode) {
                this.toggleLayerSelection(layer.id);
            } else if (e.ctrlKey || e.metaKey) {
                this.toggleLayerSelection(layer.id);
            } else {
                this.selectLayer(layer.id);
            }
        });
        
        // Drag and drop handlers
        layerDiv.addEventListener('dragstart', (e) => {
            this.isDragging = true;
            
            // Store which layers are being dragged
            if (this.isMultiSelectMode && this.selectedLayerIds.has(layer.id)) {
                // Dragging multiple selected layers
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'multi-layer',
                    layerIds: Array.from(this.selectedLayerIds)
                }));
            } else {
                // Dragging single layer
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'single-layer',
                    layerIds: [layer.id]
                }));
            }
            
            layerDiv.classList.add('is-dragging');
            
            // Add dragging class to all selected layers
            if (this.isMultiSelectMode && this.selectedLayerIds.has(layer.id)) {
                this.selectedLayerIds.forEach(id => {
                    const element = document.querySelector(`[data-layer-id="${id}"]`);
                    if (element) element.classList.add('is-dragging');
                });
            }
        });
        
        layerDiv.addEventListener('dragend', (e) => {
            this.isDragging = false;
            layerDiv.classList.remove('is-dragging');
            
            // Remove dragging class from all selected layers
            if (this.isMultiSelectMode && this.selectedLayerIds.has(layer.id)) {
                this.selectedLayerIds.forEach(id => {
                    const element = document.querySelector(`[data-layer-id="${id}"]`);
                    if (element) element.classList.remove('is-dragging');
                });
            }
        });
        
        layerDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            layerDiv.classList.add('drag-over');
        });
        
        layerDiv.addEventListener('dragleave', (e) => {
            layerDiv.classList.remove('drag-over');
        });
        
        layerDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            layerDiv.classList.remove('drag-over');
            
            try {
                const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (dragData.type === 'multi-layer') {
                    this.moveMultipleLayersToPosition(dragData.layerIds, layer.id);
                } else if (dragData.type === 'single-layer') {
                    this.moveLayerToPosition(dragData.layerIds[0], layer.id);
                }
            } catch (error) {
                // Fallback for old format
                const draggedId = e.dataTransfer.getData('text/plain');
                this.moveLayerToPosition(draggedId, layer.id);
            }
        });
    }
    
    startLongPress(layerDiv, layer, e) {
        this.cancelLongPress(); // Clear any existing timer
        
        // Store starting position
        this.longPressStartPos = {
            x: e.clientX || e.touches[0].clientX,
            y: e.clientY || e.touches[0].clientY
        };
        
        layerDiv.classList.add('long-pressing');
        
        this.longPressTimer = setTimeout(() => {
            // Long press detected - enter multi-select mode
            this.enterMultiSelectMode(layer.id);
            layerDiv.classList.remove('long-pressing');
        }, this.longPressDelay);
    }
    
    cancelLongPress() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        
        this.longPressStartPos = null;
        
        // Remove long-pressing class from all elements
        document.querySelectorAll('.long-pressing').forEach(el => {
            el.classList.remove('long-pressing');
        });
    }
    
    enterMultiSelectMode(initialLayerId) {
        this.isMultiSelectMode = true;
        this.selectedLayerIds.clear();
        this.selectedLayerIds.add(initialLayerId);
        this.setActiveLayer(initialLayerId);
        this.updateLayersPanel();
    }
    
    exitMultiSelectMode() {
        this.isMultiSelectMode = false;
        this.updateLayersPanel();
    }
    
    createFolderElement(folder) {
        const folderDiv = document.createElement('div');
        const isSelected = this.selectedLayerIds.has(folder.id);
        
        folderDiv.className = `folder-item ${folder.isExpanded ? 'is-expanded' : ''} ${isSelected ? 'multi-selected' : ''} ${this.isMultiSelectMode ? 'multi-selectable' : ''} ${folder.parentId ? 'folder-child' : ''}`;
        folderDiv.dataset.folderId = folder.id;
        folderDiv.draggable = true; // Always enable dragging
        
        const folderIcon = document.createElement('span');
        folderIcon.className = 'folder-icon';
        folderIcon.textContent = '▶';
        
        const folderName = document.createElement('span');
        folderName.className = 'layer-name';
        folderName.textContent = folder.name;
        
        // Add delete button for folders
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'folder-delete';
        deleteBtn.textContent = '🗑';
        deleteBtn.title = 'Delete folder';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.deleteFolder(folder.id);
        });
        
        folderDiv.appendChild(folderIcon);
        folderDiv.appendChild(folderName);
        folderDiv.appendChild(deleteBtn);
        
        // Add multi-select indicator if in multi-select mode
        if (this.isMultiSelectMode && isSelected) {
            const indicator = document.createElement('div');
            indicator.className = 'multi-select-indicator';
            indicator.textContent = this.selectedLayerIds.size;
            folderDiv.appendChild(indicator);
        }
        
        // Add event handlers
        this.addFolderEventHandlers(folderDiv, folder);
        
        return folderDiv;
    }
    
    addFolderEventHandlers(folderDiv, folder) {
        // Long press detection for folders
        folderDiv.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            this.startLongPress(folderDiv, folder, e);
        });
        
        folderDiv.addEventListener('touchstart', (e) => {
            this.startLongPress(folderDiv, folder, e);
        });
        
        folderDiv.addEventListener('mouseup', (e) => {
            this.cancelLongPress();
        });
        
        // Don't cancel on mouseleave - allow movement during long press
        // folderDiv.addEventListener('mouseleave', (e) => {
        //     this.cancelLongPress();
        // });
        
        folderDiv.addEventListener('touchend', (e) => {
            this.cancelLongPress();
        });
        
        folderDiv.addEventListener('touchcancel', (e) => {
            this.cancelLongPress();
        });
        
        // Prevent context menu on long press
        folderDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Add mouse move detection to cancel long press if moved too far
        folderDiv.addEventListener('mousemove', (e) => {
            if (this.longPressStartPos && this.longPressTimer) {
                const currentPos = {
                    x: e.clientX,
                    y: e.clientY
                };
                const distance = Math.sqrt(
                    Math.pow(currentPos.x - this.longPressStartPos.x, 2) +
                    Math.pow(currentPos.y - this.longPressStartPos.y, 2)
                );
                
                if (distance > this.longPressThreshold) {
                    this.cancelLongPress();
                }
            }
        });
        
        // Click handler
        folderDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            // Don't handle clicks during drag operations
            if (this.isDragging) return;
            
            if (this.isMultiSelectMode) {
                this.toggleLayerSelection(folder.id);
            } else {
                this.toggleFolder(folder.id);
            }
        });
        
        // Drag and drop handlers for folders
        folderDiv.addEventListener('dragstart', (e) => {
            this.isDragging = true;
            
            // Store which folders/layers are being dragged
            if (this.isMultiSelectMode && this.selectedLayerIds.has(folder.id)) {
                // Dragging multiple selected items including this folder
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'multi-layer',
                    layerIds: Array.from(this.selectedLayerIds)
                }));
            } else {
                // Dragging single folder
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'single-layer',
                    layerIds: [folder.id]
                }));
            }
            
            folderDiv.classList.add('is-dragging');
        });
        
        folderDiv.addEventListener('dragend', (e) => {
            this.isDragging = false;
            folderDiv.classList.remove('is-dragging');
        });
        
        folderDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            folderDiv.classList.add('drag-over');
        });
        
        folderDiv.addEventListener('dragleave', (e) => {
            folderDiv.classList.remove('drag-over');
        });
        
        folderDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            folderDiv.classList.remove('drag-over');
            
            try {
                const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                
                if (dragData.type === 'multi-layer') {
                    // Move multiple layers to this folder
                    this.moveMultipleLayersToFolder(dragData.layerIds, folder.id);
                } else if (dragData.type === 'single-layer') {
                    // Move single layer to this folder
                    this.moveLayerToFolder(dragData.layerIds[0], folder.id);
                }
            } catch (error) {
                // Fallback for old format
                const draggedId = e.dataTransfer.getData('text/plain');
                this.moveLayerToFolder(draggedId, folder.id);
            }
        });
    }
    
    createDropZone() {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            try {
                const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (dragData.type === 'multi-layer') {
                    this.moveMultipleLayersToDropZone(dragData.layerIds, dropZone);
                } else if (dragData.type === 'single-layer') {
                    this.moveLayerToDropZone(dragData.layerIds[0], dropZone);
                }
            } catch (error) {
                // Fallback for old format
                const draggedId = e.dataTransfer.getData('text/plain');
                this.moveLayerToDropZone(draggedId, dropZone);
            }
        });
        
        return dropZone;
    }
    
    // Multi-select methods
    selectLayer(layerId) {
        this.selectedLayerIds.clear();
        this.selectedLayerIds.add(layerId);
        this.setActiveLayer(layerId);
        this.updateLayersPanel();
    }
    
    toggleLayerSelection(layerId) {
        if (this.selectedLayerIds.has(layerId)) {
            this.selectedLayerIds.delete(layerId);
            if (this.activeLayerId === layerId) {
                // Set another selected layer as active, or clear if none
                const remainingSelected = Array.from(this.selectedLayerIds);
                this.activeLayerId = remainingSelected.length > 0 ? remainingSelected[0] : null;
            }
        } else {
            this.selectedLayerIds.add(layerId);
            this.setActiveLayer(layerId);
        }
        this.updateLayersPanel();
    }
    
    // Move layer to folder
    moveLayerToFolder(layerId, folderId) {
        const layer = this.layers.find(l => l.id === layerId);
        const folder = this.layers.find(l => l.id === folderId);
        
        if (layer && folder && folder.type === 'folder') {
            // Prevent moving a folder into itself or its children
            if (layer.type === 'folder' && this.wouldCreateCircularReference(layerId, folderId)) {
                return;
            }
            layer.parentId = folderId;
            this.updateLayersPanel();
        }
    }
    
    // Move multiple layers to folder
    moveMultipleLayersToFolder(layerIds, folderId) {
        const folder = this.layers.find(l => l.id === folderId);
        
        if (folder && folder.type === 'folder') {
            layerIds.forEach(layerId => {
                const layer = this.layers.find(l => l.id === layerId);
                if (layer) {
                    // Prevent moving a folder into itself or its children
                    if (layer.type === 'folder' && this.wouldCreateCircularReference(layerId, folderId)) {
                        return;
                    }
                    layer.parentId = folderId;
                }
            });
            this.updateLayersPanel();
        }
    }
    
    // Remove layer from folder (make it top-level)
    removeLayerFromFolder(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.parentId = null;
            this.updateLayersPanel();
        }
    }
    
    // Remove multiple layers from folders
    removeMultipleLayersFromFolders(layerIds) {
        layerIds.forEach(layerId => {
            const layer = this.layers.find(l => l.id === layerId);
            if (layer) {
                layer.parentId = null;
            }
        });
        this.updateLayersPanel();
    }
    
    // Check if moving a folder would create a circular reference
    wouldCreateCircularReference(folderId, targetFolderId) {
        if (folderId === targetFolderId) return true;
        
        let currentFolder = this.layers.find(l => l.id === targetFolderId);
        while (currentFolder && currentFolder.parentId) {
            if (currentFolder.parentId === folderId) return true;
            currentFolder = this.layers.find(l => l.id === currentFolder.parentId);
        }
        return false;
    }
    
    // Insert new item above currently selected item
    // In the layers array, lower indices are at the bottom, higher indices are at the top
    // So "above" means higher index (insert after the selected item)
    insertAboveSelected(newItem) {
        // Find the currently selected item
        let selectedItem = null;
        
        // Check if we have a selected layer
        if (this.selectedLayerIds.size > 0) {
            const selectedId = Array.from(this.selectedLayerIds)[0];
            selectedItem = this.layers.find(l => l.id === selectedId);
        }
        
        // If no selected item, add to top (highest index)
        if (!selectedItem) {
            this.layers.push(newItem);
            return;
        }
        
        // Find the index of the selected item
        const selectedIndex = this.layers.findIndex(l => l.id === selectedItem.id);
        
        // Insert the new item above the selected item (at selectedIndex + 1)
        // This puts it on top of the selected layer
        this.layers.splice(selectedIndex + 1, 0, newItem);
    }
    
    // Move multiple layers to position
    moveMultipleLayersToPosition(layerIds, targetId) {
        const targetIndex = this.layers.findIndex(l => l.id === targetId);
        if (targetIndex === -1) return;
        
        // Remove all dragged layers from their current positions
        const draggedLayers = [];
        layerIds.forEach(layerId => {
            const layerIndex = this.layers.findIndex(l => l.id === layerId);
            if (layerIndex !== -1) {
                draggedLayers.push(this.layers.splice(layerIndex, 1)[0]);
            }
        });
        
        // Insert all dragged layers at the target position
        draggedLayers.reverse().forEach(layer => {
            this.layers.splice(targetIndex, 0, layer);
        });
        
        this.updateLayersPanel();
        // Immediately redraw canvas to show new layer order
        this.applyTransformations();
        this.updateNavigationCanvas();
    }
    
    // Move multiple selected layers to folder
    moveSelectedLayersToFolder(folderId) {
        const selectedLayers = Array.from(this.selectedLayerIds);
        const folder = this.layers.find(l => l.id === folderId);
        
        if (folder && folder.type === 'folder') {
            selectedLayers.forEach(layerId => {
                const layer = this.layers.find(l => l.id === layerId);
                if (layer) {
                    layer.parentId = folderId;
                }
            });
            this.updateLayersPanel();
        }
    }
    
    // Folder methods
    createFolder() {
        const newFolder = {
            id: `folder-${this.nextFolderId}`,
            name: `Folder ${this.nextFolderId}`,
            type: 'folder',
            isExpanded: true,
            children: [],
            parentId: null // Support nested folders
        };
        
        // Only put layers in folder if multiple layers are selected
        if (this.selectedLayerIds.size > 1) {
            const selectedLayers = Array.from(this.selectedLayerIds);
            selectedLayers.forEach(layerId => {
                const layer = this.layers.find(l => l.id === layerId);
                if (layer && layer.type === 'layer') {
                    layer.parentId = newFolder.id;
                }
            });
            
            // Exit multi-select mode after creating folder
            this.exitMultiSelectMode();
        }
        
        // Insert above currently selected item
        this.insertAboveSelected(newFolder);
        this.nextFolderId++;
        this.updateLayersPanel();
    }
    
    toggleFolder(folderId) {
        const folder = this.layers.find(l => l.id === folderId);
        if (folder && folder.type === 'folder') {
            folder.isExpanded = !folder.isExpanded;
            this.updateLayersPanel();
        }
    }
    
    // Delete folder and move its contents to parent or top level
    deleteFolder(folderId) {
        const folder = this.layers.find(l => l.id === folderId);
        if (!folder || folder.type !== 'folder') return;
        
        // Find all items in this folder
        const itemsInFolder = this.layers.filter(item => item.parentId === folderId);
        
        // Move items to parent folder or make them top-level
        itemsInFolder.forEach(item => {
            if (folder.parentId) {
                // Move to parent folder
                item.parentId = folder.parentId;
            } else {
                // Make top-level
                item.parentId = null;
            }
        });
        
        // Remove folder from selection if it was selected
        this.selectedLayerIds.delete(folderId);
        
        // Remove the folder from layers array
        const folderIndex = this.layers.findIndex(l => l.id === folderId);
        if (folderIndex !== -1) {
            this.layers.splice(folderIndex, 1);
        }
        
        // If no layers remain, create a default layer
        if (this.layers.length === 0) {
            this.addLayer();
        } else {
            // Set a new active layer if the deleted folder was active
            const firstLayer = this.layers.find(l => l.type === 'layer');
            if (firstLayer) {
                this.setActiveLayer(firstLayer.id);
            }
        }
        
        this.updateLayersPanel();
    }
    
    // Drag and drop methods
    moveLayerToPosition(draggedId, targetId) {
        const draggedIndex = this.layers.findIndex(l => l.id === draggedId);
        const targetIndex = this.layers.findIndex(l => l.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        const draggedItem = this.layers.splice(draggedIndex, 1)[0];
        this.layers.splice(targetIndex, 0, draggedItem);
        
        this.updateLayersPanel();
        // Immediately redraw canvas to show new layer order
        this.applyTransformations();
        this.updateNavigationCanvas();
    }
    
    moveLayerToDropZone(draggedId, dropZone) {
        // Find the position of the drop zone and move the layer there
        const draggedIndex = this.layers.findIndex(l => l.id === draggedId);
        if (draggedIndex === -1) return;
        
        const draggedItem = this.layers.splice(draggedIndex, 1)[0];
        
        // If dropping on a drop zone, make it top-level (remove from folder)
        draggedItem.parentId = null;
        
        // Find the drop zone position in the DOM
        const dropZones = document.querySelectorAll('.drop-zone');
        const dropZoneIndex = Array.from(dropZones).indexOf(dropZone);
        
        if (dropZoneIndex !== -1) {
            this.layers.splice(dropZoneIndex, 0, draggedItem);
        } else {
            this.layers.push(draggedItem);
        }
        
        this.updateLayersPanel();
        // Immediately redraw canvas to show new layer order
        this.applyTransformations();
        this.updateNavigationCanvas();
    }
    
    // Renumber layers after any movement operation
    renumberLayersAfterMove() {
        this.renumberLayers();
        this.updateLayersPanel();
    }
    
    moveMultipleLayersToDropZone(layerIds, dropZone) {
        // Save layer state before moving
        this.saveLayerState();
        
        // Remove all dragged layers from their current positions
        const draggedLayers = [];
        layerIds.forEach(layerId => {
            const layerIndex = this.layers.findIndex(l => l.id === layerId);
            if (layerIndex !== -1) {
                const draggedItem = this.layers.splice(layerIndex, 1)[0];
                // If dropping on a drop zone, make it top-level (remove from folder)
                draggedItem.parentId = null;
                draggedLayers.push(draggedItem);
            }
        });
        
        // Find the drop zone position in the DOM
        const dropZones = document.querySelectorAll('.drop-zone');
        const dropZoneIndex = Array.from(dropZones).indexOf(dropZone);
        
        if (dropZoneIndex !== -1) {
            // Insert all dragged layers at the drop zone position
            draggedLayers.reverse().forEach(layer => {
                this.layers.splice(dropZoneIndex, 0, layer);
            });
        } else {
            // Add to end if drop zone not found
            this.layers.push(...draggedLayers);
        }
        
        // Renumber layers after movement
        this.renumberLayers();
        
        this.updateLayersPanel();
        // Immediately redraw canvas to show new layer order
        this.applyTransformations();
        this.updateNavigationCanvas();
    }
    
    addLayer() {
        // Create canvas for new layer
        const layerCanvas = document.createElement('canvas');
        const canvasWidth = this.canvasWidth || this.drawingAreaSize;
        const canvasHeight = this.canvasHeight || this.drawingAreaSize;
        layerCanvas.width = canvasWidth;
        layerCanvas.height = canvasHeight;
        const layerCtx = layerCanvas.getContext('2d');
        layerCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Calculate layer number based on position in array
        // Layer 1 is at the bottom (index 0), higher numbers are on top
        // Find the highest layer number currently in use
        let maxLayerNumber = 0;
        for (const layer of this.layers) {
            if (layer.type === 'layer') {
                const layerNum = parseInt(layer.name);
                if (!isNaN(layerNum) && layerNum > maxLayerNumber) {
                    maxLayerNumber = layerNum;
                }
            }
        }
        const newLayerNumber = maxLayerNumber + 1;
        
        const newLayer = {
            id: `layer-${this.nextLayerId}`,
            name: `${newLayerNumber}`, // Use the calculated layer number
            visible: true,
            opacity: 100,
            blendMode: 'normal',
            isActive: false,
            thumbnail: null,
            color: this.getRandomColor(),
            type: 'layer',
            parentId: null,
            canvas: layerCanvas,
            ctx: layerCtx
        };
        
        // Insert above currently selected item
        this.insertAboveSelected(newLayer);
        this.nextLayerId++;
        this.selectLayer(newLayer.id);
        
        // Renumber all layers to match their positions
        this.renumberLayers();
        
        this.updateLayersPanel();
    }
    
    // Renumber layers based on their position in the array
    // Layer 1 is at the bottom (index 0), higher numbers are on top
    renumberLayers() {
        // Only renumber layers that have numeric names (not custom names)
        let layerNumber = 1;
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (layer.type === 'layer') {
                // Check if the layer name is just a number (not a custom name)
                const currentName = layer.name.trim();
                const isNumericName = /^\d+$/.test(currentName);
                
                if (isNumericName) {
                    // Rename to the new number based on position
                    layer.name = `${layerNumber}`;
                }
                layerNumber++;
            }
        }
    }
    
    toggleLayerVisibility(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.visible = !layer.visible;
            this.updateLayersPanel();
            // Redraw canvas to show/hide layer content
            this.applyTransformations();
            // Update navigation canvas if visible
            this.updateNavigationCanvas();
        }
    }
    
    updateActiveLayerControls() {
        const activeLayer = this.layers.find(l => l.isActive);
        if (!activeLayer) return;
        
        const opacitySlider = document.getElementById('layer-opacity');
        const opacityValue = document.querySelector('.opacity-value');
        const blendModeSelect = document.getElementById('blend-mode');
        
        if (opacitySlider) {
            opacitySlider.value = activeLayer.opacity;
            opacitySlider.addEventListener('input', (e) => {
                e.stopPropagation();
                activeLayer.opacity = parseInt(e.target.value);
                if (opacityValue) opacityValue.textContent = `${activeLayer.opacity}%`;
                this.updateLayersPanel();
            });
        }
        
        if (opacityValue) {
            opacityValue.textContent = `${activeLayer.opacity}%`;
        }
        
        if (blendModeSelect) {
            blendModeSelect.value = activeLayer.blendMode;
            blendModeSelect.addEventListener('change', (e) => {
                e.stopPropagation();
                activeLayer.blendMode = e.target.value;
                this.updateLayersPanel();
            });
        }
    }
    
    duplicateLayer() {
        const activeLayer = this.layers.find(l => l.isActive);
        if (!activeLayer) return;
        
        const duplicatedLayer = {
            ...activeLayer,
            id: `layer-${this.nextLayerId}`,
            name: `${this.nextLayerId}`,
            isActive: false,
            color: activeLayer.color // Copy the color
        };
        
        const activeIndex = this.layers.findIndex(l => l.id === activeLayer.id);
        this.layers.splice(activeIndex, 0, duplicatedLayer);
        this.nextLayerId++;
        this.setActiveLayer(duplicatedLayer.id);
        this.updateLayersPanel();
    }
    
    deleteLayer() {
        const selectedItems = Array.from(this.selectedLayerIds);
        if (selectedItems.length === 0) return;
        
        // Separate layers and folders
        const selectedLayers = selectedItems.filter(id => {
            const item = this.layers.find(l => l.id === id);
            return item && item.type === 'layer';
        });
        
        const selectedFolders = selectedItems.filter(id => {
            const item = this.layers.find(l => l.id === id);
            return item && item.type === 'folder';
        });
        
        // Don't delete all layers
        if (this.layers.filter(l => l.type === 'layer').length <= selectedLayers.length) return;
        
        // Save layer state before deletion
        this.saveLayerState();
        
        // Delete selected folders first
        selectedFolders.forEach(folderId => {
            this.deleteFolder(folderId);
        });
        
        // Remove selected layers
        selectedLayers.forEach(layerId => {
            const layerIndex = this.layers.findIndex(l => l.id === layerId);
            if (layerIndex !== -1) {
                this.layers.splice(layerIndex, 1);
            }
        });
        
        // Clear selection and set a new active layer
        this.selectedLayerIds.clear();
        if (this.layers.length > 0) {
            const firstLayer = this.layers.find(l => l.type === 'layer');
            if (firstLayer) {
                this.selectLayer(firstLayer.id);
            }
        }
        
        this.updateLayersPanel();
        // Redraw the canvas to reflect the deleted layer
        this.applyTransformations();
    }
    
    moveLayerUp() {
        const selectedLayers = Array.from(this.selectedLayerIds);
        if (selectedLayers.length === 0) return;
        
        // Move all selected layers up
        selectedLayers.forEach(layerId => {
            const layerIndex = this.layers.findIndex(l => l.id === layerId);
            if (layerIndex > 0) {
                [this.layers[layerIndex], this.layers[layerIndex - 1]] = [this.layers[layerIndex - 1], this.layers[layerIndex]];
            }
        });
        
        this.updateLayersPanel();
        // Immediately redraw canvas to show new layer order
        this.applyTransformations();
        this.updateNavigationCanvas();
    }
    
    moveLayerDown() {
        const selectedLayers = Array.from(this.selectedLayerIds);
        if (selectedLayers.length === 0) return;
        
        // Move all selected layers down (in reverse order to maintain relative positions)
        selectedLayers.reverse().forEach(layerId => {
            const layerIndex = this.layers.findIndex(l => l.id === layerId);
            if (layerIndex < this.layers.length - 1) {
                [this.layers[layerIndex], this.layers[layerIndex + 1]] = [this.layers[layerIndex + 1], this.layers[layerIndex]];
            }
        });
        
        this.updateLayersPanel();
        // Immediately redraw canvas to show new layer order
        this.applyTransformations();
        this.updateNavigationCanvas();
    }
    
    setActiveLayer(layerId) {
        this.layers.forEach(layer => {
            layer.isActive = layer.id === layerId;
        });
        this.activeLayerId = layerId;
        // Don't update panel here - let the calling method handle it
    }
    
    renderLayers() {
        // Legacy method - now handled by updateLayersPanel
        this.updateLayersPanel();
    }
    
    setupLayerControls() {
        // Add layer button
        const addLayerBtn = document.getElementById('add-layer');
        if (addLayerBtn) {
            addLayerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addLayer();
            });
        }
        
        // Add folder button
        const addFolderBtn = document.getElementById('add-folder');
        if (addFolderBtn) {
            addFolderBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.createFolder();
            });
        }
        
        // Duplicate layer button
        const duplicateLayerBtn = document.getElementById('duplicate-layer');
        if (duplicateLayerBtn) {
            duplicateLayerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.duplicateLayer();
            });
        }
        
        // Delete layer button
        const deleteLayerBtn = document.getElementById('delete-layer');
        if (deleteLayerBtn) {
            deleteLayerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteLayer();
            });
        }
        
        // Move up button
        const moveUpBtn = document.getElementById('move-up');
        if (moveUpBtn) {
            moveUpBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveLayerUp();
            });
        }
        
        // Move down button
        const moveDownBtn = document.getElementById('move-down');
        if (moveDownBtn) {
            moveDownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveLayerDown();
            });
        }
        
        // Import layer button (placeholder)
        const importLayerBtn = document.getElementById('import-layer');
        if (importLayerBtn) {
            importLayerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                alert('Import layer functionality (placeholder)');
            });
        }
        
        // Merge layer button (placeholder)
        const mergeLayerBtn = document.getElementById('merge-layer');
        if (mergeLayerBtn) {
            mergeLayerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                alert('Merge layer functionality (placeholder)');
            });
        }
        
        // Layer color picker button
        const layerColorPickerBtn = document.getElementById('layer-color-picker');
        if (layerColorPickerBtn) {
            layerColorPickerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const colorPicker = document.getElementById('color-picker');
                if (colorPicker) colorPicker.click();
            });
        }
        
    }
    
    // ===== BRUSH PANEL (FULLY FUNCTIONAL) =====
    setupBrushPanel() {
        // Initialize brush engine
        this.brushEngine = null;
        
        // Load brushes from registry
        this.loadBrushesFromRegistry();
        
        this.currentTab = 'basic';
        this.currentBrush = this.basicBrushes.length > 0 ? this.basicBrushes[0] : null;
        this.selectedBrushId = this.basicBrushes.length > 0 ? this.basicBrushes[0].id : null;
        
        // Initialize settings for the initial brush
        if (this.selectedBrushId && !this.brushSettings[this.selectedBrushId]) {
            this.brushSettings[this.selectedBrushId] = {
                size: this.brushSize,
                opacity: this.brushOpacity
            };
        }
        
        this.renderBrushList();
        this.setupBrushPanelEvents();
    }
    
    loadBrushesFromRegistry() {
        // Initialize empty arrays
        this.basicBrushes = [];
        this.customBrushes = [];
        this.specialBrushes = [];
        
        
        // Load brushes from registry if available
        if (typeof brushRegistry !== 'undefined') {
            const allBrushes = brushRegistry.getAll();
            console.log('Loading brushes from registry:', Object.keys(allBrushes).length, 'total');
            
            for (const [id, brush] of Object.entries(allBrushes)) {
                const metadata = brush.metadata || {};
                const category = metadata.category || 'basic';
                const name = metadata.name || id;
                
                const brushData = {
                    id: id,
                    name: name,
                    value: metadata.value || 10.0,
                    isStarred: metadata.isStarred || false,
                    preview: metadata.preview || 'pen',
                    type: id
                };
                
                // Add to appropriate category
                if (category === 'basic') {
                    this.basicBrushes.push(brushData);
                } else if (category === 'custom') {
                    this.customBrushes.push(brushData);
                } else if (category === 'special') {
                    // Add special brushes
                    this.specialBrushes.push(brushData);
                } else {
                    // Default to basic
                    this.basicBrushes.push(brushData);
                }
            }
            
            console.log(`Loaded brushes - Basic: ${this.basicBrushes.length}, Custom: ${this.customBrushes.length}, Special: ${this.specialBrushes.length}`);
        } else {
            console.warn('brushRegistry is undefined');
        }
    }
    
    renderBrushList() {
        const brushList = document.getElementById('brush-list');
        if (!brushList) {
            console.warn('brush-list element not found');
            return;
        }
        
        brushList.innerHTML = '';
        
        let currentBrushSet;
        switch(this.currentTab) {
            case 'basic':
                currentBrushSet = this.basicBrushes;
                break;
            case 'custom':
                currentBrushSet = this.customBrushes;
                break;
            case 'special':
                currentBrushSet = this.specialBrushes;
                break;
            default:
                currentBrushSet = this.basicBrushes;
        }
        
        console.log(`Rendering ${currentBrushSet.length} brushes for tab: ${this.currentTab}`);
        
        currentBrushSet.forEach(brush => {
            const brushItem = document.createElement('div');
            brushItem.className = `brush-item ${brush.id === this.selectedBrushId ? 'selected' : ''}`;
            brushItem.dataset.brushId = brush.id;
            
            // Get the current size for this brush from settings, or use brush.value as fallback
            const currentSize = this.brushSettings[brush.id]?.size !== undefined 
                ? this.brushSettings[brush.id].size 
                : (brush.value || 20);
            
            // Update brush.value to match current size
            brush.value = currentSize;
            
            brushItem.innerHTML = `
                <button class="brush-add-btn">+</button>
                <div class="brush-preview-stroke ${brush.preview}"></div>
                <span class="brush-name">${brush.name}</span>
                <span class="brush-value">${currentSize}</span>
                <button class="brush-menu-btn">⋮</button>
            `;
            
            if (brush.isStarred) {
                const star = document.createElement('span');
                star.className = 'brush-star';
                star.textContent = '★';
                brushItem.insertBefore(star, brushItem.querySelector('.brush-name'));
            }
            
            brushList.appendChild(brushItem);
        });
    }
    
    setupBrushPanelEvents() {
        const brushPanel = document.getElementById('brush-panel');
        const brushList = document.getElementById('brush-list');
        const brushSettings = document.getElementById('brush-settings');
        
        // Brush tab switching
        const brushTabs = document.querySelectorAll('.brush-tab');
        brushTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.dataset.tab;
                this.switchBrushTab(tabType, tab);
            });
        });
        
        // Brush item selection and menu button
        if (brushList) {
            // Track last click time for double-click detection
            let lastClickTime = 0;
            let lastClickBrushId = null;
            const doubleClickDelay = 300; // milliseconds
            
            brushList.addEventListener('click', (e) => {
                // Check if menu button (⋮) was clicked - single click opens settings
                if (e.target.classList.contains('brush-menu-btn') || e.target.closest('.brush-menu-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                const brushItem = e.target.closest('.brush-item');
                if (brushItem) {
                    const brushId = brushItem.dataset.brushId;
                    
                        this.openBrushSettings(brushId);
                        return;
                    }
                }
                
                // Handle brush item clicks (for selection and double-click)
                const brushItem = e.target.closest('.brush-item');
                if (brushItem && !e.target.classList.contains('brush-menu-btn') && !e.target.closest('.brush-menu-btn')) {
                    const brushId = brushItem.dataset.brushId;
                    const currentTime = Date.now();
                    
                    // Check for double-click
                    if (brushId === lastClickBrushId && (currentTime - lastClickTime) < doubleClickDelay) {
                        // Double-click detected
                        e.preventDefault();
                        e.stopPropagation();
                        
                        this.openBrushSettings(brushId);
                        
                        // Reset double-click tracking
                        lastClickTime = 0;
                        lastClickBrushId = null;
                    } else {
                        // Single click - select brush
                        e.stopPropagation();
                        this.selectBrush(brushId);
                        lastClickTime = currentTime;
                        lastClickBrushId = brushId;
                    }
                }
            });
        }
        
        // Brush settings close
        const brushSettingsClose = document.querySelector('.brush-settings-close');
        if (brushSettingsClose) {
            brushSettingsClose.addEventListener('click', () => {
                this.closeBrushSettings();
            });
        }
        
        // Brush settings tabs
        const brushSettingsTabs = document.querySelectorAll('.brush-settings-tab');
        brushSettingsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                brushSettingsTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // TODO: Switch settings content
            });
        });
        
        // Only add brush outside click handler once
        if (!this.brushOutsideClickHandler) {
            // Click/touch outside to close brush panel
            this.brushOutsideClickHandler = (e) => {
                const brushPanel = document.getElementById('brush-panel');
                const brushBtn = document.getElementById('btn-brush');
                
                // If panel is open and click/touch is outside the panel and not on the button
                if (brushPanel && brushPanel.classList.contains('is-visible') &&
                    !brushPanel.contains(e.target) && 
                    !brushBtn.contains(e.target)) {
                    this.closeBrushPanel();
                }
            };
            
            document.addEventListener('click', this.brushOutsideClickHandler);
            document.addEventListener('touchstart', this.brushOutsideClickHandler, { passive: true });
        }
        
        // Brush control sliders
        const brushSliders = document.querySelectorAll('.brush-slider');
        brushSliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueSpan = e.target.parentElement.querySelector('.brush-control-value');
                if (valueSpan) {
                    const value = e.target.value;
                    if (e.target.min === '1' && e.target.max === '200') {
                        // Thickness slider
                        valueSpan.textContent = `${(value / 10).toFixed(1)}px`;
                    } else {
                        // Percentage sliders
                        valueSpan.textContent = `${value}%`;
                    }
                }
            });
        });
        
        // Brush control buttons
        const brushControlBtns = document.querySelectorAll('.brush-control-btn');
        brushControlBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slider = e.target.parentElement.querySelector('.brush-slider');
                if (slider) {
                    const currentValue = parseInt(slider.value);
                    const step = 1;
                    const newValue = e.target.textContent === '−' 
                        ? Math.max(parseInt(slider.min), currentValue - step)
                        : Math.min(parseInt(slider.max), currentValue + step);
                    
                    slider.value = newValue;
                    slider.dispatchEvent(new Event('input'));
                }
            });
        });
        
        // Reset button
        const resetBtn = document.querySelector('.brush-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetBrushSettings();
            });
        }
        
        // Add group button
        const addGroupBtn = document.querySelector('.brush-add-group-btn');
        if (addGroupBtn) {
            addGroupBtn.addEventListener('click', () => {
                this.addNewBrushGroup();
            });
        }
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (brushPanel && brushPanel.classList.contains('is-visible')) {
                if (!brushPanel.contains(e.target) && !e.target.closest('#btn-brush')) {
                    this.closeBrushPanel();
                }
            }
        });
    }
    
    selectBrush(brushId) {
        // Save current brush settings before switching
        if (this.selectedBrushId) {
            if (!this.brushSettings[this.selectedBrushId]) {
                this.brushSettings[this.selectedBrushId] = {};
            }
            this.brushSettings[this.selectedBrushId].size = this.brushSize;
            this.brushSettings[this.selectedBrushId].opacity = this.brushOpacity;
        }
        
        this.selectedBrushId = brushId;
        
        // Restore brush settings for the selected brush
        if (this.brushSettings[brushId]) {
            this.brushSize = this.brushSettings[brushId].size !== undefined ? this.brushSettings[brushId].size : 20;
            this.brushOpacity = this.brushSettings[brushId].opacity !== undefined ? this.brushSettings[brushId].opacity : 100;
        } else {
            // Initialize default settings for new brush
            this.brushSize = 20;
            this.brushOpacity = 100;
            this.brushSettings[brushId] = {
                size: 20,
                opacity: 100
            };
        }
        
        // Update sliders to reflect the brush's settings
        this.updateBrushSliders();
        
        let currentBrushSet;
        switch(this.currentTab) {
            case 'basic':
                currentBrushSet = this.basicBrushes;
                break;
            case 'custom':
                currentBrushSet = this.customBrushes;
                break;
            case 'special':
                currentBrushSet = this.specialBrushes;
                break;
            default:
                currentBrushSet = this.basicBrushes;
        }
        this.currentBrush = currentBrushSet.find(b => b.id === brushId);
        this.renderBrushList();
        this.updateBrushSettings();
        
        // If config panel is open, update it for the new brush
        if (this.isBrushConfigOpen) {
            this.createBrushConfigPanel(brushId);
        }
    }
    
    updateBrushSliders() {
        // Update slider values and display values
        const brushSizeVerticalSlider = document.getElementById('brush-size-vertical-slider');
        const brushOpacityVerticalSlider = document.getElementById('brush-opacity-vertical-slider');
        const brushSizeValue = document.getElementById('brush-size-value');
        const brushOpacityValue = document.getElementById('brush-opacity-value');
        const brushSizeSlider = document.getElementById('brush-size-slider');
        const brushOpacitySlider = document.getElementById('brush-opacity-slider');
        
        if (brushSizeVerticalSlider) {
            brushSizeVerticalSlider.value = this.brushSize;
        }
        if (brushSizeValue) {
            brushSizeValue.textContent = this.brushSize;
        }
        if (brushSizeSlider) {
            brushSizeSlider.value = this.brushSize;
        }
        
        if (brushOpacityVerticalSlider) {
            brushOpacityVerticalSlider.value = this.brushOpacity;
        }
        if (brushOpacityValue) {
            brushOpacityValue.textContent = this.brushOpacity;
        }
        if (brushOpacitySlider) {
            brushOpacitySlider.value = this.brushOpacity;
        }
    }
    
    updateBrushValueInList(brushId, size) {
        // Update the brush value display in the brush list
        const brushList = document.getElementById('brush-list');
        if (!brushList) return;
        
        const brushItem = brushList.querySelector(`[data-brush-id="${brushId}"]`);
        if (brushItem) {
            const brushValueElement = brushItem.querySelector('.brush-value');
            if (brushValueElement) {
                brushValueElement.textContent = size;
            }
            
            // Also update the brush object's value property
            const allBrushes = [...this.basicBrushes, ...this.customBrushes, ...this.specialBrushes];
            const brush = allBrushes.find(b => b.id === brushId);
            if (brush) {
                brush.value = size;
            }
        }
    }
    
    openBrushSettings(brushId) {
        // Create or show brush config panel
        this.createBrushConfigPanel(brushId);
    }
    
    // Get default config for a brush type
    getBrushDefaultConfig(brushId) {
        // Universal config options for all brushes
        const universalConfig = {
            flow: 0.8,
            spacing: 0.15,
            roundness: 1.00,
            angle: 0.00
        };
        
        // Brush-specific configs
        const brushSpecificConfigs = {
            'pen': {},
            'marker': { intensity: 0.4 },
            'beads': { intensity: 0.7 },
            'calligraphy': { lineWidth: 1, lerps: 16 },
            'hatching': { lineWidth: 1, lerps: 3 },
            'sprayPaint': { density: 10, minRadius: 0.5 },
            'realisticSketchingPencil': { bristleCount: 5, gridSize: 4, skipThreshold: 0.3 }
        };
        
        // Merge universal config with brush-specific config
        return { ...universalConfig, ...(brushSpecificConfigs[brushId] || {}) };
    }
    
    // Get config for a brush (with defaults)
    getBrushConfig(brushId) {
        if (!this.brushConfigs[brushId]) {
            this.brushConfigs[brushId] = { ...this.getBrushDefaultConfig(brushId) };
        }
        return this.brushConfigs[brushId];
    }
    
    // Update config for a brush
    updateBrushConfig(brushId, config) {
        if (!this.brushConfigs[brushId]) {
            this.brushConfigs[brushId] = {};
        }
        Object.assign(this.brushConfigs[brushId], config);
    }
    
    // Create config panel for a brush inside the brush panel
    createBrushConfigPanel(brushId) {
        const brush = this.getBrushById(brushId);
        if (!brush) {
            console.warn('Brush not found:', brushId);
            return;
        }
        
        const brushPanel = document.getElementById('brush-panel');
        const configPanel = document.getElementById('brush-config-panel');
        if (!brushPanel || !configPanel) return;
        
        // Show config panel and expand brush panel
        brushPanel.classList.add('has-config');
        configPanel.classList.add('is-visible');
        
        // Get current config
        const config = this.getBrushConfig(brushId);
        const configFields = this.getBrushConfigFields(brushId);
        
        // Build config HTML
        let configHTML = `
            <div class="brush-config-header">
                <span class="brush-config-title">${brush.name} Settings</span>
                <button class="brush-config-close">×</button>
            </div>
            <div class="brush-config-content">
        `;
        
        if (configFields.length === 0) {
            configHTML += '<p style="padding: 20px; text-align: center; color: #94a3b8;">No additional settings for this brush.</p>';
        } else {
            configFields.forEach(field => {
                const value = config[field.key] !== undefined ? config[field.key] : field.default;
                const displayValue = this.formatBrushConfigValue(value, field);
                configHTML += `
                    <div class="brush-config-group">
                        <label class="brush-config-label">${field.label}</label>
                        <div class="brush-config-slider-row">
                            <input type="range" class="brush-config-slider" 
                                   id="brush-config-${brushId}-${field.key}"
                                   min="${field.min}" max="${field.max}" step="${field.step}" value="${value}">
                            <span class="brush-config-value" id="brush-config-${brushId}-${field.key}-value">${displayValue}</span>
                        </div>
                    </div>
                `;
            });
        }
        
        configHTML += '</div>';
        configPanel.innerHTML = configHTML;
        
        this.isBrushConfigOpen = true;
        this.activeBrushConfigBrushId = brushId;

        // Setup events
        this.setupBrushConfigEvents(configPanel, brushId, configFields);
    }
    
    // Setup events for brush config panel
    setupBrushConfigEvents(panel, brushId, configFields) {
        const closeBtn = panel.querySelector('.brush-config-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeBrushConfigPanel();
            });
        }
        
        configFields.forEach(field => {
            const slider = document.getElementById(`brush-config-${brushId}-${field.key}`);
            const valueSpan = document.getElementById(`brush-config-${brushId}-${field.key}-value`);
            
            if (slider && valueSpan) {
                slider.addEventListener('input', (e) => {
                    let value = parseFloat(e.target.value);
                    if (Number.isNaN(value)) {
                        value = field.default;
                    }
                    valueSpan.textContent = this.formatBrushConfigValue(value, field);
                    this.updateBrushConfig(brushId, { [field.key]: value });
                });
            }
        });
    }
    
    // Close brush config panel
    closeBrushConfigPanel() {
        const brushPanel = document.getElementById('brush-panel');
        const configPanel = document.getElementById('brush-config-panel');
        this.isBrushConfigOpen = false;
        this.activeBrushConfigBrushId = null;
        if (brushPanel) {
            brushPanel.classList.remove('has-config');
        }
        if (configPanel) {
            configPanel.classList.remove('is-visible');
        }
    }
    
    // Get config fields for a brush type
    getBrushConfigFields(brushId) {
        // Default brushes (pen, marker) have no config options
        const defaultBrushes = ['pen', 'marker'];
        if (defaultBrushes.includes(brushId)) {
            return [];
        }
        
        // Universal config fields for non-default brushes
        const universalFields = [
            { key: 'flow', label: 'Flow', min: 0, max: 1, step: 0.01, default: 0.8 },
            { key: 'spacing', label: 'Spacing', min: 0, max: 1, step: 0.01, default: 0.15 },
            { key: 'roundness', label: 'Roundness', min: 0, max: 1, step: 0.01, default: 1.00 },
            { key: 'angle', label: 'Angle', min: 0, max: 360, step: 1, default: 0.00 }
        ];
        
        // Brush-specific fields
        const brushSpecificFields = {
            'beads': [
                { key: 'intensity', label: 'Intensity', min: 0, max: 1, step: 0.01, default: 0.7 }
            ],
            'calligraphy': [
                { key: 'lineWidth', label: 'Line Width', min: 0.5, max: 5, step: 0.1, default: 1 },
                { key: 'lerps', label: 'Smoothness', min: 4, max: 32, step: 1, default: 16 }
            ],
            'hatching': [
                { key: 'lineWidth', label: 'Line Width', min: 0.5, max: 5, step: 0.1, default: 1 },
                { key: 'lerps', label: 'Lines', min: 1, max: 10, step: 1, default: 3 }
            ],
            'sprayPaint': [
                { key: 'density', label: 'Density', min: 5, max: 50, step: 1, default: 10 },
                { key: 'minRadius', label: 'Min Radius', min: 0.1, max: 1, step: 0.1, default: 0.5 }
            ],
            'realisticSketchingPencil': [
                { key: 'bristleCount', label: 'Bristle Count', min: 3, max: 20, step: 1, default: 5 },
                { key: 'gridSize', label: 'Texture Size', min: 2, max: 10, step: 1, default: 4 },
                { key: 'skipThreshold', label: 'Skip Threshold', min: 0, max: 1, step: 0.01, default: 0.3 }
            ]
        };
        
        // Combine universal fields with brush-specific fields
        return [...universalFields, ...(brushSpecificFields[brushId] || [])];
    }

    formatBrushConfigValue(value, field) {
        if (field.key === 'angle') {
            return Math.round(value);
        }
        if (field.step >= 1) {
            return Math.round(value);
        }
        return parseFloat(value).toFixed(2);
    }
    
    closeBrushSettings() {
        const brushSettings = document.getElementById('brush-settings');
        if (brushSettings) {
            brushSettings.classList.remove('is-visible');
        }
        this.closeBrushConfigPanel();
    }
    
    updateBrushSettings() {
        const brushSettingsTitle = document.querySelector('.brush-settings-title');
        if (brushSettingsTitle && this.currentBrush) {
            brushSettingsTitle.textContent = this.currentBrush.name;
        }
    }
    
    resetBrushSettings() {
        const sliders = document.querySelectorAll('.brush-slider');
        sliders.forEach(slider => {
            if (slider.min === '1' && slider.max === '200') {
                slider.value = 41; // 4.1px
            } else {
                slider.value = slider.min === '0' ? 0 : 100;
            }
            slider.dispatchEvent(new Event('input'));
        });
        
        const toggle = document.getElementById('force-fade-out');
        if (toggle) {
            toggle.checked = false;
        }
    }
    
    toggleBrushPanel() {
        const panel = document.getElementById('brush-panel');
        if (panel) {
            const isVisible = panel.classList.contains('is-visible');
            if (isVisible) {
                this.closeBrushPanel();
            } else {
                this.openBrushPanel();
            }
        }
    }
    
    openBrushPanel() {
        const panel = document.getElementById('brush-panel');
        if (panel) {
            panel.classList.add('is-visible');
            this.renderBrushList();
            // Outside click closing disabled by request
            this.removeBrushPanelOutsideListener();
        }
    }
    
    closeBrushPanel() {
        const panel = document.getElementById('brush-panel');
        const settings = document.getElementById('brush-settings');
        this.closeBrushConfigPanel();
        if (panel) {
            panel.classList.remove('is-visible');
        }
        if (settings) {
            settings.classList.remove('is-visible');
        }
        this.removeBrushPanelOutsideListener();
    }

    addBrushPanelOutsideListener() {
        // Outside click closing disabled by request
        return;
    }
    
    removeBrushPanelOutsideListener() {
        if (this.brushPanelOutsideHandler) {
            document.removeEventListener('mousedown', this.brushPanelOutsideHandler);
            document.removeEventListener('click', this.brushPanelOutsideHandler);
            document.removeEventListener('touchstart', this.brushPanelOutsideHandler);
            this.brushPanelOutsideHandler = null;
        }
    }
    
    addNewBrushGroup() {
        const groupName = prompt('Enter name for new brush group:');
        if (groupName && groupName.trim()) {
            // Create a new brush group with some default brushes
            const newGroup = [
                { id: `${groupName.toLowerCase()}-1`, name: `${groupName} Brush 1`, value: 25.0, isStarred: false, preview: 'solid' },
                { id: `${groupName.toLowerCase()}-2`, name: `${groupName} Brush 2`, value: 35.0, isStarred: false, preview: 'soft' },
                { id: `${groupName.toLowerCase()}-3`, name: `${groupName} Brush 3`, value: 45.0, isStarred: false, preview: 'thick' }
            ];
            
            // Add the new group to the brush groups
            this[`${groupName.toLowerCase()}Brushes`] = newGroup;
            
            // Add a new tab button
            this.addNewTabButton(groupName.toLowerCase(), groupName);
            
            alert(`New brush group "${groupName}" created with 3 default brushes!`);
        }
    }
    
    switchBrushTab(tabType, clickedTab) {
        // Remove active class from all tabs
        const allTabs = document.querySelectorAll('.brush-tab');
        allTabs.forEach(tab => tab.classList.remove('active'));
        
        // Add active class to clicked tab
        clickedTab.classList.add('active');
        
        // Update current tab and render brush list
        this.currentTab = tabType;
        this.renderBrushList();
    }
    
    addNewTabButton(tabId, tabName) {
        const tabsContainer = document.querySelector('.brush-tabs');
        const addGroupBtn = document.querySelector('.brush-add-group-btn');
        
        const newTab = document.createElement('button');
        newTab.className = 'brush-tab';
        newTab.dataset.tab = tabId;
        newTab.textContent = tabName;
        
        // Insert before the add group button
        tabsContainer.insertBefore(newTab, addGroupBtn);
        
        // Add event listener for the new tab
        newTab.addEventListener('click', () => {
            this.switchBrushTab(tabId, newTab);
        });
    }

    // ===== REFERENCE IMAGES (FULLY FUNCTIONAL) =====
    setupReferenceImages() {
        this.referenceImages = [];
        
        this.openRefViewers = new Map(); // Track open viewers
        this.viewerCounter = 0; // For unique positioning
        this.refViewerZIndex = 1000; // Base z-index for reference viewers
        
        this.setupReferenceImagesEvents();
        this.renderReferenceImagesGrid();
    }
    
    setupReferenceImagesEvents() {
        console.log('Setting up reference images events...');
        const refImagesPanel = document.getElementById('saved-ref-images-panel');
        console.log('Reference images panel:', refImagesPanel);
        
        // Only add event listeners once
        if (this.refImagesOutsideClickHandler) return;
        
        // Click/touch outside to close reference images panel
        this.refImagesOutsideClickHandler = (e) => {
            const refImagesPanel = document.getElementById('saved-ref-images-panel');
            const savedRefImagesBtn = document.getElementById('saved-ref-images');
            
            // If panel is open and click/touch is outside the panel and not on the button
            if (refImagesPanel && refImagesPanel.classList.contains('show') &&
                !refImagesPanel.contains(e.target) && 
                !savedRefImagesBtn.contains(e.target)) {
                this.closeReferenceImagesPanel();
            }
        };
        
        document.addEventListener('click', this.refImagesOutsideClickHandler);
        document.addEventListener('touchstart', this.refImagesOutsideClickHandler, { passive: true });
        
        // Reference image items - use event delegation since items are dynamically created
        const refImagesGrid = document.querySelector('.ref-images-grid');
        if (refImagesGrid) {
            refImagesGrid.addEventListener('click', (e) => {
                console.log('Grid clicked, target:', e.target);
                const refImageItem = e.target.closest('.ref-image-item:not(.add-new)');
                console.log('Found ref image item:', refImageItem);
                if (refImageItem) {
                    const imageId = refImageItem.dataset.imageId;
                    console.log('Image ID:', imageId);
                    this.openReferenceImageViewer(imageId);
                }
            });
        }
        
        // Add new reference image
        const addRefImage = document.getElementById('add-ref-image');
        if (addRefImage) {
            addRefImage.addEventListener('click', () => {
                this.addNewReferenceImage();
            });
        }
        
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (refImagesPanel && refImagesPanel.classList.contains('is-visible')) {
                if (!refImagesPanel.contains(e.target) && !e.target.closest('#saved-ref-images')) {
                    this.closeReferenceImagesPanel();
                }
            }
            
            const refImageViewer = document.querySelector('.ref-image-viewer');
            if (refImageViewer && refImageViewer.classList.contains('is-visible')) {
                if (!refImageViewer.contains(e.target)) {
                    this.closeReferenceImageViewer();
                }
            }
        });
    }
    
    toggleReferenceImagesPanel() {
        console.log('Toggling reference images panel...');
        const panel = document.getElementById('saved-ref-images-panel');
        console.log('Panel element:', panel);
        if (panel) {
            const isVisible = panel.classList.contains('is-visible');
            console.log('Panel is visible:', isVisible);
            if (isVisible) {
                this.closeReferenceImagesPanel();
            } else {
                this.openReferenceImagesPanel();
            }
            // Debug: check classes after toggle
            console.log('Panel classes after toggle:', panel.className);
            console.log('Panel computed display:', window.getComputedStyle(panel).display);
        } else {
            console.error('Reference images panel not found!');
        }
    }
    
    openReferenceImagesPanel() {
        console.log('Opening reference images panel...');
        const panel = document.getElementById('saved-ref-images-panel');
        if (panel) {
            panel.classList.add('is-visible');
            console.log('Panel classes after opening:', panel.className);
            console.log('Panel computed display after opening:', window.getComputedStyle(panel).display);
        } else {
            console.error('Panel not found when trying to open');
        }
    }
    
    closeReferenceImagesPanel() {
        console.log('Closing reference images panel...');
        const panel = document.getElementById('saved-ref-images-panel');
        if (panel) {
            panel.classList.remove('is-visible');
            console.log('Panel classes after closing:', panel.className);
        } else {
            console.error('Panel not found when trying to close');
        }
    }
    
    openReferenceImageViewer(imageId) {
        console.log('Opening reference image viewer for:', imageId);
        
        // Check if viewer is already open for this image
        if (this.openRefViewers.has(imageId)) {
            console.log('Viewer already open for this image');
            return;
        }
        
        const refImage = this.referenceImages.find(img => img.id === imageId);
        if (!refImage) {
            console.error('Reference image not found:', imageId);
            return;
        }
        
        // Create new viewer element
        const viewer = this.createRefImageViewer(refImage);
        
        // Add to container
        const container = document.getElementById('ref-viewers-container');
        if (container) {
            container.appendChild(viewer);
            this.openRefViewers.set(imageId, viewer);
            console.log('Reference image viewer opened successfully');
        } else {
            console.error('Reference viewers container not found');
        }
    }
    
    createRefImageViewer(refImage) {
        const viewer = document.createElement('div');
        viewer.className = 'ref-image-viewer';
        viewer.dataset.imageId = refImage.id;
        
        // Position viewer with offset to avoid overlap
        const offset = this.viewerCounter * 30;
        viewer.style.top = `${50 + offset}px`;
        viewer.style.left = `${50 + offset}px`;
        this.viewerCounter++;
        
        // Top drag handle (invisible)
        const dragHandle = document.createElement('div');
        dragHandle.className = 'ref-viewer-drag-handle';
        viewer.appendChild(dragHandle);
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'ref-viewer-close';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => {
            this.closeReferenceImageViewer(refImage.id);
        });
        closeBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.closeReferenceImageViewer(refImage.id);
        }, { passive: false });
        viewer.appendChild(closeBtn);
        
        // Create content area (no header)
        const content = document.createElement('div');
        content.className = 'ref-viewer-content';
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'ref-viewer-image-container';
        
        const imageDiv = document.createElement('div');
        imageDiv.className = 'ref-viewer-image';
        
        if (refImage.image) {
            // Show actual image
            const img = document.createElement('img');
            img.src = refImage.image;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            imageDiv.appendChild(img);
        } else {
            // Show placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'ref-viewer-placeholder';
        placeholder.innerHTML = `<span class="ref-viewer-text">${refImage.name}</span>`;
        imageDiv.appendChild(placeholder);
        }
        
        imageContainer.appendChild(imageDiv);
        content.appendChild(imageContainer);
        
        viewer.appendChild(content);
        
        // Add resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        viewer.appendChild(resizeHandle);
        
        // Add drag functionality: allow dragging from handle or borders
        this.makeViewerDraggable(viewer, viewer, dragHandle);
        
        // Add resize functionality
        this.makeViewerResizable(viewer);
        
        // Add click-to-front functionality
        this.addClickToFront(viewer);
        
        // Add touch gesture support for image content
        this.addTouchGestures(imageDiv, imageContainer);
        
        return viewer;
    }
    
    makeViewerDraggable(viewer, dragElement, dragHandle) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        const bringToFront = () => {
            this.bringRefViewerToFront(viewer);
        };
        
        const startDrag = (clientX, clientY) => {
            // Bring this viewer to the front
            bringToFront();
            
            isDragging = true;
            startX = clientX;
            startY = clientY;
            startLeft = parseInt(window.getComputedStyle(viewer).left);
            startTop = parseInt(window.getComputedStyle(viewer).top);
            
            viewer.style.cursor = 'grabbing';
        };
        
        const onMouseDown = (e) => {
            // Only allow dragging when starting from the explicit top handle
            const startedOnHandle = !!(dragHandle && (e.target === dragHandle || dragHandle.contains(e.target)));
            if (!startedOnHandle) return;
            
            startDrag(e.clientX, e.clientY);
            e.preventDefault();
        };
        
        const onTouchStart = (e) => {
            // Only allow dragging when starting from the explicit top handle
            const startedOnHandle = !!(dragHandle && (e.target === dragHandle || dragHandle.contains(e.target)));
            if (!startedOnHandle || e.touches.length !== 1) return;
            
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
            e.preventDefault();
        };
        
        const updatePosition = (clientX, clientY) => {
            if (!isDragging) return;
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;
            viewer.style.left = `${startLeft + deltaX}px`;
            viewer.style.top = `${startTop + deltaY}px`;
        };
        
        const stopDrag = () => {
            if (isDragging) {
                isDragging = false;
                viewer.style.cursor = 'default';
            }
        };
        
        // Mouse events
        if (dragHandle) dragHandle.addEventListener('mousedown', onMouseDown);
        
        // Touch events
        if (dragHandle) dragHandle.addEventListener('touchstart', onTouchStart, { passive: false });
        
        document.addEventListener('mousemove', (e) => updatePosition(e.clientX, e.clientY));
        document.addEventListener('mouseup', stopDrag);
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches.length === 1) {
                const touch = e.touches[0];
                updatePosition(touch.clientX, touch.clientY);
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchend', stopDrag);
    }
    
    makeViewerResizable(viewer) {
        const resizeHandle = viewer.querySelector('.resize-handle');
        if (!resizeHandle) return;
        
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        let mouseMoveHandler, mouseUpHandler, touchMoveHandler, touchEndHandler;
        
        const startResize = (clientX, clientY) => {
            isResizing = true;
            startX = clientX;
            startY = clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(viewer).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(viewer).height, 10);
            
            // Add visual feedback
            viewer.style.cursor = 'nw-resize';
            document.body.style.cursor = 'nw-resize';
        };
        
        const doResize = (clientX, clientY) => {
            if (!isResizing) return;
            
            const newWidth = startWidth + clientX - startX;
            const newHeight = startHeight + clientY - startY;
            
            viewer.style.width = Math.max(200, newWidth) + 'px';
            viewer.style.height = Math.max(150, newHeight) + 'px';
        };
        
        const stopResize = () => {
            if (!isResizing) return;
            
            isResizing = false;
            viewer.style.cursor = 'default';
            document.body.style.cursor = 'default';
            
            // Remove event listeners
            if (mouseMoveHandler) document.removeEventListener('mousemove', mouseMoveHandler);
            if (mouseUpHandler) document.removeEventListener('mouseup', mouseUpHandler);
            if (touchMoveHandler) document.removeEventListener('touchmove', touchMoveHandler);
            if (touchEndHandler) document.removeEventListener('touchend', touchEndHandler);
        };
        
        // Mouse events
        resizeHandle.addEventListener('mousedown', (e) => {
            startResize(e.clientX, e.clientY);
            e.preventDefault();
            
            // Create bound event handlers
            mouseMoveHandler = (e) => doResize(e.clientX, e.clientY);
            mouseUpHandler = stopResize;
            
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
        
        // Touch events
        resizeHandle.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                startResize(touch.clientX, touch.clientY);
                e.preventDefault();
                
                // Create bound event handlers
                touchMoveHandler = (e) => {
                    if (isResizing && e.touches.length === 1) {
                        const touch = e.touches[0];
                        doResize(touch.clientX, touch.clientY);
                        e.preventDefault();
                    }
                };
                touchEndHandler = stopResize;
                
                document.addEventListener('touchmove', touchMoveHandler, { passive: false });
                document.addEventListener('touchend', touchEndHandler);
            }
        }, { passive: false });
    }
    
    addClickToFront(viewer) {
        const bringToFront = () => {
            // Get the highest z-index among all reference viewers
            let maxZIndex = 1000;
            this.openRefViewers.forEach((otherViewer) => {
                const zIndex = parseInt(window.getComputedStyle(otherViewer).zIndex) || 1000;
                if (zIndex > maxZIndex) {
                    maxZIndex = zIndex;
                }
            });
            
            // Set this viewer to be on top, but keep it below navigation panel (z-index: 2000)
            const newZIndex = Math.min(maxZIndex + 1, 1999);
            viewer.style.zIndex = newZIndex;
        };
        
        // Mouse click events
        viewer.addEventListener('click', (e) => {
            // Don't bring to front if clicking on interactive elements
            if (e.target.closest('button') || e.target.closest('input')) {
                return;
            }
            
            // Don't bring to front if this was a drag operation
            if (e.detail === 0) return; // Programmatic click
            
            bringToFront();
        });
        
        // Touch events
        viewer.addEventListener('touchstart', (e) => {
            // Don't bring to front if touching interactive elements
            if (e.target.closest('button') || e.target.closest('input')) {
                return;
            }
            
            // Small delay to distinguish from drag gestures
            setTimeout(() => {
                if (!e.defaultPrevented) {
                    bringToFront();
                }
            }, 100);
        }, { passive: true });
    }
    
    addTouchGestures(imageDiv, imageContainer) {
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let lastDistance = 0;
        let lastCenterX = 0;
        let lastCenterY = 0;
        let isGesturing = false;
        
        // Touch events
        imageDiv.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Two finger gesture - pinch/zoom
                isGesturing = true;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                lastDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                lastCenterX = (touch1.clientX + touch2.clientX) / 2;
                lastCenterY = (touch1.clientY + touch2.clientY) / 2;
                
                e.preventDefault();
            } else if (e.touches.length === 1 && scale > 1) {
                // Single finger pan when zoomed
                isGesturing = true;
                const touch = e.touches[0];
                lastCenterX = touch.clientX;
                lastCenterY = touch.clientY;
                
                e.preventDefault();
            }
        });
        
        imageDiv.addEventListener('touchmove', (e) => {
            if (!isGesturing) return;
            
            if (e.touches.length === 2) {
                // Pinch zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                const currentDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                const scaleChange = currentDistance / lastDistance;
                scale *= scaleChange;
                scale = Math.max(0.5, Math.min(scale, 5)); // Limit zoom range
                
                // Update center point for zoom
                const currentCenterX = (touch1.clientX + touch2.clientX) / 2;
                const currentCenterY = (touch1.clientY + touch2.clientY) / 2;
                
                const rect = imageContainer.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const deltaX = currentCenterX - lastCenterX;
                const deltaY = currentCenterY - lastCenterY;
                
                translateX += deltaX / scale;
                translateY += deltaY / scale;
                
                lastDistance = currentDistance;
                lastCenterX = currentCenterX;
                lastCenterY = currentCenterY;
                
                this.updateImageTransform(imageDiv, scale, translateX, translateY);
                e.preventDefault();
            } else if (e.touches.length === 1 && scale > 1) {
                // Pan when zoomed
                const touch = e.touches[0];
                const deltaX = touch.clientX - lastCenterX;
                const deltaY = touch.clientY - lastCenterY;
                
                translateX += deltaX / scale;
                translateY += deltaY / scale;
                
                lastCenterX = touch.clientX;
                lastCenterY = touch.clientY;
                
                this.updateImageTransform(imageDiv, scale, translateX, translateY);
                e.preventDefault();
            }
        });
        
        imageDiv.addEventListener('touchend', (e) => {
            isGesturing = false;
        });
        
        // Mouse wheel zoom
        imageDiv.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const rect = imageContainer.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            
            const scaleChange = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = scale * scaleChange;
            
            if (newScale >= 0.5 && newScale <= 5) {
                // Adjust translation to zoom towards mouse position
                translateX = translateX * scaleChange - deltaX * (scaleChange - 1) / newScale;
                translateY = translateY * scaleChange - deltaY * (scaleChange - 1) / newScale;
                
                scale = newScale;
                this.updateImageTransform(imageDiv, scale, translateX, translateY);
            }
        });
        
        // Double tap to reset (separate event listener to avoid conflicts)
        let lastTap = 0;
        let tapTimeout;
        
        imageDiv.addEventListener('touchend', (e) => {
            if (e.touches.length === 0 && !isGesturing) {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                
                if (tapLength < 500 && tapLength > 0) {
                    // Double tap - reset zoom and pan
                    clearTimeout(tapTimeout);
                    scale = 1;
                    translateX = 0;
                    translateY = 0;
                    this.updateImageTransform(imageDiv, scale, translateX, translateY);
                } else {
                    // Single tap - set timeout to prevent accidental double tap
                    clearTimeout(tapTimeout);
                    tapTimeout = setTimeout(() => {
                        lastTap = currentTime;
                    }, 500);
                }
            }
        });
    }
    
    updateImageTransform(imageDiv, scale, translateX, translateY) {
        // Use transform3d for better performance and to prevent layout shifts
        imageDiv.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
        imageDiv.style.transformOrigin = 'center center';
        imageDiv.style.willChange = 'transform'; // Optimize for animations
    }
    
    closeReferenceImageViewer(imageId) {
        const viewer = this.openRefViewers.get(imageId);
        if (viewer) {
            viewer.remove();
            this.openRefViewers.delete(imageId);
            this.cleanupZIndex();
        }
    }
    
    // Clean z-index management
    bringRefViewerToFront(viewer) {
        // Increment the global z-index counter
        this.refViewerZIndex++;
        
        // Cap it at 9999 to stay below navigation panel (z-index: 10000)
        if (this.refViewerZIndex >= 9999) {
            this.refViewerZIndex = 1000;
            this.reassignZIndexes();
        }
        
        viewer.style.zIndex = this.refViewerZIndex;
    }
    
    reassignZIndexes() {
        // Reset all reference viewers to clean z-index values
        let currentZIndex = 1000;
        this.openRefViewers.forEach((viewer) => {
            viewer.style.zIndex = currentZIndex;
            currentZIndex++;
        });
        this.refViewerZIndex = currentZIndex - 1;
    }
    
    cleanupZIndex() {
        // If we have very few viewers open, reset the z-index counter
        if (this.openRefViewers.size <= 2) {
            this.refViewerZIndex = 1000;
            this.reassignZIndexes();
        }
    }
    
    addNewReferenceImage() {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageDataUrl = event.target.result;
            const newId = `ref-${Date.now()}`;
                    const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
                    
            const newImage = {
                id: newId,
                        name: fileName || 'Reference Image',
                        image: imageDataUrl
            };
            
            this.referenceImages.push(newImage);
            this.renderReferenceImagesGrid();
                    // Keep panel open after selecting image
                    this.openReferenceImagesPanel();
                };
                reader.readAsDataURL(file);
            }
            // Clean up
            document.body.removeChild(fileInput);
        });
        
        // Add to body and trigger click
        document.body.appendChild(fileInput);
        fileInput.click();
    }
    
    renderReferenceImagesGrid() {
        const grid = document.querySelector('.ref-images-grid');
        if (!grid) return;
        
        // Clear existing items except add new button
        const existingItems = grid.querySelectorAll('.ref-image-item:not(.add-new)');
        existingItems.forEach(item => item.remove());
        
        // Add reference image items
        this.referenceImages.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'ref-image-item';
            item.dataset.imageId = image.id;
            
            const placeholder = document.createElement('div');
            placeholder.className = 'ref-image-placeholder';
            
            if (image.image) {
                // Show actual image
                const img = document.createElement('img');
                img.src = image.image;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                placeholder.appendChild(img);
            } else {
                // Show placeholder text
                const text = document.createElement('span');
                text.className = 'ref-image-text';
                text.textContent = `Ref ${index + 1}`;
                placeholder.appendChild(text);
            }
            
            item.appendChild(placeholder);
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'ref-image-name';
            nameDiv.textContent = image.name;
            item.appendChild(nameDiv);
            
            // Insert before add new button
            const addNewBtn = document.getElementById('add-ref-image');
            grid.insertBefore(item, addNewBtn);
            
            // Add click event
            item.addEventListener('click', () => {
                this.openReferenceImageViewer(image.id);
            });
        });
    }
    
    
    // ===== COLOR PICKER (FULLY FUNCTIONAL) =====
    setupColorPicker() {
        const colorPicker = document.getElementById('color-picker');
        const hexInput = document.getElementById('hex-input');
        
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.currentColor = e.target.value;
                if (hexInput) hexInput.value = this.currentColor;
                this.updateColorButton();
            });
        }
        
        if (hexInput) {
            hexInput.addEventListener('input', (e) => {
                const color = e.target.value;
                if (/^#[0-9A-F]{6}$/i.test(color)) {
                    this.currentColor = color;
                    if (colorPicker) colorPicker.value = color;
                    this.updateColorButton();
                }
            });
        }
        
        // Set initial color button color
        this.updateColorButton();
    }
    
    // Update the color button to show the current color
    updateColorButton() {
        // Update layers panel color button
        const layerColorPickerBtn = document.getElementById('layer-color-picker');
        if (layerColorPickerBtn) {
            layerColorPickerBtn.style.color = this.currentColor;
        }
        
        // Update bottom toolbar color button
        const bottomColorBtn = document.getElementById('btn-color');
        if (bottomColorBtn) {
            bottomColorBtn.style.setProperty('--current-color', this.currentColor);
        }
    }
    
    // Setup top toolbar buttons
    setupTopToolbar() {
        // Navigation button
        const navigationBtn = document.getElementById('navigation');
        if (navigationBtn) {
            navigationBtn.addEventListener('click', () => {
                this.toggleNavigationPopup();
            });
            navigationBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.toggleNavigationPopup();
            }, { passive: false });
        }
        
        // Selection area button
        const selectionAreaBtn = document.getElementById('selection-area');
        if (selectionAreaBtn) {
            selectionAreaBtn.addEventListener('click', () => {
                this.toggleSelectionArea();
            });
        }
        
        // Stabilizer button
        const stabilizerBtn = document.getElementById('stabilizer');
        if (stabilizerBtn) {
            stabilizerBtn.addEventListener('click', () => {
                this.toggleStabilizer();
            });
        }
        
        // Ruler button (now used for options menu)
        const rulerBtn = document.getElementById('ruler');
        const optionsMenu = document.getElementById('options-menu');
        if (rulerBtn && optionsMenu) {
            rulerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                optionsMenu.classList.toggle('is-visible');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (optionsMenu && !optionsMenu.contains(e.target) && !rulerBtn.contains(e.target)) {
                    optionsMenu.classList.remove('is-visible');
                }
            });
        }
        
        // Saved reference images button
        const savedRefImagesBtn = document.getElementById('saved-ref-images');
        if (savedRefImagesBtn) {
            savedRefImagesBtn.addEventListener('click', () => {
                console.log('Saved ref images button clicked');
                this.toggleReferenceImagesPanel();
            });
        }
    }
    
    // ===== HOMEPAGE & PROJECT MANAGEMENT =====
    setupHomepage() {
        const newCanvasBtn = document.getElementById('new-canvas-btn');
        if (newCanvasBtn) {
            newCanvasBtn.addEventListener('click', () => {
                this.createNewProject();
            });
        }
    }
    
    showHomepage() {
        const homepage = document.getElementById('homepage');
        const workspace = document.getElementById('workspace');
        if (homepage) {
            homepage.style.display = 'block';
            homepage.style.background = '#1a1a1a';
            homepage.style.width = '100%';
            homepage.style.minHeight = '100vh';
        }
        if (workspace) workspace.style.display = 'none';
        this.renderHomepage();
        // Update URL
        window.history.pushState({}, '', window.location.pathname);
    }
    
    showWorkspace() {
        const homepage = document.getElementById('homepage');
        const workspace = document.getElementById('workspace');
        if (homepage) homepage.style.display = 'none';
        if (workspace) workspace.style.display = 'block';
        
        // Recalculate canvas display after workspace becomes visible
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
            this.setupCanvasDisplay();
            this.applyTransformations();
        }, 50);
    }
    
    renderHomepage() {
        const canvasesGrid = document.getElementById('canvases-grid');
        if (!canvasesGrid) return;
        
        // Force apply styles directly via inline styles
        const homepage = document.getElementById('homepage');
        if (homepage) {
            homepage.style.cssText = 'width: 100% !important; min-height: 100vh !important; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%) !important; display: flex !important; align-items: flex-start !important; justify-content: center !important; padding: 0 !important; overflow-y: auto !important; position: relative !important; z-index: 1 !important;';
        }
        
        const homepageContent = document.querySelector('.homepage-content');
        if (homepageContent) {
            homepageContent.style.cssText = 'width: 100% !important; max-width: 1400px !important; padding: 60px 40px 40px 40px !important;';
        }
        
        // Keep the new canvas button, remove only canvas items
        const newCanvasBtn = document.getElementById('new-canvas-btn');
        const existingItems = canvasesGrid.querySelectorAll('.canvas-item:not(#new-canvas-btn)');
        existingItems.forEach(item => item.remove());
        
        const projects = this.getAllProjects();
        
        projects.forEach(project => {
            const canvasItem = document.createElement('div');
            canvasItem.className = 'canvas-item';
            canvasItem.dataset.projectId = project.id;
            
            const thumbnail = document.createElement('div');
            thumbnail.className = 'canvas-item-thumbnail';
            if (project.thumbnail) {
                const img = document.createElement('img');
                img.src = project.thumbnail;
                img.alt = project.name;
                thumbnail.appendChild(img);
            } else {
                thumbnail.style.background = '#1e1e1e';
                const placeholder = document.createElement('div');
                placeholder.className = 'canvas-item-placeholder';
                placeholder.textContent = 'No preview';
                thumbnail.appendChild(placeholder);
            }
            
            const info = document.createElement('div');
            info.className = 'canvas-item-info';
            
            const name = document.createElement('div');
            name.className = 'canvas-item-name';
            name.textContent = project.name || 'Untitled Canvas';
            
            const date = document.createElement('div');
            date.className = 'canvas-item-date';
            const dateObj = new Date(project.updatedAt || project.createdAt);
            date.textContent = dateObj.toLocaleDateString();
            
            info.appendChild(name);
            info.appendChild(date);
            
            canvasItem.appendChild(thumbnail);
            canvasItem.appendChild(info);
            
            // Add action buttons
            const actions = document.createElement('div');
            actions.className = 'canvas-item-actions';
            
            const openBtn = document.createElement('button');
            openBtn.className = 'canvas-action-btn canvas-action-open';
            openBtn.textContent = 'Open';
            openBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadProject(project.id);
                this.showWorkspace();
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'canvas-action-btn canvas-action-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this canvas? This action cannot be undone.')) {
                    this.deleteProject(project.id);
                    this.renderHomepage(); // Refresh the homepage
                }
            });
            
            actions.appendChild(openBtn);
            actions.appendChild(deleteBtn);
            canvasItem.appendChild(actions);
            
            canvasesGrid.appendChild(canvasItem);
        });
    }
    
    getAllProjects() {
        // Persistence disabled; return empty list
        return [];
    }
    
    getProject(projectId) { return null; }
    
    saveProject(projectData) { /* no-op */ }
    
    deleteProject(projectId) { /* no-op */ }
    
    createNewProject() {
        const projectId = `project-${Date.now()}`;
        this.currentProjectId = projectId;
        
        // Reset workspace to default state
        this.resetWorkspace();
        
        // Save initial project
        this.saveCurrentProject();
        
        // Show workspace
        this.showWorkspace();
        
        // Update URL
        window.history.pushState({}, '', `?project=${projectId}`);
        
        // Force a resize event to ensure proper canvas sizing
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 150);
    }
    
    resetWorkspace() {
        // Reset to default state
        this.layers = [
            { id: 'layer-1', name: '1', visible: true, opacity: 100, blendMode: 'normal', isActive: true, thumbnail: null, color: '#feca57', type: 'layer', parentId: null, canvas: null, ctx: null },
        ];
        this.activeLayerId = 'layer-1';
        this.selectedLayerIds = new Set(['layer-1']);
        this.nextLayerId = 2;
        this.history = [];
        this.historyStep = -1;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.rotation = 0;
        
        // Initialize layer canvases (this creates the canvas elements)
        this.initializeLayerCanvases();
        
        // Save initial canvas state for undo/redo
        this.saveInitialCanvasState();
        
        this.updateLayersPanel();
        this.applyTransformations();
    }
    
    saveCurrentProject() {
        // Persistence disabled
        return;
    }
    
    generateProjectThumbnail() {
        // Create a thumbnail from the current canvas view
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 200;
        tempCanvas.height = 200;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw white background
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, 200, 200);
        
        // Draw all visible layers
        const canvasWidth = this.canvasWidth || this.drawingAreaSize;
        const canvasHeight = this.canvasHeight || this.drawingAreaSize;
        
        this.layers.forEach(layer => {
            if (layer.type === 'layer' && layer.visible && layer.canvas) {
                tempCtx.globalAlpha = layer.opacity / 100;
                tempCtx.globalCompositeOperation = layer.blendMode || 'source-over';
                tempCtx.drawImage(layer.canvas, 0, 0, 200, 200);
            }
        });
        
        tempCtx.globalAlpha = 1;
        tempCtx.globalCompositeOperation = 'source-over';
        
        return tempCanvas.toDataURL();
    }
    
    async loadProject(projectId) {
        // Persistence disabled; no-op for loading
        console.warn('Loading disabled (persistence turned off).');
        return;
    }
    
    // Top toolbar button handlers
    toggleNavigationPopup() {
        const popup = document.getElementById('navigation-popup');
        if (popup) {
            popup.classList.toggle('show');
            
            // Setup popup event listeners if showing
            if (popup.classList.contains('show')) {
                this.setupNavigationPopup();
            }
        }
    }
    
    setupNavigationPopup() {
        // Navigation panel toggle
        const navToggle = document.getElementById('nav-panel-toggle');
        if (navToggle) {
            // Set initial state based on panel visibility
            const panel = document.getElementById('navigation-panel');
            navToggle.checked = panel && panel.classList.contains('show');
            
            navToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.openNavigationPanel();
                } else {
                    this.closeNavigationPanel();
                }
                // Close popup after toggle
                document.getElementById('navigation-popup').classList.remove('show');
            });
        }
    }
    
    openNavigationPanel() {
        const panel = document.getElementById('navigation-panel');
        if (panel) {
            panel.classList.add('show');
            this.setupNavigationPanel();
            // Update navigation canvas after panel is shown
            // Use a longer timeout to ensure DOM is ready
            setTimeout(() => {
                // Check if elements exist before trying to setup
                const navViewport = document.getElementById('nav-viewport');
                const navCanvas = document.getElementById('nav-canvas');
                if (navViewport && navCanvas) {
                    this.setupNavigationCanvas();
                    // Also update the canvas content immediately
                    this.updateNavigationCanvas();
                } else {
                    console.warn('Navigation canvas elements not ready yet, retrying...');
                    // Retry after another delay
                    setTimeout(() => {
                        this.setupNavigationCanvas();
                        this.updateNavigationCanvas();
                    }, 100);
                }
            }, 200);
        }
        // Update toggle state
        const navToggle = document.getElementById('nav-panel-toggle');
        if (navToggle) {
            navToggle.checked = true;
        }
    }
    
    closeNavigationPanel() {
        const panel = document.getElementById('navigation-panel');
        if (panel) {
            panel.classList.remove('show');
        }
        // Update toggle state
        const navToggle = document.getElementById('nav-panel-toggle');
        if (navToggle) {
            navToggle.checked = false;
        }
    }
    
    setupNavigationPanel() {
        const panel = document.getElementById('navigation-panel');
        if (!panel) return;
        
        // Make panel resizable
        this.makeResizable(panel);
        
        // Make panel draggable
        this.makeNavigationPanelDraggable(panel);
        
        // Navigation panel should not close when clicking outside
        
        // Don't setup navigation canvas here - it will be called from openNavigationPanel
        // after the panel is shown and elements are ready
    }
    
    
    setupNavigationCanvas() {
        const navViewport = document.getElementById('nav-viewport');
        const navCanvas = document.getElementById('nav-canvas');
        const mainCanvas = document.getElementById('drawing-canvas');
        
        if (!navCanvas || !mainCanvas || !navViewport) {
            console.warn('Navigation canvas elements not found', {
                navViewport: !!navViewport,
                navCanvas: !!navCanvas,
                mainCanvas: !!mainCanvas,
                navViewportId: navViewport ? navViewport.id : 'not found',
                navCanvasId: navCanvas ? navCanvas.id : 'not found',
                mainCanvasId: mainCanvas ? mainCanvas.id : 'not found'
            });
            return;
        }
        
        // Use setTimeout to ensure viewport dimensions are available
        setTimeout(() => {
            // Get actual drawing canvas dimensions (use actual pixel dimensions)
            // Ensure we use the correct dimensions - if canvasWidth and canvasHeight are set, use them
            // Otherwise fall back to drawingAreaSize for both (square)
            const drawingWidth = this.canvasWidth || this.drawingAreaSize;
            const drawingHeight = this.canvasHeight || this.drawingAreaSize;
            
            // Debug: Log the actual canvas dimensions
            console.log('Canvas dimensions:', {
                canvasWidth: this.canvasWidth,
                canvasHeight: this.canvasHeight,
                drawingAreaSize: this.drawingAreaSize,
                drawingWidth,
                drawingHeight
            });
            
            const drawingAspectRatio = drawingWidth / drawingHeight;
            
            // Get viewport dimensions (accounting for padding)
            const viewportRect = navViewport.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(navViewport);
            const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
            const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
            const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
            const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
            
            // Calculate available space (viewport minus padding)
            const viewportWidth = viewportRect.width - paddingLeft - paddingRight;
            const viewportHeight = viewportRect.height - paddingTop - paddingBottom;
            
            if (viewportWidth <= 0 || viewportHeight <= 0) {
                console.warn('Viewport dimensions are zero or negative:', viewportWidth, viewportHeight);
                return;
            }
            
            const viewportAspectRatio = viewportWidth / viewportHeight;
            
            // Calculate canvas size to fit within viewport while maintaining aspect ratio
            // CRITICAL: Always maintain the exact aspect ratio of the drawing canvas
            let navCanvasWidth, navCanvasHeight;
            
            // Calculate both dimensions based on which constraint is tighter
            const widthBasedHeight = viewportWidth / drawingAspectRatio;
            const heightBasedWidth = viewportHeight * drawingAspectRatio;
            
            if (widthBasedHeight <= viewportHeight) {
                // Width is the limiting factor - fit to width
                navCanvasWidth = viewportWidth;
                navCanvasHeight = widthBasedHeight;
            } else {
                // Height is the limiting factor - fit to height
                navCanvasHeight = viewportHeight;
                navCanvasWidth = heightBasedWidth;
            }
            
            // Double-check: ensure aspect ratio is EXACTLY maintained
            const calculatedAspectRatio = navCanvasWidth / navCanvasHeight;
            const aspectRatioDiff = Math.abs(calculatedAspectRatio - drawingAspectRatio);
            
            if (aspectRatioDiff > 0.0001) {
                console.error('Aspect ratio mismatch detected! Correcting...', {
                    drawingAspectRatio,
                    calculatedAspectRatio,
                    diff: aspectRatioDiff,
                    navCanvasWidth,
                    navCanvasHeight,
                    viewportWidth,
                    viewportHeight
                });
                // Force correct aspect ratio - recalculate based on the tighter constraint
                if (widthBasedHeight <= viewportHeight) {
                    navCanvasWidth = viewportWidth;
                    navCanvasHeight = viewportWidth / drawingAspectRatio;
                } else {
                    navCanvasHeight = viewportHeight;
                    navCanvasWidth = viewportHeight * drawingAspectRatio;
                }
                // Verify again
                const correctedAspectRatio = navCanvasWidth / navCanvasHeight;
                const correctedDiff = Math.abs(correctedAspectRatio - drawingAspectRatio);
                if (correctedDiff > 0.0001) {
                    console.error('Failed to correct aspect ratio!', {
                        expected: drawingAspectRatio,
                        got: correctedAspectRatio,
                        diff: correctedDiff
                    });
                }
            }
            
            // Set navigation canvas internal size to match the display size
            // This ensures no stretching - internal size matches display size
            // Calculate the display size first, then set internal size to match
            // Round to ensure integer pixel values
            const finalWidth = Math.round(navCanvasWidth);
            const finalHeight = Math.round(navCanvasHeight);
            
            // Verify aspect ratio one more time before setting
            const finalAspectRatio = finalWidth / finalHeight;
            if (Math.abs(finalAspectRatio - drawingAspectRatio) > 0.0001) {
                console.error('FINAL ASPECT RATIO MISMATCH!', {
                    expected: drawingAspectRatio,
                    got: finalAspectRatio,
                    width: finalWidth,
                    height: finalHeight
                });
                // Force correct aspect ratio
                if (drawingAspectRatio > viewportAspectRatio) {
                    navCanvas.width = finalWidth;
                    navCanvas.height = Math.round(finalWidth / drawingAspectRatio);
                } else {
                    navCanvas.height = finalHeight;
                    navCanvas.width = Math.round(finalHeight * drawingAspectRatio);
                }
            } else {
                navCanvas.width = finalWidth;
                navCanvas.height = finalHeight;
            }
            
            // Set display size to match internal size exactly (no scaling)
            // Clear any conflicting styles first
            navCanvas.style.width = '';
            navCanvas.style.height = '';
            navCanvas.style.maxWidth = '';
            navCanvas.style.maxHeight = '';
            navCanvas.style.minWidth = '';
            navCanvas.style.minHeight = '';
            navCanvas.style.aspectRatio = '';
            
            // Set the calculated dimensions (same as internal size)
            navCanvas.style.width = navCanvas.width + 'px';
            navCanvas.style.height = navCanvas.height + 'px';
            navCanvas.style.margin = 'auto';
            navCanvas.style.display = 'block';
            navCanvas.style.imageRendering = 'auto'; // Use default rendering
            navCanvas.style.objectFit = 'none'; // Don't scale
            navCanvas.style.aspectRatio = `${navCanvas.width} / ${navCanvas.height}`; // Force aspect ratio
            // Verify the aspect ratio is correct
            const verifiedAspectRatio = navCanvas.width / navCanvas.height;
            const expectedAspectRatio = drawingWidth / drawingHeight;
            const aspectRatioError = Math.abs(verifiedAspectRatio - expectedAspectRatio);
            
            console.log('Navigation canvas setup:', {
                actualCanvasWidth: this.canvasWidth,
                actualCanvasHeight: this.canvasHeight,
                drawingWidth,
                drawingHeight,
                drawingAspectRatio: expectedAspectRatio,
                viewportWidth,
                viewportHeight,
                viewportAspectRatio,
                calculatedNavWidth: navCanvasWidth,
                calculatedNavHeight: navCanvasHeight,
                canvasInternalWidth: navCanvas.width,
                canvasInternalHeight: navCanvas.height,
                canvasDisplayWidth: navCanvas.style.width,
                canvasDisplayHeight: navCanvas.style.height,
                verifiedAspectRatio,
                aspectRatioError: aspectRatioError > 0.001 ? 'MISMATCH!' : 'OK'
            });
            
            if (aspectRatioError > 0.001) {
                console.error('Aspect ratio mismatch detected!', {
                    expected: expectedAspectRatio,
                    actual: verifiedAspectRatio,
                    error: aspectRatioError
                });
            }
            
            // Copy main canvas to navigation canvas immediately
        this.updateNavigationCanvas();
        
        // Listen for canvas changes
        this.setupCanvasUpdateListener();
        }, 100);
    }
    
    updateNavigationCanvas() {
        const navCanvas = document.getElementById('nav-canvas');
        
        if (!navCanvas) {
            console.warn('Navigation canvas not found');
            return;
        }
        
        const navCtx = navCanvas.getContext('2d');
        const navWidth = navCanvas.width;
        const navHeight = navCanvas.height;
        
        if (navWidth === 0 || navHeight === 0) {
            console.warn('Navigation canvas size is zero:', navWidth, navHeight);
            return;
        }
        
        // Clear navigation canvas with light gray background (panel background)
        navCtx.fillStyle = '#f8f9fa';
        navCtx.fillRect(0, 0, navWidth, navHeight);
        
        // Get the actual drawing canvas dimensions
        const drawingWidth = this.canvasWidth || this.drawingAreaSize;
        const drawingHeight = this.canvasHeight || this.drawingAreaSize;
        
        // Canvas is already sized to maintain aspect ratio, so draw at full size
        // Draw white background
        navCtx.fillStyle = '#ffffff';
        navCtx.fillRect(0, 0, navWidth, navHeight);
        
        // Draw all visible layers from bottom to top
        // In the layers array, index 0 is at the bottom, higher indices are on top
        // So we draw from index 0 to length-1 (bottom to top)
        let hasContent = false;
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (layer.type === 'layer' && layer.visible && layer.canvas) {
                try {
                navCtx.globalAlpha = layer.opacity / 100;
                navCtx.globalCompositeOperation = layer.blendMode || 'source-over';
                navCtx.drawImage(
                    layer.canvas,
                    0, 0, drawingWidth, drawingHeight,
                        0, 0, navWidth, navHeight
                );
                    hasContent = true;
                } catch (e) {
                    console.warn('Error drawing layer to navigation canvas:', e, layer);
                }
            }
        }
        
        // Reset composite operation
        navCtx.globalAlpha = 1;
        navCtx.globalCompositeOperation = 'source-over';
        
        if (!hasContent && this.layers.length > 0) {
            console.log('No content drawn - layers:', this.layers.map(l => ({
                type: l.type,
                visible: l.visible,
                hasCanvas: !!l.canvas
            })));
        }
    }
    
    setupCanvasUpdateListener() {
        // Clear any existing interval
        if (this.navCanvasUpdateInterval) {
            clearInterval(this.navCanvasUpdateInterval);
        }
        
        // Update navigation canvas when main canvas changes
        const mainCanvas = document.getElementById('drawing-canvas');
        if (mainCanvas) {
            // Listen for canvas redraws (this is a simple approach)
            // In a real implementation, you'd want to listen to drawing events
            this.navCanvasUpdateInterval = setInterval(() => {
                const panel = document.getElementById('navigation-panel');
                if (panel && panel.classList.contains('show')) {
                    this.updateNavigationCanvas();
                }
            }, 200); // Update every 200ms
        }
        
        // Update navigation canvas on resize
        const resizeHandler = () => {
            const panel = document.getElementById('navigation-panel');
            if (panel && panel.classList.contains('show')) {
                this.setupNavigationCanvas(); // Recalculate size
            }
        };
        
        // Remove old listener if exists
        if (this.navCanvasResizeHandler) {
            window.removeEventListener('resize', this.navCanvasResizeHandler);
        }
        
        this.navCanvasResizeHandler = resizeHandler;
        window.addEventListener('resize', resizeHandler);
    }
    
    makeDraggable(element, handle) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        handle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            if (e.target === handle || handle.contains(e.target)) {
                isDragging = true;
            }
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                xOffset = currentX;
                yOffset = currentY;
                
                element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            }
        }
        
        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
    }
    
    makeResizable(element) {
        const resizeHandle = element.querySelector('.resize-handle');
        if (!resizeHandle) return;
        
        // Check if this is the navigation panel
        const isNavPanel = element.id === 'navigation-panel';
        
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        let mouseMoveHandler, mouseUpHandler, touchMoveHandler, touchEndHandler;
        
        // Get canvas aspect ratio for navigation panel
        const getCanvasAspectRatio = () => {
            if (!isNavPanel) return null;
            const drawingWidth = this.canvasWidth || this.drawingAreaSize;
            const drawingHeight = this.canvasHeight || this.drawingAreaSize;
            return drawingWidth / drawingHeight;
        };
        
        const startResize = (clientX, clientY) => {
            isResizing = true;
            startX = clientX;
            startY = clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
            
            // Add visual feedback
            element.style.cursor = 'nw-resize';
            document.body.style.cursor = 'nw-resize';
        };
        
        const doResize = (clientX, clientY) => {
            if (!isResizing) return;
            
            if (isNavPanel) {
                // For navigation panel, maintain canvas aspect ratio
                const aspectRatio = getCanvasAspectRatio();
                if (aspectRatio) {
                    const deltaX = clientX - startX;
                    const deltaY = clientY - startY;
                    
                    // Use the larger delta to maintain aspect ratio
                    const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
                    const signX = deltaX >= 0 ? 1 : -1;
                    const signY = deltaY >= 0 ? 1 : -1;
                    
                    const newWidth = startWidth + delta * signX;
                    const newHeight = startHeight + delta * signY;
                    
                    // Calculate which dimension to use based on aspect ratio
                    let finalWidth, finalHeight;
                    if (aspectRatio > 1) {
                        // Canvas is wider - use width as primary
                        finalWidth = Math.max(200, newWidth);
                        finalHeight = finalWidth / aspectRatio;
                    } else {
                        // Canvas is taller - use height as primary
                        finalHeight = Math.max(150, newHeight);
                        finalWidth = finalHeight * aspectRatio;
                    }
                    
                    element.style.width = finalWidth + 'px';
                    element.style.height = finalHeight + 'px';
                } else {
                    // Fallback to normal resize
            const newWidth = startWidth + clientX - startX;
            const newHeight = startHeight + clientY - startY;
            element.style.width = Math.max(200, newWidth) + 'px';
            element.style.height = Math.max(150, newHeight) + 'px';
                }
            } else {
                // Normal resize for other panels
                const newWidth = startWidth + clientX - startX;
                const newHeight = startHeight + clientY - startY;
                element.style.width = Math.max(200, newWidth) + 'px';
                element.style.height = Math.max(150, newHeight) + 'px';
            }
        };
        
        const stopResize = () => {
            if (!isResizing) return;
            
            isResizing = false;
            element.style.cursor = 'default';
            document.body.style.cursor = 'default';
            
            // Update navigation canvas if this is the nav panel
            if (isNavPanel) {
                setTimeout(() => {
                    this.setupNavigationCanvas();
                }, 50);
            }
            
            // Remove event listeners
            if (mouseMoveHandler) document.removeEventListener('mousemove', mouseMoveHandler);
            if (mouseUpHandler) document.removeEventListener('mouseup', mouseUpHandler);
            if (touchMoveHandler) document.removeEventListener('touchmove', touchMoveHandler);
            if (touchEndHandler) document.removeEventListener('touchend', touchEndHandler);
        };
        
        // Mouse events
        resizeHandle.addEventListener('mousedown', (e) => {
            startResize(e.clientX, e.clientY);
            e.preventDefault();
            
            // Create bound event handlers
            mouseMoveHandler = (e) => doResize(e.clientX, e.clientY);
            mouseUpHandler = stopResize;
            
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
        
        // Touch events
        resizeHandle.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                startResize(touch.clientX, touch.clientY);
                e.preventDefault();
                
                // Create bound event handlers
                touchMoveHandler = (e) => {
                    if (isResizing && e.touches.length === 1) {
                        const touch = e.touches[0];
                        doResize(touch.clientX, touch.clientY);
                        e.preventDefault();
                    }
                };
                touchEndHandler = stopResize;
                
                document.addEventListener('touchmove', touchMoveHandler, { passive: false });
                document.addEventListener('touchend', touchEndHandler);
            }
        }, { passive: false });
    }
    
    makeNavigationPanelDraggable(panel) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        const startDrag = (clientX, clientY) => {
            isDragging = true;
            startX = clientX;
            startY = clientY;
            startLeft = parseInt(window.getComputedStyle(panel).left);
            startTop = parseInt(window.getComputedStyle(panel).top);
            
            panel.style.cursor = 'grabbing';
        };
        
        const onMouseDown = (e) => {
            // Don't start dragging if clicking on resize handle or canvas
            if (e.target.closest('.nav-resize-handle') || e.target.closest('canvas')) {
                return;
            }
            
            startDrag(e.clientX, e.clientY);
            e.preventDefault();
        };
        
        const onTouchStart = (e) => {
            // Don't start dragging if clicking on resize handle or canvas
            if (e.target.closest('.nav-resize-handle') || e.target.closest('canvas') || e.touches.length !== 1) {
                return;
            }
            
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
            e.preventDefault();
        };
        
        const updatePosition = (clientX, clientY) => {
            if (!isDragging) return;
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;
            panel.style.left = `${startLeft + deltaX}px`;
            panel.style.top = `${startTop + deltaY}px`;
        };
        
        const stopDrag = () => {
            if (isDragging) {
                isDragging = false;
                panel.style.cursor = 'default';
            }
        };
        
        // Mouse events
        panel.addEventListener('mousedown', onMouseDown);
        
        // Touch events
        panel.addEventListener('touchstart', onTouchStart, { passive: false });
        
        document.addEventListener('mousemove', (e) => updatePosition(e.clientX, e.clientY));
        document.addEventListener('mouseup', stopDrag);
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches.length === 1) {
                const touch = e.touches[0];
                updatePosition(touch.clientX, touch.clientY);
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchend', stopDrag);
    }
    
    toggleSelectionArea() {
        console.log('Selection area toggled');
        // TODO: Implement selection area functionality
    }
    
    toggleStabilizer() {
        console.log('Stabilizer toggled');
        // TODO: Implement stabilizer functionality
    }
    
    toggleRuler() {
        console.log('Ruler toggled');
        // TODO: Implement ruler functionality
    }
    
    toggleSavedRefImages() {
        this.toggleReferenceImagesPanel();
    }
    
    // ===== ACTION HANDLERS (FULLY FUNCTIONAL) =====
    handleUndo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            const historyEntry = this.history[this.historyStep];
            
            if (historyEntry) {
                if (historyEntry.type === 'canvas') {
                    // Restore canvas drawing state
                    const layerCtx = this.getActiveLayerContext();
                    if (layerCtx && historyEntry.imageData) {
                        // Clear the canvas first
                        const canvasWidth = this.canvasWidth || this.drawingAreaSize;
                        const canvasHeight = this.canvasHeight || this.drawingAreaSize;
                        layerCtx.clearRect(0, 0, canvasWidth, canvasHeight);
                        
                        // Restore the previous state
                        layerCtx.putImageData(historyEntry.imageData, 0, 0);
                        
                        // Redraw the canvas with current transformations
                        this.applyTransformations();
                    }
                } else if (historyEntry.type === 'layers') {
                    // Restore layer structure state
                    this.restoreLayerState(historyEntry.layers);
                }
                
                // Update button states
                this.updateUndoRedoButtons();
            }
        }
    }
    
    handleRedo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            const historyEntry = this.history[this.historyStep];
            
            if (historyEntry) {
                if (historyEntry.type === 'canvas') {
                    // Restore canvas drawing state
                    const layerCtx = this.getActiveLayerContext();
                    if (layerCtx && historyEntry.imageData) {
                        // Clear the canvas first
                        const canvasWidth = this.canvasWidth || this.drawingAreaSize;
                        const canvasHeight = this.canvasHeight || this.drawingAreaSize;
                        layerCtx.clearRect(0, 0, canvasWidth, canvasHeight);
                        
                        // Restore the next state
                        layerCtx.putImageData(historyEntry.imageData, 0, 0);
                        
                        // Redraw the canvas with current transformations
                        this.applyTransformations();
                    }
                } else if (historyEntry.type === 'layers') {
                    // Restore layer structure state
                    this.restoreLayerState(historyEntry.layers);
                }
                
                // Update button states
                this.updateUndoRedoButtons();
            }
        }
    }
    
    restoreLayerState(layersSnapshot) {
        // Restore layer structure from snapshot
        // First, save canvas content from current layers
        const canvasWidth = this.canvasWidth || this.drawingAreaSize;
        const canvasHeight = this.canvasHeight || this.drawingAreaSize;
        
        // Create a map of old layer IDs to their canvas content
        const layerCanvasMap = new Map();
        this.layers.forEach(layer => {
            if (layer.canvas && layer.ctx) {
                const imageData = layer.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
                layerCanvasMap.set(layer.id, imageData);
            }
        });
        
        // Restore layers structure
        this.layers = layersSnapshot.map(layerData => {
            const restoredLayer = { ...layerData };
            
            // Restore canvas if it existed before
            if (layerCanvasMap.has(restoredLayer.id)) {
                // Recreate canvas
                if (!restoredLayer.canvas) {
                    restoredLayer.canvas = document.createElement('canvas');
                    restoredLayer.canvas.width = canvasWidth;
                    restoredLayer.canvas.height = canvasHeight;
                    restoredLayer.ctx = restoredLayer.canvas.getContext('2d');
                }
                // Restore canvas content
                restoredLayer.ctx.putImageData(layerCanvasMap.get(restoredLayer.id), 0, 0);
            } else {
                // New layer or layer that didn't exist - create empty canvas
                restoredLayer.canvas = document.createElement('canvas');
                restoredLayer.canvas.width = canvasWidth;
                restoredLayer.canvas.height = canvasHeight;
                restoredLayer.ctx = restoredLayer.canvas.getContext('2d');
                restoredLayer.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            }
            
            return restoredLayer;
        });
        
        // Update active layer if it still exists
        if (this.activeLayerId && !this.layers.find(l => l.id === this.activeLayerId)) {
            // Active layer was deleted, select the first available layer
            const firstLayer = this.layers.find(l => l.type === 'layer');
            if (firstLayer) {
                this.activeLayerId = firstLayer.id;
                this.selectLayer(firstLayer.id);
            }
        }
        
        // Update selected layers
        this.selectedLayerIds = new Set(
            Array.from(this.selectedLayerIds).filter(id => 
                this.layers.find(l => l.id === id)
            )
        );
        
        // Renumber layers after restoration
        this.renumberLayers();
        
        // Update UI
        this.updateLayersPanel();
        this.applyTransformations();
        this.updateNavigationCanvas();
    }
    
    updateUndoRedoButtons() {
        // Update bottom toolbar buttons
        const btnUndo = document.getElementById('btn-undo');
        const btnRedo = document.getElementById('btn-redo');
        
        if (btnUndo) {
            btnUndo.disabled = this.historyStep <= 0;
            btnUndo.style.opacity = this.historyStep <= 0 ? '0.5' : '1';
        }
        
        if (btnRedo) {
            btnRedo.disabled = this.historyStep >= this.history.length - 1;
            btnRedo.style.opacity = this.historyStep >= this.history.length - 1 ? '0.5' : '1';
        }
    }
    
    handleExport() {
        // Create a temporary canvas to export the drawing area
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set size to match drawing area
        tempCanvas.width = this.drawingAreaSize;
        tempCanvas.height = this.drawingAreaSize;
        
        // Fill with white background
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, this.drawingAreaSize, this.drawingAreaSize);
        
        // Create a new canvas to capture the current drawing state
        const captureCanvas = document.createElement('canvas');
        const captureCtx = captureCanvas.getContext('2d');
        captureCanvas.width = this.canvas.width;
        captureCanvas.height = this.canvas.height;
        
        // Copy the current canvas state
        captureCtx.drawImage(this.canvas, 0, 0);
        
        // Extract the drawing area from the captured canvas
        const halfSize = this.drawingAreaSize / 2;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Calculate the source rectangle in the captured canvas
        const sourceX = centerX + this.panX - halfSize;
        const sourceY = centerY + this.panY - halfSize;
        
        // Draw the drawing area to the export canvas
        tempCtx.drawImage(
            captureCanvas,
            sourceX, sourceY, this.drawingAreaSize, this.drawingAreaSize,
            0, 0, this.drawingAreaSize, this.drawingAreaSize
        );
        
        // Convert to blob and download
        tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ibis-paint-drawing-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
        
        // noop
    }
    
    handlePlay() {
        // noop
    }
    
    // ===== UI UPDATES =====
    updateUI() {
        // Update color picker values
        const colorPicker = document.getElementById('color-picker');
        const hexInput = document.getElementById('hex-input');
        
        if (colorPicker) colorPicker.value = this.currentColor;
        if (hexInput) hexInput.value = this.currentColor;
        
        // Update brush controls
        const brushSizeSlider = document.getElementById('brush-size-slider');
        const brushOpacitySlider = document.getElementById('brush-opacity-slider');
        const stabilizerSlider = document.getElementById('stabilizer-slider');
        
        if (brushSizeSlider) brushSizeSlider.value = this.brushSize;
        if (brushOpacitySlider) brushOpacitySlider.value = this.brushOpacity;
        if (stabilizerSlider) stabilizerSlider.value = this.stabilizer;
        
        // Update vertical brush control sliders
        const brushSizeVerticalSlider = document.getElementById('brush-size-vertical-slider');
        const brushOpacityVerticalSlider = document.getElementById('brush-opacity-vertical-slider');
        const brushSizeValue = document.getElementById('brush-size-value');
        const brushOpacityValue = document.getElementById('brush-opacity-value');
        
        if (brushSizeVerticalSlider) brushSizeVerticalSlider.value = this.brushSize;
        if (brushOpacityVerticalSlider) brushOpacityVerticalSlider.value = this.brushOpacity;
        if (brushSizeValue) brushSizeValue.textContent = this.brushSize;
        if (brushOpacityValue) brushOpacityValue.textContent = this.brushOpacity;
        
        // Update bottom color swatch
        const btnColor = document.getElementById('btn-color');
        if (btnColor) {
            btnColor.style.setProperty('--current-color', this.currentColor);
        }
    }
    
    // ===== PUBLIC API FOR FUTURE POPUP PANELS =====
    getCurrentTool() {
        return this.currentTool;
    }
    
    setCurrentTool(tool) {
        // Check if tool is functional
        const nonFunctionalTools = ['bucket', 'lasso', 'magic', 'fx', 'smudge', 'blur', 'special', 'vector', 'text', 'eyedropper'];
        if (nonFunctionalTools.includes(tool)) {
            const toolName = tool.charAt(0).toUpperCase() + tool.slice(1);
            alert(`${toolName} tool is not functional yet.`);
            return;
        }
        
        this.currentTool = tool;
        this.updateToolSelectionByTool();
        this.updateBrushSlidersVisibility();
        this.updateCanvasCursor();
        
        // Open canvas settings if canvas tool is selected
        if (tool === 'canvas') {
            this.openCanvasSettings();
        }
    }
    
    updateCanvasCursor() {
        if (this.canvas) {
            if (this.currentTool === 'hand') {
                this.canvas.style.cursor = 'grab';
            } else if (this.isRotating) {
                this.canvas.style.cursor = 'grab';
            } else {
                this.canvas.style.cursor = 'crosshair';
            }
        }
    }

    updateToolSelection(selectedTile) {
        // Remove active class from all tool tiles
        const allTiles = document.querySelectorAll('.tool-tile');
        allTiles.forEach(tile => tile.classList.remove('is-active'));
        
        // Add active class to selected tile
        if (selectedTile) {
            selectedTile.classList.add('is-active');
        }
    }
    
    updateToolSelectionByTool() {
        // Update tool selection based on currentTool
        const allTiles = document.querySelectorAll('.tool-tile');
        allTiles.forEach(tile => {
            tile.classList.remove('is-active');
            const tool = tile.getAttribute('data-tool');
            if (tool === this.currentTool) {
                tile.classList.add('is-active');
            }
        });
        this.updateBrushSlidersVisibility();
        this.updateToolButtonIcon();
    }
    
    updateToolButtonIcon() {
        // Update the tool button icon to match the current tool
        const btnBrush = document.getElementById('btn-brush');
        if (btnBrush) {
            // Remove all icon classes
            const iconClasses = ['icon-brush', 'icon-eraser', 'icon-smudge', 'icon-blur', 'icon-wand', 
                                'icon-lasso', 'icon-fx', 'icon-move', 'icon-star', 'icon-bucket', 
                                'icon-vector', 'icon-text', 'icon-frame', 'icon-eyedropper', 'icon-canvas'];
            iconClasses.forEach(cls => btnBrush.classList.remove(cls));
            
            // Map tool names to icon classes (some tools have different icon class names)
            const toolIconMap = {
                'brush': 'icon-brush',
                'eraser': 'icon-eraser',
                'smudge': 'icon-smudge',
                'blur': 'icon-blur',
                'magic': 'icon-wand',
                'lasso': 'icon-lasso',
                'fx': 'icon-fx',
                'transform': 'icon-move',
                'special': 'icon-star',
                'bucket': 'icon-bucket',
                'vector': 'icon-vector',
                'text': 'icon-text',
                'frame': 'icon-frame',
                'eyedropper': 'icon-eyedropper',
                'canvas': 'icon-canvas',
                'hand': 'icon-move' // Use move icon for hand tool
            };
            
            // Add the current tool's icon class
            const toolIconClass = toolIconMap[this.currentTool] || `icon-${this.currentTool}`;
            if (toolIconClass) {
                btnBrush.classList.add(toolIconClass);
            }
            
            // Update title
            const toolNames = {
                'brush': 'Brush',
                'eraser': 'Eraser',
                'smudge': 'Smudge',
                'blur': 'Blur',
                'magic': 'Magic Wand',
                'lasso': 'Lasso',
                'fx': 'Filter',
                'transform': 'Transform',
                'special': 'Special',
                'bucket': 'Bucket',
                'vector': 'Vector',
                'text': 'Text',
                'frame': 'Frame',
                'eyedropper': 'Eyedropper',
                'canvas': 'Canvas',
                'hand': 'Hand Tool'
            };
            btnBrush.title = toolNames[this.currentTool] || 'Tool Settings';
        }
    }
    
    openToolSettings() {
        // Open the appropriate settings panel based on current tool
        if (this.currentTool === 'brush') {
            // Always open the brush panel (brush menu)
            // User can double-click brushes in the menu to open their settings
            this.toggleBrushPanel();
        } else if (this.currentTool === 'canvas') {
            // Toggle canvas settings (don't open if already open from tool selection)
            const popup = document.getElementById('canvas-settings-popup');
            if (popup && popup.classList.contains('is-visible')) {
                this.closeCanvasSettings();
            } else {
                this.openCanvasSettings();
            }
        } else if (this.currentTool === 'bucket') {
            this.openBucketSettings();
        } else if (this.currentTool === 'vector') {
            this.openVectorSettings();
        } else if (this.currentTool === 'hatch') {
            this.openHatchSettings();
        } else if (this.currentTool === 'smudge' || this.currentTool === 'blur') {
            this.openEffectSettings();
        } else {
            // For other tools, show a placeholder or create tool-specific panels
            this.showToolSettingsPlaceholder();
        }
    }
    
    openCanvasSettings() {
        const popup = document.getElementById('canvas-settings-popup');
        const widthInput = document.getElementById('canvas-width');
        const heightInput = document.getElementById('canvas-height');
        
        if (popup && widthInput && heightInput) {
            // Set current canvas size in inputs
            widthInput.value = this.canvasWidth || this.drawingAreaSize;
            heightInput.value = this.canvasHeight || this.drawingAreaSize;
            popup.classList.add('is-visible');
            
            // Hide all UI elements
            this.hideUIForCanvasSettings();
            
            // Show initial preview
            this.updateCanvasPreview();
        }
    }
    
    closeCanvasSettings() {
        const popup = document.getElementById('canvas-settings-popup');
        if (popup) {
            popup.classList.remove('is-visible');
            
            // Show all UI elements
            this.showUIForCanvasSettings();
            
            // Hide preview
            this.hideCanvasPreview();
        }
    }
    
    hideUIForCanvasSettings() {
        const rightToolbar = document.querySelector('.right-float-toolbar');
        const topControls = document.querySelector('.top-right-controls');
        const bottomBar = document.querySelector('.bottom-toolbar');
        const brushSliders = document.getElementById('brush-control-sliders');
        const hideBtn = document.getElementById('btn-hidebar');
        
        // Store original display values before hiding
        if (rightToolbar) {
            const computedStyle = window.getComputedStyle(rightToolbar);
            this._rightToolbarWasVisible = computedStyle.display !== 'none';
            rightToolbar.style.display = 'none';
        }
        if (topControls) {
            const computedStyle = window.getComputedStyle(topControls);
            this._topControlsWasVisible = computedStyle.display !== 'none';
            topControls.style.display = 'none';
        }
        if (bottomBar) {
            const computedStyle = window.getComputedStyle(bottomBar);
            this._bottomBarWasVisible = computedStyle.display !== 'none';
            bottomBar.style.display = 'none';
        }
        if (brushSliders) {
            this._brushSlidersWasVisible = brushSliders.classList.contains('is-visible');
            brushSliders.style.display = 'none';
        }
        if (hideBtn) {
            const computedStyle = window.getComputedStyle(hideBtn);
            this._hideBtnWasVisible = computedStyle.display !== 'none';
            hideBtn.style.display = 'none';
        }
    }
    
    showUIForCanvasSettings() {
        const rightToolbar = document.querySelector('.right-float-toolbar');
        const topControls = document.querySelector('.top-right-controls');
        const bottomBar = document.querySelector('.bottom-toolbar');
        const brushSliders = document.getElementById('brush-control-sliders');
        const hideBtn = document.getElementById('btn-hidebar');
        
        if (rightToolbar && this._rightToolbarWasVisible) {
            rightToolbar.style.display = 'flex';
        }
        if (topControls && this._topControlsWasVisible) {
            topControls.style.display = 'flex';
        }
        if (bottomBar && this._bottomBarWasVisible) {
            bottomBar.style.display = 'grid';
        }
        if (brushSliders && this._brushSlidersWasVisible) {
            brushSliders.style.display = 'flex';
        }
        if (hideBtn && this._hideBtnWasVisible) {
            hideBtn.style.display = 'block';
        }
    }
    
    updateCanvasPreview() {
        const widthInput = document.getElementById('canvas-width');
        const heightInput = document.getElementById('canvas-height');
        
        if (!widthInput || !heightInput) return;
        
        const newWidth = parseInt(widthInput.value) || this.canvasWidth || this.drawingAreaSize;
        const newHeight = parseInt(heightInput.value) || this.canvasHeight || this.drawingAreaSize;
        const currentWidth = this.canvasWidth || this.drawingAreaSize;
        const currentHeight = this.canvasHeight || this.drawingAreaSize;
        
        // Draw preview on canvas overlay
        this.drawCanvasPreview(newWidth, newHeight, currentWidth, currentHeight);
    }
    
    drawCanvasPreview(newWidth, newHeight, currentWidth, currentHeight) {
        // This will be drawn on the main canvas as an overlay
        // We'll use a separate canvas for the preview overlay
        let previewCanvas = document.getElementById('canvas-preview-canvas');
        if (!previewCanvas) {
            previewCanvas = document.createElement('canvas');
            previewCanvas.id = 'canvas-preview-canvas';
            previewCanvas.className = 'canvas-preview-canvas';
            const canvasContainer = document.getElementById('canvas-container');
            if (canvasContainer) {
                canvasContainer.appendChild(previewCanvas);
            }
        }
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        previewCanvas.width = rect.width;
        previewCanvas.height = rect.height;
        previewCanvas.style.width = rect.width + 'px';
        previewCanvas.style.height = rect.height + 'px';
        previewCanvas.style.position = 'absolute';
        previewCanvas.style.top = '0';
        previewCanvas.style.left = '0';
        previewCanvas.style.pointerEvents = 'none';
        previewCanvas.style.zIndex = '10001';
        previewCanvas.style.display = 'block';
        
        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        
        // Apply same transformations as main canvas
        ctx.save();
        ctx.translate(previewCanvas.width / 2, previewCanvas.height / 2);
        ctx.translate(this.panX, this.panY);
        ctx.rotate(this.rotation);
        ctx.scale(this.zoom, this.zoom);
        
        // Draw new canvas size outline
        const newHalfWidth = newWidth / 2;
        const newHalfHeight = newHeight / 2;
        const currentHalfWidth = currentWidth / 2;
        const currentHalfHeight = currentHeight / 2;
        
        // Check if there's any change
        const hasChange = (newWidth !== currentWidth || newHeight !== currentHeight);
        
        // If there's a change, draw the new canvas size outline in red. Otherwise, draw in white
        if (hasChange) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)';
            ctx.lineWidth = 3 / this.zoom;
            ctx.setLineDash([5 / this.zoom, 5 / this.zoom]);
            
            // Draw only the new canvas size outline in red (full rectangle)
            ctx.beginPath();
            ctx.rect(-newHalfWidth, -newHalfHeight, newWidth, newHeight);
            ctx.stroke();
        } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2 / this.zoom;
            ctx.strokeRect(-newHalfWidth, -newHalfHeight, newWidth, newHeight);
            ctx.restore();
            return; // No change, so no red outline needed
        }
        
        // Both rectangles are already drawn in red above
        // No need for additional edge/corner drawing
        
        ctx.setLineDash([]);
        
        ctx.restore();
    }
    
    hideCanvasPreview() {
        // Hide the preview canvas
        const previewCanvas = document.getElementById('canvas-preview-canvas');
        if (previewCanvas) {
            previewCanvas.style.display = 'none';
        }
        // Redraw the canvas without preview
        this.applyTransformations();
    }
    
    resizeCanvas(newWidth, newHeight) {
        // Update drawing area size (use max for square display, but store both)
        this.drawingAreaSize = Math.max(newWidth, newHeight);
        const oldWidth = this.canvasWidth;
        const oldHeight = this.canvasHeight;
        this.canvasWidth = newWidth;
        this.canvasHeight = newHeight;
        
        // Resize all layer canvases - keep content centered
        this.layers.forEach(layer => {
            if (layer.type === 'layer' && layer.canvas) {
                // Create a temporary canvas to preserve existing content
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = oldWidth;
                tempCanvas.height = oldHeight;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(layer.canvas, 0, 0);
                
                // Resize the layer canvas
                layer.canvas.width = newWidth;
                layer.canvas.height = newHeight;
                
                // Clear the new canvas
                layer.ctx.clearRect(0, 0, newWidth, newHeight);
                
                // Calculate offset to center the old content in the new canvas
                // When increasing: add space equally around (positive offset)
                // When decreasing: crop equally from all sides (negative offset, but we'll crop the source)
                const offsetX = (newWidth - oldWidth) / 2;
                const offsetY = (newHeight - oldHeight) / 2;
                
                if (newWidth >= oldWidth && newHeight >= oldHeight) {
                    // Canvas is increasing - center the old content
                    layer.ctx.drawImage(tempCanvas, offsetX, offsetY);
                } else {
                    // Canvas is decreasing - crop from the center
                    // Calculate source rectangle to crop from center
                    const sourceX = Math.max(0, -offsetX);
                    const sourceY = Math.max(0, -offsetY);
                    const sourceWidth = Math.min(oldWidth, newWidth);
                    const sourceHeight = Math.min(oldHeight, newHeight);
                    
                    // Draw the cropped portion at (0, 0) in the new canvas
                    layer.ctx.drawImage(
                        tempCanvas,
                        sourceX, sourceY, sourceWidth, sourceHeight,
                        0, 0, sourceWidth, sourceHeight
                    );
                }
            }
        });
        
        // Reinitialize any new layers that might be created later
        this.initializeLayerCanvases();
        
        // Reset brush engine to use new canvas dimensions
        this.brushEngine = null;
        
        
        // Fit canvas to viewport so it's fully visible with void space
        this.fitCanvasToViewport();
        
        // Update navigation canvas if visible (recalculate size for new aspect ratio)
        if (document.getElementById('navigation-panel')?.classList.contains('show')) {
            this.setupNavigationCanvas();
        }
        
        // Update the display
        this.applyTransformations();
        this.renderLayers();
        
        // Save state to history
        this.saveCanvasState();
    }
    
    openBucketSettings() {
        // Create or show bucket settings panel
        let panel = document.getElementById('bucket-settings-panel');
        if (!panel) {
            panel = this.createBucketSettingsPanel();
        }
        panel.classList.add('is-visible');
    }
    
    openVectorSettings() {
        // Create or show vector field settings panel
        let panel = document.getElementById('vector-settings-panel');
        if (!panel) {
            panel = this.createVectorSettingsPanel();
        }
        panel.classList.add('is-visible');
    }
    
    openHatchSettings() {
        // Create or show hatch settings panel
        let panel = document.getElementById('hatch-settings-panel');
        if (!panel) {
            panel = this.createHatchSettingsPanel();
        }
        panel.classList.add('is-visible');
    }
    
    openEffectSettings() {
        // Create or show effect settings panel (for smudge/blur)
        let panel = document.getElementById('effect-settings-panel');
        if (!panel) {
            panel = this.createEffectSettingsPanel();
        }
        panel.classList.add('is-visible');
    }
    
    // Create tool settings panels
    createBucketSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'bucket-settings-panel';
        panel.className = 'tool-settings-panel';
        panel.innerHTML = `
            <div class="tool-settings-header">
                <span class="tool-settings-title">Bucket Fill Settings</span>
                <button class="tool-settings-close">×</button>
            </div>
            <div class="tool-settings-content">
                <div class="tool-setting-group">
                    <label>Opacity:</label>
                    <input type="range" id="bucket-opacity" min="0" max="100" value="80">
                    <span id="bucket-opacity-value">80</span>
                </div>
                <div class="tool-setting-group">
                    <label>Bleed:</label>
                    <input type="range" id="bucket-bleed" min="0" max="60" value="7" step="1">
                    <span id="bucket-bleed-value">7</span>
                </div>
                <div class="tool-setting-group">
                    <label>Texture:</label>
                    <input type="range" id="bucket-texture" min="0" max="100" value="40" step="1">
                    <span id="bucket-texture-value">40</span>
                </div>
                <div class="tool-setting-group">
                    <label>Border:</label>
                    <input type="range" id="bucket-border" min="0" max="100" value="40" step="1">
                    <span id="bucket-border-value">40</span>
                </div>
                <div class="tool-setting-group">
                    <label>Direction:</label>
                    <select id="bucket-direction">
                        <option value="out">Out</option>
                        <option value="in">In</option>
                    </select>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        this.setupBucketSettingsEvents(panel);
        return panel;
    }
    
    createVectorSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'vector-settings-panel';
        panel.className = 'tool-settings-panel';
        const fields = ['curved', 'truncated', 'zigzag', 'waves', 'seabed'];
        panel.innerHTML = `
            <div class="tool-settings-header">
                <span class="tool-settings-title">Vector Field Settings</span>
                <button class="tool-settings-close">×</button>
            </div>
            <div class="tool-settings-content">
                <div class="tool-setting-group">
                    <label>Field Type:</label>
                    <select id="vector-field-type">
                        ${fields.map(f => `<option value="${f}">${f.charAt(0).toUpperCase() + f.slice(1)}</option>`).join('')}
                    </select>
                </div>
                <div class="tool-setting-group">
                    <label>Strength:</label>
                    <input type="range" id="vector-strength" min="0" max="200" value="100" step="1">
                    <span id="vector-strength-value">100</span>%
                </div>
                <div class="tool-setting-group">
                    <button id="vector-toggle" class="tool-toggle-btn">Enable Vector Field</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        this.setupVectorSettingsEvents(panel);
        return panel;
    }
    
    createHatchSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'hatch-settings-panel';
        panel.className = 'tool-settings-panel';
        panel.innerHTML = `
            <div class="tool-settings-header">
                <span class="tool-settings-title">Hatch Settings</span>
                <button class="tool-settings-close">×</button>
            </div>
            <div class="tool-settings-content">
                <div class="tool-setting-group">
                    <label>Distance:</label>
                    <input type="range" id="hatch-distance" min="1" max="20" value="5" step="1">
                    <span id="hatch-distance-value">5</span>
                </div>
                <div class="tool-setting-group">
                    <label>Angle:</label>
                    <input type="range" id="hatch-angle" min="0" max="180" value="45" step="1">
                    <span id="hatch-angle-value">45</span>°
                </div>
                <div class="tool-setting-group">
                    <label>
                        <input type="checkbox" id="hatch-random"> Random
                    </label>
                </div>
                <div class="tool-setting-group">
                    <label>
                        <input type="checkbox" id="hatch-continuous"> Continuous
                    </label>
                </div>
                <div class="tool-setting-group">
                    <label>
                        <input type="checkbox" id="hatch-gradient"> Gradient
                    </label>
                </div>
                <div class="tool-setting-group">
                    <button id="hatch-toggle" class="tool-toggle-btn">Enable Hatch</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        this.setupHatchSettingsEvents(panel);
        return panel;
    }
    
    createEffectSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'effect-settings-panel';
        panel.className = 'tool-settings-panel';
        panel.innerHTML = `
            <div class="tool-settings-header">
                <span class="tool-settings-title">${this.currentTool === 'smudge' ? 'Smudge' : 'Blur'} Settings</span>
                <button class="tool-settings-close">×</button>
            </div>
            <div class="tool-settings-content">
                <div class="tool-setting-group">
                    <label>Intensity:</label>
                    <input type="range" id="effect-intensity" min="0" max="100" value="50" step="1">
                    <span id="effect-intensity-value">50</span>
                </div>
                <div class="tool-setting-group">
                    <label>Size:</label>
                    <input type="range" id="effect-size" min="1" max="100" value="20" step="1">
                    <span id="effect-size-value">20</span>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        this.setupEffectSettingsEvents(panel);
        return panel;
    }
    
    setupBucketSettingsEvents(panel) {
        const closeBtn = panel.querySelector('.tool-settings-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => panel.classList.remove('is-visible'));
        }
        
        // Setup sliders
        const opacitySlider = document.getElementById('bucket-opacity');
        const bleedSlider = document.getElementById('bucket-bleed');
        const textureSlider = document.getElementById('bucket-texture');
        const borderSlider = document.getElementById('bucket-border');
        
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('bucket-opacity-value').textContent = value;
            });
        }
        
        if (bleedSlider) {
            bleedSlider.addEventListener('input', (e) => {
                const value = e.target.value / 100;
                document.getElementById('bucket-bleed-value').textContent = e.target.value;
            });
        }
        
        if (textureSlider) {
            textureSlider.addEventListener('input', (e) => {
                const value = e.target.value / 100;
                document.getElementById('bucket-texture-value').textContent = e.target.value;
            });
        }
        
        if (borderSlider) {
            borderSlider.addEventListener('input', (e) => {
                const value = e.target.value / 100;
                document.getElementById('bucket-border-value').textContent = e.target.value;
            });
        }
    }
    
    setupVectorSettingsEvents(panel) {
        const closeBtn = panel.querySelector('.tool-settings-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => panel.classList.remove('is-visible'));
        }
        
        const toggleBtn = document.getElementById('vector-toggle');
        const typeSelect = document.getElementById('vector-field-type');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
            });
        }
    }
    
    setupHatchSettingsEvents(panel) {
        const closeBtn = panel.querySelector('.tool-settings-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => panel.classList.remove('is-visible'));
        }
        
        const toggleBtn = document.getElementById('hatch-toggle');
        const distanceSlider = document.getElementById('hatch-distance');
        const angleSlider = document.getElementById('hatch-angle');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
            });
        }
    }
    
    setupEffectSettingsEvents(panel) {
        const closeBtn = panel.querySelector('.tool-settings-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => panel.classList.remove('is-visible'));
        }
    }
    
    showToolSettingsPlaceholder() {
        // Placeholder for tool settings - can be expanded later
        const toolNames = {
            'eraser': 'Eraser',
            'smudge': 'Smudge',
            'blur': 'Blur',
            'magic': 'Magic Wand',
            'lasso': 'Lasso',
            'fx': 'Filter',
            'transform': 'Transform',
            'special': 'Special',
            'bucket': 'Bucket',
            'vector': 'Vector',
            'text': 'Text',
            'frame': 'Frame',
            'eyedropper': 'Eyedropper',
            'canvas': 'Canvas'
        };
        const toolName = toolNames[this.currentTool] || this.currentTool;
        // For now, just show an alert - can be replaced with actual settings panels later
        console.log(`${toolName} settings panel - to be implemented`);
    }
    
    updateBrushSlidersVisibility() {
        const brushSliders = document.getElementById('brush-control-sliders');
        if (brushSliders) {
            if (this.currentTool === 'brush') {
                brushSliders.classList.add('is-visible');
            } else {
                brushSliders.classList.remove('is-visible');
            }
        }
    }
    
    clearCanvas() {
        // Clear all layer canvases
        this.layers.forEach(layer => {
            if (layer.type === 'layer' && layer.ctx) {
                layer.ctx.clearRect(0, 0, this.drawingAreaSize, this.drawingAreaSize);
            }
        });
        
        // Update the display
        this.applyTransformations();
        this.renderLayers();
        
        // Save state to history
        this.saveCanvasState();
    }
    
    getBrushSize() {
        return this.brushSize;
    }
    
    setBrushSize(size) {
        this.brushSize = size;
        const slider = document.getElementById('brush-size-slider');
        if (slider) slider.value = size;
        // noop
    }
    
    getBrushOpacity() {
        return this.brushOpacity;
    }
    
    setBrushOpacity(opacity) {
        this.brushOpacity = opacity;
        const slider = document.getElementById('brush-opacity-slider');
        if (slider) slider.value = opacity;
        // noop
    }
    
    getCurrentColor() {
        return this.currentColor;
    }
    
    setCurrentColor(color) {
        this.currentColor = color;
        const colorPicker = document.getElementById('color-picker');
        const hexInput = document.getElementById('hex-input');
        if (colorPicker) colorPicker.value = color;
        if (hexInput) hexInput.value = color;
        // noop
    }
    
    getLayers() {
        return this.layers;
    }
    
    getActiveLayer() {
        return this.layers.find(layer => layer.id === this.activeLayerId);
    }
    
    addNewLayer(name) {
        const newLayer = {
            id: `layer-${Date.now()}`,
            name: name || `Layer ${this.layers.length + 1}`,
            visible: true,
            opacity: 100,
            isActive: false
        };
        this.layers.push(newLayer);
        this.renderLayers();
        return newLayer;
    }
    
    deleteLayerById(layerId) {
        this.deleteLayer(layerId);
    }
    
    toggleLayerVisibilityById(layerId) {
        this.toggleLayerVisibility(layerId);
    }
    
    setActiveLayerById(layerId) {
        this.setActiveLayer(layerId);
    }
    
    // ===== ZOOM API FOR POPUP PANELS =====
    getZoom() {
        return this.zoom;
    }
    
    setZoomLevel(zoom) {
        this.setZoom(zoom);
    }
    
    resetZoomAndPan() {
        this.resetZoom();
    }
    
    getPan() {
        return { x: this.panX, y: this.panY };
    }
    
    setPan(x, y) {
        this.panX = x;
        this.panY = y;
        this.applyTransformations();
    }
    
    getRotation() {
        return this.rotation;
    }
    
    setRotation(rotation) {
        this.rotation = rotation;
        this.applyTransformations();
    }
    
    rotateCanvas(angle) {
        this.rotation += angle;
        this.applyTransformations();
    }

    // Prevent edits on hidden layer
    canEditActiveLayer() {
        const activeLayer = this.getActiveLayer();
        if (!activeLayer) return false;
        if (activeLayer.visible === false) {
            alert('Layer is hidden. Unhide the layer to edit.');
            return false;
        }
        return true;
    }

    // ===== EXPORT =====
    // Export moved to IbisExport module; keep legacy wrapper if referenced elsewhere
    exportVisibleLayersAsPNG(filenameOverride) {
        if (window.IbisExport && typeof window.IbisExport.exportVisibleLayersAsPNG === 'function') {
            window.IbisExport.exportVisibleLayersAsPNG(this, filenameOverride);
            return;
        }
        // Fallback
        if (typeof this.handleExport === 'function') this.handleExport();
    }
}

// ===== FUTURE FUNCTIONALITY MODULES =====
class DrawingEngine {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }
    
    // Drawing methods to be implemented
    drawBrush() {}
    drawEraser() {}
    drawShapes() {}
    handleTouch() {}
}

class ToolManager {
    constructor() {
        this.tools = {};
    }
    
    registerTool(toolId, toolClass) {
        this.tools[toolId] = toolClass;
    }
    
    getTool(toolId) {
        return this.tools[toolId];
    }
}

class HistoryManager {
    constructor() {
        this.history = [];
        this.currentStep = -1;
    }
    
    saveState() {
        this.saveCanvasState();
    }
    
    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            const imageData = this.history[this.historyStep];
            const layerCtx = this.getActiveLayerContext();
            if (layerCtx) {
                layerCtx.putImageData(imageData, 0, 0);
            }
            this.applyTransformations(); // Redraw with current transformations
            this.updateUndoRedoButtons();
            // noop
        }
    }
    
    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            const imageData = this.history[this.historyStep];
            const layerCtx = this.getActiveLayerContext();
            if (layerCtx) {
                layerCtx.putImageData(imageData, 0, 0);
            }
            this.applyTransformations(); // Redraw with current transformations
            this.updateUndoRedoButtons();
            // noop
        }
    }
}

// Global instance for popup panels to access
let workspaceInstance = null;

// Initialize the workspace when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are properly rendered
    setTimeout(() => {
        workspaceInstance = new IbisPaintWorkspace();
        
        // Make workspace globally accessible for popup panels
        window.workspace = workspaceInstance;
        
        // workspace ready
    }, 100);
});

// Global screenshot helper
if (typeof window !== 'undefined') {
    window.captureScreenshot = function() {
        try {
            if (window.workspace && window.IbisExport && typeof window.IbisExport.exportVisibleLayersAsPNG === 'function') {
                window.IbisExport.exportVisibleLayersAsPNG(window.workspace, 'screenshot.png');
                return;
            }
        } catch (e) {
            console.warn('Workspace export failed, falling back to raw canvas capture.', e);
        }
        // Fallback: capture first canvas on the page
        const canvas = document.querySelector('canvas');
        if (!canvas) return alert('No canvas found to capture.');
        const save = (href) => {
            const a = document.createElement('a');
            a.href = href;
            a.download = 'screenshot.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        if (canvas.toBlob) {
            canvas.toBlob((blob) => {
                if (!blob) return save(canvas.toDataURL('image/png'));
                const url = URL.createObjectURL(blob);
                save(url);
                URL.revokeObjectURL(url);
            }, 'image/png');
        } else {
            save(canvas.toDataURL('image/png'));
        }
    };
}

        // Export PNG option
const exportPngOption = document.getElementById('option-export-png');
if (exportPngOption) {
    exportPngOption.addEventListener('click', () => {
        console.log('[Export] Export PNG clicked');
                const ws = (typeof window !== 'undefined' && window.workspace) ? window.workspace : this;
                if (window.IbisExport && typeof window.IbisExport.exportVisibleLayersAsPNG === 'function') {
                    window.IbisExport.exportVisibleLayersAsPNG(ws);
                } else if (typeof this.handleExport === 'function') {
                    this.handleExport();
                }
        if (optionsMenu) optionsMenu.classList.remove('is-visible');
    });
}

// Global delegation fallback (in case menu is re-rendered or detached)
        document.addEventListener('click', (e) => {
    const target = e.target.closest('#option-export-png');
    if (target) {
        console.log('[Export] Export PNG via global delegation');
        try { alert('Exporting PNG...'); } catch(_) {}
                const ws = (typeof window !== 'undefined' && window.workspace) ? window.workspace : this;
                if (window.IbisExport && typeof window.IbisExport.exportVisibleLayersAsPNG === 'function') {
                    window.IbisExport.exportVisibleLayersAsPNG(ws);
                } else if (typeof this.handleExport === 'function') {
                    this.handleExport();
                }
    }
});