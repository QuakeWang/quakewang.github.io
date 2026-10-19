document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const navToggle = document.getElementById('nav-toggle');
    const navToggleLabel = document.querySelector('.nav-toggle');
    const backToTop = document.getElementById('back-to-top');

    if (!(header instanceof HTMLElement)) return;

    const isNavToggleEnabled =
        navToggle instanceof HTMLInputElement &&
        navToggleLabel instanceof HTMLElement;

    let inactiveElements = [];

    const applyNavState = (isOpen, restoreFocus = true) => {
        navToggle.checked = isOpen;
        navToggleLabel.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen === header.classList.contains('open')) return;

        if (isOpen) {
            const scrollbarWidth = Math.max(0,
                window.innerWidth - document.documentElement.getBoundingClientRect().width);
            document.documentElement.style.setProperty('--nav-scrollbar-width', `${scrollbarWidth}px`);
        }

        header.classList.toggle('open', isOpen);
        document.documentElement.classList.toggle('nav-open', isOpen);

        if (isOpen) {
            // Leave the header interactive while isolating the covered page.
            inactiveElements = [...document.body.children, ...header.parentElement.children]
                .filter((element) => element instanceof HTMLElement &&
                    element.tagName !== 'SCRIPT' && !element.contains(header) && !element.inert);
            inactiveElements.forEach((element) => { element.inert = true; });
            header.querySelector('.nav a, .nav button')?.focus({ preventScroll: true });
            return;
        }

        inactiveElements.forEach((element) => { element.inert = false; });
        inactiveElements = [];
        if (restoreFocus) navToggleLabel.focus({ preventScroll: true });
    };

    if (isNavToggleEnabled) {
        applyNavState(false, false);

        window.addEventListener('pagehide', () => applyNavState(false, false));
        window.addEventListener('pageshow', () => applyNavState(false, false));

        navToggle.addEventListener('change', () => {
            applyNavState(navToggle.checked);
        });

        navToggleLabel.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            navToggle.click();
        });

        document.addEventListener('keydown', (event) => {
            if (!navToggle.checked) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                applyNavState(false);
            } else if (event.key === 'Tab') {
                const controls = [...header.querySelectorAll('a[href], button, [tabindex="0"]')];
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });

        header.querySelectorAll('.nav a').forEach((link) => {
            link.addEventListener('click', () => {
                applyNavState(false, false);
            });
        });

        const maxWidth = window.getComputedStyle(document.documentElement).getPropertyValue('--max-width');
        if (maxWidth) {
            const mediaQuery = window.matchMedia(`(max-width: ${maxWidth.trim()})`);
            const onMediaChange = (event) => {
                if (event.matches) return;
                applyNavState(false, false);
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
        if (backToTop) backToTop.classList.toggle('show', scrollTop > 100);

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
