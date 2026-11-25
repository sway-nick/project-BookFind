import { closeContactModal } from './modals.js';
import iziToast from 'izitoast';
import { t } from './i18n.js';

const contactForm = document.querySelector('.contact-form');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

contactForm.addEventListener('submit', handleSubmit);

function toggleError(input, hasError) {
  input.closest('.contact-form-field').classList.toggle('is-error', hasError);
}

function handleSubmit(event) {
  event.preventDefault();

  const name = contactForm.elements.name.value.trim();
  const email = contactForm.elements.email.value.trim();

  const isNameValid = name !== '';
  const isEmailValid = EMAIL_PATTERN.test(email);

  toggleError(contactForm.elements.name, !isNameValid);
  toggleError(contactForm.elements.email, !isEmailValid);

  if (!isNameValid || !isEmailValid) {
    return;
  }

  iziToast.success({
    message: t('toast_register_success'),
    position: 'topRight',
  });

  contactForm.reset();
  closeContactModal();
}

contactForm.addEventListener('input', event => {
  toggleError(event.target, false);
});
