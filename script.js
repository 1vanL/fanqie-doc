document.addEventListener('DOMContentLoaded', function() {
    const splineViewer = document.querySelector('spline-viewer');
    const cards = document.querySelectorAll('.card');
    
    // GSAP风格的文字分割函数
    function splitTextToChars(element) {
        const text = element.textContent;
        element.innerHTML = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char; // 保持空格
            element.appendChild(span);
        }
    }
    
    // 只为sub-title应用文字分割
    const subTitle = document.querySelector('.sub-title');
    
    if (subTitle) {
        splitTextToChars(subTitle);
    }
    
    // 设置一个固定的loading时间（6秒）
    setTimeout(() => {
        document.body.classList.add('spline-loaded');
        console.log('🎬 Loading动画结束，网站内容显示');
    }, 6000);

    // Spline加载状态检测（用于性能监控）
    let splineLoaded = false;
    let splineLoadStartTime = performance.now();
    
    // 检测Spline加载完成
    if (splineViewer) {
        // 监听Spline的load事件
        splineViewer.addEventListener('load', () => {
            const loadTime = performance.now() - splineLoadStartTime;
            splineLoaded = true;
            console.log(`🎉 Spline内容加载完成！耗时: ${Math.round(loadTime)}ms`);
        });
        
        // 监听Spline的error事件
        splineViewer.addEventListener('error', (event) => {
            console.error('❌ Spline加载失败:', event);
            document.body.classList.add('spline-error');
        });
        
        // 备用检测方法：定期检查Spline是否已渲染
        const checkSplineLoaded = () => {
            if (!splineLoaded && splineViewer.shadowRoot) {
                const canvas = splineViewer.shadowRoot.querySelector('canvas');
                if (canvas && canvas.width > 0 && canvas.height > 0) {
                    const loadTime = performance.now() - splineLoadStartTime;
                    splineLoaded = true;
                    console.log(`🎨 Spline渲染完成！耗时: ${Math.round(loadTime)}ms`);
                    setTimeout(() => {
                        document.body.classList.add('spline-loaded');
                        console.log('🎬 Loading动画结束，网站内容显示');
                    }, 5000); // 临时延长到5秒，用于测试loading动画
                    return;
                }
            }
            
            // 如果还没加载完成且未超时，继续检查
            if (!splineLoaded && performance.now() - splineLoadStartTime < 10000) {
                requestAnimationFrame(checkSplineLoaded);
            } else if (!splineLoaded) {
                console.warn('⚠️ Spline加载超时（10秒）');
                document.body.classList.add('spline-timeout');
            }
        };
        
        // 开始检查
        requestAnimationFrame(checkSplineLoaded);
    }
    
    // 提供全局函数来检查Spline加载状态
    window.isSplineLoaded = () => splineLoaded;
    window.getSplineLoadTime = () => performance.now() - splineLoadStartTime;
    
    // 加载状态监控函数
    window.getSplineLoadStatus = () => {
        const currentTime = performance.now();
        const loadTime = currentTime - splineLoadStartTime;
        
        if (splineLoaded) {
            return {
                status: 'loaded',
                loadTime: Math.round(loadTime),
                message: `Spline已加载完成，耗时${Math.round(loadTime)}ms`
            };
        } else if (loadTime > 10000) {
            return {
                status: 'timeout',
                loadTime: Math.round(loadTime),
                message: `Spline加载超时，已等待${Math.round(loadTime)}ms`
            };
        } else {
            return {
                status: 'loading',
                loadTime: Math.round(loadTime),
                message: `Spline正在加载中，已等待${Math.round(loadTime)}ms`
            };
        }
    };
    
    // 在控制台定期输出加载状态（仅在开发模式下）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const logInterval = setInterval(() => {
            if (splineLoaded) {
                clearInterval(logInterval);
                return;
            }
            
            const status = window.getSplineLoadStatus();
            console.log(`📊 ${status.message}`);
            
            if (status.status === 'timeout') {
                clearInterval(logInterval);
            }
        }, 1000);
    }
    
    // Swiper 初始化
    const swiper = new Swiper('.swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        initialSlide: 2,
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        }
    });

    // 为每个卡片添加鼠标移动事件监听
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 将鼠标位置转换为相对百分比 (-0.5 到 0.5)
            const xPercent = (x / rect.width - 0.5) * 2;
            const yPercent = (y / rect.height - 0.5) * 2;
            
            // 计算旋转角度（最大5度）
            const rotateX = -yPercent * 5;
            const rotateY = xPercent * 5;
            
            // 检查卡片是否已经完成进入动画
            const cardComponent = card.closest('.card-component');
            if (cardComponent && cardComponent.classList.contains('animate-in')) {
                // 如果动画已完成，保持最终的translateY值
                card.style.transform = `
                    perspective(1000px)
                    translateY(0)
                    scale(1)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                `;
            } else {
                // 如果动画未完成，保持初始的translateY值
                card.style.transform = `
                    perspective(1000px)
                    translateY(60px)
                    scale(1)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                `;
            }
        });

        // 鼠标离开时恢复原状
        card.addEventListener('mouseleave', () => {
            // 检查卡片是否已经完成进入动画
            const cardComponent = card.closest('.card-component');
            if (cardComponent && cardComponent.classList.contains('animate-in')) {
                // 如果动画已完成，恢复到CSS动画的最终状态
                card.style.transform = 'perspective(1000px) translateY(0) scale(1) rotateX(0) rotateY(0)';
            } else {
                // 如果动画未完成，恢复到初始状态
                card.style.transform = 'perspective(1000px) translateY(60px) scale(1) rotateX(0) rotateY(0)';
            }
        });

        // 添加过渡效果（仅在鼠标离开时）
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.6s ease-out';
        });
    });

    // Apple风格的滚动驱动动画 - 类似viewport-content效果
    const secondSlogan = document.querySelector('.second-slogan');
    const thirdSlogan = document.querySelector('.third-slogan');
    const cardComponent = document.querySelector('.card-component');
    const swiperElement = document.querySelector('.swiper');
    const animatedElements = new Set(); // 用于跟踪已动画的元素

    // 创建Intersection Observer来监听元素进入视口
    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -10% 0px', // 元素进入视口10%时触发
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedElements.has(entry.target)) {
                // 使用requestAnimationFrame确保在下一帧执行，避免阻塞
                requestAnimationFrame(() => {
                    entry.target.classList.add('animate-in');
                    animatedElements.add(entry.target);
                    // 动画完成后移除will-change以释放GPU资源
                    setTimeout(() => {
                        if (entry.target.style) {
                            entry.target.style.willChange = 'auto';
                        }
                    }, 2000);
                });
            }
        });
    }, observerOptions);

    // 开始观察second-slogan、third-slogan、card-component和swiper元素
    if (secondSlogan) {
        observer.observe(secondSlogan);
    }
    if (thirdSlogan) {
        observer.observe(thirdSlogan);
    }
    if (cardComponent) {
        observer.observe(cardComponent);
    }
    if (swiperElement) {
        observer.observe(swiperElement);
    }

    // 移除滚动视差效果，避免与CSS动画冲突
    // 动画完成后保持最终状态，不再受滚动影响
}); 