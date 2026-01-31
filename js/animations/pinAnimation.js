// js/animations/pinAnimation.js
gsap.registerPlugin(ScrollTrigger)

class ParcourAnimation {
  constructor(root = document) {
    this.root = root

    this.path = this.root.querySelector('.parcours-svg-path')
    this.pathBg = this.root.querySelector('.parcours-svg-path-bg')
    this.pin = this.root.querySelector('.parcours-pin')
    this.altitudeMarker = this.root.querySelector('.altitude-marker')
    this.altitudeMarkerLine = this.root.querySelector('.altitude-marker-line')

    this.section = this.root.querySelector('.parcours-section')

    this.pathLength = 0
    this.animation = null

    // Données réelles du parcours (6.36 km)
    this.distanceTotal = 6.36
    this.altitudeMax = 7
    this.altitudeMin = 0

    this.altitudeData = [
      0, 107.14, 71.43, 0, 107.14, 178.57, 178.57, 142.86, 178.57, 178.57, 178.57, 142.86, 178.57, 178.57, 214.29,
      178.57, 178.57, 142.86, 71.43, 71.43, 71.43, 71.43, 214.29, 250, 178.57, 142.86, 142.86, 142.86, 250, 0, 0, 0, 0,
      0, 35.71, 0, 0, 0, 0, 0, 0, 0, 142.86, 178.57, 107.14, 142.86, 142.86, 107.14, 71.43, 35.71, 35.71, 35.71, 35.71,
      0, 0, 0, 0,
    ]

    if (!this.path) {
      console.warn('Parcours SVG path introuvable')
      return
    }

    this.init()
  }

  init() {
    this.pathLength = this.path.getTotalLength()

    gsap.set(this.path, {
      strokeDasharray: this.pathLength,
      strokeDashoffset: this.pathLength,
    })

    this.createScrollAnimation()
  }

  createScrollAnimation() {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: this.section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        markers: false,
        onUpdate: (self) => {
          this.updatePinPosition(self.progress)
          this.updateAltitudeMarker(self.progress)
        },
      },
    })

    timeline.to(
      this.path,
      {
        strokeDashoffset: 0,
        ease: 'none',
        duration: 1,
      },
      0
    )

    this.animation = timeline
  }

  updatePinPosition(progress) {
    if (!this.pin || !this.path) return
    try {
      const offset = this.pathLength * progress
      const localPoint = this.getPointOnPath(offset)
      if (!localPoint) return

      const svg = this.path.ownerSVGElement || this.path.closest('svg')

      if (svg && this.pin instanceof SVGElement) {
        const tag = this.pin.tagName.toLowerCase()
        if (tag === 'circle' || this.pin.hasAttribute('cx')) {
          gsap.to(this.pin, {
            attr: { cx: localPoint.x, cy: localPoint.y },
            duration: 0.05,
            overwrite: 'auto',
          })
        } else {
          gsap.to(this.pin, {
            attr: { transform: `translate(${localPoint.x},${localPoint.y})` },
            duration: 0.05,
            overwrite: 'auto',
          })
        }
        return
      }

      if (svg) {
        const pt = svg.createSVGPoint()
        pt.x = localPoint.x
        pt.y = localPoint.y
        const screenPt = pt.matrixTransform(svg.getScreenCTM())
        const rect = svg.getBoundingClientRect()
        const x = screenPt.x - rect.left
        const y = screenPt.y - rect.top
        gsap.to(this.pin, { x, y, duration: 0.05, overwrite: 'auto' })
        return
      }

      gsap.to(this.pin, {
        x: localPoint.x,
        y: localPoint.y,
        duration: 0.05,
        overwrite: 'auto',
      })
    } catch (e) {}
  }

  updateAltitudeMarker(progress) {
    if (!this.altitudeMarker || !this.altitudeMarkerLine) return

    try {
      if (this.altitudeLine && this.altitudeLine.getTotalLength) {
        const pathLen = this.altitudeLine.getTotalLength()
        const point = this.altitudeLine.getPointAtLength(pathLen * progress)

        if (point) {
          const svg = this.altitudeLine.ownerSVGElement || this.altitudeLine.closest('svg')

          if (svg && this.altitudeMarker instanceof SVGElement) {
            gsap.set(this.altitudeMarker, { attr: { cx: point.x, cy: point.y } })
            gsap.set(this.altitudeMarkerLine, {
              attr: { x1: point.x, x2: point.x, y1: 0, y2: svg.viewBox ? svg.viewBox.baseVal.height : 300 },
            })
          }
          return
        }
      }
    } catch (e) {}
  }

  getPointOnPath(distance) {
    if (!this.path) return null
    try {
      const limitedDistance = Math.max(0, Math.min(distance, this.pathLength))
      const point = this.path.getPointAtLength(limitedDistance)
      return { x: point.x, y: point.y }
    } catch (e) {
      return null
    }
  }

  destroy() {
    if (this.animation) this.animation.kill()
  }
}

export function initParcours(root = document) {
  new ParcourAnimation(root)
}
