class HorizontalCards {
  constructor() {
    this.container = null
    this.cardsStack = null
    this.cards = []

    this.maxX = 0

    // État des animations
    this.cardStates = new Map()
    this.logoAnimations = []

    // Instance pour le nettoyage
    this.scrollTrigger = null

    this.init()
  }

  /**
   * Initialise tous les composants de l'animation
   */
  init() {
    gsap.registerPlugin(ScrollTrigger)
    this.setupElements()
    this.setupInitialStates()
    this.setupCardHover()
    this.createHorizontalScrollAnimation()
  }

  /**
   * Récupère et met en cache les éléments DOM nécessaires
   */
  setupElements() {
    this.container = document.querySelector('.partenaires-section')

    if (!this.container) return

    this.cardsStack = this.container.querySelector('.partenaires-track')

    if (!this.cardsStack) return

    this.cards = Array.from(this.cardsStack.querySelectorAll('.partner-card'))
  }

  setupInitialStates() {
    if (!this.cards.length) return

    // Configure l'état initial de tous les logos (cachés vers le bas)
    this.cards.forEach((card) => {
      const img = card.querySelector('img')
      if (img) {
        gsap.set(img, { y: '100%', opacity: 0 })
        this.cardStates.set(card, { revealed: false, img })
      }
    })
  }

  /**
   * Configure les effets de hover sur les cards
   * Légère mise à l'échelle et ombre portée au survol
   */
  setupCardHover() {
    if (!this.cards.length) return

    this.cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.03,
          boxShadow: '0 1.5rem 3rem rgba(0,0,0,0.35)',
          duration: 0.25,
        })
      })

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          boxShadow: '0 0 0 rgba(0,0,0,0)',
          duration: 0.25,
        })
      })
    })
  }

  /**
   * Calcule les dimensions nécessaires pour l'animation
   */
  calculateDimensions() {
    if (!this.cardsStack) return

    const stackWidth = this.cardsStack.scrollWidth || this.cardsStack.offsetWidth
    this.maxX = Math.max(0, stackWidth - window.innerWidth * 0.25)

    const screensOfContent = this.maxX / window.innerWidth
    this.pinDuration = `+=${Math.max(1600, screensOfContent * 1600)}vh`
  }

  /**
   * Crée l'animation principale de scroll horizontal
   */
  createHorizontalScrollAnimation() {
    if (!this.container || !this.cardsStack || !this.cards.length) return

    this.calculateDimensions()

    ScrollTrigger.addEventListener('refreshInit', () => this.calculateDimensions())

    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.container,
      start: 'top top',
      end: () => this.pinDuration,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => this.handleScrollUpdate(self),
    })
  }

  /**
   * Déplace les cards horizontalement et gère l'apparition/disparition des logos
   * @param {ScrollTrigger} self -
   */
  handleScrollUpdate(self) {
    const progress = self.progress
    const x = -this.maxX * progress

    gsap.set(this.cardsStack, { x })

    this.handleLogoReveal()
  }

  /**
   * Gère l'apparition et la disparition des logos
   */
  handleLogoReveal() {
    const revealStart = window.innerWidth * 0.9
    const revealEnd = window.innerWidth * 0.2

    this.cards.forEach((card) => {
      const state = this.cardStates.get(card)
      if (!state) return

      const rect = card.getBoundingClientRect()
      const { img, revealed } = state

      const isVisibleZone = rect.right < revealStart && rect.right > revealEnd

      if (isVisibleZone && !revealed) {
        gsap.to(img, {
          y: '0%',
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        })
        state.revealed = true
      } else if (!isVisibleZone && revealed) {
        gsap.to(img, {
          y: '100%',
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
        })
        state.revealed = false
      }
    })
  }

  /**
   * Actualise les dimensions et le ScrollTrigger
   */
  refresh() {
    this.calculateDimensions()

    if (this.scrollTrigger) {
      this.scrollTrigger.refresh()
    }
  }

  /**
   * Nettoie toutes les animations et le ScrollTrigger
   * Réinitialise les éléments à leur état initial
   */
  destroy() {
    if (this.scrollTrigger) {
      this.scrollTrigger.kill()
      this.scrollTrigger = null
    }

    this.logoAnimations.forEach((animation) => {
      if (animation) animation.kill()
    })
    this.logoAnimations = []

    if (this.cardsStack) {
      gsap.set(this.cardsStack, { clearProps: 'all' })
    }

    this.cards.forEach((card) => {
      const img = card.querySelector('img')
      if (img) gsap.set(img, { clearProps: 'all' })
    })
    this.cardStates.clear()
  }
}

// Initialisation après le chargement de la fenêtre
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    try {
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        new HorizontalCards()
      } else {
        console.warn('GSAP or ScrollTrigger not found for HorizontalCards')
      }
    } catch (e) {
      console.error('Error initializing HorizontalCards', e)
    }
  })
}
