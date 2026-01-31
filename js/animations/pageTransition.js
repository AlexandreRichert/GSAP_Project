// js/animations/pageTransition.js
barba.init({
  prefetchIgnore: true,
  timeout: 5000,
  prevent: ({ el }) => el.classList && el.classList.contains('no-barba'),
  transitions: [
    {
      name: 'runner-clip-transition',
      once(data) {
        console.log('🏃 ONCE - Preloader complet')

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

          // Calculer le ratio d'échelle
          const scaleRatio = (navLogoRect.width / preloaderLogoRect.width) * 0.75

          // Centrer la transformation
          gsap.set(preloaderLogo, { transformOrigin: 'center center' })

          // Timeline du preloader
          const tl = gsap.timeline({
            onComplete: () => {
              preloader.style.display = 'none'
              console.log('✓ Preloader terminé')
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

          // 4. Disparition du logo du preloader
          tl.to(
            preloaderLogo,
            {
              opacity: 0,
              duration: 0.3,
            },
            '-=0.2'
          )

          // 5. Clip-path du background vers le haut
          tl.to(preloader, {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: 0.8,
            ease: 'power2.inOut',
          })
        })
      },

      /**
       * LEAVE - Sortie de la page actuelle
       */
      leave(data) {
        return new Promise((resolve) => {
          console.log('🏃 LEAVE - Runner entre en scène')

          // Bloquer le scroll
          document.body.style.overflow = 'hidden'

          // Masquer le preloader
          const preloader = document.querySelector('.preloader')
          if (preloader) {
            preloader.style.display = 'none'
          }

          // ===== Container principal =====
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
          clipOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: -200vw;
            width: 200vw;
            height: 100vh;
            background: linear-gradient(90deg, 
              var(--background-color) 0%, 
              #7a2626 50%, 
              var(--background-color) 100%
            );
            z-index: 9999;
            pointer-events: none;
            box-shadow: 
              inset -20px 0 60px rgba(0, 0, 0, 0.5),
              inset 20px 0 60px rgba(0, 0, 0, 0.5);
          `

          // ===== Runner (GIF) =====
          const runnerContainer = document.createElement('div')
          runnerContainer.className = 'runner-character'
          runnerContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: -200px;
            transform: translateY(-50%);
            width: 150px;
            height: 150px;
            z-index: 10000;
            pointer-events: none;
          `

          const runnerImg = document.createElement('img')
          runnerImg.src = 'assets/running.gif'
          runnerImg.alt = 'Runner'
          runnerImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
          `

          // Fallback emoji si GIF non disponible
          runnerImg.onerror = function () {
            this.style.display = 'none'
            const emoji = document.createElement('div')
            emoji.textContent = '🏃'
            emoji.style.cssText = `
              font-size: 120px;
              filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
            `
            runnerContainer.appendChild(emoji)
          }

          runnerContainer.appendChild(runnerImg)
          transitionContainer.appendChild(clipOverlay)
          transitionContainer.appendChild(runnerContainer)
          document.body.appendChild(transitionContainer)

          // ===== Animation LEAVE =====
          const tl = gsap.timeline({
            onComplete: () => {
              console.log('✓ LEAVE terminé')
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

          // 3) Fondu de la page actuelle
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
       */
      enter(data) {
        return new Promise((resolve) => {
          console.log('🏃 ENTER - Révélation de la nouvelle page')

          // Récupérer les éléments de transition
          const transitionContainer = document.querySelector('.runner-transition-container')
          const clipOverlay = document.querySelector('.runner-clip-overlay')
          const runnerContainer = document.querySelector('.runner-character')

          if (!transitionContainer || !clipOverlay || !runnerContainer) {
            console.warn('⚠️ Éléments de transition non trouvés')
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

              // Restaurer
              gsap.set(data.next.container, { opacity: 1 })
              document.body.style.overflow = ''

              console.log('✓ ENTER terminé')
              resolve()
            },
          })

          // 1) Le clip-path continue vers la droite
          tl.to(
            clipOverlay,
            {
              left: '100vw',
              duration: 1.5,
              ease: 'power2.inOut',
            },
            0
          )

          // 2) Le runner continue
          tl.to(
            runnerContainer,
            {
              left: 'calc(100vw + 200px)',
              duration: 1.5,
              ease: 'power2.inOut',
            },
            0
          )

          // 3) Révéler la nouvelle page
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

      /**
       * AFTER ENTER - Réinitialiser les animations
       */
      afterEnter(data) {
        console.log('🏃 AFTER ENTER - Réinitialisation animations')

        // Tuer tous les ScrollTriggers existants
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

        // Obtenir le namespace de la page
        const namespace = data.next.namespace

        // Réinitialiser les animations selon la page
        if (namespace === 'home') {
          // Page d'accueil
          if (typeof HorizontalCards !== 'undefined') {
            new HorizontalCards()
          }
          if (typeof ParcourAnimation !== 'undefined') {
            new ParcourAnimation()
          }
          // Le carousel de distances s'initialise automatiquement
        }

        // Animations communes à toutes les pages
        if (typeof initTextReveal === 'function') {
          initTextReveal(data.next.container)
        }

        // Refresh ScrollTrigger
        ScrollTrigger.refresh()
      },
    },
  ],
})

// ===== HOOKS GLOBAUX =====
barba.hooks.before((data) => {
  console.log('🏃 Navigation vers:', data.next.url.href)
})

barba.hooks.after((data) => {
  console.log('✓ Transition terminée')
})

console.log('🏃 Barba Runner Transition initialisée!')
