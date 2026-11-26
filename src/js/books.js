import { getBooks, getBooksByCategory, getCategories } from './books-api.js';
import {
  loadMoreBooks,
  refs,
  renderBooks,
  renderCategories,
  setActiveCategory,
  toggleLoadMore,
  updateCounter,
} from './books-render.js';
import { BOOKS_PER_LOAD, BOOKS_PER_PAGE, TABLET_QUERY } from './constants.js';
import iziToast from 'izitoast';
import { t, getCurrentLanguage } from './i18n.js';
import { getCategoryTranslation } from './translations.js';

const ALL_CATEGORIES = 'All categories';
let currentBooks = [];
let shownCount = 0;

function openCategories() {
  refs.categories.classList.add('is-open');
  refs.categoriesToggle.setAttribute('aria-expanded', 'true');
  document.addEventListener('click', onOutsideClick);
}

function closeCategories() {
  refs.categories.classList.remove('is-open');
  refs.categoriesToggle.setAttribute('aria-expanded', 'false');
  document.removeEventListener('click', onOutsideClick);
}

function toggleCategories() {
  refs.categories.classList.contains('is-open')
    ? closeCategories()
    : openCategories();
}

function onOutsideClick(e) {
  if (!refs.categories.contains(e.target)) {
    closeCategories();
  }
}

function getBooksLimit() {
  return window.matchMedia(TABLET_QUERY).matches
    ? BOOKS_PER_PAGE.TABLET_UP
    : BOOKS_PER_PAGE.MOBILE;
}

async function getAllBooks() {
  const topBooks = await getBooks();
  const allBooks = [];
  for (const category of topBooks) {
    for (const book of category.books) {
      allBooks.push(book);
    }
  }
  return allBooks;
}

function showBooks(books) {
  currentBooks = books;
  shownCount = Math.min(getBooksLimit(), currentBooks.length);
  renderBooks(currentBooks.slice(0, shownCount));
  updateBooksInfo();
}

function showMoreBooks() {
  const nextBooks = currentBooks.slice(shownCount, shownCount + BOOKS_PER_LOAD);
  loadMoreBooks(nextBooks);
  shownCount += nextBooks.length;
  updateBooksInfo();
}

function updateBooksInfo() {
  toggleLoadMore(shownCount < currentBooks.length);
  updateCounter(shownCount, currentBooks.length);
}

async function categoryHandler(e) {
  const targetButton = e.target.closest('.categories-btn');
  if (!targetButton) return;
  closeCategories();
  setActiveCategory(targetButton);
  const isAll = targetButton.hasAttribute('data-all-categories');
  const category = targetButton.dataset.categoryName || e.target.textContent.trim();
  try {
    if (isAll) {
      const data = await getAllBooks();
      showBooks(data);
    } else {
      const data = await getBooksByCategory(category);
      showBooks(data);
    }
  } catch {
    iziToast.error({
      message: t('toast_error_load'),
      position: 'topRight',
    });
  }
}

async function initBooks() {
  refs.booksLoadMore.addEventListener('click', showMoreBooks);
  refs.categoriesList.addEventListener('click', categoryHandler);
  refs.categoriesToggle.addEventListener('click', toggleCategories);
  try {
    const [categories, books] = await Promise.all([
      getCategories(),
      getAllBooks(),
    ]);
    const categoryNames = categories.map(category => category.list_name);
    renderCategories([ALL_CATEGORIES, ...categoryNames]);
    showBooks(books);
  } catch {
    iziToast.error({
      message: t('toast_error_load'),
      position: 'topRight',
    });
  }
}

window.addEventListener('booksy:lang-changed', () => {
  const allCatBtn = document.querySelector('[data-all-categories="true"]');
  if (allCatBtn) {
    allCatBtn.textContent = t('books_all_categories');
  }
  const lang = getCurrentLanguage();
  document.querySelectorAll('.categories-btn[data-category-name]').forEach(btn => {
    if (!btn.hasAttribute('data-all-categories')) {
      const orig = btn.dataset.categoryName;
      btn.textContent = getCategoryTranslation(orig, lang);
    }
  });
  document.querySelectorAll('.books-item-btn[data-id]').forEach(btn => {
    btn.textContent = t('books_learn_more');
  });
});

initBooks();