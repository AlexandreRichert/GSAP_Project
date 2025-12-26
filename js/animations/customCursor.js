// customCursor.js - Custom Cursor Animation
const CustomCursor = {
    init() {
        const cursor = document.querySelector('.cursor');
        
        if (!cursor) return;

        // Only enable on desktop
        if (window.innerWidth < 768) {
            cursor.style.display = 'none';
            return;
        }

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        // Update mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor animation
        const updateCursor = () => {
            const speed = 0.15;
            
            cursorX += (mouseX - cursorX) * speed;
            cursorY += (mouseY - cursorY) * speed;

            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';

            requestAnimationFrame(updateCursor);
        };

        updateCursor();

        // Cursor effects on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .card, .slider-dot');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                gsap.to(cursor, {
                    width: 60,
                    height: 60,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            element.addEventListener('mouseleave', () => {
                gsap.to(cursor, {
                    width: 40,
                    height: 40,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });
    }
};

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomCursor;
}
