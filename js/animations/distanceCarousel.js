;(function () {
  'use strict'

  const CONFIG = {
    autoRotateSpeed: 3,
    radius: 350,
    transitionDuration: 0.6,
    pauseOnHover: true,
  }

  let currentIndex = 0
  let tiles = []
  let isAutoRotating = true
  let autoRotateInterval = null
  let isTransitioning = false

  /**
   * Initialisation
   */
  function initCarousel() {
    const carousel = document.querySelector('.distances-carousel')
    if (!carousel) {
      console.error('❌ .distances-carousel non trouvé')
      return
    }

    const track = carousel.querySelector('.distances-track')
    if (!track) {
      console.error('❌ .distances-track non trouvé')
      return
    }

    tiles = Array.from(track.querySelectorAll('.distance-tile'))

    if (tiles.length === 0) {
      console.error('❌ Aucune tuile trouvée')
      return
    }

    addCarouselControls(carousel)
    addPauseIndicator(carousel)
    positionTiles()
    updateActiveTile()
    startAutoRotate()

    if (CONFIG.pauseOnHover) {
      carousel.addEventListener('mouseenter', handleMouseEnter)
      carousel.addEventListener('mouseleave', handleMouseLeave)
    }

    tiles.forEach((tile, index) => {
      tile.addEventListener('click', () => {
        goToSlide(index)
      })
    })

    gsap.from(tiles, {
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      onComplete: () => {},
    })
  }

  /**
   * Flèches de navigation
   */
  function addCarouselControls(carousel) {
    const controls = document.createElement('div')
    controls.className = 'carousel-controls'
    controls.innerHTML = `
      <button class="carousel-arrow prev" aria-label="Distance précédente">
        <svg viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
      <button class="carousel-arrow next" aria-label="Distance suivante">
        <svg viewBox="0 0 24 24">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>
    `

    carousel.appendChild(controls)

    // Event listeners
    controls.querySelector('.prev').addEventListener('click', () => {
      stopAutoRotate()
      previousSlide()
      startAutoRotate()
    })

    controls.querySelector('.next').addEventListener('click', () => {
      stopAutoRotate()
      nextSlide()
      startAutoRotate()
    })
  }

  function addPauseIndicator(carousel) {
    const indicator = document.createElement('div')
    indicator.className = 'carousel-pause-indicator'
    carousel.appendChild(indicator)
  }

  /**
   * Calcule la position X/Z d'une tuile selon son angle
   */
  function getPositionFromAngle(angle) {
    const rad = angle * (Math.PI / 180)
    return {
      x: Math.sin(rad) * CONFIG.radius,
      z: Math.cos(rad) * CONFIG.radius,
    }
  }

  /**
   * Tuiles en cercle
   */
  function positionTiles() {
    const totalTiles = tiles.length
    const angleStep = 360 / totalTiles

    tiles.forEach((tile, index) => {
      const angle = index * angleStep
      const pos = getPositionFromAngle(angle)

      gsap.set(tile, {
        x: pos.x,
        z: pos.z,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        force3D: true,
      })
    })
  }

  /**
   * Slide suivante
   */
  function nextSlide() {
    if (isTransitioning) return
    currentIndex = (currentIndex + 1) % tiles.length
    rotateTo(currentIndex)
  }

  /**
   * Slide précédente
   */
  function previousSlide() {
    if (isTransitioning) return
    currentIndex = (currentIndex - 1 + tiles.length) % tiles.length
    rotateTo(currentIndex)
  }

  /**
   * Slide spécifique
   */
  function goToSlide(index) {
    if (isTransitioning || index === currentIndex) return
    stopAutoRotate()
    currentIndex = index
    rotateTo(currentIndex)
    startAutoRotate()
  }

  /**
   * Rotation en déplaçant CHAQUE TUILE individuellement
   */
  function rotateTo(targetIndex) {
    isTransitioning = true
    const totalTiles = tiles.length
    const angleStep = 360 / totalTiles
    const rotationAmount = angleStep

    // Pour chaque tuile, on calcule sa nouvelle position
    tiles.forEach((tile, index) => {
      const currentAngle = index * angleStep
      const newAngle = currentAngle - targetIndex * angleStep
      const normalizedAngle = ((newAngle % 360) + 360) % 360

      const newPos = getPositionFromAngle(normalizedAngle)

      gsap.to(tile, {
        x: newPos.x,
        z: newPos.z,
        duration: CONFIG.transitionDuration,
        ease: 'power2.inOut',
        force3D: true,
      })
    })

    // Une fois l'animation terminée, on met à jour l'état actif
    gsap.delayedCall(CONFIG.transitionDuration, () => {
      isTransitioning = false
      updateActiveTile()
    })
  }

  /**
   * Met à jour la classe active et anime la tuile centrale
   */
  function updateActiveTile() {
    tiles.forEach((tile, index) => {
      if (index === currentIndex) {
        tile.classList.add('active')
        gsap.to(tile, {
          scale: 1.2,
          z: '+=100',
          duration: 0.4,
          ease: 'power2.out',
          force3D: true,
        })
      } else {
        tile.classList.remove('active')
        const totalTiles = tiles.length
        const angleStep = 360 / totalTiles
        const currentAngle = index * angleStep
        const newAngle = currentAngle - currentIndex * angleStep
        const normalizedAngle = ((newAngle % 360) + 360) % 360
        const pos = getPositionFromAngle(normalizedAngle)

        gsap.to(tile, {
          scale: 1,
          z: pos.z,
          duration: 0.4,
          ease: 'power2.out',
          force3D: true,
        })
      }
    })
  }

  /**
   * Démarre la rotation automatique
   */
  function startAutoRotate() {
    if (!isAutoRotating || autoRotateInterval) return

    const rotationInterval = CONFIG.autoRotateSpeed * 1000
    autoRotateInterval = setInterval(() => {
      nextSlide()
    }, rotationInterval)
  }

  /**
   * Arrête la rotation automatique
   */
  function stopAutoRotate() {
    if (autoRotateInterval) {
      clearInterval(autoRotateInterval)
      autoRotateInterval = null
    }
  }

  /**
   * Gère l'entrée de la souris (pause)
   */
  function handleMouseEnter() {
    stopAutoRotate()
    const indicator = document.querySelector('.carousel-pause-indicator')
    if (indicator) {
      gsap.to(indicator, {
        opacity: 1,
        duration: 0.3,
        onStart: () => indicator.classList.add('visible'),
      })
    }
  }

  /**
   * Gère la sortie de la souris (reprise)
   */
  function handleMouseLeave() {
    startAutoRotate()
    const indicator = document.querySelector('.carousel-pause-indicator')
    if (indicator) {
      gsap.to(indicator, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => indicator.classList.remove('visible'),
      })
    }
  }

  /**
   * Gère le redimensionnement de la fenêtre
   */
  function handleResize() {
    if (window.innerWidth <= 768) {
      CONFIG.radius = 250
    } else if (window.innerWidth <= 480) {
      CONFIG.radius = 200
    } else {
      CONFIG.radius = 350
    }

    const totalTiles = tiles.length
    const angleStep = 360 / totalTiles

    tiles.forEach((tile, index) => {
      const currentAngle = index * angleStep
      const newAngle = currentAngle - currentIndex * angleStep
      const normalizedAngle = ((newAngle % 360) + 360) % 360
      const pos = getPositionFromAngle(normalizedAngle)

      gsap.set(tile, {
        x: pos.x,
        z: pos.z,
      })
    })

    updateActiveTile()
  }

  /**
   * Nettoie les event listeners
   */
  function cleanup() {
    stopAutoRotate()
    const carousel = document.querySelector('.distances-carousel')
    if (carousel) {
      carousel.removeEventListener('mouseenter', handleMouseEnter)
      carousel.removeEventListener('mouseleave', handleMouseLeave)
    }
    window.removeEventListener('resize', handleResize)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel)
  } else {
    initCarousel()
  }

  let resizeTimeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(handleResize, 250)
  })

  window.addEventListener('beforeunload', cleanup)
})()
