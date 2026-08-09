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
