document.addEventListener('DOMContentLoaded', function() {
    // Setup canvas - using hero-image as container
    const container = document.querySelector('.iceberg-container');
    const canvas = document.getElementById('lensFlareCanvas');
    const ctx = canvas.getContext('2d');
    
    // Size canvas to cover entire viewport
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Light source position and animation state
    let lightPos = { x: canvas.width * 0.5, y: canvas.height * 0.5 };
    let opacity = 0;
    const fadeSpeed = 0.2;
    
    // Mouse tracking
    container.addEventListener('mousemove', (e) => {
        lightPos = {
            x: e.clientX,
            y: e.clientY
        };
    });

    // Optical elements configuration with brighter colors
    const opticalElements = [
        // Main glow (brighter white)
        { type: 'glow', size: 120, blur: 50, color: 'rgba(255, 255, 255, 0.9)' },
        
        // Central point (the actual light source - brighter)
        { type: 'point', size: 10, blur: 0, color: 'rgba(255, 255, 255, 1)' },
        
        // Primary lens artifacts (more vibrant rainbow streaks)
        { type: 'streak', angle: 45, length: 220, width: 35, color: 'rgba(255, 50, 50, 0.8)', distance: 0.3 },
        { type: 'streak', angle: -45, length: 220, width: 35, color: 'rgba(50, 255, 50, 0.8)', distance: 0.3 },
        
        // Secondary reflections (brighter circular flares)
        { type: 'circle', size: 70, blur: 20, color: 'rgba(220, 150, 255, 0.7)', offsetX: -0.4, offsetY: -0.2 },
        { type: 'circle', size: 50, blur: 15, color: 'rgba(100, 220, 255, 0.7)', offsetX: 0.3, offsetY: -0.3 },
        { type: 'circle', size: 90, blur: 30, color: 'rgba(255, 220, 100, 0.6)', offsetX: 0.5, offsetY: 0.4 },
        
        // Rainbow rings (more saturated colors)
        { type: 'ring', size: 160, thickness: 12, blur: 15, color: 'rgba(255, 0, 0, 0.5)', offsetX: -0.2, offsetY: 0.1 },
        { type: 'ring', size: 270, thickness: 18, blur: 20, color: 'rgba(0, 255, 0, 0.4)', offsetX: 0.1, offsetY: 0.2 },
        { type: 'ring', size: 380, thickness: 22, blur: 25, color: 'rgba(0, 0, 255, 0.3)', offsetX: -0.1, offsetY: -0.3 }
    ];

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Adjust opacity based on hover state with faster transition
        const targetOpacity = container.matches(':hover') ? 1 : 0;
        opacity += (targetOpacity - opacity) * fadeSpeed;
        
        // Only draw if there's some opacity
        if (opacity > 0.01) {
            // Calculate center of screen (for flare positioning)
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Draw all optical elements with current opacity
            ctx.save();
            ctx.globalAlpha = opacity;
            opticalElements.forEach(element => {
                drawOpticalElement(element, lightPos.x, lightPos.y, centerX, centerY);
            });
            ctx.restore();
        }
        
        requestAnimationFrame(animate);
    }
    animate();

    // Draw different types of optical elements
    function drawOpticalElement(element, lightX, lightY, centerX, centerY) {
        ctx.save();
        
        // Calculate position based on element type
        let x, y;
        if (element.offsetX !== undefined) {
            // Position relative to vector from center to light source
            const dx = lightX - centerX;
            const dy = lightY - centerY;
            x = centerX + dx * element.offsetX;
            y = centerY + dy * element.offsetY;
        } else {
            x = lightX;
            y = lightY;
        }
        
        // Apply blur if needed
        if (element.blur) {
            ctx.filter = `blur(${element.blur}px)`;
        }
        
        // Draw based on element type
        switch(element.type) {
            case 'glow':
                const gradient = ctx.createRadialGradient(
                    x, y, 0,
                    x, y, element.size
                );
                gradient.addColorStop(0, element.color);
                gradient.addColorStop(1, 'transparent');
                
                ctx.beginPath();
                ctx.fillStyle = gradient;
                ctx.arc(x, y, element.size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'point':
                ctx.beginPath();
                ctx.fillStyle = element.color;
                ctx.arc(x, y, element.size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'streak':
                // Calculate streak position (opposite side from center)
                const streakX = x + (x - centerX) * element.distance;
                const streakY = y + (y - centerY) * element.distance;
                
                // Rotate context for angled streaks
                ctx.translate(streakX, streakY);
                ctx.rotate(element.angle * Math.PI / 180);
                
                // Create gradient for streak
                const streakGradient = ctx.createLinearGradient(
                    -element.length/2, 0,
                    element.length/2, 0
                );
                streakGradient.addColorStop(0, 'transparent');
                streakGradient.addColorStop(0.3, element.color);
                streakGradient.addColorStop(0.7, element.color);
                streakGradient.addColorStop(1, 'transparent');
                
                // Draw streak
                ctx.beginPath();
                ctx.fillStyle = streakGradient;
                ctx.rect(-element.length/2, -element.width/2, element.length, element.width);
                ctx.fill();
                break;
                
            case 'circle':
                ctx.beginPath();
                ctx.fillStyle = element.color;
                ctx.arc(x, y, element.size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'ring':
                ctx.beginPath();
                ctx.strokeStyle = element.color;
                ctx.lineWidth = element.thickness;
                ctx.arc(x, y, element.size, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
        
        ctx.restore();
    }
});