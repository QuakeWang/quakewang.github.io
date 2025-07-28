document.addEventListener('DOMContentLoaded', function() {
    const codeBlocks = document.querySelectorAll('.post-body pre');
    
    codeBlocks.forEach(function(pre) {
        let language = '';
        const codeElement = pre.querySelector('code');
        
        if (codeElement) {
            const classList = codeElement.classList;
            for (const className of classList) {
                if (className.startsWith('language-')) {
                    language = className.replace('language-', '');
                    break;
                }
            }
        }
        
        if (language) {
            pre.setAttribute('data-lang', language);
        }
        
    });
    
    const inlineCodes = document.querySelectorAll('.post-body p > code, .post-body li > code');
    inlineCodes.forEach(function(code) {
        code.classList.add('inline-code');
    });
});
