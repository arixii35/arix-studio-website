console.log("VYRON");

/* ===== Живое кодовое окно ===== */

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const codeContainer = document.querySelector('.visual-code');
    const indicator = document.querySelector('.code-live-indicator');
    const codeLines = codeContainer
        ? Array.from(codeContainer.querySelectorAll('.code-line')).filter(
              (el) => el.textContent.trim() !== ''
          )
        : [];

    if (!codeContainer || !codeLines.length || reduceMotion) return;

    let activeIndex = 0;

    function activateLine(index) {
        codeLines.forEach((el) => el.classList.remove('code-line--active'));

        const line = codeLines[index];
        if (!line) return;

        line.classList.add('code-line--active');

        if (indicator) {
            const lineRect = line.getBoundingClientRect();
            const containerRect = codeContainer.getBoundingClientRect();
            const top = lineRect.top - containerRect.top + lineRect.height / 2 - 2;

            indicator.style.transform = `translateY(${top}px)`;
        }
    }

    activateLine(activeIndex);

    setInterval(() => {
        activeIndex = (activeIndex + 1) % codeLines.length;
        activateLine(activeIndex);
    }, 2200);
})();


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
        whiteSprite = tint(img, '#f5f3ff');
    };

    const prints = [];
    let lastX = null;
    let lastY = null;
    let flip = 1;

    const SPAWN_MIN_DIST = 100;
    const LIFETIME = 1700;
    const STAMP_SIZE = 42;
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
        });

        if (prints.length > MAX_PRINTS) prints.shift();

        lastX = x;
        lastY = y;
    }

    window.addEventListener('mousemove', onMove, { passive: true });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (whiteSprite) {
            const now = performance.now();

            for (let i = prints.length - 1; i >= 0; i--) {
                const p = prints[i];
                const age = now - p.born;

                if (age > LIFETIME) {
                    prints.splice(i, 1);
                    continue;
                }

                const t = age / LIFETIME;
                const opacity = Math.pow(1 - t, 1.6);
                const scale = 0.85 + t * 0.35;
                const size = STAMP_SIZE * scale;

                ctx.save();
                ctx.globalAlpha = opacity * 0.4;
                ctx.shadowColor = 'rgba(245, 243, 255, 0.4)';
                ctx.shadowBlur = 10;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.drawImage(whiteSprite, -size / 2, -size / 2, size, size);
                ctx.restore();
            }
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
})();


/* ===== LED-сетка справа от Hero (волна + сборка в V) ===== */

