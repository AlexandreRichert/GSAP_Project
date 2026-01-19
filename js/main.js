document.addEventListener('DOMContentLoaded', () => {
  const burgerMenu = document.querySelector('.burger-menu')
  const dropdownMenu = document.querySelector('.dropdown-menu')
  const menuOverlay = document.querySelector('.menu-overlay')
  const dropdownLinks = document.querySelectorAll('.dropdown-link')

  // Toggle menu
  function toggleMenu() {
    burgerMenu.classList.toggle('active')
    dropdownMenu.classList.toggle('active')
    menuOverlay.classList.toggle('active')
    document.body.style.overflow = dropdownMenu.classList.contains('active') ? 'hidden' : ''
  }

  // Fermer le menu
  function closeMenu() {
    burgerMenu.classList.remove('active')
    dropdownMenu.classList.remove('active')
    menuOverlay.classList.remove('active')
    document.body.style.overflow = ''
  }

  // Event listeners
  burgerMenu.addEventListener('click', toggleMenu)
  menuOverlay.addEventListener('click', closeMenu)

  // Fermer le menu au clic sur un lien
  dropdownLinks.forEach((link) => {
    link.addEventListener('click', closeMenu)
  })

  // Fermer avec Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdownMenu.classList.contains('active')) {
      closeMenu()
    }
  })
})
