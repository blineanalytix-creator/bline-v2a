/**
 * B_LineGraphix - Legal Page Network Animation
 * Partikel formen ein zum Seiteninhalt passendes Symbol (§, Schloss, Waage).
 * Gleiche Ästhetik wie das Hauptseiten-Netzwerk: weiße Partikel, Connections, Flashes.
 */
(function () {
    'use strict';

    const canvas = document.getElementById('legal-network');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    const isMobile = window.innerWidth <= 768;
    let width, height, dpr;
    let nodes = [], flashes = [];

    const config = {
        nodeCount: isMobile ? 150 : 400,
        alpha: 0.65,
        flashRate: 0.018,
        connDist: isMobile ? 50 : 80,
        nodeR: 2.2,
        lineW: 0.7,
        colors: { r: 255, g: 255, b: 255 }
    };

    /* ── Detect which symbol to show ── */
    function getSymbol() {
        const h1 = document.querySelector('.legal-page-content h1');
        const text = h1 ? h1.textContent.trim() : '';
        if (text.includes('Datenschutz')) return '\u{1F512}'; /* 🔒 */
        if (text.includes('KI')) return 'KI';
        return '§'; /* Impressum default */
    }

    /* ── Generate points from text/symbol ── */
    function genSymbolPoints(n, symbol) {
        const off = document.createElement('canvas');
        const octx = off.getContext('2d');
        off.width = width;
        off.height = height;

        const fontSize = height * (isMobile ? 0.35 : 0.52);
        octx.font = '700 ' + fontSize + 'px Inter, sans-serif';
        octx.textAlign = 'center';
        octx.textBaseline = 'middle';
        octx.fillStyle = '#fff';
        /* Position: rechts auf Desktop, zentriert auf Mobile */
        const cx = isMobile ? width * 0.5 : width * 0.72;
        const cy = isMobile ? height * 0.38 : height * 0.47;
        octx.fillText(symbol, cx, cy);

        const imgData = octx.getImageData(0, 0, off.width, off.height).data;
        const pts = [];
        let att = 0;
        while (pts.length < n && att < n * 50) {
            att++;
            const x = Math.random() * width;
            const y = Math.random() * height;
            const idx = (Math.floor(y) * off.width + Math.floor(x)) * 4;
            if (imgData[idx + 3] > 128) pts.push({ x, y });
        }
        /* Fallback: Cluster in der Mitte */
        while (pts.length < n) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * height * 0.2;
            pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
        }
        return pts;
    }

    /* ── Setup ── */
    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createNodes() {
        const symbol = getSymbol();
        const targets = genSymbolPoints(config.nodeCount, symbol);
        nodes = targets.map(t => ({
            x: t.x, y: t.y,
            tx: t.x, ty: t.y,
            brightness: 0,
            phase: Math.random() * Math.PI * 2
        }));
    }

    function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2; }

    /* ── Render Loop ── */
    function animate() {
        ctx.clearRect(0, 0, width, height);

        const t = Date.now() * 0.001;
        const c = config.colors;
        const breathe = 1.0 + Math.sin(t * 0.4) * 0.03;

        /* Drift: Nodes sanft um ihre Zielposition atmen */
        nodes.forEach((n, i) => {
            const dx = n.tx - width * (isMobile ? 0.5 : 0.72);
            const dy = n.ty - height * (isMobile ? 0.38 : 0.47);

            if (i < nodes.length * 0.75) {
                /* Stabile Punkte: sanftes Atmen */
                n.x = n.tx + dx * (breathe - 1) + Math.sin(t * 0.15 + i * 2.1) * 0.6;
                n.y = n.ty + dy * (breathe - 1) + Math.cos(t * 0.12 + i * 1.8) * 0.6;
            } else {
                /* Emissionspunkte: langsam nach außen driften */
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const dirX = dx / dist, dirY = dy / dist;
                const cycle = ((t * 0.14 + i * 0.37) % 1);
                const emitDist = cycle * 18;
                n.x = n.tx + dirX * emitDist + Math.sin(t * 0.2 + i * 3.1) * 1.2;
                n.y = n.ty + dirY * emitDist + Math.cos(t * 0.18 + i * 2.7) * 1.2;
                n._emitFade = cycle < 0.75 ? 1 : 1 - (cycle - 0.75) / 0.25;
            }
        });

        /* Flashes */
        if (!isMobile && Math.random() < config.flashRate && nodes.length > 0) {
            flashes.push({
                idx: Math.floor(Math.random() * nodes.length),
                radius: 60 + Math.random() * 50,
                intensity: 0.3 + Math.random() * 0.5,
                age: 0, maxAge: 80 + Math.random() * 60
            });
        }
        for (let i = flashes.length - 1; i >= 0; i--) {
            if (++flashes[i].age >= flashes[i].maxAge) flashes.splice(i, 1);
        }
        nodes.forEach(n => { n.brightness = 0; });
        flashes.forEach(f => {
            const o = nodes[f.idx]; if (!o) return;
            const fade = 1 - f.age / f.maxAge;
            nodes.forEach(n => {
                const dx = n.x - o.x, dy = n.y - o.y, d = Math.sqrt(dx*dx + dy*dy);
                if (d < f.radius) n.brightness = Math.max(n.brightness, (1 - d / f.radius) * fade * f.intensity);
            });
        });

        /* Connections (desktop only) */
        const ba = 0.88 + Math.sin(t * 0.4) * 0.12;
        if (!isMobile && config.connDist > 0) {
            const cd2 = config.connDist * config.connDist;
            ctx.lineWidth = config.lineW;
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const dx = a.x - b.x, dy = a.y - b.y, d2 = dx*dx + dy*dy;
                    if (d2 >= cd2) continue;
                    const d = Math.sqrt(d2);
                    const fade = 1 - d / config.connDist;
                    const la = (config.alpha * 0.4 + Math.max(a.brightness, b.brightness) * 0.5) * fade * ba;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + la + ')';
                    ctx.stroke();
                }
            }
        }

        /* Nodes */
        nodes.forEach(n => {
            const emitFade = n._emitFade !== undefined ? n._emitFade : 1.0;
            const na = (isMobile ? config.alpha : config.alpha + n.brightness * 0.6) * emitFade;
            const r = isMobile ? config.nodeR : config.nodeR + n.brightness * 1.5;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + na + ')';
            ctx.fill();

            /* Glow */
            if (!isMobile && n.brightness > 0.2) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, r * 3.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (n.brightness * 0.1 * emitFade) + ')';
                ctx.fill();
            }
            n._emitFade = undefined;
        });

        requestAnimationFrame(animate);
    }

    resize();
    createNodes();
    animate();
    window.addEventListener('resize', () => { resize(); createNodes(); flashes = []; });
})();
