document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.querySelector('.preloader')
  const preloaderLogo = document.querySelector('.preloader-logo')

  if (!preloader || !preloaderLogo) return

  // Animation de rotation du logo pendant le chargement
  gsap.to(preloaderLogo, {
    rotation: 360,
    duration: 2,
    repeat: -1,
    ease: 'linear',
  })

  // Attendre un bit pour voir si Barba se charge
  setTimeout(() => {
    if (typeof barba === 'undefined') {
      console.warn('⚠️ Barba.js non chargé - Activation du fallback preloader')

      // Arrêter la rotation et faire disparaître
      gsap.to(preloaderLogo, {
        rotation: '+=360',
        duration: 0.5,
        ease: 'power2.in',
      })

      gsap.to(preloader, {
        opacity: 0,
        duration: 1,
        delay: 0.5,
        onComplete: () => {
          preloader.style.display = 'none'
        },
      })
    }
  }, 3000)
})
