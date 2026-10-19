const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../static/js/reading-progress.js'), 'utf8');
const math = vm.createContext({ document: { addEventListener() {} } });
vm.runInContext(source, math);

test('long article progress starts at the reading line and completes at the visible body end', () => {
    const progress = (top) => math.getReadingProgress({ top, height: 2000 }, 800, 100);
    assert.equal(progress(300), 0);
    assert.equal(progress(100), 0);
    assert.equal(progress(-550), 50);
    assert.equal(progress(-1200), 100);
    assert.equal(progress(-2000), 100);
});

test('short and empty articles have finite progress and remain complete below the body', () => {
    const progress = (top) => math.getReadingProgress({ top, height: 300 }, 800, 100);
    assert.equal(progress(900), 0);
    assert.equal(progress(650), 50);
    assert.equal(progress(500), 100);
    assert.equal(progress(-300), 100);
    assert.equal(math.getReadingProgress({ top: 100, height: 0 }, 800, 100), 0);
});

function fixture({ hasArticle = true, hasSidebar = true } = {}) {
    const state = { top: 100, height: 2000, viewport: 800, headingTops: [100, 1000] };
    const frames = [];
    const events = {};
    const rootStyle = {};
    const article = {
        style: { setProperty() {} },
        getBoundingClientRect: () => ({ top: state.top, height: state.height }),
    };
    const percentage = {};
    const attributes = {};
    const progress = { setAttribute: (key, value) => { attributes[key] = value; } };
    const sidebar = {
        clientHeight: 100,
        scrollTop: 0,
        getBoundingClientRect: () => ({ top: 100, bottom: 200 }),
    };
    const links = ['start', '章节'].map((id, index) => {
        const classes = new Set();
        const attrs = {};
        const style = {};
        return {
            hash: '#' + encodeURIComponent(id),
            classes,
            attrs,
            style: { setProperty: (key, value) => { style[key] = value; },
                getPropertyValue: (key) => style[key] },
            classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) },
            setAttribute: (key, value) => { attrs[key] = value; },
            removeAttribute: (key) => { delete attrs[key]; },
            closest: () => null,
            getBoundingClientRect: () => ({
                top: 100 + index * 200 - sidebar.scrollTop,
                bottom: 130 + index * 200 - sidebar.scrollTop,
            }),
        };
    });
    const ids = ['start', '章节'];
    let initialize;
    let resize;
    const runtime = vm.createContext({
        document: {
            documentElement: { style: { setProperty: (key, value) => { rootStyle[key] = value; } } },
            addEventListener: (_, callback) => { initialize = callback; },
            getElementById: (id) => {
                const index = ids.indexOf(id);
                return index < 0 ? null : { getBoundingClientRect: () => ({ top: state.headingTops[index] }) };
            },
            querySelectorAll: () => hasSidebar ? links : [],
            querySelector: (selector) => ({
                '.post-body': hasArticle ? article : null,
                '.header': { offsetHeight: 84 },
                '.progress-percentage': hasSidebar ? percentage : null,
                '.reading-progress': hasSidebar ? progress : null,
                '.sidebar-body': hasSidebar ? sidebar : null,
            })[selector],
        },
        window: {
            get innerHeight() { return state.viewport; },
            addEventListener: (name, callback) => { events[name] = callback; },
            requestAnimationFrame: (callback) => { frames.push(callback); return frames.length; },
        },
        ResizeObserver: class {
            constructor(callback) { resize = callback; }
            observe() {}
        },
    });
    vm.runInContext(source, runtime);
    initialize();
    return { state, events, frames, rootStyle, percentage, attributes, sidebar, links,
        resize: () => resize(), flush: () => frames.shift()() };
}

test('continuous scroll updates once per frame without waiting for scrolling to stop', () => {
    const f = fixture();
    f.state.top = -550;
    f.events.scroll();
    f.events.scroll();
    f.events.scroll();
    assert.equal(f.frames.length, 1);
    f.flush();
    assert.equal(f.percentage.textContent, '50%');
    assert.equal(f.attributes['aria-valuenow'], 50);
    assert.equal(f.rootStyle['--reading-progress'], '50%');
    f.state.top = -1200;
    f.events.scroll();
    f.flush();
    assert.equal(f.percentage.textContent, '100%');
});