(function () {
    const container = document.getElementById('ledGrid');
    if (!container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let dots = [];
    const spacing = 20;

    function build() {
        const rect = container.getBoundingClientRect();
        W = rect.width;
        H = rect.height;

        if (W === 0 || H === 0) return;

        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        cols = Math.max(4, Math.floor(W / spacing));
        rows = Math.max(6, Math.floor(H / spacing));

        const offsetX = (W - (cols - 1) * spacing) / 2;
        const offsetY = (H - (rows - 1) * spacing) / 2;

        dots = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                dots.push({
                    x: offsetX + c * spacing,
                    y: offsetY + r * spacing,
                    row: r,
                    col: c,
                    isV: false,
                });
            }
        }

        const centerCol = (cols - 1) / 2;
        const vCols = new Set();

        for (let r = 0; r < rows; r++) {
            const t = r / (rows - 1 || 1);
            const spread = (1 - t) * centerCol * 0.85;
            const left = Math.round(centerCol - spread);
            const right = Math.round(centerCol + spread);
            vCols.add(r + '_' + left);
            vCols.add(r + '_' + right);
        }

        dots.forEach((d) => {
            d.isV = vCols.has(d.row + '_' + d.col);
        });
    }

    build();
    window.addEventListener('resize', build);

    let mouseX = -9999;
    let mouseY = -9999;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    container.addEventListener('mouseleave', () => {
        mouseX = -9999;
        mouseY = -9999;
    });

    if (reduceMotion) {
        ctx.clearRect(0, 0, W, H);
        dots.forEach((d) => {
            ctx.beginPath();
            ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2);
            ctx.fillStyle = d.isV
                ? 'rgba(139, 92, 246, 0.35)'
                : 'rgba(34, 34, 34, 0.9)';
            ctx.fill();
        });
        return;
    }

    const CYCLE = 18000;
    const ASSEMBLE_START = 13000;
    const ASSEMBLE_DURATION = 2200;
    const HOLD_DURATION = 1800;
    const FADE_DURATION = 1400;

    const start = performance.now();

    function draw(now) {
        if (W && H) {
            const elapsed = (now - start) % CYCLE;

            ctx.clearRect(0, 0, W, H);

            let vProgress = 0;
            let vHoldOpacity = 0;

            if (elapsed >= ASSEMBLE_START && elapsed < ASSEMBLE_START + ASSEMBLE_DURATION) {
                vProgress = (elapsed - ASSEMBLE_START) / ASSEMBLE_DURATION;
            } else if (
                elapsed >= ASSEMBLE_START + ASSEMBLE_DURATION &&
                elapsed < ASSEMBLE_START + ASSEMBLE_DURATION + HOLD_DURATION
            ) {
                vProgress = 1;
                vHoldOpacity = 1;
            } else if (
                elapsed >= ASSEMBLE_START + ASSEMBLE_DURATION + HOLD_DURATION &&
                elapsed < ASSEMBLE_START + ASSEMBLE_DURATION + HOLD_DURATION + FADE_DURATION
            ) {
                vProgress = 1;
                const t =
                    (elapsed - (ASSEMBLE_START + ASSEMBLE_DURATION + HOLD_DURATION)) /
                    FADE_DURATION;
                vHoldOpacity = 1 - t;
            }

            const ambientPhase = now / 2600;

            dots.forEach((d) => {
                let alpha = 0.1;
                let color = '34, 34, 34';

                const wave = Math.sin((d.col + d.row) * 0.35 - ambientPhase) * 0.5 + 0.5;
                alpha += wave * 0.06;

                const dx = d.x - mouseX;
                const dy = d.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const radius = 90;

                if (dist < radius) {
                    const t = 1 - dist / radius;
                    alpha += t * 0.5;
                    color = '139, 92, 246';
                }

                if (d.isV) {
                    const rowT = d.row / (rows - 1 || 1);

                    if (rowT <= vProgress) {
                        const localFade = Math.min(1, (vProgress - rowT) * 6);
                        alpha = Math.max(
                            alpha,
                            0.12 +
                                0.55 * vHoldOpacity * localFade +
                                0.35 * (vProgress < 1 ? localFade : 0)
                        );
                        color = '139, 92, 246';
                    }
                }

                alpha = Math.min(alpha, 0.9);

                ctx.beginPath();
                ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${alpha})`;
                ctx.fill();
            });
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
})();


/* ===== Инерционная прокрутка колесом мыши ===== */

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    function getMaxScroll() {
        return document.documentElement.scrollHeight - window.innerHeight;
    }

    let current = window.scrollY;
    let target = window.scrollY;
    const ease = 0.09;
    let ticking = false;

    function loop() {
        current += (target - current) * ease;

        if (Math.abs(target - current) < 0.5) {
            current = target;
            window.scrollTo(0, current);
            ticking = false;
            return;
        }

        window.scrollTo(0, current);
        requestAnimationFrame(loop);
    }

    function onWheel(e) {
        if (e.ctrlKey) return;

        e.preventDefault();

        target += e.deltaY;
        target = Math.max(0, Math.min(target, getMaxScroll()));

        if (!ticking) {
            ticking = true;
            requestAnimationFrame(loop);
        }
    }

    let syncTimeout = null;

    function onNativeScroll() {
        if (ticking) return;

        clearTimeout(syncTimeout);
        syncTimeout = setTimeout(() => {
            current = window.scrollY;
            target = window.scrollY;
        }, 80);
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    window.addEventListener('resize', () => {
        target = Math.max(0, Math.min(target, getMaxScroll()));
    });
})();
