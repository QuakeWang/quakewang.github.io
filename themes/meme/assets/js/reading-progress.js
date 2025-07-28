document.addEventListener('DOMContentLoaded', () => {
    const isArticlePage = document.querySelector('.post-body') !== null;
    
    if (!isArticlePage) return;
    
    const progressBar = document.getElementById('reading-progress-bar');
    const progressPercentage = document.getElementById('reading-progress-percentage');
    const tocLinks = document.querySelectorAll('.toc-container a');
    const backToTop = document.getElementById('back-to-top');
    
    if (!progressBar || !progressPercentage) {
        console.error('Progress elements not found');
        return;
    }
    
    if (backToTop) {
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    const headings = Array.from(document.querySelectorAll('.post-body h1, .post-body h2, .post-body h3, .post-body h4, .post-body h5, .post-body h6'))
        .filter(heading => heading.id);
    
    function updateReadingProgress() {
        const docHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight,
            document.body.clientHeight,
            document.documentElement.clientHeight
        ) - window.innerHeight;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        const scrollPercent = (scrollTop / docHeight) * 100;
        const percent = Math.min(Math.max(scrollPercent, 0), 100);
        
        progressBar.style.width = `${percent}%`;
        
        updateTocHighlight(scrollTop);
    }
    
    function updateTocHighlight(scrollTop) {
        if (!headings.length || !tocLinks.length) return;
        
        let currentHeadingIndex = -1;
        const offset = 100;
        
        for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];
            const headingTop = heading.getBoundingClientRect().top + window.scrollY;
            
            if (scrollTop >= headingTop - offset) {
                currentHeadingIndex = i;
            } else {
                break;
            }
        }
        
        tocLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        if (currentHeadingIndex >= 0) {
            const currentHeading = headings[currentHeadingIndex];
            const currentHeadingId = currentHeading.id;
            
            const activeLink = document.querySelector(`.toc-container a[href="#${currentHeadingId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                
                const tocContainer = document.querySelector('.sidebar-body');
                if (tocContainer) {
                    const linkTop = activeLink.offsetTop;
                    const containerScrollTop = tocContainer.scrollTop;
                    const containerHeight = tocContainer.clientHeight;
                    
                    if (linkTop < containerScrollTop || linkTop > containerScrollTop + containerHeight) {
                        tocContainer.scrollTo({
                            top: linkTop - containerHeight / 2,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        }
    }
    
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress, { passive: true });
    
    updateReadingProgress();
});