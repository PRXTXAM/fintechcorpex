/**
 * FINTECHCORPEX // Interactive Telemetry Particles Background
 * High-performance 2D Canvas particle simulation with mouse repulsion fields.
 */

(function () {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };
    
    // Config parameters
    const PARTICLE_COUNT = 65;
    const COLORS = [
        'rgba(255, 255, 255, 0.12)', // White dust
        'rgba(255, 255, 255, 0.06)', // Dim white dust
        'rgba(255, 40, 0, 0.20)',   // Rosso corsa glow embers
        'rgba(255, 40, 0, 0.08)'    // Dim red embers
    ];
    
    // Resize Canvas to fill viewport
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    
    // Track Mouse Coordinates
    window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseout', function () {
        mouse.x = null;
        mouse.y = null;
    });
    
    // Particle Class Definition
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1; // 1px to 3px
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 15) + 5; // Inertia weight
            
            // Random floating drift velocities
            this.vx = (Math.random() * 0.4 - 0.2);
            this.vy = (Math.random() * 0.4 - 0.2) - 0.15; // Slow upward float bias
            
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        update() {
            // 1. Natural floating drift
            this.x += this.vx;
            this.y += this.vy;
            
            // Wrap around edges when floating off screen
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
            
            // 2. Mouse Repulsion Vector Physics
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    
                    // The closer the mouse, the stronger the force
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * this.density * 0.35;
                    let directionY = forceDirectionY * force * this.density * 0.35;
                    
                    // Repulse: push away from mouse
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
        }
    }
    
    // Initialize/Re-initialize Particles list
    function initParticles() {
        particles = [];
        const adjustedCount = Math.floor(PARTICLE_COUNT * (canvas.width * canvas.height / (1920 * 1080)));
        const finalCount = Math.max(adjustedCount, 30); // Cap lower bound
        
        for (let i = 0; i < finalCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        requestAnimationFrame(animate);
    }
    
    // Startup
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
})();
