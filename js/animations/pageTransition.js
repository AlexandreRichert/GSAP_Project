// pageTransition.js - Smooth Page Transitions
const PageTransition = {
    init() {
        const pageLinks = document.querySelectorAll('.page-link');
        const transition = document.querySelector('.page-transition');
        
        if (!transition) return;

        pageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                
                // Animate transition overlay
                gsap.timeline()
                    .to(transition, {
                        yPercent: 0,
                        duration: 0.5,
                        ease: 'power2.inOut'
                    })
                    .call(() => {
                        window.location.href = target;
                    }, null, '+=0.2');
            });
        });

        // Transition out on page load
        gsap.to(transition, {
            yPercent: 100,
            duration: 0.5,
            ease: 'power2.inOut',
            delay: 0.3
        });
    }
};

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageTransition;
}
