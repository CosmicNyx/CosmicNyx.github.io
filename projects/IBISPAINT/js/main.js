/**
 * Bootstraps the application by loading required scripts in sequence.
 * Ensures libraries and modules are available in the correct order
 * before the workspace logic executes.
 */
// Main JavaScript entry point
// This file loads all JavaScript modules in the correct order

// Script loading order - load synchronously
const scripts = [
    // Libraries first
    'js/libs/p5.min.js',
    'js/libs/p5.brush.js',
    
    // Application modules
    'js/icons.js',
    'js/brushes.js',
    'js/brush-implementations.js',
    'js/p5brush-integration.js',
    'js/app.js'
];

// Load scripts sequentially
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.async = false; // Load synchronously
    script.onload = callback;
    script.onerror = function() {
        console.error('Failed to load script: ' + src);
        if (callback) callback(); // Continue even if one fails
    };
    document.head.appendChild(script);
}

// Load all scripts in order
function loadAllScripts(index) {
    if (index >= scripts.length) {
        // All scripts loaded
        console.log('All scripts loaded successfully');
        return;
    }
    
    loadScript(scripts[index], function() {
        loadAllScripts(index + 1);
    });
}

// Start loading immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        loadAllScripts(0);
    });
} else {
    // DOM already loaded
    loadAllScripts(0);
}
