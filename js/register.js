/**
 * Register page logic - Gère la sélection du dossard via grille
 */
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('register-app')
  if (!app) return

  // Récupérer la distance depuis l'URL
  const params = new URLSearchParams(window.location.search)
  const distance = params.get('distance') || '5k'

  // Mapping distance -> label affiché
  const distanceLabels = {
    '5k': '5 km',
    '10k': '10 km',
    '12k': '12 km',
    '15k': '15 km',
    '21k': '21 km (Semi)',
    '25k': '25 km',
    '30k': '30 km',
    '35k': '35 km',
    '42k': '42 km (Marathon)',
  }

  // Afficher la distance sélectionnée
  const distanceEl = document.getElementById('selected-distance')
  if (distanceEl) {
    distanceEl.textContent = distanceLabels[distance] || distance
  }

  // State
  let selectedDossardId = null

  // DOM
  const dossardCards = document.querySelectorAll('.dossard-card')
  const chooseBtn = document.getElementById('choose-dossard-btn')

  // S'assurer que toutes les cards sont visibles
  dossardCards.forEach((card) => {
    card.style.opacity = '1'
    card.style.visibility = 'visible'
  })

  // Animation d'entrée des cards (optionnelle)
  if (window.gsap && dossardCards.length > 0) {
    gsap.fromTo(
      '.dossard-card',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 0.2,
      }
    )
  }

  // Gestion de la sélection
  dossardCards.forEach((card) => {
    card.addEventListener('click', () => {
      // Retirer la sélection précédente
      dossardCards.forEach((c) => c.classList.remove('selected'))

      // Sélectionner cette card
      card.classList.add('selected')
      selectedDossardId = card.dataset.id

      // Activer le bouton
      if (chooseBtn) {
        chooseBtn.disabled = false
        chooseBtn.querySelector('span').textContent = 'Continuer avec ce dossard'

        // Petite animation
        if (window.gsap) {
          gsap.fromTo(
            chooseBtn,
            { scale: 1 },
            { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut' }
          )
        }
      }

      // Animation de sélection
      if (window.gsap) {
        gsap.to(card, {
          scale: 1.02,
          duration: 0.2,
          ease: 'power2.out',
        })

        // Réduire légèrement les autres
        dossardCards.forEach((c) => {
          if (c !== card) {
            gsap.to(c, { scale: 1, duration: 0.2 })
          }
        })
      }
    })

    // Hover effects
    card.addEventListener('mouseenter', () => {
      if (!card.classList.contains('selected') && window.gsap) {
        gsap.to(card, { y: -5, duration: 0.2, ease: 'power2.out' })
      }
    })

    card.addEventListener('mouseleave', () => {
      if (!card.classList.contains('selected') && window.gsap) {
        gsap.to(card, { y: 0, duration: 0.2, ease: 'power2.out' })
      }
    })
  })

  // Bouton pour continuer vers la page participants
  if (chooseBtn) {
    chooseBtn.addEventListener('click', () => {
      if (!selectedDossardId) return

      // Animation de feedback
      if (window.gsap) {
        gsap.to(chooseBtn, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            window.location.href = `participants.html?distance=${encodeURIComponent(distance)}&dossard=${encodeURIComponent(selectedDossardId)}`
          },
        })
      } else {
        window.location.href = `participants.html?distance=${encodeURIComponent(distance)}&dossard=${encodeURIComponent(selectedDossardId)}`
      }
    })
  }

  // Navigation clavier
  let focusedIndex = -1
  const cardArray = Array.from(dossardCards)

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      focusedIndex = (focusedIndex + 1) % cardArray.length
      cardArray[focusedIndex].focus()
      cardArray[focusedIndex].click()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      focusedIndex = (focusedIndex - 1 + cardArray.length) % cardArray.length
      cardArray[focusedIndex].focus()
      cardArray[focusedIndex].click()
    } else if (e.key === 'Enter' && selectedDossardId) {
      chooseBtn?.click()
    }
  })

  // Rendre les cards focusables
  dossardCards.forEach((card) => {
    card.setAttribute('tabindex', '0')
  })
})
