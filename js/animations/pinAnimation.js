gsap.registerPlugin(ScrollTrigger)

const path = document.querySelector('.parcours-svg-path')

if (!path) {
  console.warn('Parcours SVG path introuvable')
} else {
  const pathLength = path.getTotalLength()

  gsap.set(path, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  })

  gsap.to(path, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.parcours-wrapper',
      start: 'top top',
      end: '+=1000',
      scrub: true,
      pin: '.parcours-section',
    },
  })
}
