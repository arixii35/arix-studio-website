console.log("VYRON");

const heroVisual = document.getElementById('heroVisual');

const visualCard = document.getElementById('visualCard');

if (visualCard && heroVisual) {
    heroVisual.addEventListener('mousemove', (e) => {
        const rect = visualCard.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        const maxTilt = 6;
        const ry = Math.max(-1, Math.min(1, dx)) * maxTilt;
        const rx = Math.max(-1, Math.min(1, -dy)) * maxTilt;

        visualCard.style.setProperty('--rx', `${rx}deg`);
        visualCard.style.setProperty('--ry', `${ry}deg`);
    });

    heroVisual.addEventListener('mouseleave', () => {
        visualCard.style.setProperty('--rx', `0deg`);
        visualCard.style.setProperty('--ry', `0deg`);
    });
}


/* ===== Фоновые следы-подковы за курсором (по всему сайту) ===== */

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'hoofTrail';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize);
    resize();

    let purpleSprite = null;
    let whiteSprite = null;

    function tint(sourceImg, color) {
        const off = document.createElement('canvas');
        off.width = sourceImg.naturalWidth;
        off.height = sourceImg.naturalHeight;

        const octx = off.getContext('2d');
        octx.drawImage(sourceImg, 0, 0);

        octx.globalCompositeOperation = 'source-atop';
        octx.fillStyle = color;
        octx.fillRect(0, 0, off.width, off.height);

        return off;
    }

    const img = new Image();
    img.src = 'assets/backg.png';
    img.onload = () => {
        purpleSprite = tint(img, '#8b5cf6');
        whiteSprite = tint(img, '#f5f3ff');
    };

    const prints = [];
    let lastX = null;
    let lastY = null;
    let flip = 1;

    const SPAWN_MIN_DIST = 60;
    const LIFETIME = 950;
    const STAMP_SIZE = 60;
    const MAX_PRINTS = 40;

    function onMove(e) {
        const x = e.clientX;
        const y = e.clientY;

        if (lastX === null) {
            lastX = x;
            lastY = y;
            return;
        }

        const dx = x - lastX;
        const dy = y - lastY;
        const dist = Math.hypot(dx, dy);

        if (dist < SPAWN_MIN_DIST) return;

        const angle = Math.atan2(dy, dx);
        const perpX = Math.cos(angle + Math.PI / 2);
        const perpY = Math.sin(angle + Math.PI / 2);

        flip *= -1;
        const offset = 9 * flip;

        prints.push({
            x: x + perpX * offset,
            y: y + perpY * offset,
            angle: angle + Math.PI / 2,
            born: performance.now(),
            isPurple: flip > 0,
        });

        if (prints.length > MAX_PRINTS) prints.shift();

        lastX = x;
        lastY = y;
    }

    window.addEventListener('mousemove', onMove, { passive: true });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (purpleSprite && whiteSprite) {
            const now = performance.now();

            for (let i = prints.length - 1; i >= 0; i--) {
                const p = prints[i];
                const age = now - p.born;

                if (age > LIFETIME) {
                    prints.splice(i, 1);
                    continue;
                }

                const t = age / LIFETIME;
                const opacity = 1 - t;
                const scale = 0.85 + t * 0.35;
                const size = STAMP_SIZE * scale;
                const sprite = p.isPurple ? purpleSprite : whiteSprite;

                ctx.save();
                ctx.globalAlpha = opacity * (p.isPurple ? 0.55 : 0.4);
                ctx.shadowColor = p.isPurple
                    ? 'rgba(124, 58, 237, 0.55)'
                    : 'rgba(245, 243, 255, 0.4)';
                ctx.shadowBlur = 10;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
                ctx.restore();
            }
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
})();
