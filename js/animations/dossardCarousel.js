document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track')
  const items = Array.from(document.querySelectorAll('.carousel-item'))
  const prevBtn = document.querySelector('.carousel-btn.prev')
  const nextBtn = document.querySelector('.carousel-btn.next')
  const carousel = document.querySelector('.carousel')

  let currentIndex = 0
  let autoplayTimer = null
  const AUTOPLAY_DELAY = 4500

  if (!track || items.length === 0) {
    console.error('Carousel: éléments manquants')
    return
  }

  function createCounter() {
    const counter = document.createElement('div')
    counter.className = 'carousel-counter'
    counter.innerHTML = `
      <span class="counter-current">01</span>
      <span class="counter-separator">/</span>
      <span class="counter-total">${String(items.length).padStart(2, '0')}</span>
    `
    carousel.appendChild(counter)
    return counter
  }

  const counter = createCounter()
  const counterCurrent = counter.querySelector('.counter-current')

  function updateCounter(index) {
    const newNumber = String(index + 1).padStart(2, '0')
    gsap.to(counterCurrent, {
      y: -10,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        counterCurrent.textContent = newNumber
        gsap.fromTo(counterCurrent, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' })
      },
    })
  }

  function initSlides() {
    items.forEach((item, i) => {
      if (i === 0) {
        gsap.set(item, { opacity: 1, visibility: 'visible', zIndex: 2 })
        const img = item.querySelector('img')
        const title = item.querySelector('.slide-title')
        const sub = item.querySelector('.slide-sub')

        if (img) gsap.set(img, { scale: 1.05 })
        if (title) gsap.set(title, { y: 0, opacity: 1 })
        if (sub) gsap.set(sub, { y: 0, opacity: 1 })
      } else {
        gsap.set(item, { opacity: 0, visibility: 'hidden', zIndex: 1 })
      }
    })
  }

  function revealText(item) {
    const title = item.querySelector('.slide-title')
    const sub = item.querySelector('.slide-sub')

    const tl = gsap.timeline()

    if (title) {
      tl.fromTo(title, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
    }

    if (sub) {
      tl.fromTo(sub, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    }
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
    const currentTitle = currentSlide.querySelector('.slide-title')
    const currentSub = currentSlide.querySelector('.slide-sub')

    if (currentTitle) {
      tl.to(
        currentTitle,
        {
          y: -20,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
        },
        0
      )
    }
    if (currentSub) {
      tl.to(
        currentSub,
        {
          y: -20,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
        },
        0
      )
    }

    if (currentImg) {
      tl.to(
        currentImg,
        {
          scale: 1.1,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        0
      )
    }

    tl.to(
      currentSlide,
      {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
      },
      0
    )

    const nextImg = nextSlide.querySelector('img')

    if (nextImg) {
      gsap.set(nextImg, { scale: 1.15 })
    }

    tl.fromTo(nextSlide, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.inOut' }, 0.3)

    if (nextImg) {
      tl.to(
        nextImg,
        {
          scale: 1.05,
          duration: 1.2,
          ease: 'power2.out',
        },
        0.3
      )
    }

    tl.call(() => revealText(nextSlide), null, 0.6)

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

  console.log('Carousel initialisé avec succès!')
})
