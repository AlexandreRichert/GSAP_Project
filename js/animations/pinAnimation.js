// pinAnimation.js - ScrollTrigger Pin Animations
const PinAnimation = {
    init() {
        // Register ScrollTrigger plugin
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        const pinSection = document.querySelector('.pin-section');
        const pinItems = document.querySelectorAll('.pin-item');
        
        if (!pinSection || pinItems.length === 0) return;

        // Pin the section
        ScrollTrigger.create({
            trigger: pinSection,
            start: 'top top',
            end: 'bottom bottom',
            pin: '.pin-content',
            pinSpacing: false
        });

        // Animate items sequentially
        pinItems.forEach((item, index) => {
            gsap.to(item, {
                scrollTrigger: {
                    trigger: pinSection,
                    start: `top+=${index * 200} top`,
                    end: `top+=${(index + 1) * 200} top`,
                    scrub: 1
                },
                opacity: 1,
                scale: 1,
                duration: 0.5
            });
        });
    }
};

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PinAnimation;
}
