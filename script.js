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
