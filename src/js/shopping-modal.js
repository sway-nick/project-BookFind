import iziToast from 'izitoast';
import { t } from './i18n.js';
import {
  getShoppingList,
  removeFromShoppingList,
  clearShoppingList,
} from './shopping-list-storage.js';
import { shoppingItemTemplate } from './books-render.js';
import { STORAGE } from './constants.js';

const refs = {
  openBtn: document.querySelector('[data-shopping-open]'),
  backdrop: document.querySelector('#shopping-modal'),
  closeBtn: document.querySelector('.shopping-modal-close'),
  list: document.querySelector('.shopping-list'),
  pagination: document.querySelector('.shopping-pagination'),
  buyBtn: document.querySelector('.shopping-buy-btn'),
};

let currentPage = 1;

function paginationTemplate(totalPages) {
  let markup = '';
  for (let page = 1; page <= totalPages; page += 1) {
    const activeClass = page === currentPage ? ' is-active' : '';
    markup += `<li><button class="shopping-page-btn${activeClass}"
                  type="button" data-page="${page}">${page}</button></li>`;
  }
  return markup;
}

function renderShoppingList() {
  const list = getShoppingList();
  const totalPages = Math.ceil(list.length / STORAGE.SHOPPING_PER_PAGE);
  currentPage = Math.min(currentPage, Math.max(totalPages, 1));

  const start = (currentPage - 1) * STORAGE.SHOPPING_PER_PAGE;
  const pageItems = list.slice(start, start + STORAGE.SHOPPING_PER_PAGE);

  refs.list.innerHTML = list.length
    ? pageItems.map(shoppingItemTemplate).join('')
    : `<li class="shopping-empty" data-i18n="shopping_empty">${t('shopping_empty')}</li>`;
  refs.pagination.innerHTML = totalPages > 1 ? paginationTemplate(totalPages) : '';
  refs.buyBtn.classList.toggle('is-hidden', !list.length);
}

function onEscPress(event) {
  if (event.key === 'Escape') closeShoppingModal();
}

function openShoppingModal() {
  currentPage = 1;
  renderShoppingList();
  refs.backdrop.classList.remove('is-hidden');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', onEscPress);
}

function closeShoppingModal() {
  refs.backdrop.classList.add('is-hidden');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onEscPress);
}

function buyAll() {
  clearShoppingList();
  renderShoppingList();
  iziToast.success({ message: t('toast_thank_you'), position: 'topRight' });
}

refs.openBtn.addEventListener('click', openShoppingModal);
refs.closeBtn.addEventListener('click', closeShoppingModal);
refs.buyBtn.addEventListener('click', buyAll);

refs.backdrop.addEventListener('click', event => {
  if (event.target === refs.backdrop) closeShoppingModal();
});

refs.pagination.addEventListener('click', event => {
  const button = event.target.closest('[data-page]');
  if (!button || button.classList.contains('is-active')) return;
  currentPage = Number(button.dataset.page);
  renderShoppingList();
});

refs.list.addEventListener('click', event => {
  const button = event.target.closest('[data-remove-id]');
  if (!button) return;
  removeFromShoppingList(button.dataset.removeId);
  renderShoppingList();
});