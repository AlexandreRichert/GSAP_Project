// Page Transition Animation avec coureur
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger)

  // Créer les éléments de transition
  createTransitionElements()

  // Intercepter tous les clics sur les liens avec la classe 'page-link'
  const pageLinks = document.querySelectorAll('.page-link')

  pageLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const targetUrl = link.getAttribute('href')

      if (targetUrl && targetUrl !== '#') {
        pageTransitionOut(targetUrl)
      }
    })
  })

  // Animation d'entrée au chargement de la page
  window.addEventListener('load', () => {
    // Attendre que le preloader soit terminé (si présent)
    setTimeout(() => {
      pageTransitionIn()
    }, 100)
  })

  console.log('Page Transition initialisée! 🏃')
})

// Créer les éléments HTML pour la transition
function createTransitionElements() {
  // Vérifier si les éléments existent déjà
  if (document.querySelector('.page-transition-overlay')) return

  // Créer l'overlay
  const overlay = document.createElement('div')
  overlay.className = 'page-transition-overlay'

  // Créer le coureur
  const runner = document.createElement('div')
  runner.className = 'page-transition-runner'

  // Image du coureur (placeholder - vous remplacerez par votre GIF)
  const runnerImg = document.createElement('img')
  // Supporter pages situées dans /pages/ en ajustant le chemin
  const basePath = location.pathname.includes('/pages/') ? '../' : ''
  runnerImg.src = basePath + 'assets/running.gif'
  runnerImg.alt = 'Coureur'
  runnerImg.onerror = function () {
    // Fallback si l'image n'existe pas : utiliser un emoji
    this.style.display = 'none'
    const emoji = document.createElement('div')
    emoji.className = 'runner-emoji'
    emoji.textContent = '🏃'
    runner.appendChild(emoji)
  }

  runner.appendChild(runnerImg)

  // Ajouter au body
  document.body.appendChild(overlay)
  document.body.appendChild(runner)
}

// Animation de sortie (page actuelle → nouvelle page)
function pageTransitionOut(targetUrl) {
  const overlay = document.querySelector('.page-transition-overlay')
  const runner = document.querySelector('.page-transition-runner')

  if (!overlay || !runner) {
    console.error('Éléments de transition non trouvés')
    window.location.href = targetUrl
    return
  }

  // Bloquer le scroll
  document.body.style.overflow = 'hidden'

  // Timeline de sortie
  const tl = gsap.timeline({
    onComplete: () => {
      // Naviguer vers la nouvelle page
      window.location.href = targetUrl
    },
  })

  // Position initiale : hors écran à gauche
  gsap.set(runner, {
    x: '-150%',
    opacity: 1,
  })

  gsap.set(overlay, {
    x: '-100%',
    opacity: 1,
  })

  // 1. Le coureur entre depuis la gauche
  tl.to(runner, {
    x: '50%',
    duration: 0.6,
    ease: 'power2.out',
  })

  // 2. L'overlay suit le coureur avec un léger délai
  tl.to(
    overlay,
    {
      x: '0%',
      duration: 0.8,
      ease: 'power2.inOut',
    },
    '-=0.4'
  )

  // 3. Le coureur continue vers la droite
  tl.to(
    runner,
    {
      x: '150%',
      duration: 0.6,
      ease: 'power2.in',
    },
    '-=0.2'
  )

  console.log('Transition OUT déclenchée vers:', targetUrl)
}

// Animation d'entrée (nouvelle page chargée)
function pageTransitionIn() {
  const overlay = document.querySelector('.page-transition-overlay')
  const runner = document.querySelector('.page-transition-runner')

  if (!overlay || !runner) {
    console.error('Éléments de transition non trouvés')
    return
  }

  // Timeline d'entrée
  const tl = gsap.timeline({
    onComplete: () => {
      // Restaurer le scroll
      document.body.style.overflow = ''

      // Cacher les éléments de transition
      gsap.set([overlay, runner], { opacity: 0 })
    },
  })

  // Position initiale : l'overlay couvre l'écran
  gsap.set(overlay, {
    x: '0%',
    opacity: 1,
  })

  gsap.set(runner, {
    x: '50%',
    opacity: 1,
  })

  // 1. Le coureur sort vers la droite
  tl.to(runner, {
    x: '150%',
    duration: 0.6,
    ease: 'power2.in',
  })

  // 2. L'overlay sort vers la droite
  tl.to(
    overlay,
    {
      x: '100%',
      duration: 0.8,
      ease: 'power2.inOut',
    },
    '-=0.4'
  )

  console.log('Transition IN terminée')
}

// Fonction pour mettre à jour l'image du coureur (à appeler depuis votre code)
function setRunnerImage(imagePath) {
  const runnerImg = document.querySelector('.page-transition-runner img')
  if (runnerImg) {
    runnerImg.src = imagePath
    runnerImg.style.display = 'block'

    // Cacher l'emoji si présent
    const emoji = document.querySelector('.runner-emoji')
    if (emoji) emoji.style.display = 'none'
  }
}

// Exporter la fonction pour pouvoir l'utiliser
window.setRunnerImage = setRunnerImage
