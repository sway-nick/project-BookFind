import Accordion from 'accordion-js';
import 'accordion-js/accordion.min.css';
import iziToast from 'izitoast';
import { getBookById } from './books-api.js';
import { addToShoppingList } from './shopping-list-storage.js';

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

const bookAccordion = new Accordion(refs.accordionContainer, {
  duration: 250,
  showMultiple: false,
});

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

  refs.img.src = book.book_image || PLACEHOLDER_IMG;
  refs.img.alt = formattedTitle;
  refs.title.textContent = formattedTitle;
  refs.author.textContent = book.author || 'Unknown author';
  refs.price.textContent = formatPrice(book.price);
  refs.detailsText.textContent = book.description?.trim() || DEFAULT_DESCRIPTION;

  setQuantity(MIN_QUANTITY);
}

function handleBookModalEscape(event) {
  if (event.key === 'Escape') {
    closeBookModal();
  }
}

async function openBookModal(bookId) {
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
      message: 'Failed to load book details. Please try again later.',
      position: 'topRight',
    });
  }
}

function closeBookModal() {
  if (refs.backdrop.classList.contains('is-hidden')) return;

  refs.backdrop.classList.add('is-hidden');
  document.body.style.overflow = '';
  window.removeEventListener('keydown', handleBookModalEscape);
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
    message: `Added to cart: ${quantity} × "${title}"`,
    position: 'topCenter',
  });
});

refs.form.addEventListener('submit', event => {
  event.preventDefault();
  iziToast.success({
    message: 'Дякуємо за покупку',
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
    openBookModal(bookId);
  }
});

export { openBookModal, closeBookModal };