test('section selection decodes anchors, keeps the active section, and scrolls only the directory', () => {
    const f = fixture();
    assert.equal(f.links[0].attrs['aria-current'], 'location');
    f.state.headingTops = [-900, 90];
    f.events.scroll();
    f.flush();
    assert.equal(f.links[0].classes.has('active'), false);
    assert.equal(f.links[0].attrs['aria-current'], undefined);
    assert.equal(f.links[1].attrs['aria-current'], 'location');
    assert.equal(f.sidebar.scrollTop, 130);
    f.events.scroll();
    f.flush();
    assert.equal(f.sidebar.scrollTop, 130);
    f.state.headingTops = [100, 1000];
    f.events.scroll();
    f.flush();
    assert.equal(f.links[0].attrs['aria-current'], 'location');
});

test('viewport, content changes and history restoration recalculate progress', () => {
    const f = fixture();
    f.state.top = -550;
    f.events.resize();
    f.flush();
    assert.equal(f.percentage.textContent, '50%');
    f.state.height = 3300;
    f.resize();
    f.flush();
    assert.equal(f.percentage.textContent, '25%');
    f.state.viewport = 1000;
    f.state.height = 300;
    f.state.top = 600;
    f.events.resize();
    f.flush();
    assert.equal(f.percentage.textContent, '100%');
    assert.equal(f.links[1].classes.has('active'), true);
    assert.ok(f.links.every(link => link.style.getPropertyValue('--chapter-progress') === '100%'));
    f.state.top = 1100;
    f.events.pageshow();
    f.flush();
    assert.equal(f.percentage.textContent, '0%');
});

test('chapter trails follow heading boundaries and reverse when reading back', () => {
    const f = fixture();
    f.state.headingTops = [300, 1000];
    f.events.scroll();
    f.flush();
    assert.equal(f.links[0].style.getPropertyValue('--chapter-progress'), '0%');
    assert.equal(f.links[1].style.getPropertyValue('--chapter-progress'), '0%');

    f.state.headingTops = [-350, 550];
    f.events.scroll();
    f.flush();
    assert.equal(f.links[0].style.getPropertyValue('--chapter-progress'), '50%');
    assert.equal(f.links[1].style.getPropertyValue('--chapter-progress'), '0%');

    f.state.headingTops = [-900, 90];
    f.events.scroll();
    f.flush();
    assert.equal(f.links[0].style.getPropertyValue('--chapter-progress'), '100%');
    assert.ok(parseFloat(f.links[1].style.getPropertyValue('--chapter-progress')) > 0);

    f.state.headingTops = [300, 1000];
    f.events.scroll();
    f.flush();
    assert.equal(f.links[0].style.getPropertyValue('--chapter-progress'), '0%');
    assert.equal(f.links[1].style.getPropertyValue('--chapter-progress'), '0%');
});

test('chapter trails stay finite for adjacent headings and reflow with content', () => {
    const f = fixture();
    f.state.headingTops = [90, 90];
    f.events.scroll();
    f.flush();
    assert.equal(f.links[0].style.getPropertyValue('--chapter-progress'), '100%');
    f.state.headingTops = [-350, 1450];
    f.resize();
    f.flush();
    assert.equal(f.links[0].style.getPropertyValue('--chapter-progress'), '25%');
});

test('entering a nested section reveals its collapsed ancestors', () => {
    const f = fixture();
    const collapsed = new Set(['child', 'parent']);
    const parent = { classList: { remove: () => collapsed.delete('parent') },
        parentElement: { closest: () => null } };
    const child = { classList: { remove: () => collapsed.delete('child') },
        parentElement: { closest: () => parent } };
    f.links[1].closest = () => child;
    f.state.headingTops = [-900, 90];
    f.events.scroll();
    f.flush();
    assert.equal(collapsed.size, 0);
});

test('resizing a directory keeps the current section visible without changing the article position', () => {
    const f = fixture();
    f.state.headingTops = [-900, 90];
    f.events.scroll();
    f.flush();
    f.sidebar.getBoundingClientRect = () => ({ top: 100, bottom: 180 });
    f.events.resize();
    f.flush();
    assert.equal(f.sidebar.scrollTop, 150);
    assert.equal(f.state.top, 100);
    assert.equal(f.links[1].attrs['aria-current'], 'location');
});

test('mobile progress works without a sidebar and non-article pages stay untouched', () => {
    const mobile = fixture({ hasSidebar: false });
    mobile.state.top = -1200;
    mobile.events.scroll();
    mobile.flush();
    assert.equal(mobile.rootStyle['--reading-progress'], '100%');
    const home = fixture({ hasArticle: false });
    assert.deepEqual(home.events, {});
    assert.deepEqual(home.rootStyle, {});
});
