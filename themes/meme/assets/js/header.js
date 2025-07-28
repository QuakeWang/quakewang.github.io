window.addEventListener("DOMContentLoaded", event => {
    // Measure header height for the scrolling fix
    const header = document.querySelector('.header');
    if (header) {
        const headerHeight = window.getComputedStyle(header, null).getPropertyValue('height');
        document.documentElement.style.setProperty('--header-height', headerHeight);
    }
}, {once: true});

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                
                if (currentScrollY > 100) {
                    if (currentScrollY > lastScrollY) {
                        header.classList.add('header-hidden');
                    } else {
                        header.classList.remove('header-hidden');
                    }
                } else {
                    header.classList.remove('header-hidden');
                }
                
                lastScrollY = currentScrollY;
                ticking = false;
            });
            
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    function updateHeaderOpacity() {
        const scrollY = window.scrollY;
        const threshold = 50;
        const distance = 100;
        
        const headerWrapper = document.querySelector('.header-wrapper');
        
        if (scrollY < threshold) {
            if (document.documentElement.classList.contains('dark')) {
                headerWrapper.style.background = 'rgba(28, 28, 30, 0.5)';
            } else {
                headerWrapper.style.background = 'rgba(255, 255, 255, 0.5)';
            }
        } else if (scrollY >= threshold + distance) {
            if (document.documentElement.classList.contains('dark')) {
                headerWrapper.style.background = 'rgba(28, 28, 30, 0.9)';
            } else {
                headerWrapper.style.background = 'rgba(255, 255, 255, 0.9)';
            }
        } else {
            const progress = (scrollY - threshold) / distance;
            const opacity = 0.5 + (progress * 0.4);
            
            if (document.documentElement.classList.contains('dark')) {
                headerWrapper.style.background = `rgba(28, 28, 30, ${opacity})`;
            } else {
                headerWrapper.style.background = `rgba(255, 255, 255, ${opacity})`;
            }
        }
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHeaderOpacity();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    updateHeaderOpacity();
});