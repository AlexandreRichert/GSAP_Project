//js/animations/textReveal.js
gsap.registerPlugin(SplitText, ScrollTrigger)

class textReveal {
  constructor(root = document) {
    this.root = root
    this.containers = Array.from(this.root.querySelectorAll('[data-copy-container]'))
    this.init()
  }

  init() {
    this.containers.forEach((container) => {
      const paragraphs = Array.from(container.children)

      paragraphs.forEach((el, index) => {
        const text = el.textContent.trim()

        if (text.includes('Alors, prêt')) {
          this.createBouncingText(el)
        } else {
          this.createStaggeredBox(el, index)
        }
      })
    })

    this.animateButtons()
  }

  createStaggeredBox(el, index) {
    const wrapper = document.createElement('div')
    wrapper.className = 'text-reveal-box'

    const isRight = index % 2 === 0
    wrapper.classList.add(isRight ? 'box-right' : 'box-left')

    el.parentNode.insertBefore(wrapper, el)
    wrapper.appendChild(el)

    const split = new SplitText(el, {
      type: 'lines',
      linesClass: 'line++',
    })

    split.lines.forEach((line) => {
      const lineWrapper = document.createElement('div')
      lineWrapper.className = 'line-wrapper'
      line.parentNode.insertBefore(lineWrapper, line)
      lineWrapper.appendChild(line)
    })

    gsap.set(wrapper, {
      opacity: 0,
      y: -200,
    })

    gsap.set(split.lines, {
      xPercent: isRight ? 100 : -100,
      opacity: 0,
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 85%',
        end: 'top 30%',
        toggleActions: 'play none none none',
      },
    })

    tl.to(wrapper, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    })

    tl.to(
      split.lines,
      {
        xPercent: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
      },
      '-=0.3'
    )
  }

  createBouncingText(el) {
    const wrapper = document.createElement('div')
    wrapper.className = 'text-bounce-wrapper'
    el.parentNode.insertBefore(wrapper, el)
    wrapper.appendChild(el)

    const split = new SplitText(el, {
      type: 'chars,words',
      charsClass: 'char++',
      wordsClass: 'word++',
    })

    gsap.set(wrapper, {
      y: -300,
      opacity: 0,
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    })

    tl.to(wrapper, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'bounce.out',
    })

    tl.to(
      split.chars,
      {
        y: -10,
        duration: 0.15,
        stagger: {
          each: 0.02,
          from: 'start',
          ease: 'power1.out',
        },
      },
      '-=0.4'
    )

    tl.to(
      split.chars,
      {
        y: 0,
        duration: 0.3,
        stagger: {
          each: 0.02,
          from: 'start',
          ease: 'elastic.out(1, 0.5)',
        },
      },
      '-=0.3'
    )
  }

  animateButtons() {
    const buttons = document.querySelector('.actions')
    if (!buttons) return

    const btnElements = buttons.querySelectorAll('.btn')

    gsap.set(btnElements, {
      y: 50,
      opacity: 0,
    })

    gsap.to(btnElements, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: buttons,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    })
  }
}

function initTextReveal(root = document) {
  const heroText = root.querySelector('.hero-text')
  if (heroText) {
    const heroElements = heroText.querySelectorAll('h1, p')
    heroElements.forEach((el) => {
      const split = new SplitText(el, {
        type: 'lines',
        linesClass: 'line++',
      })

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
    })
  }

  new textReveal(root)
}

document.addEventListener('DOMContentLoaded', () => initTextReveal(document))

// Re-init when Barba inserts new container
document.addEventListener('barba:enter', (e) => {
  const container = e.detail && e.detail.container ? e.detail.container : document
  initTextReveal(container)
})
