(() => {
    const storageKey = 'theme';
    const root = document.documentElement;

    const parseCssColorToRgb = (value) => {
        const input = value.trim();
        if (!input) return null;

        const hexMatch = input.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
        if (hexMatch) {
            let hex = hexMatch[1];
            if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return { r, g, b };
        }

        const rgbMatch = input.match(
            /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*[0-9.]+\s*)?\)$/i
        );
        if (rgbMatch) {
            const r = Math.round(Number(rgbMatch[1]));
            const g = Math.round(Number(rgbMatch[2]));
            const b = Math.round(Number(rgbMatch[3]));
            if ([r, g, b].every((n) => Number.isFinite(n))) return { r, g, b };
        }

        return null;
    };

    const rgbToHsl = ({ r, g, b }) => {
        const red = r / 255;
        const green = g / 255;
        const blue = b / 255;
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const delta = max - min;

        let hue = 0;
        let saturation = 0;
        const lightness = (max + min) / 2;

        if (delta !== 0) {
            saturation =
                lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

            switch (max) {
                case red:
                    hue = (green - blue) / delta + (green < blue ? 6 : 0);
                    break;
                case green:
                    hue = (blue - red) / delta + 2;
                    break;
                default:
                    hue = (red - green) / delta + 4;
                    break;
            }

            hue /= 6;
        }

        return {
            h: Math.round(hue * 360),
            s: Math.round(saturation * 100),
            l: Math.round(lightness * 100),
        };
    };

    const updateDerivedColorTokens = () => {
        const styles = getComputedStyle(root);
        const primaryValue = styles.getPropertyValue('--color-primary');
        const contrastMediumValue = styles.getPropertyValue('--color-contrast-medium');

        const primaryRgb = parseCssColorToRgb(primaryValue);
        if (primaryRgb) {
            root.style.setProperty(
                '--color-primary-rgb',
                `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`
            );

            const primaryHsl = rgbToHsl(primaryRgb);
            root.style.setProperty('--color-primary-h', `${primaryHsl.h}`);
            root.style.setProperty('--color-primary-s', `${primaryHsl.s}%`);
            root.style.setProperty('--color-primary-l', `${primaryHsl.l}%`);
        }

        const contrastRgb = parseCssColorToRgb(contrastMediumValue);
        if (contrastRgb) {
            const contrastHsl = rgbToHsl(contrastRgb);
            root.style.setProperty('--color-contrast-medium-h', `${contrastHsl.h}`);
            root.style.setProperty('--color-contrast-medium-s', `${contrastHsl.s}%`);
            root.style.setProperty('--color-contrast-medium-l', `${contrastHsl.l}%`);
        }
    };

    const getSystemTheme = () => {
        if (!window.matchMedia) return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (theme, persist) => {
        if (theme === 'dark' || theme === 'light') {
            root.dataset.theme = theme;
            root.classList.toggle('dark', theme === 'dark');
            if (persist) localStorage.setItem(storageKey, theme);
            updateDerivedColorTokens();
            return;
        }

        root.removeAttribute('data-theme');
        root.classList.toggle('dark', getSystemTheme() === 'dark');
        if (persist) localStorage.removeItem(storageKey);
        updateDerivedColorTokens();
    };

    const storedTheme = (() => {
        try {
            return localStorage.getItem(storageKey);
        } catch {
            return null;
        }
    })();

    if (storedTheme === 'dark' || storedTheme === 'light') {
        applyTheme(storedTheme, false);
    } else {
        applyTheme('system', false);
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const onChange = () => {
                const currentStored = (() => {
                    try {
                        return localStorage.getItem(storageKey);
                    } catch {
                        return null;
                    }
                })();
                if (currentStored === 'dark' || currentStored === 'light') return;
                applyTheme('system', false);
            };

            if (typeof mediaQuery.addEventListener === 'function') {
                mediaQuery.addEventListener('change', onChange);
            } else if (typeof mediaQuery.addListener === 'function') {
                mediaQuery.addListener(onChange);
            }
        }
    }

    const toggleButton =
        document.getElementById('theme-toggle') ||
        document.querySelector('.theme-toggle-btn');

    if (!toggleButton) return;

    toggleButton.addEventListener('click', () => {
        const current =
            root.dataset.theme === 'dark' || root.classList.contains('dark') ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
    });
})();
