// preloader.js - Page Preloader Animation
const Preloader = {
    init() {
        const preloader = document.querySelector('.preloader');
        const progressBar = document.querySelector('.preloader-progress-bar');
        
        if (!preloader || !progressBar) return;

        // Animate progress bar
        gsap.to(progressBar, {
            width: '100%',
            duration: 2,
            ease: 'power2.inOut',
            onComplete: () => {
                // Hide preloader
                gsap.to(preloader, {
                    yPercent: -100,
                    duration: 0.8,
                    ease: 'power3.inOut',
                    onComplete: () => {
                        preloader.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                });
            }
        });
    }
};

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Preloader;
}
