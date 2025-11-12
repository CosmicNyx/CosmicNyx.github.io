/**
 * Brush module exposing a configurable BrushEngine and shared registry.
 * Handles coordinate translation, basic line rendering, and brush
 * registration hooks for custom stroke implementations.
 */
;(function (global) {
    'use strict';

    function BrushEngine(ctx, canvasWidth, canvasHeight, workspace) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.workspace = workspace || null;
        this.brushes = Object.create(null);
        this.lastDrawPoints = Object.create(null);
    }

    // Translate logical brush coordinates (centered around origin) to canvas coordinates.
    BrushEngine.prototype.convertCoords = function (coords) {
        var halfWidth = this.canvasWidth / 2;
        var halfHeight = this.canvasHeight / 2;
        return {
            x: coords.x + halfWidth,
            y: coords.y + halfHeight
        };
    };

    BrushEngine.prototype.dist = function (x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    };

    BrushEngine.prototype.lerp = function (start, end, t) {
        return start + (end - start) * t;
    };

    BrushEngine.prototype.getSpeed = function (from, to) {
        return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
    };

    BrushEngine.prototype.getAngle = function (from, to) {
        return Math.atan2(to.y - from.y, to.x - from.x);
    };

    // Allow external brush implementations to register themselves by name.
    BrushEngine.prototype.registerBrush = function (name, brushFn) {
        this.brushes[name] = brushFn;
    };

    // Core drawing routine invoked on every pointer move.
    // It delegates to custom brushes when available, otherwise falls back to a simple line.
    BrushEngine.prototype.draw = function (from, to, brushType, color, size, opacity) {
        // Look up a registered brush implementation by type.
        var brush = this.brushes[brushType];
        if (brush && typeof brush === 'function') {
            try {
                // Execute custom brush logic with the engine context as `this`.
                brush.call(this, from, to, color, size, opacity);
            } catch (e) {
                console.error('Brush drawing error:', e, 'brushType:', brushType, 'error stack:', e.stack);
            }
            return;
        } else if (brushType && !brush) {
            console.warn('Brush not found:', brushType, 'Available brushes:', Object.keys(this.brushes));
        }

        // Default fallback rendering: draw a straight stroke between the two points.
        var fromCoords = this.convertCoords(from);
        var toCoords = this.convertCoords(to);

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
    };

    function BrushRegistry() {
        this.brushes = Object.create(null);
    }

    // Store brush metadata and implementation so the engine can initialize later.
    BrushRegistry.prototype.register = function (name, brushFn, metadata) {
        this.brushes[name] = {
            function: brushFn,
            metadata: metadata || {}
        };
    };

    BrushRegistry.prototype.get = function (name) {
        return this.brushes[name];
    };

    BrushRegistry.prototype.getAll = function () {
        return this.brushes;
    };

    // Push all registered brushes into a specific engine instance.
    BrushRegistry.prototype.initialize = function (engine) {
        var keys = Object.keys(this.brushes);
        console.log('Initializing', keys.length, 'brushes on engine');
        for (var i = 0; i < keys.length; i++) {
            var name = keys[i];
            engine.registerBrush(name, this.brushes[name].function);
        }
        console.log('Engine brushes after init:', Object.keys(engine.brushes));
    };

    var brushRegistry = new BrushRegistry();

    global.BrushEngine = BrushEngine;
    global.brushRegistry = brushRegistry;
})(typeof window !== 'undefined' ? window : globalThis);


