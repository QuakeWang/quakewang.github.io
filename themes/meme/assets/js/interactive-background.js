document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetX = mouseX;
    let targetY = mouseY;

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    const updateMousePosition = () => {
        // Using lerp for smooth animation
        const lerp = (start, end, factor) => start * (1 - factor) + end * factor;

        mouseX = lerp(mouseX, targetX, 0.1);
        mouseY = lerp(mouseY, targetY, 0.1);

        body.style.setProperty('--mouse-x', `${mouseX}px`);
        body.style.setProperty('--mouse-y', `${mouseY}px`);

        requestAnimationFrame(updateMousePosition);
    };

    requestAnimationFrame(updateMousePosition);
});