// Brush module: exposes BrushEngine and a shared brushRegistry
;(function (global) {
    'use strict';

    function BrushEngine(ctx, canvasWidth, canvasHeight, workspace) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.workspace = workspace || null;
        this.brushes = Object.create(null);
        this.lastDrawPoints = Object.create(null);
        this.currentBrushConfig = null;
    }

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

    BrushEngine.prototype.registerBrush = function (name, brushFn) {
        this.brushes[name] = brushFn;
    };

    BrushEngine.prototype.draw = function (from, to, brushType, color, size, opacity) {
        var rawConfig = {};
        if (this.workspace && typeof this.workspace.getBrushConfig === 'function') {
            rawConfig = this.workspace.getBrushConfig(brushType) || {};
        }

        var effectiveConfig = Object.assign({}, rawConfig);
        var flow = typeof effectiveConfig.flow === 'number' ? effectiveConfig.flow : 1;
        var spacingRatio = typeof effectiveConfig.spacing === 'number' ? effectiveConfig.spacing : 0;
        var roundness = typeof effectiveConfig.roundness === 'number' ? effectiveConfig.roundness : 1;
        var angle = typeof effectiveConfig.angle === 'number' ? effectiveConfig.angle : 0;

        effectiveConfig.flow = flow;
        effectiveConfig.spacing = spacingRatio;
        effectiveConfig.roundness = roundness;
        effectiveConfig.angle = angle;

        var spacingKey = brushType || '_default';
        if (spacingRatio > 0 && this.lastDrawPoints[spacingKey]) {
            var last = this.lastDrawPoints[spacingKey];
            var dist = this.dist(last.x, last.y, to.x, to.y);
            var threshold = Math.max(0.5, spacingRatio * size);
            if (dist < threshold) {
                return;
            }
        }
        this.lastDrawPoints[spacingKey] = { x: to.x, y: to.y };

        var adjustedOpacity = Math.max(0, Math.min(100, opacity * flow));

        var brush = this.brushes[brushType];
        this.currentBrushConfig = effectiveConfig;
        if (brush) {
            try {
                brush.call(this, from, to, color, size, adjustedOpacity);
            } finally {
                this.currentBrushConfig = null;
            }
            return;
        }
        this.currentBrushConfig = null;

        var fromCoords = this.convertCoords(from);
        var toCoords = this.convertCoords(to);
        var midpointX = (fromCoords.x + toCoords.x) / 2;
        var midpointY = (fromCoords.y + toCoords.y) / 2;
        var angleRad = angle * Math.PI / 180;

        this.ctx.save();
        if (angleRad !== 0) {
            this.ctx.translate(midpointX, midpointY);
            this.ctx.rotate(angleRad);
            this.ctx.translate(-midpointX, -midpointY);
        }
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = Math.max(0.1, size * roundness);
        this.ctx.globalAlpha = adjustedOpacity / 100;
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

    BrushRegistry.prototype.initialize = function (engine) {
        var keys = Object.keys(this.brushes);
        for (var i = 0; i < keys.length; i++) {
            var name = keys[i];
            engine.registerBrush(name, this.brushes[name].function);
        }
    };

    var brushRegistry = new BrushRegistry();

    global.BrushEngine = BrushEngine;
    global.brushRegistry = brushRegistry;
})(typeof window !== 'undefined' ? window : globalThis);


