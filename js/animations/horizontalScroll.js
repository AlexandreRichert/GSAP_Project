// js/animations/horizontalScroll.js
const MOBILE_BREAKPOINT_MQ = '(max-width: 768px)'

class HorizontalCards {
  constructor(root = document) {
    this.root = root

    this.container = null
    this.cardsStack = null
    this.cards = []

    this.maxX = 0
    this.maxY = 0

    this.cardStates = new Map()
    this.logoAnimations = []

    this.scrollTrigger = null
    this.mobileScrollTweens = []
    this.mobileQuery = typeof window !== 'undefined' ? window.matchMedia(MOBILE_BREAKPOINT_MQ) : null
    this.isMobile = this.mobileQuery ? this.mobileQuery.matches : false
    this._onMobileBreakpointChange = () => this.rebuildForBreakpoint()

    if (this.mobileQuery) {
      this.mobileQuery.addEventListener('change', this._onMobileBreakpointChange)
    }

    this.init()
  }

  init() {
    gsap.registerPlugin(ScrollTrigger)

    this.setupElements()
    if (!this.container) return

    this.setupInitialStates()
    this.setupCardHover()

    if (this.isMobile) {
      this.setupMobileAlternatingScroll()
    } else {
      this.createHorizontalScrollAnimation()
    }
  }

  rebuildForBreakpoint() {
    const nextMobile = this.mobileQuery ? this.mobileQuery.matches : false
    if (nextMobile === this.isMobile) return

    if (this.scrollTrigger) {
      this.scrollTrigger.kill()
      this.scrollTrigger = null
    }

    this.mobileScrollTweens.forEach((t) => t.kill())
    this.mobileScrollTweens = []

    if (this.cardsStack) gsap.set(this.cardsStack, { clearProps: 'transform' })

    this.cards.forEach((card) => {
      gsap.set(card, { clearProps: 'transform,opacity' })
      const img = card.querySelector('img')
      if (img) gsap.set(img, { clearProps: 'transform,opacity' })
    })

    this.cardStates.clear()
    this.isMobile = nextMobile
    this.setupInitialStates()

    if (this.isMobile) {
      this.setupMobileAlternatingScroll()
    } else {
      this.createHorizontalScrollAnimation()
    }

    ScrollTrigger.refresh()
  }

  /**
   * Récupère les éléments DANS LE CONTAINER BARBA
   */
  setupElements() {
    this.container = this.root.querySelector('.partenaires-section')

    if (!this.container) return

    this.cardsStack = this.container.querySelector('.partenaires-track')
    if (!this.cardsStack) return

    this.cards = Array.from(this.cardsStack.querySelectorAll('.partner-card'))
  }

  setupInitialStates() {
    if (!this.cards.length) return

    if (this.isMobile) {
      this.cards.forEach((card) => {
        const img = card.querySelector('img')
        if (img) {
          gsap.set(img, { y: '0%', opacity: 1 })
          this.cardStates.set(card, { revealed: true, img })
        }
      })
      return
    }

    this.cards.forEach((card) => {
      const img = card.querySelector('img')
      if (img) {
        gsap.set(img, { y: '100%', opacity: 0 })
        this.cardStates.set(card, { revealed: false, img })
      }
    })
  }

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

  calculateDimensions() {
    if (!this.cardsStack) return

    if (this.isMobile) {
      // Mobile: calcul vertical
      const stackHeight = this.cardsStack.scrollHeight || this.cardsStack.offsetHeight
      this.maxY = Math.max(0, stackHeight - window.innerHeight * 0.25)
    } else {
      // Desktop: calcul horizontal
      const stackWidth = this.cardsStack.scrollWidth || this.cardsStack.offsetWidth
      this.maxX = Math.max(0, stackWidth - window.innerWidth * 0.25)

      const screensOfContent = this.maxX / window.innerWidth
      this.pinDuration = `+=${Math.max(1600, screensOfContent * 1600)}vh`
    }
  }

  createHorizontalScrollAnimation() {
    if (!this.container || !this.cardsStack || !this.cards.length) return

    this.calculateDimensions()

    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.container,
      start: 'top top',
      end: () => this.pinDuration,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => this.handleScrollUpdate(self),
    })

    if (!this._horizontalRefreshInitAttached) {
      this._boundHorizontalRefreshInit = () => this.calculateDimensions()
      ScrollTrigger.addEventListener('refreshInit', this._boundHorizontalRefreshInit)
      this._horizontalRefreshInitAttached = true
    }
  }

  handleScrollUpdate(self) {
    const progress = self.progress
    const x = -this.maxX * progress

    gsap.set(this.cardsStack, { x })

    this.handleLogoReveal()
  }

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
   * Mobile : scroll vertical natif, cartes empilées, entrée alternée gauche / droite au scroll.
   */
  setupMobileAlternatingScroll() {
    if (this._horizontalRefreshInitAttached && this._boundHorizontalRefreshInit) {
      ScrollTrigger.removeEventListener('refreshInit', this._boundHorizontalRefreshInit)
      this._horizontalRefreshInitAttached = false
    }

    if (!this.container || !this.cardsStack || !this.cards.length) return

    const slideAmount = () => Math.min(window.innerWidth * 0.45, 240)

    this.cards.forEach((card, index) => {
      const fromLeft = index % 2 === 0
      const tween = gsap.fromTo(
        card,
        {
          x: () => (fromLeft ? -slideAmount() : slideAmount()),
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            end: 'top 56%',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      )
      this.mobileScrollTweens.push(tween)
    })
  }

  refresh() {
    this.calculateDimensions()

    if (this.scrollTrigger) {
      this.scrollTrigger.refresh()
    }
  }

  destroy() {
    if (this._horizontalRefreshInitAttached && this._boundHorizontalRefreshInit) {
      ScrollTrigger.removeEventListener('refreshInit', this._boundHorizontalRefreshInit)
      this._horizontalRefreshInitAttached = false
    }

    if (this.mobileQuery) {
      this.mobileQuery.removeEventListener('change', this._onMobileBreakpointChange)
    }

    if (this.scrollTrigger) {
      this.scrollTrigger.kill()
      this.scrollTrigger = null
    }

    this.mobileScrollTweens.forEach((t) => t.kill())
    this.mobileScrollTweens = []

    this.logoAnimations.forEach((animation) => {
      if (animation) animation.kill()
    })
    this.logoAnimations = []

    if (this.cardsStack) {
      gsap.set(this.cardsStack, { clearProps: 'all' })
    }

    this.cards.forEach((card) => {
      gsap.set(card, { clearProps: 'all' })
      const img = card.querySelector('img')
      if (img) gsap.set(img, { clearProps: 'all' })
    })

    this.cardStates.clear()
  }
}

export function initHorizontalScroll(root = document) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not found for HorizontalCards')
    return
  }

  new HorizontalCards(root)
}
