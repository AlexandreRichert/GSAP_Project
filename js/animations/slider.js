// slider.js - GSAP Slider
const Slider = {
    currentSlide: 0,
    totalSlides: 0,
    isAnimating: false,

    init() {
        const slider = document.querySelector('.slider');
        const track = document.querySelector('.slider-track');
        const slides = document.querySelectorAll('.slide');
        const prevBtn = document.querySelector('.slider-btn-prev');
        const nextBtn = document.querySelector('.slider-btn-next');
        const dots = document.querySelectorAll('.slider-dot');
        
        if (!slider || !track || slides.length === 0) return;

        this.totalSlides = slides.length;

        // Next slide
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.goToSlide(this.currentSlide + 1);
            });
        }

        // Previous slide
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.goToSlide(this.currentSlide - 1);
            });
        }

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });

        // Auto-play
        this.startAutoPlay();
    },

    goToSlide(index) {
        if (this.isAnimating) return;

        // Loop around
        if (index >= this.totalSlides) {
            index = 0;
        } else if (index < 0) {
            index = this.totalSlides - 1;
        }

        if (index === this.currentSlide) return;

        this.isAnimating = true;
        const track = document.querySelector('.slider-track');
        const dots = document.querySelectorAll('.slider-dot');

        // Animate slide
        gsap.to(track, {
            x: -index * 100 + '%',
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                this.currentSlide = index;
                this.isAnimating = false;
                
                // Update dots
                dots.forEach((dot, dotIndex) => {
                    if (dotIndex === index) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        });
    },

    startAutoPlay() {
        setInterval(() => {
            if (!this.isAnimating) {
                this.goToSlide(this.currentSlide + 1);
            }
        }, 4000);
    }
};

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Slider;
}
