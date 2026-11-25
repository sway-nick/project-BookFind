const scrollUpBtn = document.querySelector('.scroll-up-btn');

if (scrollUpBtn) {
  const threshold = 400;
  let isTicking = false;

  const updateScrollBtn = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (scrollY > threshold) {
      scrollUpBtn.classList.add('is-visible');
    } else {
      scrollUpBtn.classList.remove('is-visible');
    }
    isTicking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!isTicking) {
        window.requestAnimationFrame(updateScrollBtn);
        isTicking = true;
      }
    },
    { passive: true }
  );

  scrollUpBtn.addEventListener('click', () => {
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  });

  // Initial check on load
  updateScrollBtn();
}
