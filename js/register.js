/**
 * Register page logic - Gère la sélection du dossard via grille
 */
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('register-app')
  if (!app) return

  // Récupérer la distance depuis l'URL
  const params = new URLSearchParams(window.location.search)
  const distance = normalizeDistance(params.get('distance') || '5k')

  // Mapping distance -> label affiché
  const distanceLabels = {
    '5k': '5 km',
    '7k': '7 km',
    '10k': '10 km',
    '12k': '12 km',
    '15k': '15 km',
    '18k': '18 km',
    '21k': '21 km (Semi)',
    '30k': '30 km',
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
  const dossardsGrid = document.querySelector('.dossards-grid')
  let dossardCards = []
  const chooseBtn = document.getElementById('choose-dossard-btn')

  loadDossardsByDistance(distance)

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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (!dossardCards.length) return
      focusedIndex = (focusedIndex + 1) % dossardCards.length
      dossardCards[focusedIndex].focus()
      dossardCards[focusedIndex].click()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!dossardCards.length) return
      focusedIndex = (focusedIndex - 1 + dossardCards.length) % dossardCards.length
      dossardCards[focusedIndex].focus()
      dossardCards[focusedIndex].click()
    } else if (e.key === 'Enter' && selectedDossardId) {
      chooseBtn?.click()
    }
  })

  function normalizeDistance(raw) {
    const value = String(raw || '')
      .toLowerCase()
      .trim()
    const match = value.match(/(\d+)/)
    return match ? `${match[1]}k` : '5k'
  }

  function escapeHtml(str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  async function loadDossardsByDistance(selectedDistance) {
    if (!dossardsGrid) return

    dossardsGrid.innerHTML = '<p class="loading-text">Chargement des dossards...</p>'

    try {
      const res = await fetch(`/api/dossards?distance=${encodeURIComponent(selectedDistance)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const items = await res.json()

      if (!Array.isArray(items) || items.length === 0) {
        dossardsGrid.innerHTML = '<p class="error-text">Aucun dossard disponible pour cette distance.</p>'
        if (chooseBtn) chooseBtn.disabled = true
        return
      }

      dossardsGrid.innerHTML = items
        .map(
          (item) => `
            <div class="dossard-card" data-id="${escapeHtml(item.id)}" data-name="${escapeHtml(item.name || 'Dossard')}">
              <div class="dossard-image-wrapper">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || 'Dossard')}" />
                <div class="dossard-selected-badge">✓</div>
              </div>
              <div class="dossard-info">
                <h3>${escapeHtml(item.name || 'Dossard')}</h3>
                <p>${escapeHtml(item.description || '')}</p>
              </div>
            </div>
          `
        )
        .join('')

      dossardCards = Array.from(dossardsGrid.querySelectorAll('.dossard-card'))
      setupCardInteractions()

      if (window.gsap && dossardCards.length > 0) {
        gsap.fromTo(
          dossardCards,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.06,
            ease: 'power2.out',
            delay: 0.1,
          }
        )
      }
    } catch (err) {
      console.error('Erreur chargement dossards:', err)
      dossardsGrid.innerHTML = '<p class="error-text">Impossible de charger les dossards.</p>'
      if (chooseBtn) chooseBtn.disabled = true
    }
  }

  function setupCardInteractions() {
    dossardCards.forEach((card) => {
      card.style.opacity = '1'
      card.style.visibility = 'visible'
      card.setAttribute('tabindex', '0')

      card.addEventListener('click', () => {
        dossardCards.forEach((c) => c.classList.remove('selected'))
        card.classList.add('selected')
        selectedDossardId = card.dataset.id

        if (chooseBtn) {
          chooseBtn.disabled = false
          chooseBtn.querySelector('span').textContent = 'Continuer avec ce dossard'

          if (window.gsap) {
            gsap.fromTo(
              chooseBtn,
              { scale: 1 },
              { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut' }
            )
          }
        }

        if (window.gsap) {
          gsap.to(card, {
            scale: 1.02,
            duration: 0.2,
            ease: 'power2.out',
          })

          dossardCards.forEach((c) => {
            if (c !== card) gsap.to(c, { scale: 1, duration: 0.2 })
          })
        }
      })

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
  }
})
