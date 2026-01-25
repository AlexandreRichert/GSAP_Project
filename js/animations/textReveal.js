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

new textReveal()
