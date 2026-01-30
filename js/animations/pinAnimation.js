gsap.registerPlugin(ScrollTrigger)

class ParcourAnimation {
  constructor() {
    this.path = document.querySelector('.parcours-svg-path')
    this.pathBg = document.querySelector('.parcours-svg-path-bg')
    this.pin = document.querySelector('.parcours-pin')
    this.altitudeMarker = document.querySelector('.altitude-marker')
    this.altitudeMarkerLine = document.querySelector('.altitude-marker-line')
    this.altitudeLine = document.querySelector('.altitude-line')
    this.section = document.querySelector('.parcours-section')

    this.pathLength = 0
    this.animation = null

    // Données réelles du parcours (6.36 km)
    // Altitude en mètres
    this.distanceTotal = 6.36
    this.altitudeMax = 7
    this.altitudeMin = 0

    // Données d'altitude réelles du GPX (normalisées pour SVG)
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

  /**
   * Mettre à jour la position du pin sur le path
   * @param {number} progress -
   */
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
        gsap.to(this.pin, {
          x,
          y,
          duration: 0.05,
          overwrite: 'auto',
        })
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

  /**
   * Mettre à jour la position du marqueur d'altitude EN TEMPS RÉEL
   * @param {number} progress
   */
  updateAltitudeMarker(progress) {
    if (!this.altitudeMarker || !this.altitudeMarkerLine) return

    try {
      if (this.altitudeLine && this.altitudeLine.getTotalLength) {
        const pathLen = this.altitudeLine.getTotalLength()
        const point = this.altitudeLine.getPointAtLength(pathLen * progress)

        if (point) {
          const svg = this.altitudeLine.ownerSVGElement || this.altitudeLine.closest('svg')
          if (svg && this.altitudeMarker instanceof SVGElement) {
            gsap.set(this.altitudeMarker, {
              attr: { cx: point.x, cy: point.y },
              duration: 0.05,
              overwrite: 'auto',
            })

            gsap.set(this.altitudeMarkerLine, {
              attr: { x1: point.x, x2: point.x, y1: 0, y2: svg.viewBox ? svg.viewBox.baseVal.height : 300 },
              duration: 0.05,
              overwrite: 'auto',
            })
          } else if (svg) {
            const pt = svg.createSVGPoint()
            pt.x = point.x
            pt.y = point.y
            const screenPt = pt.matrixTransform(svg.getScreenCTM())
            const rect = svg.getBoundingClientRect()
            const x = screenPt.x - rect.left
            const y = screenPt.y - rect.top

            gsap.set(this.altitudeMarker, { x, y, duration: 0.05, overwrite: 'auto' })
            gsap.set(this.altitudeMarkerLine, {
              attr: { x1: point.x, x2: point.x, y1: 0, y2: svg.viewBox ? svg.viewBox.baseVal.height : 300 },
              duration: 0.05,
              overwrite: 'auto',
            })
          }
          return
        }
      }

      const chartWidth = 800
      const newX = chartWidth * progress
      const altitude = this.getAltitudeAtProgress(progress)
      gsap.set(this.altitudeMarker, {
        attr: { cx: newX, cy: 300 - altitude },
        duration: 0.05,
        overwrite: 'auto',
      })
      gsap.set(this.altitudeMarkerLine, { attr: { x1: newX, x2: newX }, duration: 0.05, overwrite: 'auto' })
    } catch (e) {}
  }

  /**
   * @param {number} progress
   * @returns {number}
   */
  getAltitudeAtProgress(progress) {
    try {
      const index = Math.min(Math.floor(progress * this.altitudeData.length), this.altitudeData.length - 1)

      if (index < this.altitudeData.length - 1) {
        const ratio = (progress * this.altitudeData.length) % 1
        const alt1 = this.altitudeData[index]
        const alt2 = this.altitudeData[index + 1]
        return alt1 + (alt2 - alt1) * ratio
      }

      return this.altitudeData[index]
    } catch (e) {
      return 0
    }
  }

  /**
   * Obtenir un point sur le path SVG à une distance donnée
   * @param {number} distance
   * @returns {object}
   */
  getPointOnPath(distance) {
    if (!this.path) return null

    try {
      const limitedDistance = Math.max(0, Math.min(distance, this.pathLength))
      const point = this.path.getPointAtLength(limitedDistance)

      return {
        x: point.x,
        y: point.y,
      }
    } catch (e) {
      return null
    }
  }

  destroy() {
    if (this.animation) {
      this.animation.kill()
    }
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.trigger === this.section) {
        trigger.kill()
      }
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParcourAnimation()
})

window.addEventListener('load', () => {
  ScrollTrigger.refresh()
})
