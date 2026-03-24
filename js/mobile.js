/**
 * B_LineGraphix - Mobile JS
 * Leichtgewichtig, eigenständig, nutzt CONTENT aus content.js
 */
(function () {
    'use strict';

    const C = typeof CONTENT !== 'undefined' ? CONTENT : {};

    /* ========================================
       0a. INTRO ANIMATION (1:1 from desktop)
       ======================================== */
    const Intro = {
        timers: [],

        init() {
            const ov = document.getElementById('intro-overlay');
            if (!ov) return;

            if (sessionStorage.getItem('bline_intro_seen') ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                ov.remove();
                return;
            }

            const skip = document.getElementById('intro-skip');
            if (skip) skip.addEventListener('click', () => this.skip(ov));
            document.addEventListener('keydown', e => { if (e.key === 'Escape') this.skip(ov); });

            const sym = document.getElementById('intro-sym');
            const brand = document.getElementById('intro-brand');
            const t = (fn, ms) => { this.timers.push(setTimeout(fn, ms)); };

            t(() => { if (sym) sym.classList.add('visible'); }, 200);
            t(() => { if (brand) brand.classList.add('visible'); }, 600);
            t(() => { if (brand) brand.classList.add('fade-out'); }, 2400);
            t(() => { if (sym) sym.classList.add('morph-out'); }, 2800);
            t(() => {
                sessionStorage.setItem('bline_intro_seen', 'true');
                ov.classList.add('fade-out');
            }, 3200);
            t(() => ov.remove(), 4500);
        },

        skip(ov) {
            this.timers.forEach(clearTimeout);
            sessionStorage.setItem('bline_intro_seen', 'true');
            ov.classList.add('fade-out');
            setTimeout(() => ov.remove(), 500);
        }
    };

    /* ========================================
       0b. HERO SCROLL LOCK + DIVE (1:1 from desktop)
       ======================================== */
    const HeroDive = {
        locked: false,
        isDiving: false,

        init() {
            if (sessionStorage.getItem('heroUnlocked') === 'true') {
                const wrap = document.getElementById('hero-cta-wrap');
                if (wrap) wrap.style.display = 'none';
                return;
            }

            this.locked = true;
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            const cta = document.getElementById('hero-cta');
            if (cta) cta.addEventListener('click', e => { e.preventDefault(); this.dive(); });

            const block = e => { if (this.locked) { e.preventDefault(); e.stopPropagation(); } };
            window.addEventListener('wheel', block, { passive: false });
            window.addEventListener('touchmove', block, { passive: false });
        },

        dive() {
            if (!this.locked || this.isDiving) return;
            this.isDiving = true;

            const content = document.getElementById('hero-content');
            const bg = document.getElementById('hero-bg');
            const overlay = document.getElementById('hero-dive-overlay');
            const cta = document.getElementById('hero-cta');

            if (cta) cta.disabled = true;

            if (bg) {
                bg.style.transition = 'transform 1.8s cubic-bezier(0.25,0.1,0.25,1), filter 1.8s cubic-bezier(0.25,0.1,0.25,1)';
                bg.style.transform = 'scale(1.5)';
                bg.style.filter = 'blur(20px)';
            }

            if (content) {
                content.style.transition = 'opacity 1s ease-in-out, transform 1s ease-in-out';
                content.style.opacity = '0';
                content.style.transform = 'translateY(-80px) scale(0.9)';
            }

            if (overlay) overlay.classList.add('active');

            setTimeout(() => {
                const phil = document.getElementById('philosophy');
                if (phil) phil.scrollIntoView({ behavior: 'instant' });

                sessionStorage.setItem('heroUnlocked', 'true');
                this.locked = false;
                this.isDiving = false;
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';

                if (overlay) { overlay.classList.remove('active'); overlay.style.transition = 'none'; overlay.style.opacity = '0'; }

                const wrap = document.getElementById('hero-cta-wrap');
                if (wrap) wrap.style.display = 'none';

                if (bg) { bg.style.transition = ''; bg.style.transform = ''; bg.style.filter = ''; }
                if (content) { content.style.transition = ''; content.style.opacity = ''; content.style.transform = ''; }
            }, 2000);
        }
    };

    /* ========================================
       1. SIMPLE PARTICLES (ambient background)
       ======================================== */
    const Particles = {
        canvas: null, ctx: null, nodes: [],
        width: 0, height: 0,

        init() {
            this.canvas = document.getElementById('mobile-particles');
            if (!this.canvas) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.canvas.style.display = 'none'; return;
            }
            this.ctx = this.canvas.getContext('2d');
            this.width = window.innerWidth;
            this.height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';

            for (let i = 0; i < 80; i++) {
                this.nodes.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25,
                    r: 0.8 + Math.random() * 1.2,
                    phase: Math.random() * Math.PI * 2
                });
            }
            this.animate();
        },

        animate() {
            if (document.hidden) { requestAnimationFrame(() => this.animate()); return; }
            this.ctx.clearRect(0, 0, this.width, this.height);
            const now = Date.now();
            const cd = 100;

            this.nodes.forEach(n => {
                n.x += n.vx + Math.sin(now * 0.0003 + n.phase) * 0.1;
                n.y += n.vy + Math.cos(now * 0.0002 + n.phase) * 0.08;
                if (n.x < -10) n.x = this.width + 10;
                if (n.x > this.width + 10) n.x = -10;
                if (n.y < -10) n.y = this.height + 10;
                if (n.y > this.height + 10) n.y = -10;
            });

            /* Connections */
            this.ctx.lineWidth = 0.4;
            for (let i = 0; i < this.nodes.length; i++) {
                const a = this.nodes[i];
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const b = this.nodes[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < cd) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(a.x, a.y);
                        this.ctx.lineTo(b.x, b.y);
                        this.ctx.strokeStyle = 'rgba(255,255,255,' + ((1 - d / cd) * 0.12) + ')';
                        this.ctx.stroke();
                    }
                }
            }

            /* Nodes */
            this.nodes.forEach(n => {
                const pulse = 0.5 + Math.sin(now * 0.002 + n.phase) * 0.5;
                this.ctx.beginPath();
                this.ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255,255,255,' + (0.15 + pulse * 0.1) + ')';
                this.ctx.fill();
            });

            requestAnimationFrame(() => this.animate());
        }
    };

    /* ========================================
       2. NAVIGATION
       ======================================== */
    const Nav = {
        init() {
            const btn = document.getElementById('hamburger');
            const menu = document.getElementById('mobile-menu');
            const links = document.querySelectorAll('.mobile-menu-link');
            if (!btn || !menu) return;

            const close = () => { menu.classList.remove('active'); document.body.style.overflow = ''; };

            btn.addEventListener('click', () => {
                const open = menu.classList.toggle('active');
                document.body.style.overflow = open ? 'hidden' : '';
            });

            links.forEach(l => l.addEventListener('click', close));
            document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

            /* Smooth scroll */
            document.querySelectorAll('a[href^="#"]').forEach(a => {
                a.addEventListener('click', e => {
                    const t = document.querySelector(a.getAttribute('href'));
                    if (!t) return;
                    e.preventDefault();
                    t.scrollIntoView({ behavior: 'smooth' });
                });
            });
        }
    };

    /* ========================================
       3. SCROLL REVEAL
       ======================================== */
    const Reveal = {
        init() {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const obs = new IntersectionObserver(entries => {
                entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
            }, { threshold: 0.1, rootMargin: '-20px' });
            document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        }
    };

    /* ========================================
       4. PORTFOLIO RENDERER
       ======================================== */
    const Portfolio = {
        init() {
            const grid = document.getElementById('portfolio-grid');
            if (!grid || !C.portfolio) return;

            C.portfolio.projects.forEach(p => {
                const card = document.createElement('div');
                card.className = 'portfolio-card reveal';
                card.innerHTML =
                    '<div class="portfolio-card-img"><img src="' + p.image + '" alt="' + p.title + '" loading="lazy"></div>' +
                    '<div class="portfolio-card-body">' +
                        '<span class="section-label" style="color:' + p.glowColor + '">' + p.category + '</span>' +
                        '<h3>' + p.title + '</h3>' +
                        '<p>' + p.description + '</p>' +
                        '<div class="portfolio-card-actions">' +
                            (p.website ? '<a href="' + p.website + '" target="_blank" rel="noopener" class="portfolio-action-btn">Website</a>' : '') +
                            (p.pdf ? '<a href="' + p.pdf + '" target="_blank" class="portfolio-action-btn">Case Study</a>' : '') +
                        '</div>' +
                    '</div>';
                grid.appendChild(card);
            });
        }
    };

    /* ========================================
       5. ROADMAP RENDERER
       ======================================== */
    const Roadmap = {
        init() {
            const list = document.getElementById('roadmap-list');
            if (!list || !C.roadmap) return;

            C.roadmap.steps.forEach(s => {
                const step = document.createElement('div');
                step.className = 'roadmap-step reveal';
                step.innerHTML =
                    '<span class="roadmap-step-number">' + s.number + '</span>' +
                    '<h3>' + s.title + '</h3>' +
                    '<p>' + s.desc + '</p>';
                list.appendChild(step);
            });
        }
    };

    /* ========================================
       6. CONTACT FORM
       ======================================== */
    const Contact = {
        init() {
            const form = document.getElementById('contact-form');
            if (!form) return;

            form.addEventListener('submit', async e => {
                e.preventDefault();
                const status = document.getElementById('form-status');
                const btn = document.getElementById('contact-submit');
                const name = form.querySelector('[name="name"]').value.trim();
                const email = form.querySelector('[name="email"]').value.trim();

                if (!name) { status.textContent = 'Bitte Name eingeben.'; status.className = 'form-status error'; return; }
                if (!email || !email.includes('@')) { status.textContent = 'Bitte gültige E-Mail eingeben.'; status.className = 'form-status error'; return; }

                btn.disabled = true;
                btn.textContent = 'Wird gesendet...';

                try {
                    const res = await fetch('contact-handler.php', { method: 'POST', body: new FormData(form) });
                    const data = await res.json();
                    if (data.success) {
                        status.textContent = 'Vielen Dank! Nachricht gesendet.';
                        status.className = 'form-status success';
                        form.reset();
                    } else {
                        status.textContent = data.error || 'Fehler aufgetreten.';
                        status.className = 'form-status error';
                    }
                } catch {
                    status.textContent = 'Verbindungsfehler.';
                    status.className = 'form-status error';
                }

                btn.disabled = false;
                btn.textContent = 'Gespräch vereinbaren';
            });
        }
    };

    /* ========================================
       7. COOKIE BANNER
       ======================================== */
    const Cookie = {
        init() {
            if (localStorage.getItem('bline_cookie')) return;
            const banner = document.getElementById('cookie-banner');
            if (!banner) return;
            setTimeout(() => banner.classList.add('visible'), 1500);
            document.getElementById('cookie-accept').addEventListener('click', () => {
                localStorage.setItem('bline_cookie', 'true');
                banner.classList.remove('visible');
            });
        }
    };

    /* ========================================
       INIT
       ======================================== */
    const init = () => {
        Intro.init();
        HeroDive.init();
        Particles.init();
        Nav.init();
        Portfolio.init();
        Roadmap.init();
        Reveal.init();
        Contact.init();
        Cookie.init();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
