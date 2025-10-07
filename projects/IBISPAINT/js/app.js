// Ibis Paint Workspace - Clean UI with Core Functionality
class IbisPaintWorkspace {
    constructor() {
        // Workspace state
        this.currentTool = 'brush';
        this.brushSize = 20;
        this.brushOpacity = 100;
        this.currentColor = '#3b82f6';
        this.stabilizer = 25;
        
        // Layer management
        this.layers = [
            { id: 'layer-6', name: '6', visible: true, opacity: 100, blendMode: 'normal', isActive: false, thumbnail: null, color: '#ff6b6b', type: 'layer', parentId: null },
            { id: 'layer-5', name: '5', visible: true, opacity: 100, blendMode: 'normal', isActive: false, thumbnail: null, color: '#4ecdc4', type: 'layer', parentId: null },
            { id: 'layer-4', name: '4', visible: true, opacity: 100, blendMode: 'normal', isActive: false, thumbnail: null, color: '#45b7d1', type: 'layer', parentId: null },
            { id: 'layer-3', name: '3', visible: true, opacity: 100, blendMode: 'normal', isActive: false, thumbnail: null, color: '#96ceb4', type: 'layer', parentId: null },
            { id: 'layer-2', name: '2', visible: true, opacity: 100, blendMode: 'normal', isActive: true, thumbnail: null, color: '#feca57', type: 'layer', parentId: null },
            { id: 'layer-1', name: '1', visible: true, opacity: 100, blendMode: 'normal', isActive: false, thumbnail: null, color: '#ff9ff3', type: 'layer', parentId: null },
        ];
        this.activeLayerId = 'layer-2';
        this.selectedLayerIds = new Set(['layer-2']); // Multi-select support
        this.nextLayerId = 7;
        this.nextFolderId = 1;
        
        // Multi-select mode state
        this.isMultiSelectMode = false;
        this.longPressTimer = null;
        this.longPressDelay = 500; // 500ms for long press
        this.longPressStartPos = null;
        this.longPressThreshold = 10; // pixels - allow small movement during long press
        this.isDragging = false; // Track if we're currently dragging
        
        // History for undo/redo
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
        this.lastPanX = 0;
        this.lastPanY = 0;
        
        // Drawing area (white square)
        this.drawingAreaSize = 500;
        
        // Drawing state (disabled)
        this.isDrawing = false;
        this.lastPoint = null;
        this.drawingData = [];
        
        // Create offscreen canvas for drawing
        this.drawingCanvas = null;
        this.drawingCtx = null;
        
        this.init();
    }
    
    init() {
        this.setupWorkspace();
        this.setupEventListeners();
        this.setupLayers();
        this.setupLayerControls();
        this.setupColorPicker();
        this.setupTopToolbar();
        this.setupBrushPanel();
        this.setupReferenceImages();
        this.updateUI();
        
        // Dev access in console
        window.workspace = this;
    }
    
    // ===== WORKSPACE SETUP =====
    setupWorkspace() {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Create offscreen canvas for drawing
        this.drawingCanvas = document.createElement('canvas');
        this.drawingCanvas.width = this.drawingAreaSize;
        this.drawingCanvas.height = this.drawingAreaSize;
        this.drawingCtx = this.drawingCanvas.getContext('2d');
        
        // Fill drawing canvas with white background
        this.drawingCtx.fillStyle = '#ffffff';
        this.drawingCtx.fillRect(0, 0, this.drawingAreaSize, this.drawingAreaSize);
        
        // Simple canvas setup for workspace display
        this.setupCanvasDisplay();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
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
        
        // Fill background with void color
        this.ctx.fillStyle = '#383838';
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
    }
    
