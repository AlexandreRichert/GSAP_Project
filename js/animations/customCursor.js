class CustomCursor {
  constructor() {
    this.cursor = null
    this.container = null
    this.mouseX = 0
    this.mouseY = 0
    this.lastX = 0
    this.lastY = 0
    this.isMoving = false
    this.speed = 0
    this.angle = 0
    this.particles = []
    this.maxParticles = 12

    this.init()
  }

  init() {
    document.body.style.cursor = 'none'

    this.createContainer()

    document.addEventListener('mousemove', (e) => this.handleMouseMove(e))
    document.addEventListener('mouseenter', () => this.showCursor())
    document.addEventListener('mouseleave', () => this.hideCursor())
    document.addEventListener('mousedown', () => this.handleMouseDown())
    document.addEventListener('mouseup', () => this.handleMouseUp())

    this.setupInteractiveElements()

    gsap.ticker.add(() => this.animate())

    console.log('✨ Modern elegant cursor initialized')
  }

  createContainer() {
    this.container = document.createElement('div')
    this.container.id = 'modern-cursor-container'
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `
    document.body.appendChild(this.container)

    const rootStyles = getComputedStyle(document.documentElement)
    const lightColor = (rootStyles.getPropertyValue('--light-color') || '#f8fafc').trim()
    const accentColor = (rootStyles.getPropertyValue('--accent-color') || '#ece544').trim()

    this.cursor = document.createElement('div')
    this.cursor.id = 'cursor-dot'
    this.cursor.style.cssText = `
      position: fixed;
      width: 12px;
      height: 12px;
      background: ${lightColor};
      border-radius: 50%;
      top: 0;
      left: 0;
      pointer-events: none;
      box-shadow: 0 0 10px rgba(255,255,255,0.08);
      transition: width 0.25s ease, height 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
      z-index: 10000;
    `
    this.container.appendChild(this.cursor)

    const ring = document.createElement('div')
    ring.id = 'cursor-ring'
    ring.style.cssText = `
      position: fixed;
      width: 30px;
      height: 30px;
      border: 2px solid ${lightColor};
      border-radius: 50%;
      top: 0;
      left: 0;
      pointer-events: none;
      backdrop-filter: blur(2px);
      transition: border-color 0.25s ease, box-shadow 0.25s ease;
      box-shadow: 0 0 18px ${accentColor}22;
      z-index: 9999;
    `
    this.container.appendChild(ring)
  }

  handleMouseMove(e) {
    this.lastX = this.mouseX
    this.lastY = this.mouseY
    this.mouseX = e.clientX
    this.mouseY = e.clientY

    const dx = this.mouseX - this.lastX
    const dy = this.mouseY - this.lastY
    this.speed = Math.sqrt(dx * dx + dy * dy)
    this.angle = Math.atan2(dy, dx)

    this.isMoving = this.speed > 2

    if (this.isMoving && Math.random() > 0.4) {
      this.createParticle()
    }

    gsap.to(this.cursor, {
      left: this.mouseX - 6,
      top: this.mouseY - 6,
      duration: 0.1,
      overwrite: 'auto',
    })

    gsap.to(document.getElementById('cursor-ring'), {
      left: this.mouseX - 15,
      top: this.mouseY - 15,
      duration: 0.3,
      ease: 'sine.out',
      overwrite: 'auto',
    })

    const ring = document.getElementById('cursor-ring')
    gsap.to(ring, {
      rotation: this.angle * (180 / Math.PI),
      duration: 0.5,
      ease: 'sine.out',
    })
  }

  createParticle() {
    if (this.particles.length >= this.maxParticles) {
      const oldParticle = this.particles.shift()
      oldParticle.remove()
    }

    const particle = document.createElement('div')
    const rootStyles = getComputedStyle(document.documentElement)
    const accentColor = (rootStyles.getPropertyValue('--accent-color') || '#ece544').trim()
    const lightColor = (rootStyles.getPropertyValue('--light-color') || '#f8fafc').trim()

    particle.style.cssText = `
      position: fixed;
      width: 6px;
      height: 6px;
      background: radial-gradient(circle, ${accentColor} 0%, ${lightColor} 60%);
      border-radius: 50%;
      pointer-events: none;
      left: ${this.mouseX}px;
      top: ${this.mouseY}px;
      box-shadow: 0 0 6px ${accentColor}66;
      z-index: 9998;
    `

    this.container.appendChild(particle)
    this.particles.push(particle)

    const randomAngle = Math.random() * Math.PI * 2
    const distance = 20 + Math.random() * 30
    const tx = Math.cos(randomAngle) * distance
    const ty = Math.sin(randomAngle) * distance
    gsap.to(particle, {
      x: tx,
      y: ty,
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: 'sine.out',
      onComplete: () => {
        particle.remove()
        const index = this.particles.indexOf(particle)
        if (index > -1) {
          this.particles.splice(index, 1)
        }
      },
    })
  }

  handleMouseDown() {
    const cursor = this.cursor
    const ring = document.getElementById('cursor-ring')

    const rootStyles = getComputedStyle(document.documentElement)
    const accentColor = (rootStyles.getPropertyValue('--accent-color') || '#ece544').trim()

    gsap.to(cursor, { width: 8, height: 8, duration: 0.12 })

    gsap.to(ring, { width: 20, height: 20, left: this.mouseX - 10, top: this.mouseY - 10, duration: 0.12 })

    gsap.to(ring, {
      boxShadow: `0 0 0 10px ${accentColor}22`,
      duration: 0.45,
      ease: 'power2.out',
    })
  }

  handleMouseUp() {
    const cursor = this.cursor
    const ring = document.getElementById('cursor-ring')
    const rootStyles = getComputedStyle(document.documentElement)
    const lightColor = (rootStyles.getPropertyValue('--light-color') || '#f8fafc').trim()

    gsap.to(cursor, { width: 12, height: 12, background: lightColor, duration: 0.2 })
    gsap.to(ring, { width: 30, height: 30, duration: 0.2 })
    gsap.to(ring, { boxShadow: `0 0 18px ${lightColor}22`, duration: 0.4 })
  }

  setupInteractiveElements() {
    const interactiveElements = document.querySelectorAll(
      'button, a, [role="button"], input[type="button"], input[type="submit"], [data-cursor="pointer"]'
    )

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => this.onInteractiveHover(true))
      el.addEventListener('mouseleave', () => this.onInteractiveHover(false))
    })
  }

  onInteractiveHover(isHovering) {
    const cursor = this.cursor
    const ring = document.getElementById('cursor-ring')
    const rootStyles = getComputedStyle(document.documentElement)
    const lightColor = (rootStyles.getPropertyValue('--light-color') || '#f8fafc').trim()
    const accentColor = (rootStyles.getPropertyValue('--accent-color') || '#ece544').trim()

    if (isHovering) {
      gsap.to(cursor, {
        width: 16,
        height: 16,
        background: accentColor,
        boxShadow: `0 0 12px ${accentColor}66`,
        duration: 0.28,
      })

      gsap.to(ring, {
        borderColor: accentColor,
        boxShadow: `0 0 0 8px ${accentColor}22`,
        duration: 0.28,
      })
    } else {
      gsap.to(cursor, {
        width: 12,
        height: 12,
        background: lightColor,
        boxShadow: `0 0 10px ${lightColor}55`,
        duration: 0.28,
      })

      gsap.to(ring, {
        borderColor: lightColor,
        boxShadow: `0 0 18px ${lightColor}22`,
        duration: 0.28,
      })
    }
  }

  animate() {
    const cursor = this.cursor
    const speedFactor = Math.min(this.speed / 20, 1)
    const scale = 1 + speedFactor * 0.2

    gsap.set(cursor, {
      scale: scale,
    })

    const ring = document.getElementById('cursor-ring')
    const targetOpacity = this.isMoving ? 1 : 0.6
    gsap.set(ring, {
      opacity: targetOpacity,
    })
  }

  showCursor() {
    gsap.to([this.cursor, document.getElementById('cursor-ring')], {
      opacity: 1,
      duration: 0.3,
    })
  }

  hideCursor() {
    gsap.to([this.cursor, document.getElementById('cursor-ring')], {
      opacity: 0,
      duration: 0.3,
    })
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CustomCursor()
  })
} else {
  new CustomCursor()
}
