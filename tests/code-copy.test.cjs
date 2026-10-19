const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const context = vm.createContext({ document: { addEventListener() {} } });
vm.runInContext(fs.readFileSync(path.join(__dirname, '../static/js/custom.js'), 'utf8'), context);
const getCodeText = context.getCodeTextFromBlock;

test('highlighted code preserves continuation lines, indentation, and blank lines', () => {
    const source = 'timeout 150s taskset -c 0 \\\n  cargo test -- --nocapture\n\n# Done\n';
    const lines = source.match(/[^\n]*\n/g).map((text) => ({ textContent: text, innerText: text }));
    const block = {
        querySelector: (selector) => selector === 'table.lntable'
            ? { querySelectorAll: () => lines } : null,
    };
    assert.equal(getCodeText(block), source.trimEnd());
});

test('plain code uses source text independently of rendered layout', () => {
    const source = 'fn main() {\n\tprintln!("hello");\n}\n';
    const block = {
        querySelector: (selector) => selector === 'table.lntable'
            ? null : { textContent: source, innerText: 'Rendered text', getAttribute: () => null },
    };
    assert.equal(getCodeText(block), source.trimEnd());
});

test('missing code is harmless', () => {
    assert.equal(getCodeText(null), '');
    assert.equal(getCodeText({ querySelector: () => null }), '');
});

test('rendered diagrams copy the original source instead of generated SVG text', () => {
    const source = 'flowchart TD\n  A[Start] --> B[Done]\n';
    const attributes = {};
    const code = { textContent: source,
        setAttribute: (name, value) => { attributes[name] = value; },
        getAttribute: (name) => attributes[name] ?? null };
    const template = fs.readFileSync(path.join(__dirname,
        '../themes/meme/layouts/partials/third-party/mermaid.html'), 'utf8');
    vm.runInNewContext(template.match(/<script>([\s\S]*?)<\/script>/)[1], {
        document: { addEventListener: (_, callback) => callback(), querySelectorAll: () => [code] },
        mermaid: { initialize() {}, init() { code.textContent = 'Generated diagram CSS and labels'; } },
    });
    assert.equal(getCodeText({ querySelector: (selector) => selector === 'table.lntable' ? null : code }),
        source.trimEnd());
});

function highlightedBlock(source) {
    const element = () => ({
        children: [],
        attributes: {},
        events: {},
        classList: { add() {} },
        appendChild(child) { this.children.push(child); },
        setAttribute(name, value) { this.attributes[name] = value; },
        addEventListener(name, listener) { this.events[name] = listener; },
    });
    const classes = new Set(['highlight']);
    const scroll = element();
    const code = { getAttribute: () => 'cpp', classList: [] };
    const lines = source.split('\n').map((text) => ({ textContent: text + '\n' }));
    let header;
    const block = {
        tagName: 'DIV',
        classList: {
            add: (name) => classes.add(name),
            toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
        },
        closest: () => classes.has('code-block') ? block : null,
        prepend: (child) => { header = child; },
        querySelector(selector) {
            if (selector === 'table.lntable') return { querySelectorAll: () => lines };
            if (selector === '.table-container') return scroll;
            if (selector === '.code-header') return header;
            if (selector === '.copy-button') return header?.children.find((c) => c.className === 'copy-button');
            if (selector.startsWith('code')) return code;
            return null;
        },
    };
    let copied;
    const runtime = vm.createContext({
        document: { addEventListener() {}, createElement: element },
        navigator: { clipboard: { writeText: async (text) => { copied = text; } } },
        window: { setTimeout() {} },
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../static/js/custom.js'), 'utf8'), runtime);
    return { block, classes, scroll, runtime, copied: () => copied };
}

test('short blocks are compact and initialization does not duplicate controls', () => {
    for (const count of [1, 3, 4]) {
        const fixture = highlightedBlock(Array(count).fill('return value;').join('\n'));
        fixture.runtime.prepareCodeBlock(fixture.block);
        fixture.runtime.prepareCodeBlock(fixture.block);
        assert.equal(fixture.classes.has('code-compact'), count <= 3);
        const header = fixture.block.querySelector('.code-header');
        assert.equal(header.children.length, 2);
        assert.equal(header.children[0].textContent, 'cpp');
        assert.equal(fixture.scroll.attributes.tabindex, '0');
        assert.equal(fixture.scroll.attributes['aria-label'], 'Code content');
    }
});

test('copy includes every line beyond the visible scroll area and preserves attributes', async () => {
    const source = Array.from({ length: 30 }, (_, i) => `if (value_${i}) [[unlikely]] {}`).join('\n');
    const fixture = highlightedBlock(source);
    fixture.runtime.prepareCodeBlock(fixture.block);
    await fixture.block.querySelector('.copy-button').events.click({ preventDefault() {}, stopPropagation() {} });
    assert.equal(fixture.copied(), source);
    assert.equal(fixture.classes.has('code-compact'), false);
});
