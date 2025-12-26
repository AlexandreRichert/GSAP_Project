// textReveal.js - Text Reveal Animations
const TextReveal = {
    init() {
        const textElements = document.querySelectorAll('.text-reveal');
        
        textElements.forEach((element, index) => {
            const words = element.querySelectorAll('.word');
            
            if (words.length === 0) return;
            
            // Create animation timeline
            const tl = gsap.timeline({
                delay: index * 0.1 + 2.5 // Delay after preloader
            });
            
            words.forEach((word, wordIndex) => {
                tl.to(word, {
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out'
                }, wordIndex * 0.1);
            });
        });
    }
};

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextReveal;
}
