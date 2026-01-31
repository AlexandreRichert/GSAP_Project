// Transforme ce fichier en module exportable : export function initDossardCarousel(root = document)
// La fonction initialise le carousel à l'intérieur de `root` (utile pour Barba.js)
export function initDossardCarousel(root = document) {
  const track = root.querySelector('.carousel-track')
  const items = Array.from(root.querySelectorAll('.carousel-item'))
  const prevBtn = root.querySelector('.carousel-btn.prev')
  const nextBtn = root.querySelector('.carousel-btn.next')
  const carousel = root.querySelector('.carousel')

  const titleEl = root.querySelector('.slide-title-vertical')
  const subEl = root.querySelector('.slide-sub-vertical')
  const counterCurrent = root.querySelector('.counter-current')
  const counterTotal = root.querySelector('.counter-total')

  let currentIndex = 0
  let autoplayTimer = null
  const AUTOPLAY_DELAY = 4500

  if (!track || items.length === 0) {
    // Pas d'éléments pour ce carousel dans le `root` fourni -> on quitte
    // silencieusement (évite le spam de la console lors de navigations
    // Barba sur d'autres pages qui n'ont pas ce carousel).
    return
  }

  if (counterTotal) {
    counterTotal.textContent = String(items.length).padStart(2, '0')
  }

  function updateLeftPanel(item) {
    const title = item.getAttribute('data-title') || ''
    const sub = item.getAttribute('data-sub') || ''

    if (!titleEl || !subEl) return
    const tl = gsap.timeline()
    tl.to([titleEl, subEl], {
      y: -20,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    })

    tl.call(() => {
      titleEl.textContent = title
      subEl.textContent = sub
    })

    tl.fromTo(titleEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
    tl.fromTo(subEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4')
  }

  function updateCounter(index) {
    if (!counterCurrent) return
    const newNumber = String(index + 1).padStart(2, '0')
    gsap.to(counterCurrent, {
      y: -15,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        counterCurrent.textContent = newNumber
        gsap.fromTo(counterCurrent, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' })
      },
    })
  }

  function initSlides() {
    items.forEach((item, i) => {
      if (i === 0) {
        gsap.set(item, { opacity: 1, visibility: 'visible', zIndex: 2 })
        const img = item.querySelector('img')
        if (img) gsap.set(img, { scale: 1.0 })
        updateLeftPanel(item)
      } else {
        gsap.set(item, { opacity: 0, visibility: 'hidden', zIndex: 1 })
      }
    })
  }

  function goTo(newIndex) {
    if (gsap.isTweening(items[currentIndex])) return

    newIndex = ((newIndex % items.length) + items.length) % items.length
    if (newIndex === currentIndex) return

    const currentSlide = items[currentIndex]
    const nextSlide = items[newIndex]

    const tl = gsap.timeline({
      onStart: () => {
        gsap.set(nextSlide, { visibility: 'visible', zIndex: 3 })
      },
      onComplete: () => {
        gsap.set(currentSlide, { visibility: 'hidden', zIndex: 1 })
        gsap.set(nextSlide, { zIndex: 2 })
        currentIndex = newIndex
      },
    })

    const currentImg = currentSlide.querySelector('img')
    if (currentImg) {
      tl.to(
        currentImg,
        {
          scale: 1.08,
          duration: 0.9,
          ease: 'power2.inOut',
        },
        0
      )
    }

    tl.to(
      currentSlide,
      {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.inOut',
      },
      0
    )

    const nextImg = nextSlide.querySelector('img')
    if (nextImg) {
      gsap.set(nextImg, { scale: 1.1 })
    }
    tl.fromTo(nextSlide, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.inOut' }, 0.3)

    if (nextImg) {
      tl.to(
        nextImg,
        {
          scale: 1.0,
          duration: 1.4,
          ease: 'power2.out',
        },
        0.3
      )
    }
    tl.call(() => updateLeftPanel(nextSlide), null, 0.4)
    updateCounter(newIndex)
  }

  function next() {
    goTo(currentIndex + 1)
    restartAutoplay()
  }

  function prev() {
    goTo(currentIndex - 1)
    restartAutoplay()
  }

  if (prevBtn) prevBtn.addEventListener('click', prev)
  if (nextBtn) nextBtn.addEventListener('click', next)

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  })

  let isDragging = false
  let startX = 0
  let currentX = 0

  function onPointerDown(e) {
    isDragging = true
    startX = e.touches ? e.touches[0].clientX : e.clientX
  }

  function onPointerMove(e) {
    if (!isDragging) return
    currentX = e.touches ? e.touches[0].clientX : e.clientX
  }

  function onPointerUp() {
    if (!isDragging) return
    isDragging = false

    const deltaX = currentX - startX
    const threshold = window.innerWidth * 0.15
    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        next()
      } else {
        prev()
      }
    }
  }

  track.addEventListener('touchstart', onPointerDown, { passive: true })
  track.addEventListener('touchmove', onPointerMove, { passive: true })
  track.addEventListener('touchend', onPointerUp)

  track.addEventListener('mousedown', onPointerDown)
  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mouseup', onPointerUp)

  function startAutoplay() {
    stopAutoplay()
    autoplayTimer = setInterval(() => next(), AUTOPLAY_DELAY)
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer)
      autoplayTimer = null
    }
  }

  function restartAutoplay() {
    stopAutoplay()
    startAutoplay()
  }

  if (carousel) {
    carousel.addEventListener('mouseenter', stopAutoplay)
    carousel.addEventListener('mouseleave', startAutoplay)
  }

  initSlides()
  startAutoplay()

  // Retourne un objet utile pour debug si nécessaire
  return {
    goTo,
    next,
    prev,
  }
}
