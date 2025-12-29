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
                    return line.innerText;
                })
                .join('\n')
                .trimEnd();
        }
    }

    const codeEl = block.querySelector('code[data-lang]') || block.querySelector('code');
    if (codeEl) return codeEl.innerText.trimEnd();

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

    if (getComputedStyle(block).position === 'static') {
        block.style.position = 'relative';
    }

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

    block.appendChild(button);
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.post-body > .highlight').forEach(function(block) {
        const codeEl =
            block.querySelector('code[data-lang]') ||
            block.querySelector('code[class*="language-"]');

        const language = getLanguageFromCodeElement(codeEl);
        if (language) block.setAttribute('data-lang', language);
        ensureCopyButton(block);
    });

    document
        .querySelectorAll('.post-body > pre, .post-body > div > pre')
        .forEach(function(pre) {
            const codeEl =
                pre.querySelector('code[data-lang]') ||
                pre.querySelector('code[class*="language-"]');

            const language = getLanguageFromCodeElement(codeEl);
            if (language) pre.setAttribute('data-lang', language);
            ensureCopyButton(pre);
        });

    document
        .querySelectorAll('.post-body p > code, .post-body li > code')
        .forEach(function(code) {
            code.classList.add('inline-code');
        });
});

document.addEventListener('DOMContentLoaded', function() {
    const codeBlocks = document.querySelectorAll('.post-body pre, .post-body .highlight');
    
    codeBlocks.forEach(function(block) {
        const errorElements = block.querySelectorAll('.err');
        
        errorElements.forEach(function(errorEl) {
            const text = errorEl.textContent;
            if (text === 'unlikely' || text === 'likely' || 
                text === 'fallthrough' || text === 'nodiscard' || 
                text === 'noreturn' || text === 'maybe_unused') {
                
                let prev = errorEl.previousElementSibling;
                let next = errorEl.nextElementSibling;
                
                if (prev && prev.classList.contains('o') && prev.textContent === '[' &&
                    next && next.classList.contains('o') && next.textContent === ']') {
                    prev.style.display = 'none';
                    next.style.display = 'none';
                }
                
                errorEl.style.display = 'none';
            }
        });
    });
});