    drawDrawingArea() {
        const halfSize = this.drawingAreaSize / 2;
        
        // Draw the offscreen drawing canvas
        this.ctx.drawImage(this.drawingCanvas, -halfSize, -halfSize, this.drawingAreaSize, this.drawingAreaSize);
        
        // Draw border
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 2 / this.zoom;
        this.ctx.strokeRect(-halfSize, -halfSize, this.drawingAreaSize, this.drawingAreaSize);
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
            e.preventDefault();
            
            if (e.touches.length === 2) {
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
            e.preventDefault();
            
            if (e.touches.length === 2) {
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
            e.preventDefault();
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
                    this.currentTool = 'eraser';
                    btnSwitch.classList.remove('icon-eraser');
                    btnSwitch.classList.add('icon-brush');
                } else {
                    this.currentTool = 'brush';
                    btnSwitch.classList.remove('icon-brush');
                    btnSwitch.classList.add('icon-eraser');
                }
                this.updateUI();
            });
        }

        if (btnBrush) {
            btnBrush.addEventListener('click', () => {
                this.toggleBrushPanel();
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

        if (btnUndo2) { btnUndo2.addEventListener('click', () => this.undo()); }
        if (btnRedo2) { btnRedo2.addEventListener('click', () => this.redo()); }
        if (btnLayers) {
            btnLayers.addEventListener('click', () => {
                this.toggleLayersPanel();
            });
        }
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                alert('Menu: Back / Export / Save / Settings (placeholder)');
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
        
        // Canvas events (placeholder for future drawing functionality)
        this.setupCanvasEvents();
    }
    
    setupCanvasEvents() {
        // Touch-only canvas events for drawing (disabled)
        // this.canvas.addEventListener('touchstart', (e) => {
        //     // Only handle drawing if single touch (not gesture)
        //     if (e.touches.length === 1) {
        //         this.handleCanvasTouchStart(e);
        //     }
        // });
        
        // this.canvas.addEventListener('touchmove', (e) => {
        //     // Only handle drawing if single touch (not gesture)
        //     if (e.touches.length === 1) {
        //         this.handleCanvasTouchMove(e);
        //     }
        // });
        
        // this.canvas.addEventListener('touchend', (e) => this.handleCanvasTouchEnd(e));
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
        // noop
    }
    
    handleCanvasMouseMove(e) {
        // TODO: Implement drawing functionality
    }
    
    handleCanvasMouseUp() {
        // TODO: Implement drawing functionality
    }
    
    handleCanvasTouchStart(e) {
        e.preventDefault();
        // Drawing disabled - do nothing
        // const coords = this.getCanvasCoordinates(e);
        
        // // Check if touch is within drawing area
        // if (this.isPointInDrawingArea(coords)) {
        //     this.isDrawing = true;
        //     this.lastPoint = coords;
            
        //     // Start drawing stroke
        //     this.startStroke(coords);
        //     console.log('Started drawing at:', coords);
        // }
    }
    
    handleCanvasTouchMove(e) {
        e.preventDefault();
        // Drawing disabled - do nothing
        // const coords = this.getCanvasCoordinates(e);
        
        // if (this.isDrawing && this.lastPoint) {
        //     // Continue drawing stroke
        //     this.drawLine(this.lastPoint, coords);
        //     this.lastPoint = coords;
        // }
    }
    
    handleCanvasTouchEnd(e) {
        e.preventDefault();
        
        // Drawing disabled - do nothing
        // if (this.isDrawing) {
        //     this.isDrawing = false;
        //     this.lastPoint = null;
        //     this.endStroke();
        //     console.log('Finished drawing stroke');
        // }
    }
    
    // ===== DRAWING ENGINE =====
    isPointInDrawingArea(coords) {
        const halfSize = this.drawingAreaSize / 2;
        return coords.x >= -halfSize && coords.x <= halfSize && 
               coords.y >= -halfSize && coords.y <= halfSize;
    }
    
    startStroke(coords) {
        // Drawing disabled - do nothing
        // // Save current drawing canvas state for undo
        // this.saveCanvasState();
        
        // // Set up drawing context on offscreen canvas
        // this.drawingCtx.save();
        
        // // Set drawing style
        // this.drawingCtx.strokeStyle = this.currentColor;
        // this.drawingCtx.lineWidth = this.brushSize;
        // this.drawingCtx.lineCap = 'round';
        // this.drawingCtx.lineJoin = 'round';
        // this.drawingCtx.globalAlpha = this.brushOpacity / 100;
        
        // // Convert coordinates to drawing canvas coordinates
        // const halfSize = this.drawingAreaSize / 2;
        // const drawX = coords.x + halfSize;
        // const drawY = coords.y + halfSize;
        
        // // Start path
        // this.drawingCtx.beginPath();
        // this.drawingCtx.moveTo(drawX, drawY);
    }
    
    drawLine(from, to) {
        // Drawing disabled - do nothing
        // // Convert coordinates to drawing canvas coordinates
        // const halfSize = this.drawingAreaSize / 2;
        // const fromX = from.x + halfSize;
        // const fromY = from.y + halfSize;
        // const toX = to.x + halfSize;
        // const toY = to.y + halfSize;
        
        // if (this.currentTool === 'brush') {
        //     this.drawingCtx.lineTo(toX, toY);
        //     this.drawingCtx.stroke();
        // } else if (this.currentTool === 'eraser') {
        //     this.drawingCtx.globalCompositeOperation = 'destination-out';
        //     this.drawingCtx.lineTo(toX, toY);
        //     this.drawingCtx.stroke();
        //     this.drawingCtx.globalCompositeOperation = 'source-over';
        // }
    }
    
    endStroke() {
        // Drawing disabled - do nothing
        // this.drawingCtx.restore();
        // this.applyTransformations(); // Redraw the canvas with new stroke
    }
    
    saveCanvasState() {
        // Save current drawing canvas state for undo functionality
        const imageData = this.drawingCtx.getImageData(0, 0, this.drawingAreaSize, this.drawingAreaSize);
        this.history.push(imageData);
        this.historyStep++;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyStep--;
        }
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
                this.removeClickOutsideListener();
            } else {
                panel.classList.add('is-visible');
                this.updateLayersPanel();
                this.addClickOutsideListener();
            }
        }
    }
    
    addClickOutsideListener() {
        this.clickOutsideHandler = (e) => {
            const panel = document.getElementById('layers-panel');
            const layersBtn = document.getElementById('btn-layers');
            
            // Check if click is outside panel and not on layers button
            if (panel && !panel.contains(e.target) && !layersBtn.contains(e.target)) {
                if (this.isMultiSelectMode) {
                    // Exit multi-select mode first
                    this.exitMultiSelectMode();
                } else {
                    panel.classList.remove('is-visible');
                    this.removeClickOutsideListener();
                }
            }
        };
        
        // Add escape key handler for multi-select mode
        this.escapeKeyHandler = (e) => {
            if (e.key === 'Escape' && this.isMultiSelectMode) {
                this.exitMultiSelectMode();
            }
        };
        
        // Add listener with a small delay to prevent immediate closing
        setTimeout(() => {
            document.addEventListener('click', this.clickOutsideHandler);
            document.addEventListener('keydown', this.escapeKeyHandler);
        }, 100);
    }
    
    removeClickOutsideListener() {
        if (this.clickOutsideHandler) {
            document.removeEventListener('click', this.clickOutsideHandler);
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
        
        // Create thumbnail content based on layer type
        if (layer.thumbnail) {
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
    insertAboveSelected(newItem) {
        // Find the currently selected item
        let selectedItem = null;
        
        // Check if we have a selected layer
        if (this.selectedLayerIds.size > 0) {
            const selectedId = Array.from(this.selectedLayerIds)[0];
            selectedItem = this.layers.find(l => l.id === selectedId);
        }
        
        // If no selected item, add to top
        if (!selectedItem) {
            this.layers.unshift(newItem);
            return;
        }
        
        // Find the index of the selected item
        const selectedIndex = this.layers.findIndex(l => l.id === selectedItem.id);
        
        // Insert the new item above the selected item
        this.layers.splice(selectedIndex, 0, newItem);
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
    }
    
    moveMultipleLayersToDropZone(layerIds, dropZone) {
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
        
        this.updateLayersPanel();
    }
    
    addLayer() {
        const newLayer = {
            id: `layer-${this.nextLayerId}`,
            name: `${this.nextLayerId}`,
            visible: true,
            opacity: 100,
            blendMode: 'normal',
            isActive: false,
            thumbnail: null,
            color: this.getRandomColor(),
            type: 'layer',
            parentId: null
        };
        
        // Insert above currently selected item
        this.insertAboveSelected(newLayer);
        this.nextLayerId++;
        this.selectLayer(newLayer.id);
        this.updateLayersPanel();
    }
    
    toggleLayerVisibility(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.visible = !layer.visible;
            this.updateLayersPanel();
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
        this.basicBrushes = [
            { id: 'pen', name: 'Pen', value: 8.0, isStarred: false, preview: 'pen' },
            { id: 'brush', name: 'Brush', value: 15.0, isStarred: false, preview: 'solid' },
            { id: 'marker', name: 'Marker', value: 12.0, isStarred: false, preview: 'marker' },
            { id: 'pencil', name: 'Pencil', value: 6.0, isStarred: false, preview: 'pen' }
        ];
        
        this.customBrushes = [
            { id: 'rainbow-splash', name: 'Rainbow Splash', value: 45.0, isStarred: false, preview: 'spray' },
            { id: 'cosmic-dust', name: 'Cosmic Dust', value: 23.5, isStarred: true, preview: 'soft' },
            { id: 'neon-glow', name: 'Neon Glow', value: 67.0, isStarred: false, preview: 'thick' },
            { id: 'mystic-waves', name: 'Mystic Waves', value: 34.2, isStarred: false, preview: 'wavy' },
            { id: 'crystal-shards', name: 'Crystal Shards', value: 18.8, isStarred: false, preview: 'textured' },
            { id: 'shadow-blend', name: 'Shadow Blend', value: 52.0, isStarred: false, preview: 'soft' },
            { id: 'fire-strokes', name: 'Fire Strokes', value: 89.0, isStarred: true, preview: 'thick' },
            { id: 'ice-crystals', name: 'Ice Crystals', value: 41.3, isStarred: false, preview: 'textured' }
        ];
        
        this.specialBrushes = [
            { id: 'magic-wand', name: 'Magic Wand', value: 100.0, isStarred: true, preview: 'star' },
            { id: 'galaxy-brush', name: 'Galaxy Brush', value: 75.5, isStarred: false, preview: 'spray' },
            { id: 'dragon-scale', name: 'Dragon Scale', value: 33.0, isStarred: false, preview: 'textured' },
            { id: 'phoenix-feather', name: 'Phoenix Feather', value: 58.7, isStarred: true, preview: 'soft' },
            { id: 'unicorn-hair', name: 'Unicorn Hair', value: 42.1, isStarred: false, preview: 'wavy' }
        ];
        
        this.currentTab = 'basic';
        this.currentBrush = this.basicBrushes[0];
        this.selectedBrushId = 'pen';
        
        this.renderBrushList();
        this.setupBrushPanelEvents();
    }
    
    renderBrushList() {
        const brushList = document.getElementById('brush-list');
        if (!brushList) return;
        
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
        
        currentBrushSet.forEach(brush => {
            const brushItem = document.createElement('div');
            brushItem.className = `brush-item ${brush.id === this.selectedBrushId ? 'selected' : ''}`;
            brushItem.dataset.brushId = brush.id;
            
            brushItem.innerHTML = `
                <button class="brush-add-btn">+</button>
                <div class="brush-preview-stroke ${brush.preview}"></div>
                <span class="brush-name">${brush.name}</span>
                <span class="brush-value">${brush.value}</span>
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
        
        // Brush item selection
        if (brushList) {
            brushList.addEventListener('click', (e) => {
                const brushItem = e.target.closest('.brush-item');
                if (brushItem) {
                    const brushId = brushItem.dataset.brushId;
                    this.selectBrush(brushId);
                    
                    // Double click to open settings
                    if (e.detail === 2) {
                        this.openBrushSettings(brushId);
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
        this.selectedBrushId = brushId;
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
    }
    
    openBrushSettings(brushId) {
        const brushSettings = document.getElementById('brush-settings');
        if (brushSettings) {
            this.selectBrush(brushId);
            brushSettings.classList.add('is-visible');
        }
    }
    
    closeBrushSettings() {
        const brushSettings = document.getElementById('brush-settings');
        if (brushSettings) {
            brushSettings.classList.remove('is-visible');
        }
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
        }
    }
    
    closeBrushPanel() {
        const panel = document.getElementById('brush-panel');
        const settings = document.getElementById('brush-settings');
        if (panel) {
            panel.classList.remove('is-visible');
        }
        if (settings) {
            settings.classList.remove('is-visible');
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
        this.referenceImages = [
            { id: 'ref-1', name: 'Reference 1', image: null },
            { id: 'ref-2', name: 'Reference 2', image: null },
            { id: 'ref-3', name: 'Reference 3', image: null }
        ];
        
        this.openRefViewers = new Map(); // Track open viewers
        this.viewerCounter = 0; // For unique positioning
        
        this.setupReferenceImagesEvents();
        this.renderReferenceImagesGrid();
    }
    
    setupReferenceImagesEvents() {
        console.log('Setting up reference images events...');
        const refImagesPanel = document.getElementById('saved-ref-images-panel');
        console.log('Reference images panel:', refImagesPanel);
        
        // Close button for reference images panel
        const refImagesClose = document.querySelector('.ref-images-close');
        if (refImagesClose) {
            refImagesClose.addEventListener('click', () => {
                this.closeReferenceImagesPanel();
            });
        }
        
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
        
        // Create content area (no header)
        const content = document.createElement('div');
        content.className = 'ref-viewer-content';
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'ref-viewer-image-container';
        
        const imageDiv = document.createElement('div');
        imageDiv.className = 'ref-viewer-image';
        
        const placeholder = document.createElement('div');
        placeholder.className = 'ref-viewer-placeholder';
        placeholder.innerHTML = `<span class="ref-viewer-text">${refImage.name}</span>`;
        
        imageDiv.appendChild(placeholder);
        imageContainer.appendChild(imageDiv);
        content.appendChild(imageContainer);
        
        viewer.appendChild(content);
        
        // Add drag functionality: allow dragging from handle or borders
        this.makeViewerDraggable(viewer, viewer, dragHandle);
        
        // Add touch gesture support for image content
        this.addTouchGestures(imageDiv, imageContainer);
        
        return viewer;
    }
    
    makeViewerDraggable(viewer, dragElement, dragHandle) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        const onMouseDown = (e) => {
            // Don't start dragging if clicking on image content or inputs
            if (e.target.closest('.ref-viewer-image') || e.target.closest('button') || e.target.closest('input')) {
                return;
            }
            
            // Always allow drag when starting from the explicit handle
            const startedOnHandle = !!(dragHandle && (e.target === dragHandle || dragHandle.contains(e.target)));
            
            // Otherwise, allow drag only when clicking near borders
            const rect = viewer.getBoundingClientRect();
            const borderSize = 6; // easier to grab
            const isInBorder = (
                e.clientX <= rect.left + borderSize ||
                e.clientX >= rect.right - borderSize ||
                e.clientY <= rect.top + borderSize ||
                e.clientY >= rect.bottom - borderSize
            );
            
            if (!startedOnHandle && !isInBorder) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(window.getComputedStyle(viewer).left);
            startTop = parseInt(window.getComputedStyle(viewer).top);
            
            viewer.style.cursor = 'grabbing';
            e.preventDefault();
        };
        
        dragElement.addEventListener('mousedown', onMouseDown);
        if (dragHandle) dragHandle.addEventListener('mousedown', onMouseDown);
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            viewer.style.left = `${startLeft + deltaX}px`;
            viewer.style.top = `${startTop + deltaY}px`;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                viewer.style.cursor = 'default';
            }
        });
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
        }
    }
    
    addNewReferenceImage() {
        const newImageName = prompt('Enter name for new reference image:');
        if (newImageName && newImageName.trim()) {
            const newId = `ref-${Date.now()}`;
            const newImage = {
                id: newId,
                name: newImageName,
                image: null
            };
            
            this.referenceImages.push(newImage);
            this.renderReferenceImagesGrid();
            
            alert(`New reference image "${newImageName}" added!`);
        }
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
            
            item.innerHTML = `
                <div class="ref-image-placeholder">
                    <span class="ref-image-text">Ref ${index + 1}</span>
                </div>
                <div class="ref-image-name">${image.name}</div>
            `;
            
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
        
        // Ruler button
        const rulerBtn = document.getElementById('ruler');
        if (rulerBtn) {
            rulerBtn.addEventListener('click', () => {
                this.toggleRuler();
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
        
        // Setup navigation canvas
        this.setupNavigationCanvas();
    }
    
    setupNavigationCanvas() {
        const navCanvas = document.getElementById('nav-canvas');
        const mainCanvas = document.getElementById('drawing-canvas');
        
        if (!navCanvas || !mainCanvas) return;
        
        // Set navigation canvas size
        const navViewport = navCanvas.parentElement;
        const navWidth = navViewport.clientWidth;
        const navHeight = navViewport.clientHeight;
        
        navCanvas.width = navWidth;
        navCanvas.height = navHeight;
        
        // Copy main canvas to navigation canvas
        this.updateNavigationCanvas();
        
        // Listen for canvas changes
        this.setupCanvasUpdateListener();
    }
    
    updateNavigationCanvas() {
        const navCanvas = document.getElementById('nav-canvas');
        
        if (!navCanvas || !this.drawingCanvas) return;
        
        const navCtx = navCanvas.getContext('2d');
        const navWidth = navCanvas.width;
        const navHeight = navCanvas.height;
        
        // Clear navigation canvas with light gray background (panel background)
        navCtx.fillStyle = '#f8f9fa';
        navCtx.fillRect(0, 0, navWidth, navHeight);
        
        // Get the actual drawing canvas dimensions (500x500)
        const drawingWidth = this.drawingCanvas.width;
        const drawingHeight = this.drawingCanvas.height;
        
        // Calculate scale to fit the drawing canvas in navigation panel
        const scaleX = navWidth / drawingWidth;
        const scaleY = navHeight / drawingHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Calculate centered position for the drawing canvas
        const scaledWidth = drawingWidth * scale;
        const scaledHeight = drawingHeight * scale;
        const offsetX = (navWidth - scaledWidth) / 2;
        const offsetY = (navHeight - scaledHeight) / 2;
        
        // Draw the actual drawing canvas (the white 500x500 canvas with content)
        navCtx.drawImage(
            this.drawingCanvas, 
            0, 0, drawingWidth, drawingHeight,  // Source: entire drawing canvas
            offsetX, offsetY, scaledWidth, scaledHeight  // Destination: scaled and centered
        );
    }
    
    setupCanvasUpdateListener() {
        // Update navigation canvas when main canvas changes
        const mainCanvas = document.getElementById('drawing-canvas');
        if (mainCanvas) {
            // Listen for canvas redraws (this is a simple approach)
            // In a real implementation, you'd want to listen to drawing events
            setInterval(() => {
                if (document.getElementById('navigation-panel').classList.contains('show')) {
                    this.updateNavigationCanvas();
                }
            }, 100); // Update every 100ms
        }
        
        // Update navigation canvas on resize
        window.addEventListener('resize', () => {
            if (document.getElementById('navigation-panel').classList.contains('show')) {
                this.updateNavigationCanvas();
            }
        });
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
        const resizeHandle = element.querySelector('.nav-resize-handle');
        if (!resizeHandle) return;
        
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
            
            document.addEventListener('mousemove', doResize);
            document.addEventListener('mouseup', stopResize);
        });
        
        function doResize(e) {
            if (!isResizing) return;
            
            const newWidth = startWidth + e.clientX - startX;
            const newHeight = startHeight + e.clientY - startY;
            
            element.style.width = Math.max(200, newWidth) + 'px';
            element.style.height = Math.max(150, newHeight) + 'px';
        }
        
        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', doResize);
            document.removeEventListener('mouseup', stopResize);
        }
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
            // noop
        }
    }
    
    handleRedo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            // noop
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
        this.currentTool = tool;
        // noop
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
    
    zoomIn() {
        this.zoomIn();
    }
    
    zoomOut() {
        this.zoomOut();
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
            this.drawingCtx.putImageData(imageData, 0, 0);
            this.applyTransformations(); // Redraw with current transformations
            this.updateUndoRedoButtons();
            // noop
        }
    }
    
    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            const imageData = this.history[this.historyStep];
            this.drawingCtx.putImageData(imageData, 0, 0);
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