// ✅ MODIF — imports des fonctions d’init
import { initTextReveal } from './textReveal.js'
import { initParcours } from './pinAnimation.js'
import { initCarousel } from './distanceCarousel.js'
import { initHorizontalScroll } from './horizontalScroll.js'

barba.init({
  prefetchIgnore: true,
  timeout: 5000,
  prevent: ({ el }) => el.classList && el.classList.contains('no-barba'),
  transitions: [
    {
      name: 'runner-clip-transition',
      once(data) {
        return new Promise((resolve) => {
          const preloader = document.querySelector('.preloader')
          const preloaderLogo = document.querySelector('.preloader-logo')
          const navbar = document.querySelector('.main-nav')
          const navLogo = document.querySelector('.nav-logo')

          if (!preloader || !preloaderLogo || !navbar || !navLogo) {
            console.warn('⚠️ Éléments preloader non trouvés')
            if (preloader) preloader.style.display = 'none'
            resolve()
            return
          }

          // Masquer navbar au départ
          gsap.set(navbar, { y: -100, opacity: 0 })

          // Obtenir la position finale du logo dans la navbar
          const navLogoRect = navLogo.getBoundingClientRect()
          const preloaderLogoRect = preloaderLogo.getBoundingClientRect()

          // Calculer le déplacement nécessaire
          const deltaX = navLogoRect.left - preloaderLogoRect.left + (navLogoRect.width - preloaderLogoRect.width) / 2
          const deltaY = navLogoRect.top - preloaderLogoRect.top + (navLogoRect.height - preloaderLogoRect.height) / 2

          // Calculer un ratio d'échelle plus précis et légèrement plus petit
          const widthRatio = navLogoRect.width / preloaderLogoRect.width
          const heightRatio = navLogoRect.height / preloaderLogoRect.height
          // Prendre le plus petit ratio pour garder les proportions, puis réduire un peu plus (0.9)
          const scaleRatio = Math.min(widthRatio, heightRatio) * 0.9

          // S'assurer que la transformation s'effectue depuis le centre
          gsap.set(preloaderLogo, { transformOrigin: 'center center' })

          const tl = gsap.timeline({
            onComplete: () => {
              preloader.style.display = 'none'
              resolve()
            },
          })

          // 1. Spin du logo (360°)
          tl.to(preloaderLogo, {
            rotation: 360,
            duration: 1,
            ease: 'power2.inOut',
          })

          // 2. Déplacement vers la navbar + réduction de taille
          tl.to(
            preloaderLogo,
            {
              x: deltaX,
              y: deltaY,
              scale: scaleRatio,
              duration: 0.8,
              ease: 'power2.inOut',
            },
            '+=0.2'
          )

          // 3. Apparition de la navbar
          tl.to(
            navbar,
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out',
            },
            '-=0.3'
          )

          // 5. Clip-path du background vers le haut
          tl.to(preloader, {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: 0.8,
            ease: 'power2.inOut',
          })
          // 4. Disparition du logo du preloader
          tl.to(
            preloaderLogo,
            {
              opacity: 0,
              duration: 0.3,
            },
            '-=0.2'
          )
        })
      },

      leave(data) {
        return new Promise((resolve) => {
          document.body.style.overflow = 'hidden'

          // Masquer le preloader pour les transitions
          const preloader = document.querySelector('.preloader')
          if (preloader) {
            preloader.style.display = 'none'
          }

          const transitionContainer = document.createElement('div')
          transitionContainer.className = 'runner-transition-container'
          transitionContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9998;
            pointer-events: none;
            overflow: hidden;
          `

          // ===== Clip-path overlay (200vw de large) =====
          const clipOverlay = document.createElement('div')
          clipOverlay.className = 'runner-clip-overlay'

          // ===== Runner (GIF) =====
          const runnerContainer = document.createElement('div')
          runnerContainer.className = 'runner-character'

          const runnerImg = document.createElement('img')
          runnerImg.src = '../assets/running.gif'
          runnerImg.alt = 'Runner'
          runnerImg.className = 'runner-gif'

          runnerContainer.appendChild(runnerImg)
          transitionContainer.appendChild(clipOverlay)
          transitionContainer.appendChild(runnerContainer)
          document.body.appendChild(transitionContainer)

          // ===== Animation LEAVE =====
          const tl = gsap.timeline({
            onComplete: () => {
              resolve()
            },
          })

          // 1) Le runner traverse l'écran (gauche → droite)
          tl.to(
            runnerContainer,
            {
              left: '110vw',
              duration: 1.5,
              ease: 'power2.inOut',
            },
            0
          )

          // 2) Le clip-path suit le runner avec un délai
          tl.to(
            clipOverlay,
            {
              left: '0vw',
              duration: 1.5,
              ease: 'power2.inOut',
            },
            0.2
          )

          // 3) Fondu des éléments de la page actuelle
          tl.to(
            data.current.container,
            {
              opacity: 0,
              duration: 0.5,
            },
            0.5
          )
        })
      },

      /**
       * ENTER - Entrée de la nouvelle page
       * Le clip-path continue et révèle la nouvelle page
       */
      enter(data) {
        return new Promise((resolve) => {
          // Récupérer le container de transition
          const transitionContainer = document.querySelector('.runner-transition-container')
          const clipOverlay = document.querySelector('.runner-clip-overlay')
          const runnerContainer = document.querySelector('.runner-character')

          if (!transitionContainer || !clipOverlay || !runnerContainer) {
            // Restaurer le scroll même en cas d'erreur
            document.body.style.overflow = ''
            resolve()
            return
          }

          // Masquer la nouvelle page au départ
          gsap.set(data.next.container, { opacity: 0 })

          // ===== Animation ENTER =====
          const tl = gsap.timeline({
            onComplete: () => {
              // Nettoyer
              transitionContainer.remove()

              // Restaurer l'opacité de la nouvelle page
              gsap.set(data.next.container, { opacity: 1 })

              // Restaurer le scroll
              document.body.style.overflow = ''

              resolve()
            },
          })

          // 1) Le clip-path continue de bouger vers la droite
          tl.to(
            clipOverlay,
            {
              left: '100vw',
              duration: 1.5,
              ease: 'power2.inOut',
            },
            0
          )

          // 2) Le runner continue aussi
          tl.to(
            runnerContainer,
            {
              left: 'calc(100vw + 200px)',
              duration: 1.5,
              ease: 'power2.inOut',
            },
            0
          )

          // 3) Révéler la nouvelle page progressivement
          tl.to(
            data.next.container,
            {
              opacity: 1,
              duration: 0.8,
            },
            0.4
          )
        })
      },
    },
  ],
})

barba.hooks.afterEnter((data) => {
  const container = data.next.container

  initTextReveal(container)
  initParcours(container)
  initCarousel(container)
  initHorizontalScroll(container)

  // ✅ CRUCIAL
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })
})
