console.log("Arix Studio");

const heroVisual = document.getElementById('heroVisual');

if (heroVisual) {
    heroVisual.addEventListener('mousemove', (e) => {
        const rect = heroVisual.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        heroVisual.style.setProperty('--x', `${x}px`);
        heroVisual.style.setProperty('--y', `${y}px`);
    });
}

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

const heroIconWrap = document.getElementById('heroIconWrap');

if (heroIconWrap) {
    heroIconWrap.addEventListener('mousemove', (e) => {
        const rect = heroIconWrap.getBoundingClientRect();
        const ix = e.clientX - rect.left;
        const iy = e.clientY - rect.top;

        heroIconWrap.style.setProperty('--ix', `${ix}px`);
        heroIconWrap.style.setProperty('--iy', `${iy}px`);
    });
}
