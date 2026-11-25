// для кнопки бургер-меню і суміжного функціоналу

// burger-menu
const initMobileMenu = () => {
  const openMenuBtn = document.querySelector('[data-menu-open]');
  const closeMenuBtn = document.querySelector('[data-menu-close]');
  const mobileMenu = document.querySelector('[data-menu]');
  const mobileMenuContainer = mobileMenu ? mobileMenu.querySelector('.mobile-menu-container') : null;
  const menuLinks = document.querySelectorAll('.mobile-menu-link');

  if (!openMenuBtn || !closeMenuBtn || !mobileMenu) return;

  mobileMenu.inert = true;

  const onKeyDown = event => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  };

  const openMenu = () => {
    mobileMenu.inert = false;
    mobileMenu.classList.add('is-open');
    openMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', onKeyDown);
  };

  const closeMenu = () => {
    openMenuBtn.focus();
    mobileMenu.classList.remove('is-open');
    mobileMenu.inert = true;
    openMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    document.removeEventListener('keydown', onKeyDown);
  };

  openMenuBtn.addEventListener('click', openMenu);
  closeMenuBtn.addEventListener('click', closeMenu);

  // Закриття меню при кліку на посилання навігації
  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Закриття меню при кліку по бекдропу (поза контентом меню)
  mobileMenu.addEventListener('click', event => {
    if (event.target === mobileMenu || (mobileMenuContainer && !mobileMenuContainer.contains(event.target))) {
      closeMenu();
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
  initMobileMenu();
}
// тут кінець логіки хедера
