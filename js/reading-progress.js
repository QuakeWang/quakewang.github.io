document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.querySelector('.reading-progress-bar');
    const progressPercentage = document.querySelector('.progress-percentage');
    const article = document.querySelector('.post-body');
    const tocLinks = document.querySelectorAll('.toc-container a');
    const body = document.body;
    
    if (!article) return;
    
    const headings = Array.from(document.querySelectorAll('.post-body h1, .post-body h2, .post-body h3, .post-body h4, .post-body h5, .post-body h6'));
    const headingMap = new Map();
    
    tocLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const id = href.substring(1);
            headingMap.set(id, link);
        }
    });
    
    function updateReadingProgress() {
        const articleRect = article.getBoundingClientRect();
        const articleTop = window.scrollY - (article.offsetTop - window.scrollY);
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
        );
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = documentHeight - windowHeight;
        
        let readPercentage = 0;
        
        if (articleHeight <= windowHeight) {
            const visibleHeight = Math.min(
                windowHeight,
                articleRect.bottom > 0 ? 
                    (articleRect.bottom < windowHeight ? articleRect.bottom : windowHeight) - 
                    (articleRect.top > 0 ? articleRect.top : 0) : 0
            );
            readPercentage = (visibleHeight / articleHeight) * 100;
        } else {
            readPercentage = (scrollTop / scrollHeight) * 100;
        }
        
        readPercentage = Math.min(100, Math.max(0, readPercentage));
        
        if (progressBar && progressPercentage) {
            progressBar.style.width = `${readPercentage}%`;
            progressPercentage.textContent = `${Math.round(readPercentage)}%`;
        }
        
        body.classList.add('reading-progress');
        body.style.setProperty('--reading-progress', `${readPercentage}%`);
        
        updateActiveHeading();
    }
    
    function updateActiveHeading() {
        if (headings.length === 0 || !tocLinks.length) return;
        
        let currentHeading = null;
        const scrollOffset = 100;
        
        for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];
            const rect = heading.getBoundingClientRect();
            
            if (rect.top <= scrollOffset) {
                currentHeading = heading;
            } else {
                break;
            }
        }
        
        tocLinks.forEach(link => link.classList.remove('active'));
        
        if (currentHeading) {
            const id = currentHeading.getAttribute('id');
            if (id) {
                const activeLink = headingMap.get(id);
                if (activeLink) {
                    activeLink.classList.add('active');
                    
                    const tocContainer = document.querySelector('.toc-container');
                    if (tocContainer) {
                        const linkRect = activeLink.getBoundingClientRect();
                        const containerRect = tocContainer.getBoundingClientRect();
                        
                        if (linkRect.top < containerRect.top || linkRect.bottom > containerRect.bottom) {
                            activeLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                    
                    let parent = activeLink.parentElement;
                    while (parent && parent.classList.contains('collapsible')) {
                        parent.classList.remove('collapsed');
                        parent = parent.parentElement ? parent.parentElement.closest('li') : null;
                    }
                }
            }
        }
    }
    
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    window.addEventListener('scroll', debounce(updateReadingProgress, 50), { passive: true });
    
    window.addEventListener('resize', debounce(updateReadingProgress, 100), { passive: true });
    
    updateReadingProgress();
}); 