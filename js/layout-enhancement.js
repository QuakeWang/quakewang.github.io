document.addEventListener('DOMContentLoaded', function() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    const scrollThreshold = 100;
    
    document.addEventListener('mousemove', function(e) {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    });
    
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 10) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
        
        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        
        lastScrollTop = scrollTop;
    }
    
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }
    
    window.addEventListener('scroll', debounce(handleScroll, 10));
    
    handleScroll();
    
    const tocItems = document.querySelectorAll('.toc-container li');
    
    tocItems.forEach(item => {
        const subList = item.querySelector('ul');
        if (subList) {
            item.classList.add('collapsible');
            
            const toggle = document.createElement('span');
            toggle.className = 'toc-toggle';
            item.insertBefore(toggle, item.firstChild);
            
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                item.classList.toggle('collapsed');
            });
        }
    });
    
    const progressBar = document.querySelector('.reading-progress-bar');
    const progressPercentage = document.querySelector('.progress-percentage');
    
    if (progressBar && progressPercentage) {
        window.addEventListener('scroll', function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            const scrolled = (scrollTop / (documentHeight - windowHeight)) * 100;
            const progress = Math.min(100, Math.max(0, scrolled)).toFixed(0);
            
            progressBar.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress}%`;
        });
    }
}); 