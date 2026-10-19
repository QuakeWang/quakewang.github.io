const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function fixture({ stored = 'dark', blocked = false } = {}) {
    const classes = new Set();
    const tokens = {};
    const root = {
        dataset: {},
        classList: {
            toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
            contains: (name) => classes.has(name),
        },
        style: { setProperty: (name, value) => { tokens[name] = value; } },
        removeAttribute() {},
    };
    const meta = { content: '#f8f9f7', setAttribute(name, value) { this[name] = value; } };
    const button = { addEventListener(_, callback) { this.click = callback; } };
    const source = fs.readFileSync(path.join(__dirname, '../static/js/theme-switcher.js'), 'utf8');
    vm.runInNewContext(source, {
        document: {
            documentElement: root,
            getElementById: () => button,
            querySelector: (selector) => selector === 'meta[name="theme-color"]' ? meta : null,
        },
        window: { matchMedia: () => ({ matches: false, addEventListener() {} }) },
        localStorage: {
            getItem() {
                if (blocked) throw new Error('Storage unavailable');
                return stored;
            },
            setItem(_, value) {
                if (blocked) throw new Error('Storage unavailable');
                stored = value;
            },
        },
        getComputedStyle: () => ({ getPropertyValue: (name) => ({
            '--color-bg': classes.has('dark') ? '#222428' : '#f8f9f7',
            '--color-primary': classes.has('dark') ? '#91c0b1' : '#326b62',
            '--color-contrast-medium': '#626b76',
        })[name] || '' }),
    });
    return { root, button, meta, tokens };
}

test('browser theme color follows both the saved preference and subsequent toggles', () => {
    const page = fixture();
    assert.equal(page.meta.content, '#222428');
    page.button.click();
    assert.equal(page.meta.content, '#f8f9f7');
    page.button.click();
    assert.equal(page.meta.content, '#222428');
});

test('blocked storage does not interrupt theme switching or derived color updates', () => {
    const page = fixture({ blocked: true });
    assert.doesNotThrow(() => page.button.click());
    assert.equal(page.root.dataset.theme, 'dark');
    assert.equal(page.tokens['--color-primary-rgb'], '145, 192, 177');
    assert.equal(page.meta.content, '#222428');
});
