function getCodeContent(block) {
    let code = '';
    
    const tableContainer = block.querySelector('.table-container');
    if (tableContainer) {
        const codeColumn = tableContainer.querySelector('td.lntd:last-child');
        if (codeColumn) {
            const codeElement = codeColumn.querySelector('code');
            if (codeElement) {
                code = codeElement.textContent;
            } else {
                const codeLines = codeColumn.querySelectorAll('.line');
                if (codeLines && codeLines.length > 0) {
                    code = Array.from(codeLines).map(line => line.textContent).join('\n');
                } else {
                    code = codeColumn.textContent;
                }
            }
        }
    }
    
    if (!code.trim()) {
        const codeElement = block.querySelector('code');
        if (codeElement) {
            code = codeElement.textContent;
        }
    }
    
    if (!code.trim()) {
        const clone = block.cloneNode(true);
        
        clone.querySelectorAll('.lnt, .ln').forEach(el => el.remove());
        
        code = clone.textContent;
    }
    
    return cleanCode(code);
}

function cleanCode(code) {
    if (!code) return '';
    
    return code
        .replace(/^\s+|\s+$/g, '')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .replace(/\t/g, '    ');
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.copy-button').forEach(btn => btn.remove());
    
    const codeBlocks = document.querySelectorAll('.post-body > pre, .post-body > .highlight');
    
    codeBlocks.forEach(function(block) {
        let language = '';
        
        const codeEl = block.querySelector('code');
        if (codeEl && codeEl.className) {
            const match = codeEl.className.match(/language-(\w+)/);
            if (match) language = match[1];
        }
        
        if (!language && block.classList.contains('highlight')) {
            const extraClass = Array.from(block.classList).find(cls => cls !== 'highlight');
            if (extraClass) language = extraClass;
        }
        
        if (language) {
            block.setAttribute('data-lang', language);
            
            block.querySelectorAll('pre, .chroma').forEach(el => {
                el.removeAttribute('data-lang');
                el.removeAttribute('data-language');
            });
        }
        
        block.addEventListener('click', function(e) {
            const rect = block.getBoundingClientRect();
            const isClickInCopyButton = 
                e.clientX > rect.right - 50 && 
                e.clientX < rect.right && 
                e.clientY < rect.top + 30;
                
            if (isClickInCopyButton) {

                const code = getCodeContent(block);
                
                navigator.clipboard.writeText(code).then(() => {
                    block.style.setProperty('--copy-text', '"Copied"');
                    setTimeout(() => {
                        block.style.setProperty('--copy-text', '"Copy"');
                    }, 1500);
                }).catch(err => console.error('Failed to copy: ', err));
            }
        });
    });
    
    document.querySelectorAll('.post-body p > code, .post-body li > code').forEach(code => {
        code.classList.add('inline-code');
    });
    
    document.querySelectorAll('.highlight table').forEach(table => {
        table.style.width = '100%';
        table.style.margin = '0';
        
        table.querySelectorAll('.lnt, .ln').forEach(cell => {
            cell.style.width = 'auto';
            cell.style.minWidth = '0.5em';
            cell.style.textAlign = 'right';
            cell.style.paddingRight = '0.1em';
            cell.style.userSelect = 'none';
            cell.style.opacity = '0.2';
        });
    });
    
    window.disableCopy = true;
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
