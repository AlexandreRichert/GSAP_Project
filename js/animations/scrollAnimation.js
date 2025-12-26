// scrollAnimation.js - Scroll-Triggered Animations
const ScrollAnimation = {
    init() {
        // Register ScrollTrigger plugin
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        // Animate elements on scroll
        const scrollElements = document.querySelectorAll('.scroll-fade-in');
        
        scrollElements.forEach((element, index) => {
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                delay: index * 0.1,
                ease: 'power2.out'
            });
        });
    }
};

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollAnimation;
}
