// ===== PARTICLES SYSTEM =====
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        this.init();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(80, Math.floor(window.innerWidth / 15));
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const theme = document.documentElement.getAttribute('data-theme');
        const color = theme === 'dark' ? '162, 155, 254' : '108, 92, 231';
        
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            // Mouse interaction
            const dx = this.mouseX - p.x;
            const dy = this.mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                p.x -= dx * 0.005;
                p.y -= dy * 0.005;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
            this.ctx.fill();
        });
        
        // Draw connections
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(${color}, ${0.08 * (1 - dist / 120)})`;
                    this.ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// ===== CURSOR GLOW =====
const cursorGlow = document.getElementById('cursorGlow');
let cursorTimeout;

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.opacity = '1';
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
    
    clearTimeout(cursorTimeout);
    cursorTimeout = setTimeout(() => {
        cursorGlow.style.opacity = '0';
    }, 3000);
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navLinkItems = document.querySelectorAll('.nav-link');

// Scroll effect
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    
    // Active link
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        const bottom = top + section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bottom) {
            navLinkItems.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.section === section.id) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Mobile menu
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
});

navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
    });
});

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
}

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animate stats numbers
            const numberEl = entry.target.querySelector('.stat-number, .stats-card-number');
            if (numberEl && !numberEl.dataset.animated) {
                numberEl.dataset.animated = 'true';
                animateNumber(numberEl);
            }
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.08}s`;
    observer.observe(card);
});

// Observe stats cards
document.querySelectorAll('.stats-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
});

// ===== NUMBER ANIMATION =====
function animateNumber(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const step = Math.max(1, Math.floor(target / 60));
    let current = 0;
    
    const increment = () => {
        current += step;
        if (current >= target) {
            el.textContent = target + (target === 100 ? '%' : '+');
            return;
        }
        el.textContent = current + (target === 100 ? '%' : '+');
        requestAnimationFrame(increment);
    };
    
    increment();
}

// ===== HERO COUNTERS =====
document.querySelectorAll('.hero .stat-number').forEach(el => {
    observer.observe(el.parentElement);
});

// ===== DEMO MODAL =====
function playDemo() {
    const overlay = document.createElement('div');
    overlay.className = 'demo-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; backdrop-filter: blur(10px);
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: var(--bg-card); padding: 2rem; border-radius: 20px;
        max-width: 500px; width: 90%; border: var(--card-border);
        cursor: default;
    `;
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🧠</div>
            <h3 style="font-size: 1.5rem; font-weight: 700;">Nexus Demo</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">
                Assistente autônomo rodando em tempo real.<br>
                Comandos por voz, texto, visão e muito mais!
            </p>
        </div>
        <div style="background: var(--code-bg); border-radius: 12px; padding: 1rem; font-family: monospace; font-size: 0.85rem; margin-bottom: 1rem;">
            <div style="color: #00cec9;">$ nexus --list-capabilities</div>
            <div style="color: #a29bfe;">✅ 25+ ferramentas disponíveis</div>
            <div style="color: #a29bfe;">✅ Execução autônoma ativada</div>
            <div style="color: #a29bfe;">✅ Memória de longo prazo pronta</div>
            <div style="color: #a29bfe;">✅ GitHub Pages integrado</div>
            <div style="color: #00cec9; margin-top: 0.5rem;">$ nexus --status</div>
            <div style="color: #00b894;">● Online | v3.0 | Windows</div>
        </div>
        <button onclick="this.closest('.demo-overlay').remove()" style="
            width: 100%; padding: 0.8rem; border: none; border-radius: 12px;
            background: var(--gradient-1); color: white; font-weight: 600;
            font-size: 1rem; cursor: pointer; font-family: inherit;
        ">Fechar</button>
    `;
    
    overlay.appendChild(content);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
}

// ===== SHOW STATUS =====
function showStatus() {
    const statusEl = document.getElementById('ctaStatus');
    statusEl.style.animation = 'none';
    statusEl.offsetHeight;
    statusEl.style.animation = 'pulse 2s infinite';
    
    const messages = [
        '🚀 Nexus operacional | Uptime: 99.9%',
        '⚡ Modo turbo ativado | Resposta instantânea',
        '🧠 Memória sincronizada | Contexto carregado',
        '🌐 GitHub Pages pronto | Deploy em 3 segundos'
    ];
    
    let i = 0;
    const interval = setInterval(() => {
        statusEl.innerHTML = `<div class="status-dot online"></div><span>${messages[i % messages.length]}</span>`;
        i++;
        if (i > 8) clearInterval(interval);
    }, 1500);
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.key === 't' && e.ctrlKey) {
        e.preventDefault();
        themeToggle.click();
    }
    if (e.key === 'Escape') {
        document.querySelector('.demo-overlay')?.remove();
    }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
    
    // Initial status
    showStatus();
    
    console.log('🚀 Nexus Landing Page v3.0 loaded');
    console.log('✨ Assistente Desktop Autônomo com IA');
});