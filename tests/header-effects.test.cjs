const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../static/js/header-effects.js'), 'utf8');

function fixture({ scrollbarWidth = 0 } = {}) {
    class Element {
        constructor(tagName = 'DIV') {
            this.tagName = tagName;
            this.children = [];
            this.events = {};
            this.attributes = {};
            this.inert = false;
            this.classes = new Set();
            this.classList = {
                add: (name) => this.classes.add(name),
                remove: (name) => this.classes.delete(name),
                toggle: (name, enabled) => enabled ? this.classes.add(name) : this.classes.delete(name),
                contains: (name) => this.classes.has(name),
            };
        }
        addEventListener(name, callback) { this.events[name] = callback; }
        setAttribute(name, value) { this.attributes[name] = value; }
        contains(element) { return element === this || this.children.some((child) => child.contains(element)); }
        focus() { document.activeElement = this; }
    }
    class Input extends Element {
        checked = false;
        click() {
            this.checked = !this.checked;
            this.events.change();
        }
    }
    const root = new Element('HTML');
    root.clientWidth = 390 - scrollbarWidth;
    root.getBoundingClientRect = () => ({ width: root.clientWidth });
    root.style = { setProperty(name, value) { this[name] = value; } };
    const header = new Element('HEADER');
    const backToTop = new Element();
    const toggle = new Input('INPUT');
    const trigger = new Element('LABEL');
    const brand = new Element('A');
    const links = Array.from({ length: 4 }, () => new Element('A'));
    const theme = new Element('BUTTON');
    const main = new Element();
    const footer = new Element('FOOTER');
    const alreadyInert = new Element();
    alreadyInert.inert = true;
    const container = new Element();
    container.children = [header, main, footer, alreadyInert];
    header.parentElement = container;
    header.querySelector = () => links[0];
    header.querySelectorAll = (selector) => selector === '.nav a'
        ? links : [brand, ...links, theme, trigger];
    const media = { addEventListener(_, callback) { this.change = callback; } };
    const document = {
        documentElement: root,
        body: { children: [container] },
        activeElement: trigger,
        events: {},
        addEventListener(name, callback) { this.events[name] = callback; },
        getElementById: (id) => id === 'back-to-top' ? backToTop : toggle,
        querySelector: (selector) => ({ '.header': header, '.nav-toggle': trigger })[selector],
    };
    const window = {
        innerWidth: 390,
        pageYOffset: 0,
        getComputedStyle: () => ({ getPropertyValue: () => '656px' }),
        matchMedia: () => media,
        events: {},
        addEventListener(name, callback) { this.events[name] = callback; },
        setTimeout(callback) { callback(); },
    };
    vm.runInNewContext(source, { document, window, HTMLElement: Element, HTMLInputElement: Input });
    document.events.DOMContentLoaded();
    const key = (value, shiftKey = false) => {
        const event = { key: value, shiftKey, prevented: false,
            preventDefault() { this.prevented = true; } };
        document.events.keydown(event);
        return event;
    };
    return { root, toggle, trigger, brand, links, main, footer, alreadyInert, media, document, key,
        window, backToTop };
}

test('opening and closing isolate and restore content and focus across repeated uses', () => {
    const page = fixture();
    for (const close of [() => page.key('Escape'), () => page.toggle.click()]) {
        page.toggle.click();
        assert.equal(page.trigger.attributes['aria-expanded'], 'true');
        assert.equal(page.document.activeElement, page.links[0]);
        assert.equal(page.main.inert, true);
        assert.equal(page.footer.inert, true);
        close();
        assert.equal(page.toggle.checked, false);
        assert.equal(page.trigger.attributes['aria-expanded'], 'false');
        assert.equal(page.root.classes.has('nav-open'), false);
        assert.equal(page.document.activeElement, page.trigger);
        assert.equal(page.main.inert, false);
        assert.equal(page.footer.inert, false);
        assert.equal(page.alreadyInert.inert, true);
    }
});

test('keyboard activation and focus boundaries work only while the menu is open', () => {
    const page = fixture();
    const activate = (key) => page.trigger.events.keydown({ key, preventDefault() {} });
    activate('Enter');
    assert.equal(page.toggle.checked, true);
    page.trigger.focus();
    assert.equal(page.key('Tab').prevented, true);
    assert.equal(page.document.activeElement, page.brand);
    assert.equal(page.key('Tab', true).prevented, true);
    assert.equal(page.document.activeElement, page.trigger);
    page.links[1].focus();
    assert.equal(page.key('Tab').prevented, false);
    activate(' ');
    assert.equal(page.toggle.checked, false);
    assert.equal(page.key('Tab').prevented, false);
});

test('opening measures the current scrollbar width, including overlay scrollbars', () => {
    for (const scrollbarWidth of [0, 5.5]) {
        const page = fixture({ scrollbarWidth });
        page.toggle.click();
        assert.equal(page.root.style['--nav-scrollbar-width'], `${scrollbarWidth}px`);
        page.toggle.click();
        page.root.clientWidth = 380;
        page.toggle.click();
        assert.equal(page.root.style['--nav-scrollbar-width'], '10px');
    }
});

test('navigation and desktop resizing release the page without focusing the mobile trigger', () => {
    for (const leave of ['link', 'resize']) {
        const page = fixture();
        page.toggle.click();
        page.links[1].focus();
        if (leave === 'link') page.links[1].events.click();
        else page.media.change({ matches: false });
        assert.equal(page.toggle.checked, false);
        assert.equal(page.root.classes.has('nav-open'), false);
        assert.equal(page.main.inert, false);
        page.links[1].events.click();
        assert.equal(page.document.activeElement, page.links[1]);
    }
});

test('history restoration clears navigation state and keeps the next activation usable', () => {
    const page = fixture();
    page.window.pageYOffset = 800;
    page.toggle.click();
    page.links[1].focus();
    page.window.events.pagehide({ persisted: true });
    assert.equal(page.toggle.checked, false);
    assert.equal(page.root.classes.has('nav-open'), false);
    assert.equal(page.main.inert, false);
    assert.equal(page.document.activeElement, page.links[1]);

    // Form state can be restored independently of the cached navigation classes.
    page.toggle.checked = true;
    page.window.events.pageshow();
    assert.equal(page.toggle.checked, false);
    assert.equal(page.trigger.attributes['aria-expanded'], 'false');
    assert.equal(page.window.pageYOffset, 800);
    page.toggle.click();
    assert.equal(page.trigger.attributes['aria-expanded'], 'true');
    assert.equal(page.main.inert, true);
});

test('back to top appears after scrolling and hides again at the top', () => {
    const page = fixture();
    page.window.pageYOffset = 500;
    page.window.events.scroll();
    assert.equal(page.backToTop.classes.has('show'), true);
    page.window.pageYOffset = 0;
    page.window.events.scroll();
    assert.equal(page.backToTop.classes.has('show'), false);
});
