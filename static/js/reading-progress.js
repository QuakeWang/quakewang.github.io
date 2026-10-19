function getReadingProgress(rect, viewportHeight, readingOffset) {
    if (rect.height <= 0) return 0;

    const travel = rect.height - (viewportHeight - readingOffset);
    const fraction = travel > 0
        ? (readingOffset - rect.top) / travel
        : (viewportHeight - rect.top) / rect.height;

    return Math.min(100, Math.max(0, fraction * 100));
}

document.addEventListener('DOMContentLoaded', () => {
    const article = document.querySelector('.post-body');
    if (!article) return;

    const header = document.querySelector('.header');
    const percentage = document.querySelector('.progress-percentage');
    const progress = document.querySelector('.reading-progress');
    const sidebar = document.querySelector('.sidebar-body');
    const sections = Array.from(document.querySelectorAll('.toc-container a'), (link) => ({
        link,
        heading: document.getElementById(decodeURIComponent(link.hash.slice(1))),
    })).filter(({ heading }) => heading);
    let activeLink = null;
    let frame = null;

    function update() {
        frame = null;
        const offset = (header ? header.offsetHeight : 0) + 16;
        const rect = article.getBoundingClientRect();
        const value = getReadingProgress(rect, window.innerHeight, offset);
        const rounded = Math.round(value);

        document.documentElement.style.setProperty('--reading-progress', `${value}%`);
        article.style.setProperty('--reading-offset', `${offset}px`);
        if (percentage) percentage.textContent = `${rounded}%`;
        if (progress) progress.setAttribute('aria-valuenow', rounded);

        const positions = sections.map(({ heading }) => heading.getBoundingClientRect().top);
        sections.forEach(({ link }, index) => {
            const start = positions[index];
            const end = index + 1 < sections.length ? positions[index + 1] : rect.top + rect.height;
            const fraction = value === 100 ? 1 : Math.min(1, Math.max(0,
                (offset - start) / Math.max(1, end - start)));
            link.style.setProperty('--chapter-progress', `${fraction * 100}%`);
        });

        let current = rect.top < window.innerHeight ? sections[0] : null;
        for (let index = 0; index < sections.length; index++) {
            if (positions[index] > offset + 1) break;
            current = sections[index];
        }
        if (value === 100 && sections.length) current = sections[sections.length - 1];

        const link = current ? current.link : null;
        if (link !== activeLink) {
            if (activeLink) {
                activeLink.classList.remove('active');
                activeLink.removeAttribute('aria-current');
            }
            activeLink = link;
            if (link) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'location');
                let item = link.closest('li');
                while (item) {
                    item.classList.remove('collapsed');
                    item = item.parentElement.closest('li');
                }
            }
        }

        if (link && sidebar && sidebar.clientHeight) {
            const bounds = sidebar.getBoundingClientRect();
            const target = link.getBoundingClientRect();
            if (target.top < bounds.top) sidebar.scrollTop += target.top - bounds.top;
            else if (target.bottom > bounds.bottom) sidebar.scrollTop += target.bottom - bounds.bottom;
        }
    }

    function scheduleUpdate() {
        if (frame === null) frame = window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    window.addEventListener('pageshow', scheduleUpdate);
    new ResizeObserver(scheduleUpdate).observe(article);
    update();
});
