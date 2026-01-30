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

  const navEntry = performance.getEntriesByType('navigation')[0]
  const isReload = navEntry && navEntry.type === 'reload'

  if (isReload) {
    sessionStorage.removeItem('pageTransition')
  }

  const fromTransition = sessionStorage.getItem('pageTransition') === 'true'

  if (fromTransition) {
    preloader.style.display = 'none'
    document.body.style.overflow = ''
    if (mainNav) gsap.set(mainNav, { opacity: 1 })
    if (heroText) gsap.set(heroText, { opacity: 1 })

    initPageAnimations()

    console.log('Navigation détectée - Preloader sauté')
    return
  }

  console.log('Chargement initial - Preloader lancé')

  document.body.style.overflow = 'hidden'

  if (mainNav) gsap.set(mainNav, { opacity: 0 })
  if (heroText) gsap.set(heroText, { opacity: 0 })

  const preloaderTimeline = gsap.timeline({
    onComplete: () => {
      preloader.style.display = 'none'
      document.body.style.overflow = ''
      initPageAnimations()

      console.log('Preloader terminé! ✨')
    },
  })

  preloaderTimeline.to(logo, {
    rotation: 360,
    duration: 2,
    ease: 'power2.inOut',
  })

  preloaderTimeline.to({}, { duration: 0.3 })

  preloaderTimeline.add(() => {
    if (!navLogo) {
      console.warn('nav-logo non trouvé, on passe cette étape')
      return
    }

    navLogo.getBoundingClientRect()

    const navLogoRect = navLogo.getBoundingClientRect()
    const logoRect = logo.getBoundingClientRect()

    const deltaX = navLogoRect.left + navLogoRect.width / 2 - (logoRect.left + logoRect.width / 2)
    const deltaY = navLogoRect.top + navLogoRect.height / 2 - (logoRect.top + logoRect.height / 2)
    const scaleRatio = navLogoRect.width / logoRect.width

    gsap.to(logo, {
      x: deltaX,
      y: deltaY,
      scale: scaleRatio * 0.75,
      duration: 1.2,
      ease: 'power3.inOut',
    })
  })

  preloaderTimeline.to(
    preloader,
    {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
    },
    '-=0.6'
  )

  if (mainNav) {
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
  }

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

// Animation du SVG parcours
