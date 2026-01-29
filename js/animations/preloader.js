document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger)

  const preloader = document.querySelector('.preloader')
  const logo = document.querySelector('.preloader-logo')
  const navLogo = document.querySelector('.nav-logo')
  const mainNav = document.querySelector('.main-nav')
  const heroContent = document.querySelector('.hero-content')
  const heroText = document.querySelector('.hero-text')

  if (!preloader || !logo) {
    console.error('Preloader: éléments manquants')
    return
  }

  // CORRECTION: Vérifier le type de navigation AVANT de lire sessionStorage
  const navEntry = performance.getEntriesByType('navigation')[0]
  const isReload = navEntry && navEntry.type === 'reload'

  // Si c'est un reload, effacer le sessionStorage
  if (isReload) {
    sessionStorage.removeItem('pageTransition')
  }

  // Maintenant vérifier si on vient d'une transition de page (navigation)
  const fromTransition = sessionStorage.getItem('pageTransition') === 'true'

  if (fromTransition) {
    // Si on vient d'une navigation, pas de preloader
    preloader.style.display = 'none'
    document.body.style.overflow = ''

    // S'assurer que la navbar et le contenu sont visibles
    if (mainNav) gsap.set(mainNav, { opacity: 1 })
    if (heroText) gsap.set(heroText, { opacity: 1 })

    // Initialiser les animations de page directement
    initPageAnimations()

    console.log('Navigation détectée - Preloader sauté')
    return
  }

  // Sinon, c'est un vrai chargement/refresh : lancer le preloader
  console.log('Chargement initial - Preloader lancé')

  // Empêcher le scroll pendant le preloader
  document.body.style.overflow = 'hidden'

  // S'assurer que la navbar et le hero sont cachés au départ
  gsap.set(mainNav, { opacity: 0 })
  gsap.set(heroText, { opacity: 0 })

  // Timeline principale du preloader
  const preloaderTimeline = gsap.timeline({
    onComplete: () => {
      // Retirer le preloader du DOM
      preloader.style.display = 'none'
      document.body.style.overflow = ''

      // Initialiser les autres animations ScrollTrigger après le preloader
      initPageAnimations()

      console.log('Preloader terminé! ✨')
    },
  })

  // 1. Rotation lente du logo au centre (tour complet)
  preloaderTimeline.to(logo, {
    rotation: 360,
    duration: 2,
    ease: 'power2.inOut',
  })

  // 2. Pause courte après la rotation
  preloaderTimeline.to({}, { duration: 0.3 })

  // 3. Déplacer le logo vers la navbar
  preloaderTimeline.add(() => {
    if (!navLogo) {
      console.warn('nav-logo non trouvé, on passe cette étape')
      return
    }

    // Forcer un reflow pour obtenir les bonnes positions
    navLogo.getBoundingClientRect()

    const navLogoRect = navLogo.getBoundingClientRect()
    const logoRect = logo.getBoundingClientRect()

    // Calculer les deltas
    const deltaX = navLogoRect.left + navLogoRect.width / 2 - (logoRect.left + logoRect.width / 2)
    const deltaY = navLogoRect.top + navLogoRect.height / 2 - (logoRect.top + logoRect.height / 2)
    const scaleRatio = navLogoRect.width / logoRect.width

    // Animation de déplacement
    gsap.to(logo, {
      x: deltaX,
      y: deltaY,
      scale: scaleRatio * 0.75,
      duration: 1.2,
      ease: 'power3.inOut',
    })
  })

  // 4. Fade out du fond du preloader en parallèle
  preloaderTimeline.to(
    preloader,
    {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
    },
    '-=0.6'
  )

  // 5. Apparition de la navbar
  preloaderTimeline.to(
    mainNav,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    },
    '-=0.5'
  )

  // 6. Apparition du contenu hero
  if (heroText) {
    preloaderTimeline.to(
      heroText,
      {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      },
      '-=0.6'
    )

    // 7. Animation des éléments de texte individuels
    const heroTitle = heroText.querySelector('h1')
    const heroParagraph = heroText.querySelector('p')

    if (heroTitle) {
      gsap.set(heroTitle, { y: 40, opacity: 0 })
      preloaderTimeline.to(
        heroTitle,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.6'
      )
    }

    if (heroParagraph) {
      gsap.set(heroParagraph, { y: 30, opacity: 0 })
      preloaderTimeline.to(
        heroParagraph,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.5'
      )
    }
  }

  console.log('Preloader GSAP initialisé avec succès! ✨')
})

// Fonction pour initialiser les animations de page après le preloader
function initPageAnimations() {
  // Animation du titre "Le Parcours"
  const parcoursTitle = document.querySelector('.parcours-wrapper h2')
  if (parcoursTitle) {
    gsap.from(parcoursTitle, {
      scrollTrigger: {
        trigger: parcoursTitle,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    })
  }

  // Animation du SVG parcours
  const svgPath = document.querySelector('.parcours-svg-path')
  if (svgPath) {
    gsap.to(svgPath, {
      scrollTrigger: {
        trigger: '.parcours-section',
        start: 'top 60%',
        end: 'bottom 20%',
        scrub: 1,
      },
      strokeDashoffset: 0,
      ease: 'none',
    })
  }

  // Animation des tuiles de distance
  const distanceTiles = document.querySelectorAll('.distance-tile')
  if (distanceTiles.length > 0) {
    gsap.from(distanceTiles, {
      scrollTrigger: {
        trigger: '.distances-section',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      y: 80,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
    })
  }

  // Animation des cartes partenaires
  const partnerCards = document.querySelectorAll('.partner-card')
  if (partnerCards.length > 0) {
    partnerCards.forEach((card) => {
      const img = card.querySelector('img')
      if (img) {
        gsap.to(img, {
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        })
      }
    })
  }

  console.log('Animations de page initialisées! 🎨')
}
