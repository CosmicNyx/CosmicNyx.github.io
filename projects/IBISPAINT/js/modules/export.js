// Simple export module to keep concerns separated
// Usage: IbisExport.exportVisibleLayersAsPNG(workspace, filenameOverride)
;(function (global) {
	'use strict';

	function triggerDownload(blobOrDataUrl, filename) {
		var a = document.createElement('a');
		if (!/\.png$/i.test(filename)) filename = filename + '.png';
		a.download = filename;
		if (blobOrDataUrl instanceof Blob) {
			var url = URL.createObjectURL(blobOrDataUrl);
			a.href = url;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} else {
			a.href = blobOrDataUrl;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	}

	function exportVisibleLayersAsPNG(workspace, filenameOverride) {
		if (!workspace || !Array.isArray(workspace.layers)) {
			console.error('[Export] Invalid workspace passed to exporter');
			return;
		}

		var width = workspace.canvasWidth || workspace.drawingAreaSize;
		var height = workspace.canvasHeight || workspace.drawingAreaSize;
		var tempCanvas = document.createElement('canvas');
		tempCanvas.width = width;
		tempCanvas.height = height;
		var tempCtx = tempCanvas.getContext('2d');

		// White background
		tempCtx.fillStyle = '#ffffff';
		tempCtx.fillRect(0, 0, width, height);

		// Composite visible layers bottom -> top
		workspace.layers.forEach(function (layer) {
			if (layer.type === 'layer' && layer.visible && layer.canvas) {
				tempCtx.globalAlpha = (layer.opacity || 100) / 100;
				tempCtx.globalCompositeOperation = layer.blendMode || 'source-over';
				tempCtx.drawImage(layer.canvas, 0, 0, width, height);
			}
		});

		tempCtx.globalAlpha = 1;
		tempCtx.globalCompositeOperation = 'source-over';

		try {
			var ts = new Date().toISOString().replace(/[:.]/g, '-');
			var filename = filenameOverride || ('canvas-' + ts + '.png');
			if (tempCanvas.toBlob) {
				tempCanvas.toBlob(function (blob) {
					if (blob) {
						triggerDownload(blob, filename);
					} else {
						triggerDownload(tempCanvas.toDataURL('image/png'), filename);
					}
				}, 'image/png');
			} else {
				triggerDownload(tempCanvas.toDataURL('image/png'), filename);
			}
		} catch (err) {
			console.error('[Export] Failed to export PNG:', err);
			alert('Export failed. If you used external images, the browser may block export (CORS).');
		}
	}

	global.IbisExport = {
		exportVisibleLayersAsPNG: exportVisibleLayersAsPNG,
	};
})(window);


