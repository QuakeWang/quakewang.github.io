function getLanguageFromCodeElement(codeEl) {
    if (!codeEl) return '';

    const dataLang = codeEl.getAttribute('data-lang');
    if (dataLang) return dataLang;

    for (const className of codeEl.classList) {
        if (className.startsWith('language-')) {
            return className.slice('language-'.length);
        }
    }

    return '';
}

function getCodeTextFromBlock(block) {
    if (!block) return '';

    const lineTable = block.querySelector('table.lntable');
    if (lineTable) {
        const lines = lineTable.querySelectorAll('.lntd:last-child .line');
        if (lines.length > 0) {
            return Array.from(lines)
                .map(function(line) {
                    return line.textContent.replace(/\r?\n$/, '');
                })
                .join('\n')
                .trimEnd();
        }
    }

    const codeEl = block.querySelector('code[data-lang]') || block.querySelector('code');
    if (codeEl) return (codeEl.getAttribute('data-code-source') ?? codeEl.textContent).trimEnd();

    return '';
}

function copyTextToClipboard(text) {
    if (!text) return Promise.resolve();

    if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        return navigator.clipboard.writeText(text);
    }

    return new Promise(function(resolve, reject) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.top = '-9999px';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();

            const ok = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (ok) resolve();
            else reject(new Error('Copy command was unsuccessful'));
        } catch (err) {
            reject(err);
        }
    });
}

function ensureCopyButton(block) {
    if (!block) return;
    if (block.querySelector('.copy-button')) return;
    if (!block.querySelector('code')) return;

    const button = document.createElement('button');
    button.className = 'copy-button';
    button.type = 'button';
    button.innerText = 'Copy';
    button.setAttribute('aria-label', 'Copy code');

    button.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();

        const codeText = getCodeTextFromBlock(block);
        copyTextToClipboard(codeText)
            .then(function() {
                button.innerText = 'Copied';
                window.setTimeout(function() {
                    button.innerText = 'Copy';
                }, 1000);
            })
            .catch(function() {
                button.innerText = 'Error';
                window.setTimeout(function() {
                    button.innerText = 'Copy';
                }, 1000);
            });
    });

    block.querySelector('.code-header').appendChild(button);
}

function prepareCodeBlock(element) {
    if (element.closest('.code-block')) return;
    const code = element.querySelector('code[data-lang]') || element.querySelector('code');
    if (!code) return;

    let block = element;
    if (element.tagName === 'PRE') {
        block = document.createElement('div');
        element.before(block);
        block.appendChild(element);
    }
    block.classList.add('code-block');
    block.classList.toggle('code-compact', getCodeTextFromBlock(block).split('\n').length <= 3);

    const scroll = block.querySelector('.table-container') || block.querySelector('pre');
    scroll.classList.add('code-scroll');
    scroll.setAttribute('tabindex', '0');
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', 'Code content');

    const header = document.createElement('div');
    header.className = 'code-header';
    const language = document.createElement('span');
    language.className = 'code-language';
    language.textContent = getLanguageFromCodeElement(code);
    header.appendChild(language);
    block.prepend(header);
    ensureCopyButton(block);
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.post-body .highlight, .post-body pre').forEach(function(element) {
        if (element.tagName === 'PRE' && element.closest('.highlight')) return;
        prepareCodeBlock(element);
    });

    document
        .querySelectorAll('.post-body p > code, .post-body li > code')
        .forEach(function(code) {
            code.classList.add('inline-code');
        });
});
