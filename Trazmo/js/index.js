import { registerCustomElements } from "./components/customElements.js";

registerCustomElements();

document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const item = question.parentElement;
    item.classList.toggle("active");

    // Close other open items (optional)
    document.querySelectorAll(".faq-item").forEach((otherItem) => {
      if (otherItem !== item && otherItem.classList.contains("active")) {
        otherItem.classList.remove("active");
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.slider-track');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0, startX = 0;

  // Handle drag/swipe
  track.addEventListener('mousedown', startDrag);
  track.addEventListener('touchstart', startDrag, {passive: true});
  
  function startDrag(e) {
    startX = e.clientX || e.touches[0].clientX;
    track.style.transition = 'none';
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, {passive: true});
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
  }

  function drag(e) {
    const x = e.clientX || e.touches[0].clientX;
    const diff = x - startX;
    track.style.transform = `translateX(calc(${currentSlide * -100}% + ${diff}px))`;
  }

  function endDrag(e) {
    const x = e.clientX || e.changedTouches[0].clientX;
    const diff = x - startX;
    
    if (Math.abs(diff) > 100) { // Minimum swipe distance
      if (diff < 0 && currentSlide < 2) currentSlide++; // Swipe left
      if (diff > 0 && currentSlide > 0) currentSlide--; // Swipe right
    }
    
    updateSlider();
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
  }

  // Dot navigation
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      currentSlide = i;
      updateSlider();
    });
  });

  // Update slider position
  function updateSlider() {
    track.style.transition = 'transform 0.4s ease';
    track.style.transform = `translateX(${currentSlide * -100}%)`;
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentSlide].classList.add('active');
  }

  // Initialize
  updateSlider();
});