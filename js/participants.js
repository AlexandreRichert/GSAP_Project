/**
 * Participants page logic - Inscription et liste des participants
 */
;(function () {
  'use strict'

  // Configuration
  const dossardDesigns = {
    'design-1': { name: 'Design Classique', image: '/assets/dossard1.png' },
    'design-2': { name: 'Design Moderne', image: '/assets/dossard2.png' },
    'design-3': { name: 'Design Édition Limitée', image: '/assets/dossard3.png' },
    'design-4': { name: 'Design Sport', image: '/assets/dossard4.png' },
    'design-5': { name: 'Design Fun', image: '/assets/dossard5.png' },
    'design-6': { name: 'Design Premium', image: '/assets/dossard6.png' },
  }

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

  // State
  let currentDistance = '5k'
  let currentDossardId = 'design-1'
  let currentFilter = 'all'
  let participants = []

  // DOM Elements
  let registrationSection, confirmationSection, participantsList
  let previewModal, dossardCanvas

  // Initialize
  document.addEventListener('DOMContentLoaded', init)

  function init() {
    // Get URL params
    const params = new URLSearchParams(window.location.search)
    currentDistance = params.get('distance') || '5k'
    currentDossardId = params.get('dossard') || 'design-1'

    // Cache DOM elements
    registrationSection = document.getElementById('registration-section')
    confirmationSection = document.getElementById('confirmation-section')
    participantsList = document.getElementById('participants-list')
    previewModal = document.getElementById('preview-modal')
    dossardCanvas = document.getElementById('dossard-canvas')

    // Display selected info
    displaySelectedInfo()

    // Setup form
    setupForm()

    // Setup filters
    setupFilters()

    // Setup modal
    setupModal()

    // Load participants
    loadParticipants()
  }

  function displaySelectedInfo() {
    const distanceEl = document.getElementById('display-distance')
    const dossardEl = document.getElementById('display-dossard')

    if (distanceEl) {
      distanceEl.textContent = distanceLabels[currentDistance] || currentDistance
    }

    if (dossardEl) {
      const design = dossardDesigns[currentDossardId]
      dossardEl.textContent = design ? design.name : currentDossardId
    }
  }

  function setupForm() {
    const form = document.getElementById('registration-form')
    if (!form) return

    form.addEventListener('submit', async (e) => {
      e.preventDefault()

      const nameInput = document.getElementById('input-name')
      const numberInput = document.getElementById('input-number')

      const name = nameInput.value.trim()
      const number = numberInput.value.trim()

      // Validation
      if (!name || name.length < 2) {
        showError(nameInput, 'Le surnom doit contenir au moins 2 caractères')
        return
      }

      if (!number || isNaN(number) || parseInt(number) < 1 || parseInt(number) > 9999) {
        showError(numberInput, 'Le numéro doit être entre 1 et 9999')
        return
      }

      // Disable form
      const submitBtn = form.querySelector('button[type="submit"]')
      submitBtn.disabled = true
      submitBtn.innerHTML = '<span>Inscription en cours...</span>'

      try {
        const payload = {
          distance: currentDistance,
          dossardId: currentDossardId,
          name: name,
          number: number,
        }

        console.log('Envoi inscription:', payload)

        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const responseText = await res.text()
        let data

        try {
          data = JSON.parse(responseText)
        } catch (e) {
          console.error('Réponse non-JSON:', responseText.substring(0, 200))
          throw new Error('Le serveur a retourné une réponse invalide')
        }

        if (!res.ok) {
          throw new Error(data.error || 'Erreur serveur')
        }

        console.log('Inscription réussie:', data)

        // Success animation
        showConfirmation(name)

        // Reload participants list (non-blocking)
        loadParticipants().catch((err) => console.warn('Erreur chargement liste:', err))
      } catch (error) {
        console.error('Erreur inscription:', error)
        alert('Une erreur est survenue: ' + error.message)
        submitBtn.disabled = false
        submitBtn.innerHTML =
          '<span>Valider mon inscription</span><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
      }
    })
  }

  function showError(input, message) {
    input.classList.add('error')
    const hint = input.nextElementSibling
    if (hint) {
      hint.textContent = message
      hint.classList.add('error-hint')
    }

    setTimeout(() => {
      input.classList.remove('error')
      if (hint) {
        hint.classList.remove('error-hint')
      }
    }, 3000)
  }

  function showConfirmation(name) {
    if (!registrationSection || !confirmationSection) return

    // Animate out registration section
    if (window.gsap) {
      gsap.to(registrationSection, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          registrationSection.style.display = 'none'
          confirmationSection.style.display = 'block'

          const confirmedName = document.getElementById('confirmed-name')
          if (confirmedName) confirmedName.textContent = name

          gsap.from(confirmationSection, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: 'power2.out',
          })

          gsap.from('.confirmation-icon', {
            scale: 0,
            rotation: -180,
            duration: 0.6,
            delay: 0.2,
            ease: 'back.out(1.5)',
          })
        },
      })
    } else {
      registrationSection.style.display = 'none'
      confirmationSection.style.display = 'block'
      const confirmedName = document.getElementById('confirmed-name')
      if (confirmedName) confirmedName.textContent = name
    }
  }

  function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn')
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')
        currentFilter = btn.dataset.filter
        renderParticipants()
      })
    })
  }

  async function loadParticipants() {
    try {
      console.log('Chargement participants depuis /api/participants')
      const res = await fetch('/api/participants')

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`)
      }

      const responseText = await res.text()

      try {
        participants = JSON.parse(responseText)
      } catch (e) {
        console.error('Réponse non-JSON reçue:', responseText.substring(0, 200))
        throw new Error('Le serveur a retourné une réponse invalide')
      }

      renderParticipants()
    } catch (error) {
      console.error('Erreur chargement participants:', error)
      participantsList.innerHTML = '<p class="error-text">Impossible de charger les participants.</p>'
    }
  }

  function renderParticipants() {
    if (!participantsList) return

    let filtered = participants
    if (currentFilter === 'current') {
      filtered = participants.filter((p) => p.distance === currentDistance)
    }

    if (filtered.length === 0) {
      participantsList.innerHTML = `
        <div class="no-participants">
          <p>Aucun participant ${currentFilter === 'current' ? 'pour cette distance' : ''} pour le moment.</p>
          <p class="sub-text">Sois le premier à t'inscrire !</p>
        </div>
      `
      return
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.ts) - new Date(a.ts))

    const html = filtered.map((p) => createParticipantCard(p)).join('')
    participantsList.innerHTML = html

    // Add preview button listeners
    participantsList.querySelectorAll('.btn-preview').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id
        const participant = participants.find((p) => p.id === id)
        if (participant) {
          openPreview(participant)
        }
      })
    })

    // Animate only cards inside this list and force final visibility.
    if (window.gsap) {
      const cards = participantsList.querySelectorAll('.participant-card')
      gsap.killTweensOf(cards)
      gsap.set(cards, { opacity: 1, y: 0, clearProps: 'transform' })
      gsap.from(cards, {
        opacity: 0,
        y: 14,
        duration: 0.3,
        stagger: 0.02,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  function createParticipantCard(participant) {
    const design = dossardDesigns[participant.dossardId] || { name: 'Design inconnu' }
    const distanceLabel = distanceLabels[participant.distance] || participant.distance

    return `
      <div class="participant-card" data-id="${participant.id}">
        <div class="participant-info">
          <span class="participant-name">${escapeHtml(participant.name)}</span>
          <span class="participant-number">N° ${escapeHtml(participant.number)}</span>
        </div>
        <div class="participant-meta">
          <span class="participant-distance">${distanceLabel}</span>
          <span class="participant-design">${design.name}</span>
        </div>
        <button class="btn-preview" data-id="${participant.id}" title="Prévisualiser le dossard">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        </button>
      </div>
    `
  }

  function escapeHtml(str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  function setupModal() {
    const closeBtn = document.getElementById('close-preview')
    const downloadBtn = document.getElementById('download-dossard')

    if (closeBtn) {
      closeBtn.addEventListener('click', closePreview)
    }

    if (previewModal) {
      previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
          closePreview()
        }
      })
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', downloadDossard)
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && previewModal && previewModal.style.display !== 'none') {
        closePreview()
      }
    })
  }

  function openPreview(participant) {
    if (!previewModal || !dossardCanvas) return

    previewModal.style.display = 'flex'
    previewModal.dataset.participantId = participant.id

    // Render dossard on canvas
    renderDossardCanvas(participant)

    // Animation
    if (window.gsap) {
      gsap.from('.preview-modal-content', {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: 'back.out(1.2)',
      })
    }
  }

  function closePreview() {
    if (!previewModal) return

    if (window.gsap) {
      gsap.to('.preview-modal-content', {
        scale: 0.9,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          previewModal.style.display = 'none'
        },
      })
    } else {
      previewModal.style.display = 'none'
    }
  }

  function renderDossardCanvas(participant) {
    const canvas = dossardCanvas
    const ctx = canvas.getContext('2d')

    const design = dossardDesigns[participant.dossardId]
    if (!design) {
      ctx.fillStyle = '#333'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#fff'
      ctx.font = '20px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Design non trouvé', canvas.width / 2, canvas.height / 2)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Draw background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Overlay with text
      const distanceLabel = distanceLabels[participant.distance] || participant.distance

      // Semi-transparent overlay for text readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100)

      // Name
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 28px "Arial", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.fillText(participant.name.toUpperCase(), canvas.width / 2, canvas.height - 70)

      // Number
      ctx.font = 'bold 36px "Arial", sans-serif'
      ctx.fillText(`N° ${participant.number}`, canvas.width / 2, canvas.height - 30)

      // Distance badge (top right)
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(236, 229, 68, 0.9)'
      const badgeWidth = ctx.measureText(distanceLabel).width + 20
      ctx.fillRect(canvas.width - badgeWidth - 10, 10, badgeWidth, 30)

      ctx.fillStyle = '#1a1a1a'
      ctx.font = 'bold 16px "Arial", sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(distanceLabel, canvas.width - 20, 28)
    }

    img.onerror = () => {
      ctx.fillStyle = '#333'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#fff'
      ctx.font = '20px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Erreur de chargement', canvas.width / 2, canvas.height / 2)
    }

    img.src = design.image
  }

  function downloadDossard() {
    if (!dossardCanvas) return

    const participantId = previewModal?.dataset.participantId
    const participant = participants.find((p) => p.id === participantId)
    const filename = participant
      ? `dossard_${participant.name.replace(/\s+/g, '_')}_${participant.number}.png`
      : 'dossard.png'

    const link = document.createElement('a')
    link.download = filename
    link.href = dossardCanvas.toDataURL('image/png')
    link.click()
  }
})()
