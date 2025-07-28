// 导航栏滚动效果
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const headerWrapper = document.querySelector('.header-wrapper');
    
    // 鼠标跟踪效果
    if (headerWrapper) {
        headerWrapper.addEventListener('mousemove', function(e) {
            const rect = headerWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            document.documentElement.style.setProperty('--mouse-x', `${x}px`);
            document.documentElement.style.setProperty('--mouse-y', `${y}px`);
        });
    }
    
    // 滚动效果
    let lastScrollTop = 0;
    let scrollTimer;
    
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 添加滚动类
        if (scrollTop > 10) {
            header.classList.add('header-scrolled'); // 修改为与 CSS 中匹配的类名
        } else {
            header.classList.remove('header-scrolled');
        }
        
        // 隐藏/显示导航栏
        if (scrollTop > 100) {
            if (scrollTop > lastScrollTop) {
                // 向下滚动，隐藏导航栏
                header.classList.add('header-hidden');
            } else {
                // 向上滚动，显示导航栏
                header.classList.remove('header-hidden');
            }
        } else {
            header.classList.remove('header-hidden');
        }
        
        lastScrollTop = scrollTop;
    }
    
    // 使用节流函数优化滚动事件
    window.addEventListener('scroll', function() {
        if (!scrollTimer) {
            scrollTimer = setTimeout(function() {
                handleScroll();
                scrollTimer = null;
            }, 10);
        }
    });
    
    // 初始化
    handleScroll();
}); 