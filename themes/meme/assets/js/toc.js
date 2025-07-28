document.addEventListener('DOMContentLoaded', () => {
    const tocContainer = document.querySelector('.toc-container');
    if (!tocContainer) return;

    const tocLinks = Array.from(tocContainer.querySelectorAll('a'));
    const tocListItems = Array.from(tocContainer.querySelectorAll('li'));
    
    tocListItems.forEach(item => {
        item.classList.add('toc-item');
        
        const link = item.querySelector('a');
        if (link) {
            const text = link.textContent;
            const cleanText = text.replace(/^\d+(\.\d+)*\.\s*/, '');
            if (cleanText !== text) {
                link.textContent = cleanText;
            }
        }
        
        const sublist = item.querySelector('ul, ol');
        if (sublist) {
            const toggle = document.createElement('span');
            toggle.className = 'toc-toggle';
            item.insertBefore(toggle, item.firstChild);
            item.classList.add('collapsible');
            item.classList.add('collapsed'); // Collapse all by default

            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                item.classList.toggle('collapsed');
            });
        }
    });

    const headings = Array.from(document.querySelectorAll('.post-body h1, .post-body h2, .post-body h3, .post-body h4, .post-body h5, .post-body h6'));

    const observer = new IntersectionObserver(entries => {
        let visibleHeadings = [];
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleHeadings.push(entry.target);
            }
        });

        if (visibleHeadings.length > 0) {
            // Find the top-most visible heading
            const topHeading = visibleHeadings.reduce((prev, curr) => {
                return prev.getBoundingClientRect().top < curr.getBoundingClientRect().top ? prev : curr;
            });

            const id = topHeading.getAttribute('id');
            const activeLink = tocContainer.querySelector(`a[href="#${id}"]`);

            // Remove active class from all links
            tocLinks.forEach(link => link.classList.remove('active'));

            if (activeLink) {
                activeLink.classList.add('active');

                // Collapse all items first
                tocListItems.forEach(item => {
                    if(item.classList.contains('collapsible')) {
                        item.classList.add('collapsed');
                    }
                });

                // Expand parents of the active link
                let parent = activeLink.parentElement;
                while (parent && parent.classList.contains('collapsible')) {
                    parent.classList.remove('collapsed');
                    parent = parent.parentElement.closest('li');
                }
            }
        }
    }, { rootMargin: '0px 0px -80% 0px' });

    headings.forEach(heading => observer.observe(heading));
});