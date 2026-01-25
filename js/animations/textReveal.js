gsap.registerPlugin(SplitText, ScrollTrigger)

class textReveal {
  constructor() {
    this.containers = document.querySelectorAll('[data-copy-container]')
    this.init()
  }

  init() {
    this.containers.forEach((container) => {
      Array.from(container.children).forEach((el) => {
        this.split(el)
      })
    })
  }

  split(el) {
    const split = new SplitText(el, {
      type: 'lines',
      linesClass: 'line++',
    })

    // Effet de base : très bas, flou, invisible
    if (el.closest('.hero-text')) {
      gsap.set(split.lines, { y: '120vh', opacity: 0, filter: 'blur(18px)' })
      gsap.to(split.lines, {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.3,
        stagger: 0.13,
        ease: 'power4.out',
        delay: 0.25,
      })
    } else {
      gsap.set(split.lines, { yPercent: 110 })
      gsap.to(split.lines, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: false,
          once: true,
          markers: true,
        },
      })
    }
  }
}

new textReveal()
