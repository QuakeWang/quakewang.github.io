document.addEventListener('DOMContentLoaded', () => {
    const tocItems = document.querySelectorAll('.toc-container li');
    if (!tocItems.length) return;

    tocItems.forEach((item) => {
        const subList = item.querySelector('ul');
        if (!subList) return;

        item.classList.add('collapsible');

        const toggle = document.createElement('button');
        toggle.className = 'toc-toggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-label', 'Toggle section');
        item.insertBefore(toggle, item.firstChild);

        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            item.classList.toggle('collapsed');
        });
    });
});
