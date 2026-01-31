// js/animations/distanceCarousel.js
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

function initCarouselInternal(root = document) {
  const carousel = root.querySelector('.distances-carousel')
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
  })

  let resizeTimeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(handleResize, 250)
  })
}
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

function getPositionFromAngle(angle) {
  const rad = angle * (Math.PI / 180)
  return {
    x: Math.sin(rad) * CONFIG.radius,
    z: Math.cos(rad) * CONFIG.radius,
  }
}

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

function nextSlide() {
  if (isTransitioning) return
  currentIndex = (currentIndex + 1) % tiles.length
  rotateTo(currentIndex)
}

function previousSlide() {
  if (isTransitioning) return
  currentIndex = (currentIndex - 1 + tiles.length) % tiles.length
  rotateTo(currentIndex)
}

function goToSlide(index) {
  if (isTransitioning || index === currentIndex) return
  stopAutoRotate()
  currentIndex = index
  rotateTo(currentIndex)
  startAutoRotate()
}

function rotateTo(targetIndex) {
  isTransitioning = true
  const totalTiles = tiles.length
  const angleStep = 360 / totalTiles

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

  gsap.delayedCall(CONFIG.transitionDuration, () => {
    isTransitioning = false
    updateActiveTile()
  })
}

function updateActiveTile() {
  tiles.forEach((tile, index) => {
    if (index === currentIndex) {
      tile.classList.add('active')
      gsap.to(tile, { scale: 1.2, z: '+=100', duration: 0.4, ease: 'power2.out' })
    } else {
      tile.classList.remove('active')
      gsap.to(tile, { scale: 1, duration: 0.4, ease: 'power2.out' })
    }
  })
}

function startAutoRotate() {
  if (!isAutoRotating || autoRotateInterval) return
  autoRotateInterval = setInterval(nextSlide, CONFIG.autoRotateSpeed * 1000)
}

function stopAutoRotate() {
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval)
    autoRotateInterval = null
  }
}

function handleMouseEnter() {
  stopAutoRotate()
}

function handleMouseLeave() {
  startAutoRotate()
}

function handleResize() {
  positionTiles()
  updateActiveTile()
}

export function initCarousel(root = document) {
  initCarouselInternal(root)
}
