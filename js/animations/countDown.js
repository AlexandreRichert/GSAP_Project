gsap.registerPlugin(ScrollTrigger)

class CountdownTimer {
  constructor(root = document) {
    this.root = root

    this.targetDate = new Date('2026-05-30T10:00:00+02:00')

    this.elements = {
      months: this.root.querySelector('.countdown-number[data-unit="months"]'),
      days: this.root.querySelector('.countdown-number[data-unit="days"]'),
      hours: this.root.querySelector('.countdown-number[data-unit="hours"]'),
      minutes: this.root.querySelector('.countdown-number[data-unit="minutes"]'),
      seconds: this.root.querySelector('.countdown-number[data-unit="seconds"]'),
    }

    this.previousValues = {
      months: -1,
      days: -1,
      hours: -1,
      minutes: -1,
      seconds: -1,
    }

    this.timerInterval = null
    this.scrollTriggers = []

    this.init()
  }

  init() {
    this.updateCountdown()
    this.startTimer()
    this.setupScrollAnimation()
  }

  calculateTimeRemaining() {
    const now = new Date()
    const difference = this.targetDate - now

    if (difference <= 0) {
      return {
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      }
    }

    // Calcul précis des mois, jours, heures, minutes, secondes
    const totalSeconds = Math.floor(difference / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)
    const totalHours = Math.floor(totalMinutes / 60)
    const totalDays = Math.floor(totalHours / 24)

    // Calcul approximatif des mois (en considérant 30.44 jours par mois en moyenne)
    const months = Math.floor(totalDays / 30.44)
    const days = Math.floor(totalDays % 30.44)
    const hours = totalHours % 24
    const minutes = totalMinutes % 60
    const seconds = totalSeconds % 60

    return {
      months,
      days,
      hours,
      minutes,
      seconds,
      total: difference,
    }
  }

  animateDigitChange(element, newValue, duration = 0.6) {
    if (!element) return

    const currentText = element.textContent
    const newText = String(newValue).padStart(2, '0')

    if (currentText === newText) return

    // Animation de flip pour le changement de chiffre
    const tl = gsap.timeline()

    tl.to(element, {
      rotationX: 90,
      duration: duration / 2,
      ease: 'power2.in',
      transformOrigin: '50% 50%',
      onComplete: () => {
        element.textContent = newText
      },
    }).to(element, {
      rotationX: 0,
      duration: duration / 2,
      ease: 'power2.out',
      transformOrigin: '50% 50%',
    })
  }

  updateCountdown() {
    const time = this.calculateTimeRemaining()

    Object.keys(this.elements).forEach((unit) => {
      const newValue = time[unit]
      if (this.previousValues[unit] !== newValue && this.elements[unit]) {
        this.animateDigitChange(this.elements[unit], newValue, unit === 'seconds' ? 0.4 : 0.6)
        this.previousValues[unit] = newValue
      }
    })
  }

  startTimer() {
    this.updateCountdown()
    this.timerInterval = setInterval(() => {
      this.updateCountdown()
    }, 1000)
  }

  setupScrollAnimation() {
    const countdownUnits = this.root.querySelectorAll('.countdown-unit')
    const countdownTitle = this.root.querySelector('.countdown-title')
    const countdownSection = this.root.querySelector('.countdown-section')

    if (!countdownSection) return

    // Animation d'apparition au scroll - Titre
    if (countdownTitle) {
      const titleTrigger = ScrollTrigger.create({
        trigger: countdownSection,
        start: 'top 80%',
        end: 'top 50%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          gsap.from(countdownTitle, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out',
          })
        },
      })

      this.scrollTriggers.push(titleTrigger)
    }

    // Animation en cascade des unités de temps
    if (countdownUnits.length > 0) {
      countdownUnits.forEach((unit, index) => {
        const unitTrigger = ScrollTrigger.create({
          trigger: countdownSection,
          start: 'top 75%',
          end: 'top 45%',
          toggleActions: 'play none none reverse',
          onEnter: () => {
            gsap.from(unit, {
              opacity: 0,
              y: 100,
              rotationX: -90,
              duration: 1,
              delay: index * 0.15,
              ease: 'power3.out',
              transformOrigin: '50% 50%',
            })
          },
        })

        this.scrollTriggers.push(unitTrigger)
      })
    }
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }

    this.scrollTriggers.forEach((trigger) => {
      if (trigger) trigger.kill()
    })
    this.scrollTriggers = []
  }
}

let currentCountdownInstance = null

export function initCountdown(root = document) {
  if (currentCountdownInstance) {
    currentCountdownInstance.destroy()
    currentCountdownInstance = null
  }

  const countdownSection = root.querySelector('.countdown-section')
  if (!countdownSection) {
    return
  }

  currentCountdownInstance = new CountdownTimer(root)
}

export function destroyCountdown() {
  if (currentCountdownInstance) {
    currentCountdownInstance.destroy()
    currentCountdownInstance = null
  }
}
