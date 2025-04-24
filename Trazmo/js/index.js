import { registerCustomElements } from "./components/customElements.js";
import { ParticleBackground } from "./components/particles.js";

registerCustomElements();

// Optimized Scroll Fade-In that doesn't affect layout
function initScrollFade() {
    const fadeConfig = {
        fadeSpeed: 0.4,
        triggerOffset: 150,
        elements: 'div:not(.slider-container *, .faq-item, .faq-question, .no-fade), section:not(.no-fade), article:not(.no-fade), [data-fade]',
        exclude: '.slider-container *, .faq-item, .faq-question, .dot, .no-fade, #lensFlareCanvas',
        batchSize: 10
    };

    // Add minimal styles that won't affect layout
    const style = document.createElement('style');
    style.textContent = `
        .js-fade-scroll {
            opacity: 0;
            will-change: opacity;
            transition: opacity ${fadeConfig.fadeSpeed}s ease-out;
        }
        .js-fade-scroll.active {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Get all potential elements and excluded elements
    const allElements = Array.from(document.querySelectorAll(fadeConfig.elements));
    const excludedElements = Array.from(document.querySelectorAll(fadeConfig.exclude));

    // Filter out excluded elements and their children
    const filteredElements = allElements.filter(el => {
        return !excludedElements.some(excludedEl => 
            el === excludedEl || 
            el.contains(excludedEl) || 
            el.closest(fadeConfig.exclude)
        );
    });

    // Process elements in batches for better performance
    function processBatch(batch) {
        batch.forEach(el => {
            // Skip if already processed or should be excluded
            if (el.classList.contains('js-fade-scroll') || 
                el.matches(fadeConfig.exclude) || 
                el.closest(fadeConfig.exclude)) {
                return;
            }

            el.classList.add('js-fade-scroll');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: `0px 0px -${fadeConfig.triggerOffset}px 0px`,
                threshold: 0.1
            });
            
            observer.observe(el);
        });
    }

    // Process elements in staggered batches
    for (let i = 0; i < filteredElements.length; i += fadeConfig.batchSize) {
        setTimeout(() => {
            const batch = filteredElements.slice(i, i + fadeConfig.batchSize);
            processBatch(batch);
        }, i * 50);
    }
}

// FAQ Functionality
function initFAQ() {
    document.querySelectorAll(".faq-question").forEach((question) => {
        question.addEventListener("click", () => {
            const item = question.parentElement;
            item.classList.toggle("active");

            // Close other open FAQ items
            document.querySelectorAll(".faq-item").forEach((otherItem) => {
                if (otherItem !== item && otherItem.classList.contains("active")) {
                    otherItem.classList.remove("active");
                }
            });
        });
    });
}

// Slider Functionality
function initSlider() {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) return;

    const track = sliderContainer.querySelector('.slider-track');
    const slides = sliderContainer.querySelectorAll('.slide');
    const dots = sliderContainer.querySelectorAll('.dot');
    let currentSlide = 0, startX = 0, isDragging = false;

    function updateSlider() {
        track.style.transition = 'transform 0.4s ease';
        track.style.transform = `translateX(${currentSlide * -100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentSlide].classList.add('active');
    }

    function startDrag(e) {
        isDragging = true;
        startX = e.clientX || e.touches[0].clientX;
        track.style.transition = 'none';
    }

    function drag(e) {
        if (!isDragging) return;
        const x = e.clientX || e.touches[0].clientX;
        const diff = x - startX;
        track.style.transform = `translateX(calc(${currentSlide * -100}% + ${diff}px))`;
    }

    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        
        const x = e.clientX || e.changedTouches[0].clientX;
        const diff = x - startX;
        
        if (Math.abs(diff) > 100) {
            if (diff < 0 && currentSlide < slides.length - 1) currentSlide++;
            if (diff > 0 && currentSlide > 0) currentSlide--;
        }
        
        updateSlider();
    }

    // Event listeners
    track.addEventListener('mousedown', startDrag);
    track.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: true });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    // Dot navigation
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            if (isDragging) return;
            currentSlide = i;
            updateSlider();
        });
    });

    // Initialize
    updateSlider();
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initScrollFade();
    initFAQ();
    initSlider();
});