// js/animations/textReveal.js
gsap.registerPlugin(SplitText, ScrollTrigger)

class textReveal {
  constructor(root = document) {
    this.root = root
    this.containers = Array.from(this.root.querySelectorAll('[data-copy-container]'))
    this.init()
  }

  init() {
    this.containers.forEach((container) => {
      // center the whole content area so all paragraphs and buttons are centered
      container.style.textAlign = 'center'
      const paragraphs = Array.from(container.children)

      paragraphs.forEach((el) => {
        const text = el.textContent.trim()
        el.style.textAlign = 'center'

        if (text.includes('Alors, prêt')) {
          this.createBouncingText(el)
        } else {
          this.createLetterReveal(el)
        }
      })
    })
  }

  createLetterReveal(el) {
    const split = new SplitText(el, {
      type: 'chars,words',
      charsClass: 'char++',
      wordsClass: 'word++',
    })

    // start off to the right, invisible
    gsap.set(split.chars, {
      xPercent: 100,
      opacity: 0,
      willChange: 'transform, opacity',
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    tl.to(split.chars, {
      xPercent: 0,
      opacity: 1,
      duration: 0.6,
      stagger: { each: 0.03, from: 'start' },
      ease: 'power2.out',
    })
  }

  createBouncingText(el) {
    // center it
    el.style.textAlign = 'center'

    // initial state offscreen above
    gsap.set(el, {
      y: -300,
      opacity: 0,
      willChange: 'transform, opacity',
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        toggleActions: 'play none none none',
      },
    })

    // small delay to wait a bit when reaching bottom
    tl.to(el, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'bounce.out',
      delay: 0.35,
    })

    // once bounce finished, reveal buttons
    tl.eventCallback('onComplete', () => this.animateButtons())
  }

  animateButtons() {
    const buttons = this.root.querySelector('.actions')
    if (!buttons) return

    // ensure buttons container is centered
    buttons.style.display = 'flex'
    buttons.style.justifyContent = 'center'
    buttons.style.gap = '1rem'

    const btnElements = buttons.querySelectorAll('.btn')

    gsap.set(btnElements, {
      y: 50,
      opacity: 0,
      willChange: 'transform, opacity',
    })

    gsap.to(btnElements, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: 'back.out(1.7)',
    })
  }
}

/* =====================================================
   HERO TEXT (inchangé)
   ===================================================== */

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

/* =====================================================
   ✅ MODIF — EXPORT POUR BARBA (REMPLACE TOUS LES EVENTS)
   ===================================================== */

export function initTextReveal(root = document) {
  runHeroText(root)
  new textReveal(root)
}

/* =====================================================
   ❌ SUPPRIMÉ (remplacé par Barba hooks)
   document.addEventListener('DOMContentLoaded', ...)
   document.addEventListener('barba:enter', ...)
   ===================================================== */
