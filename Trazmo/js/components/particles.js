export class ParticleBackground {
    constructor(element) {
      this.container = element;
      this.colors = this.getColorsFromAttributes();
      this.particleCount = parseInt(element.dataset.count) || 60;
      this.animationSpeed = parseFloat(element.dataset.speed) || 1;
      
      this.init();
    }
    
    getColorsFromAttributes() {
      const colors = [];
      // Get all color attributes (data-color-1, data-color-2, etc.)
      for (let i = 1; i <= 5; i++) {
        const color = this.container.dataset[`color${i}`] || 
                     this.container.dataset[`color-${i}`];
        if (color) colors.push(color);
      }
      // Default colors if none specified
      return colors.length > 0 ? colors : ['#00d76c', '#a8e2ff', '#ffffff'];
    }
    
    init() {
      this.canvas = document.createElement('canvas');
      this.container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      
      this.resize();
      window.addEventListener('resize', this.resize.bind(this));
      
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push(this.createParticle());
      }
      
      this.animate();
    }
    
    createParticle() {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 3 + 1,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        speed: Math.random() * this.animationSpeed + 0.2,
        direction: Math.random() * Math.PI * 2
      };
    }
    
    resize() {
      this.width = this.canvas.width = this.container.offsetWidth;
      this.height = this.canvas.height = this.container.offsetHeight;
    }
    
    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      
      this.particles.forEach(particle => {
        particle.x += Math.cos(particle.direction) * particle.speed;
        particle.y += Math.sin(particle.direction) * particle.speed;
        
        if (particle.x < 0 || particle.x > this.width) {
          particle.direction = Math.PI - particle.direction;
        }
        if (particle.y < 0 || particle.y > this.height) {
          particle.direction = -particle.direction;
        }
        
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
      });
      
      requestAnimationFrame(this.animate.bind(this));
    }
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.particle-background').forEach(el => {
      new ParticleBackground(el);
    });
  });