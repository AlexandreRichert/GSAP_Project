// js/animations/textReveal.js
gsap.registerPlugin(SplitText, ScrollTrigger)

class textReveal {
  constructor(root = document) {
    this.root = root
    this.containers = Array.from(this.root.querySelectorAll('[data-copy-container]'))
    this.init()
    this.initParallax()
  }

  init() {
    this.containers.forEach((container) => {
      container.style.textAlign = 'center'
      const paragraphs = Array.from(container.children)

      paragraphs.forEach((el) => {
        const text = el.textContent.trim()
        el.style.textAlign = 'center'

        if (text.includes('Alors, prêt')) {
          this.createBouncingText(el)
        } else {
          this.createLetterRevealScrub(el)
        }
      })
    })

    this.animateButtons()
  }

  initParallax() {
    const parallaxImages = this.root.querySelectorAll('[data-parallax-image]')

    parallaxImages.forEach((imageWrapper) => {
      const image = imageWrapper.querySelector('.contexte-image')

      if (!image) return

      gsap.to(image, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: imageWrapper,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    })

    const parallaxSections = this.root.querySelectorAll('[data-parallax-section]')

    parallaxSections.forEach((section) => {
      const imageWrapper = section.querySelector('[data-parallax-image]')

      if (imageWrapper) {
        gsap.fromTo(
          imageWrapper,
          {
            opacity: 0,
            scale: 0.9,
          },
          {
            opacity: 1,
            scale: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'top 40%',
              scrub: 0.8,
            },
          }
        )
      }
    })

    const ctaElement = this.root.querySelector('.contexte-cta')
    if (ctaElement) {
      gsap.fromTo(
        ctaElement,
        {
          scale: 0.8,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: ctaElement,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 0.6,
          },
        }
      )
    }
  }

  createLetterRevealScrub(el) {
    const split = new SplitText(el, {
      type: 'chars,words',
      charsClass: 'char++',
      wordsClass: 'word++',
    })

    gsap.set(split.chars, {
      xPercent: 100,
      opacity: 0,
      willChange: 'transform, opacity',
    })

    gsap.to(split.chars, {
      xPercent: 0,
      opacity: 1,
      stagger: { each: 0.02, from: 'start' },
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'top 40%',
        scrub: 0.5,
      },
    })
  }

  createBouncingText(el) {
    el.style.textAlign = 'center'

    gsap.set(el, {
      y: -200,
      opacity: 0,
      willChange: 'transform, opacity',
    })

    gsap.to(el, {
      y: 0,
      opacity: 1,
      ease: 'bounce.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        end: 'top 45%',
        scrub: 1.2,
      },
    })
  }

  animateButtons() {
    const buttons = this.root.querySelector('.actions')
    if (!buttons) return

    buttons.style.display = 'flex'
    buttons.style.justifyContent = 'center'
    buttons.style.gap = '1rem'

    const btnElements = buttons.querySelectorAll('.btn')

    // État initial : boutons en bas et invisibles
    gsap.set(btnElements, {
      y: 120,
      opacity: 0,
      willChange: 'transform, opacity',
    })

    gsap.to(btnElements, {
      y: 0,
      opacity: 1,
      stagger: 0.12,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: buttons,
        start: 'top 95%',
        end: 'top 55%',
        scrub: 1,
      },
    })
  }
}

function runHeroText(root = document) {
  const heroText = root.querySelector('.hero-text')

  if (!heroText) return

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

export function initTextReveal(root = document) {
  runHeroText(root)
  new textReveal(root)
}
