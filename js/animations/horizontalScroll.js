// horizontalScroll.js - Horizontal Scroll Animation
const HorizontalScroll = {
    init() {
        // Register ScrollTrigger plugin
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        const container = document.querySelector('.horizontal-container');
        const sections = document.querySelector('.horizontal-sections');
        
        if (!container || !sections) return;

        const horizontalSections = gsap.utils.toArray('.horizontal-section');
        
        // Calculate total scroll width
        const scrollWidth = sections.scrollWidth - window.innerWidth;

        // Create horizontal scroll animation
        gsap.to(sections, {
            x: -scrollWidth,
            ease: 'none',
            scrollTrigger: {
                trigger: container,
                start: 'top top',
                end: () => `+=${scrollWidth}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });

        // Animate each section content
        horizontalSections.forEach((section, index) => {
            const content = section.querySelector('.horizontal-content');
            
            if (!content) return;

            gsap.from(content, {
                scrollTrigger: {
                    trigger: section,
                    containerAnimation: gsap.to(sections, {
                        x: -scrollWidth,
                        ease: 'none'
                    }),
                    start: 'left center',
                    end: 'right center',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                scale: 0.8,
                duration: 0.5
            });
        });
    }
};

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HorizontalScroll;
}
