import { registerCustomElements } from "./components/customElements.js";
import { ParticleBackground } from "./components/particles.js";

registerCustomElements();

// Optimized Scroll Fade-In
function initScrollFade() {
    const fadeConfig = {
        fadeSpeed: 0.4,
        triggerOffset: 150,
        elements: 'div:not(.slider-container *, .faq-item, .faq-question), section, article, [data-fade]',
        exclude: '.slider-container *, .faq-item, .faq-question, .dot',
        batchSize: 10 // Process elements in batches to reduce memory pressure
    };

    const style = document.createElement('style');
    style.textContent = `
        .js-fade-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: 
                opacity ${fadeConfig.fadeSpeed}s ease-out,
                transform ${fadeConfig.fadeSpeed}s ease-out;
        }
        .js-fade-scroll.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Hardware-accelerate only the elements currently animating */
        .js-fade-scroll.animating {
            backface-visibility: hidden;
            perspective: 1000px;
        }
    `;
    document.head.appendChild(style);

    // Process elements in batches to reduce memory pressure
    const allElements = Array.from(document.querySelectorAll(fadeConfig.elements));
    const excluded = Array.from(document.querySelectorAll(fadeConfig.exclude));
    
    const filteredElements = allElements.filter(el => {
        return !excluded.some(excludedEl => 
            el.contains(excludedEl) || el === excludedEl || el.closest(fadeConfig.exclude)
        );
    });

    // Initialize elements in batches
    function processBatch(batch) {
        batch.forEach(el => {
            el.classList.add('js-fade-scroll');
            
            // Only add animating class during the actual animation
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animating', 'active');
                        setTimeout(() => {
                            entry.target.classList.remove('animating');
                        }, fadeConfig.fadeSpeed * 1000);
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

    // Process in batches with slight delay between them
    for (let i = 0; i < filteredElements.length; i += fadeConfig.batchSize) {
        const batch = filteredElements.slice(i, i + fadeConfig.batchSize);
        setTimeout(() => processBatch(batch), i * 50); // Stagger initialization
    }
}

// FAQ Functionality (unchanged)
function initFAQ() {
    document.querySelectorAll(".faq-question").forEach((question) => {
        question.addEventListener("click", () => {
            const item = question.parentElement;
            item.classList.toggle("active");

            document.querySelectorAll(".faq-item").forEach((otherItem) => {
                if (otherItem !== item && otherItem.classList.contains("active")) {
                    otherItem.classList.remove("active");
                }
            });
        });
    });
}

// Optimized Slider Functionality
function initSlider() {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) return;

    const track = sliderContainer.querySelector('.slider-track');
    const slides = sliderContainer.querySelectorAll('.slide');
    const dots = sliderContainer.querySelectorAll('.dot');
    let currentSlide = 0, startX = 0, isDragging = false;

    // Only animate the current and adjacent slides
    function optimizeSlideAnimations() {
        slides.forEach((slide, index) => {
            if (index >= currentSlide - 1 && index <= currentSlide + 1) {
                slide.style.willChange = 'transform';
            } else {
                slide.style.willChange = 'auto';
            }
        });
    }

    function updateSlider() {
        track.style.transition = 'transform 0.4s ease';
        track.style.transform = `translateX(${currentSlide * -100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentSlide].classList.add('active');
        optimizeSlideAnimations();
    }

    // Event handlers (same as before)
    function startDrag(e) {
        isDragging = true;
        startX = e.clientX || e.touches[0].clientX;
        track.style.transition = 'none';
        optimizeSlideAnimations();
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

    // Initialize
    track.addEventListener('mousedown', startDrag);
    track.addEventListener('touchstart', startDrag, {passive: true});
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, {passive: true});
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            if (isDragging) return;
            currentSlide = i;
            updateSlider();
        });
    });

    updateSlider();
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initScrollFade();
    initFAQ();
    initSlider();
});