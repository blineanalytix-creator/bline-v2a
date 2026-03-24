/* ============================================
   B_LineGraphix V2 - Main JavaScript
   1:1 Rebuild mit sauberer Vanilla-Architektur
   ============================================ */
(function () {
    'use strict';

    /* Portfolio-Daten (aus content.js) */
    const PROJECTS = (typeof CONTENT !== 'undefined' && CONTENT.portfolio) ? CONTENT.portfolio.projects : [];

    /* ========================================
       1. HEADER (Dynamic Light/Dark)
       ======================================== */
    const Header = {
        el: null, isDark: false, isScrolled: false,

        init() {
            this.el = document.getElementById('header');
            if (!this.el) return;
            window.addEventListener('scroll', () => this.update(), { passive: true });
            this.update();
        },

        update() {
            const y = window.scrollY;
            this.isScrolled = y > 50;
            this.el.classList.toggle('scrolled', this.isScrolled);

            /* Detect if current viewport is over a dark section */
            const mid = y + window.innerHeight * 0.15;
            const hero = document.getElementById('hero');
            const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
            this.isDark = mid >= heroBottom;

            this.el.classList.toggle('dark', this.isDark);
            this.el.classList.toggle('light', !this.isDark);
        }
    };

    /* ========================================
       2. NAVIGATION
       ======================================== */
    const Navigation = {
        init() {
            this.setupMobile();
            this.setupSmooth();
            this.setupActive();
        },

        setupMobile() {
            const toggle = document.getElementById('mobile-toggle');
            const menu = document.getElementById('mobile-menu');
            const links = document.querySelectorAll('.mobile-menu-link');
            if (!toggle || !menu) return;

            const close = () => {
                menu.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            };

            toggle.addEventListener('click', () => {
                const open = menu.classList.toggle('active');
                toggle.setAttribute('aria-expanded', open);
                document.body.style.overflow = open ? 'hidden' : '';
            });

            links.forEach(l => l.addEventListener('click', close));
            document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        },

        setupSmooth() {
            document.querySelectorAll('a[href^="#"]').forEach(a => {
                a.addEventListener('click', e => {
                    const t = document.querySelector(a.getAttribute('href'));
                    if (!t) return;
                    e.preventDefault();
                    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });
        },

        setupActive() {
            const links = document.querySelectorAll('.nav-link[data-section]');
            const sections = [...links].map(l => document.getElementById(l.dataset.section)).filter(Boolean);
            const obs = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        links.forEach(l => l.classList.remove('active'));
                        const a = [...links].find(l => l.dataset.section === entry.target.id);
                        if (a) a.classList.add('active');
                    }
                });
            }, { rootMargin: '-40% 0px -40% 0px' });
            sections.forEach(s => obs.observe(s));
        }
    };

    /* ========================================
       3. HERO SCROLL LOCK + DIVE
       Exakt wie Original: Lock → Eintauchen →
       BG zoom+blur, Content fadeout, Overlay fadein,
       nach 2s instant scroll, unlock
       ======================================== */
    const HeroLock = {
        locked: false,
        isDiving: false,

        init() {
            /* Return-Visit: kein Lock, kein Button */
            if (sessionStorage.getItem('heroUnlocked') === 'true') {
                const wrap = document.getElementById('hero-cta-wrap');
                if (wrap) wrap.style.display = 'none';
                return;
            }

            this.locked = true;
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            const cta = document.getElementById('hero-cta');
            if (cta) {
                cta.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.dive();
                });
            }

            /* Block scroll events while locked */
            const block = (e) => { if (this.locked) { e.preventDefault(); e.stopPropagation(); return false; } };
            window.addEventListener('wheel', block, { passive: false });
            window.addEventListener('touchmove', block, { passive: false });
            window.addEventListener('keydown', (e) => {
                if (this.locked && ['ArrowDown','ArrowUp','Space','PageDown','PageUp','Home','End'].includes(e.key)) {
                    e.preventDefault();
                }
            });
        },

        dive() {
            if (!this.locked || this.isDiving) return;
            this.isDiving = true;

            const content = document.getElementById('hero-content');
            const bg = document.querySelector('.hero-bg');
            const overlay = document.getElementById('hero-dive-overlay');
            const cta = document.getElementById('hero-cta');

            /* Disable button */
            if (cta) cta.disabled = true;

            /* 1. Background: zoom in + blur (1.8s) */
            if (bg) {
                bg.style.transition = 'transform 1.8s cubic-bezier(0.25, 0.1, 0.25, 1), filter 1.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
                bg.style.transform = 'scale(1.5)';
                bg.style.filter = 'blur(20px)';
            }

            /* 2. Content: fade up and out (1s) */
            if (content) {
                content.style.transition = 'opacity 1s ease-in-out, transform 1s ease-in-out';
                content.style.opacity = '0';
                content.style.transform = 'translateY(-100px) scale(0.9)';
            }

            /* 3. Dark overlay: fade in (1.5s via CSS transition) */
            if (overlay) {
                overlay.classList.add('active');
            }

            /* 4. After 2000ms: instant scroll, unlock, cleanup */
            setTimeout(() => {
                const phil = document.getElementById('philosophy');
                if (phil) {
                    phil.scrollIntoView({ behavior: 'instant' });
                }

                sessionStorage.setItem('heroUnlocked', 'true');
                this.locked = false;
                this.isDiving = false;

                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';

                /* Remove overlay */
                if (overlay) {
                    overlay.classList.remove('active');
                    overlay.style.transition = 'none';
                    overlay.style.opacity = '0';
                }

                /* Hide dive button (already used) */
                const wrap = document.getElementById('hero-cta-wrap');
                if (wrap) wrap.style.display = 'none';

                /* Reset hero elements so they're visible when scrolling back */
                if (bg) {
                    bg.style.transition = '';
                    bg.style.transform = '';
                    bg.style.filter = '';
                }
                if (content) {
                    content.style.transition = '';
                    content.style.opacity = '';
                    content.style.transform = '';
                }
            }, 2000);
        }
    };

    /* ========================================
       4. SCROLL REVEAL
       ======================================== */
    const ScrollReveal = {
        init() {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const obs = new IntersectionObserver(entries => {
                entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
            }, { threshold: 0.1, rootMargin: '-40px' });
            document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
        }
    };

    /* ========================================
       5. PORTFOLIO SCROLL-DRIVEN (Desktop)
       ======================================== */
    const Portfolio = {
        container: null,
        isMobile: false,

        init() {
            this.isMobile = window.innerWidth <= 768;
            if (this.isMobile) {
                this.initMobile();
                return;
            }
            this.initDesktop();
        },

        initMobile() {
            const grid = document.getElementById('portfolio-mobile-grid');
            if (!grid) return;

            PROJECTS.forEach(p => {
                const card = document.createElement('div');
                card.className = 'portfolio-mobile-card reveal';
                card.setAttribute('data-reveal', '');
                card.innerHTML = `
                    <div class="portfolio-mobile-card-img"><img src="${p.image}" alt="${p.title}" loading="lazy"></div>
                    <div class="portfolio-mobile-card-body">
                        <span class="section-label" style="color: ${p.glowColor}">${p.category}</span>
                        <h3>${p.title}</h3>
                        <p>${p.description}</p>
                        <div class="portfolio-mobile-card-actions">
                            ${p.website ? `<a href="${p.website}" target="_blank" rel="noopener" class="portfolio-action-btn">Website</a>` : ''}
                            ${p.pdf ? `<a href="${p.pdf}" target="_blank" class="portfolio-action-btn">Case Study</a>` : ''}
                        </div>
                    </div>`;
                grid.appendChild(card);
            });
        },

        initDesktop() {
            this.container = document.getElementById('portfolio');
            if (!this.container) return;

            const count = PROJECTS.length;
            const scrollPerProject = 350; // vh
            this.container.style.height = (count * scrollPerProject) + 'vh';

            /* Create scenes */
            const scenesEl = document.getElementById('portfolio-scenes');
            PROJECTS.forEach((p, i) => {
                const scene = document.createElement('div');
                scene.className = 'portfolio-scene';
                scene.id = 'scene-' + i;
                scene.innerHTML = `
                    <div class="portfolio-card" data-el="card" data-project="${i}"><img src="${p.image}" alt="${p.title}"></div>
                    <div class="portfolio-info" data-el="info">
                        <span class="portfolio-info-category" style="color: ${p.glowColor}">${p.category}</span>
                        <h3 class="portfolio-info-title" data-el="title">${p.title}</h3>
                        <p class="portfolio-info-desc" data-el="desc">${p.description}</p>
                        <p class="portfolio-info-details" data-el="details">${p.details || ''}</p>
                        <div class="portfolio-info-actions" data-el="actions">
                            ${p.website ? `<a href="${p.website}" target="_blank" rel="noopener" class="portfolio-action-btn">Website</a>` : ''}
                            ${p.pdf ? `<a href="${p.pdf}" target="_blank" class="portfolio-action-btn">Case Study</a>` : ''}
                        </div>
                        <div class="portfolio-accent-line" data-el="accent" style="background: ${p.glowColor}"></div>
                    </div>`;
                scenesEl.appendChild(scene);
            });

            /* Skip dots */
            const skipEl = document.getElementById('portfolio-skip');
            PROJECTS.forEach((p, i) => {
                const dot = document.createElement('button');
                dot.className = 'skip-dot' + (i === 0 ? ' active' : '');
                dot.style.setProperty('--dot-color', p.glowColor);
                dot.setAttribute('aria-label', 'Projekt ' + (i + 1));
                dot.addEventListener('click', () => {
                    const top = this.container.offsetTop + (i * scrollPerProject / 100 * window.innerHeight) + window.innerHeight * 0.5;
                    window.scrollTo({ top, behavior: 'smooth' });
                });
                skipEl.appendChild(dot);
            });

            /* Scroll handler (RAF-based DOM manipulation) */
            const scenes = PROJECTS.map((_, i) => document.getElementById('scene-' + i));
            const headerEl = document.getElementById('portfolio-header');
            const hintEl = document.getElementById('portfolio-scroll-hint');
            const fillEl = document.getElementById('portfolio-progress-fill');
            const counterEl = document.getElementById('portfolio-counter');
            const titleEl = document.getElementById('portfolio-progress-title');
            const dots = skipEl.querySelectorAll('.skip-dot');

            const map = (v, a, b, c, d) => c + (Math.min(Math.max(v, a), b) - a) / (b - a) * (d - c);

            const onScroll = () => {
                const rect = this.container.getBoundingClientRect();
                const totalH = this.container.offsetHeight - window.innerHeight;
                const scrolled = -rect.top;
                const progress = Math.max(0, Math.min(1, scrolled / totalH));

                /* Which project? */
                const projF = progress * count;
                const projIdx = Math.min(Math.floor(projF), count - 1);
                const projProgress = projF - projIdx;

                /* Header fade */
                if (headerEl) headerEl.style.opacity = map(progress, 0, 0.04, 1, 0);
                if (hintEl) hintEl.style.opacity = progress < 0.02 ? 1 : 0;

                /* Progress bar */
                if (fillEl) fillEl.style.width = (progress * 100) + '%';
                if (counterEl) counterEl.textContent = String(projIdx + 1).padStart(2, '0') + ' / ' + String(count).padStart(2, '0');
                if (titleEl) titleEl.textContent = PROJECTS[projIdx].title;

                /* Skip dots */
                dots.forEach((d, i) => {
                    d.classList.toggle('active', i === projIdx);
                    d.style.background = i === projIdx ? PROJECTS[i].glowColor : '';
                    d.style.boxShadow = i === projIdx ? '0 0 10px ' + PROJECTS[i].glowColor + '40' : '';
                });

                /* Scene visibility */
                scenes.forEach((scene, i) => {
                    if (i !== projIdx) {
                        scene.style.opacity = '0';
                        scene.classList.remove('active');
                        return;
                    }
                    scene.classList.add('active');

                    const p = projProgress;
                    const enterOp = map(p, 0, 0.08, 0, 1);
                    const exitOp = map(p, 0.78, 0.95, 1, 0);
                    const sceneOp = Math.min(enterOp, exitOp);
                    scene.style.opacity = sceneOp;

                    const logoReveal = map(p, 0.06, 0.22, 0, 1);
                    const titleReveal = map(p, 0.18, 0.32, 0, 1);
                    const detailReveal = map(p, 0.28, 0.42, 0, 1);
                    const actionsReveal = map(p, 0.38, 0.48, 0, 1);

                    const cardEl = scene.querySelector('[data-el="card"]');
                    const titleElem = scene.querySelector('[data-el="title"]');
                    const descEl = scene.querySelector('[data-el="desc"]');
                    const detailsEl = scene.querySelector('[data-el="details"]');
                    const actionsEl = scene.querySelector('[data-el="actions"]');
                    const accentEl = scene.querySelector('[data-el="accent"]');
                    if (cardEl) { cardEl.style.opacity = logoReveal; cardEl.style.transform = `translateY(${(1 - logoReveal) * 30}px)`; }
                    if (titleElem) { titleElem.style.opacity = titleReveal; titleElem.style.transform = `translateY(${(1 - titleReveal) * 20}px)`; }
                    if (descEl) { descEl.style.opacity = detailReveal; descEl.style.transform = `translateY(${(1 - detailReveal) * 15}px)`; }
                    if (detailsEl) { detailsEl.style.opacity = detailReveal * 0.7; }
                    if (actionsEl) { actionsEl.style.opacity = actionsReveal; actionsEl.style.transform = `translateY(${(1 - actionsReveal) * 10}px)`; }
                    if (accentEl) { accentEl.style.opacity = detailReveal * 0.4; }
                });
            };

            window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
            onScroll();
        }
    };

    /* ========================================
       6. PARTICLE MORPH CANVAS
       ======================================== */
    const ParticleMorph = {
        canvas: null, ctx: null, nodes: [], flashes: [],
        width: 0, height: 0,
        fromIdx: 0, toIdx: 0, morphProgress: 0,
        formations: [],

        config: {
            nodeCount: 350,
            mobileNodeCount: 280,
            colors: { node: {r:255,g:255,b:255}, conn: {r:255,g:255,b:255}, flash: {r:255,g:255,b:255} }
        },

        mouseX: 0, mouseY: 0,

        init() {
            this.canvas = document.getElementById('particle-canvas');
            if (!this.canvas) return;
            this.isMobile = window.innerWidth <= 768;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { this.canvas.style.display = 'none'; return; }
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            this.formations = this.buildFormations();
            this.createNodes();
            this.setupScroll();
            this.animate();
            window.addEventListener('resize', () => this.handleResize());
            if (!this.isMobile) {
                window.addEventListener('mousemove', (e) => {
                    this.mouseX = (e.clientX / this.width - 0.5) * 2;
                    this.mouseY = (e.clientY / this.height - 0.5) * 2;
                });
            }

            /* Schmetterling-Bild vorladen für Partikel-Formation */
            const bflyImg = new Image();
            bflyImg.onload = () => {
                const off = document.createElement('canvas');
                const octx = off.getContext('2d');
                const sW = 300, sH = Math.round(300 * (bflyImg.naturalHeight / bflyImg.naturalWidth));
                off.width = sW; off.height = sH;
                octx.drawImage(bflyImg, 0, 0, sW, sH);
                const data = octx.getImageData(0, 0, sW, sH).data;
                const raw = [];
                let att = 0;
                while (raw.length < this.config.nodeCount * 2 && att < this.config.nodeCount * 80) {
                    att++;
                    const x = Math.random() * sW, y = Math.random() * sH;
                    const idx = (Math.floor(y) * sW + Math.floor(x)) * 4;
                    if (data[idx + 3] > 80) raw.push({ x: x / sW, y: y / sH });
                }
                this._butterflyPts = raw;
                /* Nur Formation 10 updaten (Schmetterling) */
                if (this.nodes.length > 0) {
                    const bPts = this.genButterfly(this.nodes.length);
                    this.nodes.forEach((node, i) => { if (bPts[i]) node.pos[10] = bPts[i]; });
                }
            };
            bflyImg.src = 'assets/images/schmetterling.png';
        },

        resize() {
            const dpr = this.isMobile ? 1 : (window.devicePixelRatio || 1);
            this.width = window.innerWidth;
            /* Mobile: use visualViewport if available (iOS-safe), freeze initial height */
            if (this.isMobile) {
                if (!this._initH) {
                    this._initH = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
                }
                this.height = this._initH;
            } else {
                this.height = window.innerHeight;
            }
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        },

        handleResize() {
            const nw = window.innerWidth;
            if (this.isMobile && Math.abs(nw - this.width) < 2) return;
            this.isMobile = nw <= 768;
            this.resize();
            this.nodes = []; this.flashes = [];
            this.formations = this.buildFormations();
            this.createNodes();
        },

        /* SVG Path Data für Projekt-Logos */
        CITECH_PATH: "M60.38,83.55c-7.62-0.01-10.47-0.47-16.03-6.1-2.89-2.97-6.31-5.74-8.07-9.57-1.22-2.7-1.15-5.81-1.12-8.74,0.08-3.86-0.12-7.83,1.85-11.1,1.41-2.39,3.48-4.3,5.44-6.23,2.8-2.66,5.69-5.61,9.58-6.49,4.3-0.93,9.1,0.28,13.4-1.2,14.28-4.02,16.96-23.87,4.22-31.45-3.68-2.26-8.28-3.18-12.49-2.37-7.55,1.27-13.57,7.83-14.29,15.45-0.43,3.45-0.12,7.07-1.6,10.24-1.34,2.98-3.95,5.41-6.32,7.73-2.84,2.73-5.83,5.72-9.75,6.56-2.01,0.47-4.17,0.41-6.31,0.43-3.99-0.02-7.94,0.8-11.25,3.1-11.19,7.27-9.8,24.87,2.41,30.23,1.26,0.58,2.58,1.01,3.92,1.29,4,0.9,8.35,0.02,12.2,1.5,4.38,1.74,7.52,5.7,10.88,8.93,4.8,4.77,5.71,7.9,5.67,14.55-0.08,9.53,6.92,17.59,16.56,18.15,8.38,0.61,16.36-5.21,18.15-13.38,2.73-10.9-5.94-21.48-16.99-21.53h-0.05Z",
        CITECH_W: 95, CITECH_H: 118,

        JANTZEN_PATH: "M25.94,954.66c36.06,30.32,84.43,42.65,130.79,43.25h.5c71.17,1.67,140.95-28.6,193.44-76.41,44.72-38.8,76.28-91.16,79.79-150.57,7.96-90.31-47.77-168.06-90.6-243.39-34.35-58.56-69.78-116.58-103.64-175.4-17.7-30.34-35.96-60.43-54.33-90.42-2.77-4.43-5.54-9.03-8.35-13.67-3.11-5.13-9.88-6.61-14.86-3.27-9.28,6.24-18.42,12.7-27.62,19.06-4.49,3.11-5.84,9.16-3.1,13.89,64.48,111.31,134.13,219.83,197.19,331.93,26.03,47.03,52.96,96.11,58.24,150.4,16.75,138.49-140.36,242.73-267.38,212.79-28.12-5.95-52.88-21.06-77.02-35.93-14.29-8.07-29.27-17.42-34.16-13.07-16.47,4.33,13.92,24.38,21.11,30.8Z M431.91,43.32C395.86,13,347.48.67,301.12.07h-.5c-71.17-1.67-140.95,28.6-193.44,76.41C62.46,115.29,30.9,167.65,27.39,227.05c-7.96,90.31,47.77,168.06,90.6,243.39,34.35,58.56,69.78,116.58,103.64,175.4,17.7,30.34,35.96,60.43,54.33,90.42,2.77,4.43,5.54,9.03,8.35,13.67,3.11,5.13,9.88,6.61,14.86,3.27,9.28-6.24,18.42-12.7,27.62-19.06,4.49-3.11,5.84-9.16,3.1-13.89-64.48-111.31-134.13-219.83-197.19-331.93-26.03-47.03-52.96-96.11-58.24-150.4C57.71,99.43,214.81-4.81,341.84,25.13c28.12,5.95,52.88,21.06,77.02,35.93,14.29,8.07,29.27,17.42,34.16,13.07,2.83-8.64-13.92-24.38-21.11-30.8Z",
        JANTZEN_W: 453.34, JANTZEN_H: 997.98,

        buildFormations() {
            const m = this.isMobile;
            const ps = { alpha: 0.55, flashRate: 0.016, connDist: m ? 65 : 75, nodeR: 2.0, lineW: 0.6 };
            return [
                /* 0 */ { gen: 'genOrigin',      alpha: 0.0, flashRate: 0, connDist: 0, nodeR: 0.8, lineW: 0.2 },
                /* 1 */ { gen: 'genIcosahedron',  alpha: 0.50, flashRate: 0.016, connDist: m ? 70 : 80, nodeR: 2.0, lineW: 0.55 },
                /* 2 */ { gen: 'genCitech',       ...ps },
                /* 3 */ { gen: 'genWegweiser',    ...ps },
                /* 4 */ { gen: 'genJantzen',      ...ps },
                /* 5 */ { gen: 'genSun',          ...ps },
                /* 6 */ { gen: 'genTextBLINE',    alpha: 0.40, flashRate: 0.010, connDist: m ? 55 : 58, nodeR: 1.6, lineW: 0.45 },
                /* 7-10: Roadmap Metamorphose (Kokon → Schmetterling) */
                /* 7 */  { gen: 'genCocoon',       alpha: 0.35, flashRate: 0.010, connDist: m ? 40 : 55, nodeR: 1.6, lineW: 0.45 },
                /* 8 */  { gen: 'genCocoonOpen',   alpha: 0.38, flashRate: 0.012, connDist: m ? 48 : 68, nodeR: 1.8, lineW: 0.50 },
                /* 9 */  { gen: 'genWings',        alpha: 0.42, flashRate: 0.014, connDist: m ? 55 : 82, nodeR: 1.9, lineW: 0.55 },
                /* 10 */ { gen: 'genButterfly',    alpha: 0.50, flashRate: 0.018, connDist: m ? 62 : 95, nodeR: 2.1, lineW: 0.60 },
                /* 11: Kontakt (Hi.) */
                /* 11 */ { gen: 'genTextHi',       alpha: 0.30, flashRate: 0.008, connDist: m ? 35 : 50, nodeR: 1.4, lineW: 0.4 }
            ];
        },

        /* FORMATIONS */
        genOrigin(n) {
            /* Logo-Form: Partikel formen ein "B" in der Mitte des Hero
               (dort wo das echte Logo steht) → morpht dann zum Ikosaeder */
            return this._textPts(n, 'B');
        },

        genIcosahedron(n) {
            const m = this.isMobile;
            /* Position: direkt über der Schnittkante des Kopfes der Frau */
            const cx = this.width * (m ? 0.50 : 0.82);
            const cy = this.height * (m ? 0.30 : 0.29);
            /* Etwas kleiner – schwebt knapp über dem offenen Kopf */
            const sc = this.height * (m ? 0.10 : 0.15);

            const phi = (1+Math.sqrt(5))/2;
            const verts = [[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]];
            /* Rotationswinkel so gewählt dass keine Seite "leer" wirkt */
            const ay=-0.25, ax=0.35, ca=Math.cos(ay), sa=Math.sin(ay), cb=Math.cos(ax), sb=Math.sin(ax);
            const proj = verts.map(v => {
                const l = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
                let x=v[0]/l, y=v[1]/l, z=v[2]/l;
                const rx=x*ca-z*sa; const rz=x*sa+z*ca; x=rx; z=rz;
                const ry=y*cb-z*sb; z=y*sb+z*cb; y=ry;
                return {x: cx+x*sc, y: cy+y*sc};
            });
            const edges=[[0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],[2,3],[2,4],[2,6],[2,10],[2,11],[3,4],[3,6],[3,8],[3,9],[4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],[7,8],[7,10],[8,9],[10,11]];
            const p = [];
            /* Mehr Punkte pro Kante für dichteres Wireframe-Gefühl */
            const perEdge = Math.floor(n * 0.75 / edges.length);
            edges.forEach(([a,b]) => {
                for(let i=0; i<perEdge; i++){
                    const t = Math.random();
                    /* Weniger Noise auf den Kanten = klarere Wireframe-Linien */
                    p.push({
                        x: proj[a].x+(proj[b].x-proj[a].x)*t + (Math.random()-0.5)*2,
                        y: proj[a].y+(proj[b].y-proj[a].y)*t + (Math.random()-0.5)*2
                    });
                }
            });
            /* Rest: lockere Punkte rund um die Vertices (wie schwebende Partikel) */
            while(p.length < n){
                const v = proj[Math.floor(Math.random()*12)];
                const spread = sc * 0.15;
                p.push({
                    x: v.x + (Math.random()-0.5) * spread,
                    y: v.y + (Math.random()-0.5) * spread
                });
            }
            return p;
        },

        genScatter(n) {
            const p = [];
            while(p.length<n) p.push({x: Math.random()*this.width, y: Math.random()*this.height});
            return p;
        },

        /* Portfolio Projekt-Logo Formationen */
        genCitech(n) {
            return this._sampleSvgPath(n, this.CITECH_PATH, this.CITECH_W, this.CITECH_H);
        },

        genWegweiser(n) {
            /* Wegweiser-Kompass aus der kleinen 1.3KB Bildmarke-SVG */
            const pathData = "M1697.92,742.05l-368.07,169.31c-9.93,4.57-13.78,16.68-8.32,26.14l18.93,32.79c5.46,9.46,17.88,12.18,26.8,5.87l330.66-234.1Z M2090.75,1950.35h282.61c16.36,0,29.12,14.1,27.6,30.39-42.92,457.78-429.27,817.76-899.53,817.76-500.41,0-904.7-404.29-904.7-904.7,0-53.98,3.58-90.07,7.89-111.11,1.67-8.17,6.98-15.13,14.39-18.97l330.78-171.43c19.21-9.96,20.11-37.09,1.61-48.31-198.48-120.37-326.4-324.7-326.4-583.15,0-421.25,342.09-763.34,763.34-763.34,213.08,0,407.68,87.1,545.55,228.16,8.6,8.8,21.99,10.83,32.84,5.03l395.79-211.41c18.47-9.86,40.78,3.52,40.78,24.45v273.63c0,10.2-5.61,19.58-14.59,24.41l-264.04,141.98c-11.95,6.43-17.48,20.56-13.09,33.4,26.02,76.03,40.1,158.68,40.1,243.67,0,159.32-46.98,313.11-149.12,436.78-2.33,2.82-5.21,5.13-8.45,6.83l-1041.13,545.49c-10.4,5.45-16.2,16.84-14.58,28.47,39.69,284.55,281.09,503.46,563.04,503.46s513.58-217.36,561.98-508.28c2.23-13.39,13.77-23.23,27.35-23.23Z M1317.9,1403.05l446.68-228.79c5.41-2.77,9.78-7.23,12.38-12.72,28.46-60.11,43.93-127.84,43.93-200.72,0-248.79-192.25-449.52-432.56-449.52s-432.56,200.73-432.56,449.52c0,216.91,147.71,401,343.59,444.64,6.27,1.4,12.83.51,18.55-2.42Z";
            return this._sampleSvgPath(n, pathData, 3000, 2998);
        },

        genJantzen(n) {
            return this._sampleSvgPath(n, this.JANTZEN_PATH, this.JANTZEN_W, this.JANTZEN_H);
        },

        genSun(n) {
            const cx = this.width * 0.5, cy = this.height * 0.48;
            const m = this.isMobile;
            const innerR = this.height * (m ? 0.08 : 0.12);
            const outerR = this.height * (m ? 0.18 : 0.26);
            const rayCount = 12, rayWidth = 0.04, p = [];
            while (p.length < n) {
                const a = Math.random() * Math.PI * 2, r = Math.random();
                if (r < 0.45) {
                    const d = Math.sqrt(Math.random()) * innerR;
                    p.push({ x: cx+Math.cos(a)*d, y: cy+Math.sin(a)*d }); continue;
                }
                const ra = (Math.PI*2)/rayCount;
                const nr = Math.round(a/ra)*ra;
                if (Math.abs(a-nr) < rayWidth) {
                    const d = innerR+Math.random()*(outerR-innerR);
                    const sp = (1-(d-innerR)/(outerR-innerR))*innerR*0.3;
                    const off = (Math.random()-0.5)*sp;
                    p.push({ x: cx+Math.cos(nr)*d+(-Math.sin(nr)*off), y: cy+Math.sin(nr)*d+(Math.cos(nr)*off) });
                }
            }
            return p.slice(0, n);
        },

        /* Metamorphose-Formationen (Kokon → Schmetterling) */

        /* Step 1: Kompakter Kokon – dichter, vertikaler Cluster */
        genCocoon(n) {
            const cx = this.width * 0.5, cy = this.height * 0.48;
            const rX = this.height * 0.04, rY = this.height * 0.12;
            const pts = [];
            while (pts.length < n) {
                const a = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random());
                pts.push({ x: cx + Math.cos(a) * rX * r, y: cy + Math.sin(a) * rY * r });
            }
            return pts;
        },

        /* Step 2: Kokon öffnet sich – breiter, leicht horizontal */
        genCocoonOpen(n) {
            const cx = this.width * 0.5, cy = this.height * 0.48;
            const rX = this.height * 0.10, rY = this.height * 0.10;
            const pts = [];
            while (pts.length < n) {
                const a = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random());
                /* Leichte Flügel-Andeutung: links und rechts etwas breiter */
                const wingBoost = 1 + Math.abs(Math.cos(a)) * 0.5;
                pts.push({ x: cx + Math.cos(a) * rX * r * wingBoost, y: cy + Math.sin(a) * rY * r });
            }
            return pts;
        },

        /* Step 3: Flügel formen sich – deutliche Schmetterlingssilhouette */
        genWings(n) {
            const cx = this.width * 0.5, cy = this.height * 0.48;
            const wingW = this.height * 0.22, wingH = this.height * 0.15;
            const pts = [];
            while (pts.length < n) {
                const side = Math.random() < 0.5 ? -1 : 1;
                /* Flügelform: Ellipse die oben breiter ist */
                const a = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random());
                const wx = wingW * 0.5 * r;
                const wy = wingH * r * (0.5 + Math.abs(Math.sin(a)) * 0.5);
                const px = cx + side * (wingW * 0.15 + wx * Math.abs(Math.cos(a)));
                const py = cy + Math.sin(a) * wy * 0.7;
                pts.push({ x: px, y: py });
            }
            return pts;
        },

        /* Step 4: Voller Schmetterling – aus Bild gesampled */
        genButterfly(n) {
            if (this._butterflyPts && this._butterflyPts.length > 0) {
                const m = this.isMobile;
                const dispH = this.height * (m ? 0.35 : 0.50);
                const dispW = dispH * 1.4; /* Schmetterling ist breiter als hoch */
                const ox = (this.width - dispW) / 2;
                const oy = (this.height - dispH) / 2;
                const pts = [];
                for (let i = 0; i < n; i++) {
                    const src = this._butterflyPts[i % this._butterflyPts.length];
                    pts.push({ x: ox + src.x * dispW, y: oy + src.y * dispH });
                }
                return pts;
            }
            /* Fallback: Flügel-Form */
            return this.genWings(n);
        },

        genTextBLINE(n) {
            /* Ungeordneter Nebel an der About-Logo-Position */
            const m = this.isMobile;
            const siteW = Math.min(this.width, 1440);
            const siteOffset = (this.width - siteW) / 2;
            const colW = siteW * (5 / 12);
            const cx = m ? this.width * 0.5 : siteOffset + colW * 0.5;
            const cy = this.height * 0.48;
            const spreadX = this.height * 0.22;
            const spreadY = this.height * 0.18;
            const pts = [];
            while (pts.length < n) {
                /* Unregelmäßige Verteilung - nicht kreisförmig */
                const x = cx + (Math.random() - 0.5) * spreadX * 2 * (0.5 + Math.random() * 0.5);
                const y = cy + (Math.random() - 0.5) * spreadY * 2 * (0.3 + Math.random() * 0.7);
                pts.push({ x, y });
            }
            return pts;
        },
        genTextHi(n) { return this._textPts(n, 'Hi.'); },

        /* SVG Path Sampling Helper */
        _sampleSvgPath(n, pathData, svgW, svgH) {
            const path = new Path2D(pathData);
            const m = this.isMobile;
            const targetH = this.height * (m ? 0.35 : 0.5);
            const scale = targetH / svgH;
            const oX = (this.width - svgW * scale) / 2;
            const oY = (this.height - svgH * scale) / 2;
            const bW = svgW * scale, bH = svgH * scale;
            const pts = [];
            let att = 0;
            while (pts.length < n && att < n * 40) {
                att++;
                const px = oX + Math.random() * bW, py = oY + Math.random() * bH;
                this.ctx.save(); this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                const inside = this.ctx.isPointInPath(path, (px - oX) / scale, (py - oY) / scale);
                this.ctx.restore();
                const dpr = this.isMobile ? Math.min(window.devicePixelRatio || 1, 1.5) : (window.devicePixelRatio || 1);
                this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                if (inside) pts.push({ x: px, y: py });
            }
            const cx = oX + bW * 0.5, cy = oY + bH * 0.5;
            while (pts.length < n) { const a = Math.random()*Math.PI*2, r = Math.sqrt(Math.random()); pts.push({x: cx+Math.cos(a)*bW*0.3*r, y: cy+Math.sin(a)*bH*0.3*r}); }
            return pts.slice(0, n);
        },

        genSteps(n) {
            const m = this.isMobile;
            const tw = this.width*(m?0.7:0.38), th = this.height*(m?0.25:0.4);
            const cx = this.width*0.5, by = this.height*0.5+th*0.4;
            const sw = tw/4, g = sw*0.14, sx = cx-tw/2, p = [];
            while(p.length<n){const s=Math.floor(Math.random()*4), sH=th*(0.35+s*0.2); p.push({x: sx+s*sw+g+Math.random()*(sw-g*2), y: by-sH+Math.random()*sH});}
            return p;
        },

        _textPts(n, text) {
            const off = document.createElement('canvas'), octx = off.getContext('2d');
            off.width = this.width; off.height = this.height;
            const m = this.isMobile;
            const fs = text.length<=3 ? this.height*(m?0.3:0.45) : this.height*(m?0.12:0.18);
            octx.font = '700 '+fs+'px Inter, sans-serif';
            octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillStyle = '#fff';
            octx.fillText(text, this.width*0.5, this.height*(m?0.35:0.47));
            const d = octx.getImageData(0,0,off.width,off.height).data, pts = [];
            let att = 0;
            while(pts.length<n && att<n*40){att++; const x=Math.random()*this.width, y=Math.random()*this.height; if(d[(Math.floor(y)*off.width+Math.floor(x))*4+3]>128) pts.push({x,y});}
            const cx=this.width*0.5, cy=this.height*0.45, r=this.height*0.18;
            while(pts.length<n){const a=Math.random()*Math.PI*2, d2=Math.sqrt(Math.random()); pts.push({x:cx+Math.cos(a)*r*d2, y:cy+Math.sin(a)*r*0.6*d2});}
            return pts;
        },

        /* SCROLL – manuelle Anchors mit Portfolio-Sub-Positionen */
        setupScroll() {
            const H = this.height;
            const update = () => {
                const hero = document.querySelector('#hero');
                const phil = document.querySelector('#philosophy');
                const port = document.querySelector('#portfolio');
                const about = document.querySelector('#about');
                const road = document.querySelector('#roadmap');
                const cont = document.querySelector('#kontakt');
                if (!hero || !phil) return;

                const vy = window.scrollY + H * 0.4;
                const anchors = [];

                /* 0: Hero (B-Logo) */
                anchors.push(hero.offsetTop + hero.offsetHeight * 0.90);
                /* 1: Philosophy (Ikosaeder) */
                anchors.push(phil.offsetTop + phil.offsetHeight * 0.36);

                /* 2-5: Portfolio Projekte (4 Sub-Anchors) */
                /* Mobile: #portfolio is display:none, use #portfolio-mobile instead */
                const portEl = (port && port.offsetHeight > 0) ? port : document.querySelector('#portfolio-mobile');
                if (portEl) {
                    const pt = portEl.offsetTop, ph = portEl.offsetHeight;
                    const perProj = ph / 4;
                    for (let i = 0; i < 4; i++) {
                        anchors.push(pt + perProj * i + perProj * 0.4);
                    }
                }

                /* 6: About (B_LINE) – späterer Anchor damit Netzwerk länger unterwegs ist */
                if (about) anchors.push(about.offsetTop + about.offsetHeight * 0.7);
                /* 7-10: Roadmap Metamorphose (4 Sub-Anchors) */
                if (road) {
                    const rt = road.offsetTop, rh = road.offsetHeight;
                    const perStep = rh / 4;
                    for (let i = 0; i < 4; i++) {
                        anchors.push(rt + perStep * i + perStep * 0.5);
                    }
                }
                /* 11: Kontakt (Hi.) */
                if (cont) anchors.push(cont.offsetTop + cont.offsetHeight * 0.4);

                if (vy <= anchors[0]) { this.fromIdx=0; this.toIdx=0; this.morphProgress=0; return; }
                if (vy >= anchors[anchors.length-1]) { this.fromIdx=anchors.length-1; this.toIdx=this.fromIdx; this.morphProgress=0; return; }
                for (let i=0; i<anchors.length-1; i++) {
                    if (vy>=anchors[i] && vy<anchors[i+1]) { this.fromIdx=i; this.toIdx=i+1; this.morphProgress=(vy-anchors[i])/(anchors[i+1]-anchors[i]); return; }
                }
            };
            window.addEventListener('scroll', update, { passive: true });
            update();
        },

        /* NODES */
        createNodes() {
            const n = this.isMobile ? this.config.mobileNodeCount : this.config.nodeCount;
            const posArrays = this.formations.map(f => this[f.gen](n));
            const count = Math.min(...posArrays.map(a => a.length));
            for (let i=0; i<count; i++) {
                this.nodes.push({ pos: posArrays.map(a => a[i]), x: posArrays[0][i].x, y: posArrays[0][i].y, brightness: 0, morphOffset: Math.random()*0.12 });
            }
        },

        easeInOutCubic(t) { return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; },
        lerp(a,b,t) { return a+(b-a)*t; },

        /* RENDER */
        animate() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            const fi=this.fromIdx, ti=this.toIdx, rawP=this.morphProgress, c=this.config.colors;
            const fA=this.formations[fi], fB=this.formations[ti];
            const p = this.easeInOutCubic(rawP);
            const alpha = this.lerp(fA.alpha, fB.alpha, p);
            const connDist = this.lerp(fA.connDist, fB.connDist, p);
            const flashRate = this.lerp(fA.flashRate, fB.flashRate, p);
            const nodeR = this.lerp(fA.nodeR, fB.nodeR, p);
            const lineW = this.lerp(fA.lineW, fB.lineW, p);

            /* Interpolate (Basis) – wird vom Drift-Block ggf. überschrieben */
            if (alpha <= 0.05) {
                this.nodes.forEach(node => {
                    const from=node.pos[fi], to=node.pos[ti];
                    const np = Math.max(0, Math.min(1, (rawP-node.morphOffset)/(1-node.morphOffset*0.8)));
                    const ep = this.easeInOutCubic(np);
                    node.x = from.x+(to.x-from.x)*ep; node.y = from.y+(to.y-from.y)*ep;
                });
            }

            /* Lebendiger Polyeder: stabile Form + langsame Partikel-Emission */
            if (alpha > 0.05) {
                const t = Date.now() * 0.001;
                /* Sehr langsames Atmen (~8 Sekunden pro Zyklus) */
                const breathe = 1.0 + Math.sin(t * 0.4) * 0.035;

                this.nodes.forEach((n, i) => {
                    const from = n.pos[fi], to = n.pos[ti];
                    const np = Math.max(0, Math.min(1, (rawP - n.morphOffset) / (1 - n.morphOffset * 0.8)));
                    const ep = this.easeInOutCubic(np);
                    const baseX = from.x + (to.x - from.x) * ep;
                    const baseY = from.y + (to.y - from.y) * ep;

                    /* ~75% der Punkte: stabile Kanten (sehr sanftes Atmen + minimaler Drift) */
                    if (i < this.nodes.length * 0.75) {
                        const fcx = from.x, fcy = from.y;
                        const dx = baseX - fcx, dy = baseY - fcy;
                        n.x = fcx + dx * breathe + Math.sin(t * 0.15 + i * 2.1) * 0.6;
                        n.y = fcy + dy * breathe + Math.cos(t * 0.12 + i * 1.8) * 0.6;
                    } else {
                        /* ~25%: Emission – LANGSAM nach außen driften (~7s pro Zyklus) */
                        const fcx = from.x, fcy = from.y;
                        const dx = baseX - fcx, dy = baseY - fcy;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        const dirX = dx / dist, dirY = dy / dist;

                        const cycle = ((t * 0.14 + i * 0.37) % 1);
                        const emitDist = cycle * 20;
                        const emitFade = cycle < 0.75 ? 1 : 1 - (cycle - 0.75) / 0.25;

                        n.x = baseX + dirX * emitDist + Math.sin(t * 0.2 + i * 3.1) * 1.2;
                        n.y = baseY + (dirY * emitDist - emitDist * 0.4) + Math.cos(t * 0.18 + i * 2.7) * 1.2;
                        n._emitFade = emitFade;
                    }
                });

                /* Linien-Puls auch langsamer */
                this._breatheAlpha = 0.88 + Math.sin(t * 0.4) * 0.12;
            } else {
                this._breatheAlpha = 1.0;
            }

            /* Flashes */
            if (Math.random()<flashRate && this.nodes.length>0) {
                const r = this.isMobile ? 40+Math.random()*30 : 60+Math.random()*50;
                this.flashes.push({idx:Math.floor(Math.random()*this.nodes.length), radius:r, intensity:0.3+Math.random()*0.5, age:0, maxAge:80+Math.random()*60});
            }
            for(let i=this.flashes.length-1;i>=0;i--) { if(++this.flashes[i].age>=this.flashes[i].maxAge) this.flashes.splice(i,1); }
            this.nodes.forEach(n=>{n.brightness=0;});
            this.flashes.forEach(f => {
                const o=this.nodes[f.idx]; if(!o) return;
                const fade=1-f.age/f.maxAge;
                this.nodes.forEach(n => {const dx=n.x-o.x,dy=n.y-o.y,d=Math.sqrt(dx*dx+dy*dy); if(d<f.radius) n.brightness=Math.max(n.brightness,(1-d/f.radius)*fade*f.intensity);});
            });

            /* Connections – mit Breathe-Puls */
            const ba = this._breatheAlpha || 1.0;
            if (connDist > 0) {
                const cd2=connDist*connDist;
                this.ctx.lineWidth=lineW;
                for(let i=0;i<this.nodes.length;i++){const a=this.nodes[i]; for(let j=i+1;j<this.nodes.length;j++){const b=this.nodes[j],dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy; if(d2>=cd2) continue; const d=Math.sqrt(d2),fade=1-d/connDist,la=(alpha*0.4+Math.max(a.brightness,b.brightness)*0.5)*fade*ba; this.ctx.beginPath();this.ctx.moveTo(a.x,a.y);this.ctx.lineTo(b.x,b.y);this.ctx.strokeStyle=`rgba(${c.conn.r},${c.conn.g},${c.conn.b},${la})`;this.ctx.stroke();}}
            }

            /* Nodes */
            this.nodes.forEach(n => {
                const emitFade = n._emitFade !== undefined ? n._emitFade : 1.0;
                const na = (alpha + n.brightness * 0.6) * emitFade;
                const r = nodeR + n.brightness * 1.5;
                this.ctx.beginPath(); this.ctx.arc(n.x,n.y,r,0,Math.PI*2);
                this.ctx.fillStyle=`rgba(${c.node.r},${c.node.g},${c.node.b},${na})`;
                this.ctx.fill();
                if(n.brightness>0.2){this.ctx.beginPath();this.ctx.arc(n.x,n.y,r*3.5,0,Math.PI*2);this.ctx.fillStyle=`rgba(${c.flash.r},${c.flash.g},${c.flash.b},${n.brightness*0.1*emitFade})`;this.ctx.fill();}
                n._emitFade = undefined; /* Reset für nächsten Frame */
            });

            /* Maus-Parallax: gesamtes Netzwerk reagiert subtil auf Mausposition */
            if (!this.isMobile && (this.mouseX || this.mouseY)) {
                const px = this.mouseX * 8, py = this.mouseY * 6;
                this.nodes.forEach(n => { n.x += px; n.y += py; });
            }

            /* ── POLYEDER GLOW EFFECTS (nur wenn Ikosaeder-Formation aktiv) ── */
            if ((fi === 1 || ti === 1) && alpha > 0.1 && !this.isMobile) {
                const t = Date.now() * 0.001;
                const glowAlpha = fi === 1 && ti === 1 ? alpha : alpha * (fi === 1 ? (1 - p) : p);

                /* Ikosaeder-Vertices finden (die ersten 12 Knoten sind die Vertices) */
                const vertCount = Math.min(12, this.nodes.length);

                for (let i = 0; i < vertCount; i++) {
                    const v = this.nodes[i];

                    /* 1. Vertex-Glow: weicher Halo um jeden Vertex */
                    const glowR = 12 + Math.sin(t * 0.6 + i * 0.5) * 4;
                    const grad = this.ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, glowR);
                    grad.addColorStop(0, `rgba(255,255,255,${glowAlpha * 0.35})`);
                    grad.addColorStop(0.4, `rgba(200,220,255,${glowAlpha * 0.12})`);
                    grad.addColorStop(1, 'rgba(200,220,255,0)');
                    this.ctx.beginPath();
                    this.ctx.arc(v.x, v.y, glowR, 0, Math.PI * 2);
                    this.ctx.fillStyle = grad;
                    this.ctx.fill();

                    /* 2. Heller Vertex-Punkt */
                    this.ctx.beginPath();
                    this.ctx.arc(v.x, v.y, 2.5, 0, Math.PI * 2);
                    this.ctx.fillStyle = `rgba(255,255,255,${glowAlpha * 0.9})`;
                    this.ctx.fill();

                    /* 3. Ausstrahlende Linie von jedem Vertex nach außen */
                    const formations = this.formations[1]; /* Ikosaeder-Formation */
                    const basePos = v.pos ? v.pos[1] : null;
                    if (basePos) {
                        /* Richtung = vom Zentrum weg */
                        const cx = this.width * 0.82, cy = this.height * 0.29;
                        const dx = basePos.x - cx, dy = basePos.y - cy;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        const dirX = dx / dist, dirY = dy / dist;

                        /* Linie mit pulsierender Länge */
                        const rayLen = 15 + Math.sin(t * 0.9 + i * 0.8) * 10;
                        const endX = v.x + dirX * rayLen;
                        const endY = v.y + dirY * rayLen;

                        this.ctx.beginPath();
                        this.ctx.moveTo(v.x, v.y);
                        this.ctx.lineTo(endX, endY);
                        this.ctx.strokeStyle = `rgba(255,255,255,${glowAlpha * 0.15})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();

                        /* Dot am Ende der Linie */
                        this.ctx.beginPath();
                        this.ctx.arc(endX, endY, 1.5, 0, Math.PI * 2);
                        this.ctx.fillStyle = `rgba(255,255,255,${glowAlpha * 0.4})`;
                        this.ctx.fill();
                    }
                }
            }

            requestAnimationFrame(() => this.animate());
        }
    };

    /* ========================================
       7. LIVING NETWORK (Portfolio BG)
       ======================================== */
    const LivingNetwork = {
        canvas: null, ctx: null, nodes: [],
        width: 0, height: 0, lastScrollY: 0,

        init() {
            this.canvas = document.getElementById('living-network-canvas');
            if (!this.canvas) return;
            if (window.innerWidth <= 768) return; /* Mobile: kein LN im Portfolio */
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            this.createNodes(55);
            this._visible = true; /* Sofort starten, Observer übernimmt */
            this.animate();
            window.addEventListener('resize', () => this.resize());

            const obs = new IntersectionObserver(entries => {
                this._visible = entries[0].isIntersecting;
            }, { threshold: 0.01 });
            obs.observe(this.canvas.parentElement || this.canvas);
        },

        resize() {
            const dpr = Math.min(window.devicePixelRatio||1, 2);
            this.width = this.canvas.parentElement.offsetWidth || window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width*dpr; this.canvas.height = this.height*dpr;
            this.canvas.style.width = this.width+'px'; this.canvas.style.height = this.height+'px';
            this.ctx.setTransform(dpr,0,0,dpr,0,0);
        },

        createNodes(n) {
            for(let i=0;i<n;i++){
                this.nodes.push({x:Math.random()*this.width, y:Math.random()*this.height, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, r:1+Math.random()*1.5, phase:Math.random()*Math.PI*2});
            }
        },

        animate() {
            if (!this._visible) { requestAnimationFrame(()=>this.animate()); return; }
            this.ctx.clearRect(0,0,this.width,this.height);
            const now = Date.now();
            const scrollDelta = (window.scrollY - this.lastScrollY) / this.height;
            this.lastScrollY = window.scrollY;

            this.nodes.forEach(n => {
                n.x += n.vx + Math.sin(now*0.0003+n.phase)*0.15;
                n.y += n.vy + Math.cos(now*0.0002+n.phase)*0.1 - scrollDelta*this.height*0.3;
                if(n.x<-20) n.x=this.width+20; if(n.x>this.width+20) n.x=-20;
                if(n.y<-20) n.y=this.height+20; if(n.y>this.height+20) n.y=-20;
            });

            /* Connections */
            const cd=120;
            this.ctx.lineWidth=0.5;
            for(let i=0;i<this.nodes.length;i++){const a=this.nodes[i]; for(let j=i+1;j<this.nodes.length;j++){const b=this.nodes[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy); if(d<cd){this.ctx.beginPath();this.ctx.moveTo(a.x,a.y);this.ctx.lineTo(b.x,b.y);this.ctx.strokeStyle=`rgba(255,255,255,${(1-d/cd)*0.08})`;this.ctx.stroke();}}}

            /* Nodes */
            this.nodes.forEach(n => {
                const pulse = 0.5+Math.sin(now*0.002+n.phase)*0.5;
                this.ctx.beginPath(); this.ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
                this.ctx.fillStyle=`rgba(255,255,255,${0.08+pulse*0.06})`;
                this.ctx.fill();
            });

            requestAnimationFrame(()=>this.animate());
        }
    };

    /* ========================================
       7b. ROADMAP SCROLL-DRIVEN
       ======================================== */
    const Roadmap = {
        steps: [
            { number: '01', label: 'Schritt 01', title: 'Kennenlernen', desc: 'Kostenloses Erstgespräch: Wir klären Ihre Ziele, Zielgruppe und was Ihr Auftritt bewirken soll.' },
            { number: '02', label: 'Schritt 02', title: 'Strategie', desc: 'Sie erhalten ein klares Konzept mit Moodboard und Richtung – bevor ein Pixel gestaltet wird.' },
            { number: '03', label: 'Schritt 03', title: 'Umsetzung', desc: 'Transparenter Prozess mit Zwischenpräsentationen. Sie sehen jeden Schritt und geben Feedback.' },
            { number: '04', label: 'Schritt 04', title: 'Übergabe', desc: 'Alle Dateien in allen Formaten, plus Styleguide für konsistente Anwendung. Sofort einsatzbereit.' },
        ],

        init() {
            if (window.innerWidth <= 768) { this.initMobile(); return; }
            this.initDesktop();
        },

        initMobile() {
            /* Mobile: einfache Card-Liste */
            const container = document.getElementById('roadmap');
            if (!container) return;
            const scenes = document.getElementById('roadmap-scenes');
            const dots = document.getElementById('roadmap-dots');
            const header = document.getElementById('roadmap-header');
            if (scenes) scenes.remove();
            if (dots) dots.remove();
            if (header) header.style.position = 'relative';

            const grid = document.createElement('div');
            grid.style.cssText = 'display:grid;grid-template-columns:1fr;gap:1.5rem;padding:2rem 0;';
            grid.className = 'site-container';

            this.steps.forEach((s, i) => {
                const card = document.createElement('div');
                card.className = 'reveal';
                card.setAttribute('data-reveal', '');
                card.style.cssText = 'padding:1.5rem;border:1px solid rgba(255,255,255,0.06);border-radius:16px;background:rgba(255,255,255,0.02);';
                card.innerHTML = `<span style="font-size:2.5rem;font-weight:200;color:rgba(255,255,255,0.1);line-height:1;display:block;margin-bottom:0.5rem;">${s.number}</span><h3 style="color:#fff;margin-bottom:0.5rem;">${s.title}</h3><p style="color:rgba(255,255,255,0.5);font-size:0.875rem;line-height:1.8;">${s.desc}</p>`;
                grid.appendChild(card);
            });

            container.querySelector('.roadmap-sticky').style.position = 'relative';
            container.querySelector('.roadmap-sticky').style.height = 'auto';
            container.querySelector('.roadmap-sticky').appendChild(grid);
        },

        initDesktop() {
            const container = document.getElementById('roadmap');
            if (!container) return;

            const count = this.steps.length;
            container.style.height = (count * 250) + 'vh';

            const scenesEl = document.getElementById('roadmap-scenes');
            const dotsEl = document.getElementById('roadmap-dots');

            /* Scenes erstellen */
            this.steps.forEach((s, i) => {
                const scene = document.createElement('div');
                scene.className = 'roadmap-scene';
                scene.id = 'roadmap-scene-' + i;
                scene.setAttribute('data-side', i % 2 === 0 ? 'left' : 'right');
                scene.innerHTML = `
                    <div class="roadmap-scene-card" data-el="card">
                        <span class="roadmap-scene-number">${s.number}</span>
                        <span class="roadmap-scene-label">${s.label}</span>
                        <h3>${s.title}</h3>
                        <p>${s.desc}</p>
                    </div>`;
                scenesEl.appendChild(scene);
            });

            /* Dots */
            this.steps.forEach((s, i) => {
                const dot = document.createElement('button');
                dot.className = 'roadmap-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Schritt ' + (i + 1));
                dotsEl.appendChild(dot);
            });

            const scenes = this.steps.map((_, i) => document.getElementById('roadmap-scene-' + i));
            const headerEl = document.getElementById('roadmap-header');
            const dots = dotsEl.querySelectorAll('.roadmap-dot');
            const map = (v, a, b, c, d) => c + (Math.min(Math.max(v, a), b) - a) / (b - a) * (d - c);

            const onScroll = () => {
                const rect = container.getBoundingClientRect();
                const totalH = container.offsetHeight - window.innerHeight;
                const scrolled = -rect.top;
                const progress = Math.max(0, Math.min(1, scrolled / totalH));

                const projF = progress * count;
                const projIdx = Math.min(Math.floor(projF), count - 1);
                const projProgress = projF - projIdx;

                if (headerEl) headerEl.style.opacity = map(progress, 0, 0.06, 1, 0);

                dots.forEach((d, i) => {
                    d.classList.toggle('active', i === projIdx);
                });

                scenes.forEach((scene, i) => {
                    if (i !== projIdx) { scene.style.opacity = '0'; scene.classList.remove('active'); return; }
                    scene.classList.add('active');
                    const p = projProgress;
                    const enterOp = map(p, 0, 0.1, 0, 1);
                    const exitOp = map(p, 0.75, 0.95, 1, 0);
                    scene.style.opacity = Math.min(enterOp, exitOp);

                    const card = scene.querySelector('[data-el="card"]');
                    const reveal = map(p, 0.05, 0.25, 0, 1);
                    if (card) {
                        card.style.opacity = reveal;
                        card.style.transform = `translateY(${(1 - reveal) * 30}px)`;
                    }
                });
            };

            window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
            onScroll();
        }
    };

    /* ========================================
       7c. ABOUT LOGO HANDOFF
       Separater Scroll-Listener, unabhängig vom Netzwerk.
       Logo fadet ein wenn About-Section sichtbar wird.
       ======================================== */
    const AboutLogoHandoff = {
        init() {
            const logo = document.getElementById('about-logo-img');
            const about = document.getElementById('about');
            const canvas = document.getElementById('particle-canvas');
            if (!logo || !about) return;

            const check = () => {
                const rect = about.getBoundingClientRect();
                const vh = window.innerHeight;
                /* Logo sichtbar wenn About-Section da ist */
                const logoVisible = rect.top < vh * 0.35 && rect.bottom > 0;
                logo.classList.toggle('visible', logoVisible);
                /* Netzwerk nur aus wenn About mittig im View ist (nicht bei Roadmap) */
                const aboutCentered = rect.top < vh * 0.35 && rect.top > -rect.height * 0.5;
                if (canvas) canvas.classList.toggle('fade-out', aboutCentered);
            };

            window.addEventListener('scroll', check, { passive: true });
            check();
        }
    };

    /* ========================================
       8. MODALS
       ======================================== */
    const Modals = {
        overlay: null,

        init() {
            this.overlay = document.getElementById('modal-overlay');
            const close = document.getElementById('modal-close');
            if (!this.overlay) return;

            if (close) close.addEventListener('click', () => this.close());
            this.overlay.addEventListener('click', e => { if (e.target === this.overlay) this.close(); });
            document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
        },

        open(html) {
            document.getElementById('modal-body').innerHTML = html;
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        close() {
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    /* ========================================
       9. INTRO ANIMATION
       Overlay ist direkt im HTML (kein Flash).
       JS steuert nur die Animation.
       ======================================== */
    const Intro = {
        timers: [],

        init() {
            const ov = document.getElementById('intro-overlay');
            if (!ov) return;

            /* Return-Visit oder reduced-motion: Overlay sofort weg */
            if (sessionStorage.getItem('bline_intro_seen') ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                ov.remove();
                return;
            }

            /* Intro-Animation starten */
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
       10. COOKIE BANNER
       ======================================== */
    const Cookie = {
        init() {
            if (localStorage.getItem('bline_cookie')) return;
            const banner = document.getElementById('cookie-banner');
            if (!banner) return;
            setTimeout(() => banner.classList.add('visible'), 2000);
            document.getElementById('cookie-accept').addEventListener('click', () => {
                localStorage.setItem('bline_cookie', 'true');
                banner.classList.remove('visible');
            });
        }
    };

    /* ========================================
       11. CONTACT FORM
       ======================================== */
    const ContactForm = {
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
                if (!email || !email.includes('@')) { status.textContent = 'Bitte g\u00fcltige E-Mail eingeben.'; status.className = 'form-status error'; return; }
                btn.disabled = true; btn.textContent = 'Wird gesendet...';
                try {
                    const res = await fetch('contact-handler.php', { method: 'POST', body: new FormData(form) });
                    const data = await res.json();
                    if (data.success) { status.textContent = 'Vielen Dank! Nachricht gesendet.'; status.className = 'form-status success'; form.reset(); }
                    else { status.textContent = data.error || 'Fehler aufgetreten.'; status.className = 'form-status error'; }
                } catch { status.textContent = 'Verbindungsfehler.'; status.className = 'form-status error'; }
                btn.disabled = false; btn.textContent = 'Gespr\u00e4ch vereinbaren';
            });
        }
    };

    /* ========================================
       INIT
       ======================================== */
    const init = () => {
        Intro.init();
        Header.init();
        Navigation.init();
        HeroLock.init();
        ScrollReveal.init();
        Portfolio.init();
        ParticleMorph.init();
        LivingNetwork.init();
        Roadmap.init();
        Modals.init();
        AboutLogoHandoff.init();
        Cookie.init();
        ContactForm.init();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
