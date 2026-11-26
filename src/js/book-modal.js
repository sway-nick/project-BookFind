import Accordion from 'accordion-js';
import 'accordion-js/accordion.min.css';
import iziToast from 'izitoast';
import { t, getCurrentLanguage } from './i18n.js';
import { getBookById } from './books-api.js';
import { addToShoppingList } from './shopping-list-storage.js';
import { translateToUkrainian, getCachedTranslation } from './translator.js';

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;
const DEFAULT_DESCRIPTION = 'No description available for this book.';
const PLACEHOLDER_IMG =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const modalBackdrop = document.querySelector('#book-modal');

const refs = {
  backdrop: modalBackdrop,
  closeBtn: modalBackdrop.querySelector('.book-modal-close'),
  img: modalBackdrop.querySelector('.book-modal-img'),
  title: modalBackdrop.querySelector('.book-modal-title'),
  author: modalBackdrop.querySelector('.book-modal-author'),
  price: modalBackdrop.querySelector('.book-modal-price'),
  form: modalBackdrop.querySelector('.book-modal-form'),
  qtyInput: modalBackdrop.querySelector('.book-modal-qty-input'),
  decrementBtn: modalBackdrop.querySelector('[data-action="decrement"]'),
  incrementBtn: modalBackdrop.querySelector('[data-action="increment"]'),
  addToCartBtn: modalBackdrop.querySelector('[data-action="add-to-cart"]'),
  detailsText: modalBackdrop.querySelector('[data-accordion-details]'),
  accordionContainer: modalBackdrop.querySelector('.book-modal-accordion'),
  booksList: document.querySelector('.books-list'),
};

let currentBook = null;
let currentRawDescription = '';

const bookAccordion = new Accordion(refs.accordionContainer, {
  duration: 250,
  showMultiple: false,
});

async function updateModalDescription() {
  if (!refs.detailsText) return;
  const lang = getCurrentLanguage();
  const raw = currentRawDescription.trim();

  if (!raw) {
    refs.detailsText.textContent = t('book_modal_no_desc');
    return;
  }

  if (lang === 'uk') {
    const cached = getCachedTranslation('uk', raw);
    if (cached) {
      refs.detailsText.textContent = cached;
      return;
    }

    refs.detailsText.textContent = raw;
    const translated = await translateToUkrainian(raw);
    if (
      refs.detailsText &&
      getCurrentLanguage() === 'uk' &&
      currentRawDescription.trim() === raw
    ) {
      refs.detailsText.textContent = translated;
    }
  } else {
    refs.detailsText.textContent = raw;
  }
}

function formatBookTitle(title) {
  const trimmed = title?.trim();
  if (!trimmed) {
    return 'Untitled';
  }
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatPrice(price) {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return '$0';
  }
  return `$${Math.round(numericPrice)}`;
}

function getSafeQuantity() {
  const parsed = Number.parseInt(refs.qtyInput.value, 10);
  if (!Number.isFinite(parsed) || parsed < MIN_QUANTITY) {
    return MIN_QUANTITY;
  }
  return Math.min(parsed, MAX_QUANTITY);
}

function setQuantity(value) {
  const clamped = Math.max(MIN_QUANTITY, Math.min(value, MAX_QUANTITY));
  refs.qtyInput.value = String(clamped);
}

function populateBookModal(book) {
  const formattedTitle = formatBookTitle(book.title);
  currentBook = { ...book, title: formattedTitle };
  currentRawDescription = book.description?.trim() || '';

  refs.img.src = book.book_image || PLACEHOLDER_IMG;
  refs.img.alt = formattedTitle;
  refs.title.textContent = formattedTitle;
  refs.author.textContent = book.author || 'Unknown author';
  refs.price.textContent = formatPrice(book.price);
  
  updateModalDescription();

  setQuantity(MIN_QUANTITY);
}

window.addEventListener('booksy:lang-changed', () => {
  if (currentBook) {
    updateModalDescription();
  }
});

function handleBookModalEscape(event) {
  if (event.key === 'Escape') {
    closeBookModal();
  }
}

async function openBookModal(bookId, triggerImg = null) {
  if (!bookId) return;

  try {
    const book = await getBookById(bookId);
    populateBookModal(book);

    refs.backdrop.classList.remove('is-hidden');
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleBookModalEscape);

    bookAccordion.closeAll();
    bookAccordion.open(0);
  } catch {
    iziToast.error({
      message: t('toast_error_load'),
      position: 'topRight',
    });
  } finally {
    if (triggerImg) {
      setTimeout(() => {
        triggerImg.classList.remove('is-opening');
      }, 350);
    }
  }
}

function closeBookModal() {
  if (refs.backdrop.classList.contains('is-hidden')) return;

  refs.backdrop.classList.add('is-hidden');
  document.body.style.overflow = '';
  window.removeEventListener('keydown', handleBookModalEscape);
  document.querySelectorAll('.books-item-img.is-opening').forEach(img => {
    img.classList.remove('is-opening');
  });
}

refs.closeBtn.addEventListener('click', closeBookModal);

refs.backdrop.addEventListener('click', event => {
  if (event.target === refs.backdrop) {
    closeBookModal();
  }
});

refs.decrementBtn.addEventListener('click', () => {
  setQuantity(getSafeQuantity() - 1);
});

refs.incrementBtn.addEventListener('click', () => {
  setQuantity(getSafeQuantity() + 1);
});

refs.qtyInput.addEventListener('change', () => {
  setQuantity(getSafeQuantity());
});

refs.addToCartBtn.addEventListener('click', () => {
  const quantity = getSafeQuantity();
  const title = currentBook?.title || 'Book';
  addToShoppingList(currentBook, quantity);
  iziToast.info({
    message: t('toast_added_to_cart', { qty: quantity, title }),
    position: 'topCenter',
  });
});

refs.form.addEventListener('submit', event => {
  event.preventDefault();
  iziToast.success({
    message: t('toast_thank_you'),
    position: 'topRight',
  });
  closeBookModal();
});

refs.booksList.addEventListener('click', event => {
  const trigger = event.target.closest('.books-item-btn[data-id], .books-item-img');
  if (!trigger) return;

  const card = trigger.closest('.books-item');
  const bookId =
    trigger.dataset.id ||
    card?.querySelector('.books-item-btn[data-id]')?.dataset.id;

  if (bookId) {
    const cardImg = card?.querySelector('.books-item-img');
    if (cardImg) {
      cardImg.classList.add('is-opening');
    }
    openBookModal(bookId, cardImg);
  }
});

export { openBookModal, closeBookModal };
