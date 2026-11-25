import iziToast from 'izitoast';
import { t } from './i18n.js';

const footerForm = document.querySelector('.footer-form');

footerForm.addEventListener('submit', onFooterFormSubmit);

function onFooterFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const email = form.elements.email.value.trim();

  if (!email) {
    return;
  }

  iziToast.success({
    message: t('toast_subscribe_success'),
    position: 'topRight',
  });

  form.reset();
}