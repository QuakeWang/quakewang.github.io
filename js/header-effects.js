document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const headerWrapper = document.querySelector('.header-wrapper');
    const navToggle = document.getElementById('nav-toggle');
    const navToggleLabel = document.querySelector('.nav-toggle');
    const navCurtain = document.querySelector('.nav-curtain');

    if (!(header instanceof HTMLElement)) return;

    if (headerWrapper instanceof HTMLElement) {
        headerWrapper.addEventListener('mousemove', (event) => {
            const rect = headerWrapper.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            document.documentElement.style.setProperty('--mouse-x', `${x}px`);
            document.documentElement.style.setProperty('--mouse-y', `${y}px`);
        });
    }

    const isNavToggleEnabled =
        navToggle instanceof HTMLInputElement &&
        navToggleLabel instanceof HTMLElement &&
        navCurtain instanceof HTMLElement;

    const applyNavState = (isOpen) => {
        if (!isNavToggleEnabled) return;

        navToggleLabel.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        if (isOpen) {
            header.classList.add('open');
            navToggleLabel.classList.add('open');
            navCurtain.style.display = 'block';
            return;
        }

        header.classList.remove('open');
        navToggleLabel.classList.remove('open');
        navCurtain.removeAttribute('style');
        header.classList.remove('fade');
    };

    if (isNavToggleEnabled) {
        applyNavState(navToggle.checked);

        navToggle.addEventListener('change', () => {
            applyNavState(navToggle.checked);
        });

        navToggleLabel.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            navToggle.click();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            if (!navToggle.checked) return;

            navToggle.checked = false;
            applyNavState(false);
            navToggleLabel.focus();
        });

        header.querySelectorAll('.nav a').forEach((link) => {
            link.addEventListener('click', () => {
                if (!navToggle.checked) return;
                navToggle.checked = false;
                applyNavState(false);
            });
        });

        const maxWidth = window.getComputedStyle(document.documentElement).getPropertyValue('--max-width');
        if (maxWidth) {
            const mediaQuery = window.matchMedia(`(max-width: ${maxWidth.trim()})`);
            const onMediaChange = (event) => {
                if (event.matches) return;
                if (!navToggle.checked) return;

                navToggle.checked = false;
                applyNavState(false);
            };

            if (typeof mediaQuery.addEventListener === 'function') {
                mediaQuery.addEventListener('change', onMediaChange);
            } else if (typeof mediaQuery.addListener === 'function') {
                mediaQuery.addListener(onMediaChange);
            }
        }
    }

    let lastScrollTop = 0;
    let scrollTimer;

    const handleScroll = () => {
        if (isNavToggleEnabled && navToggle.checked) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 10) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }

        if (scrollTop > 100) {
            if (scrollTop > lastScrollTop) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
        } else {
            header.classList.remove('header-hidden');
        }

        lastScrollTop = scrollTop;
    };

    window.addEventListener(
        'scroll',
        () => {
            if (scrollTimer) return;
            scrollTimer = window.setTimeout(() => {
                handleScroll();
                scrollTimer = undefined;
            }, 10);
        },
        { passive: true }
    );

    handleScroll();
});
