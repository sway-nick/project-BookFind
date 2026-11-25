import Swiper from 'swiper';
import { Autoplay, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';

const heroSliderEl = document.querySelector('.hero-slider');

if (heroSliderEl) {
  new Swiper(heroSliderEl, {
    modules: [Autoplay, Keyboard, A11y],
    slidesPerView: 1,
    spaceBetween: 24,
    speed: 600,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    a11y: {
      enabled: true,
    },
  });
}

