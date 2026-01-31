document.addEventListener('DOMContentLoaded', () => {
  // Attendre un peu pour voir si Barba se charge
  setTimeout(() => {
    if (typeof barba === 'undefined') {
      console.warn('⚠️ Barba.js non chargé - Activation du fallback preloader')

      const preloader = document.querySelector('.preloader')
      if (!preloader) return

      gsap.to(preloader, {
        opacity: 0,
        duration: 1,
        delay: 0.5,
        onComplete: () => {
          preloader.style.display = 'none'
        },
      })
    } else {
    }
  }, 100)
})
