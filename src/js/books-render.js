export const refs = {
  categoriesList: document.querySelector('.categories-list'),
  booksList: document.querySelector('.books-list'),
  booksLoadMore: document.querySelector('.books-more-btn'),
  booksShown: document.querySelector('.books-count-current'),
  booksTotal: document.querySelector('.books-count-total'),
  categories: document.querySelector('.categories'),
  categoriesToggle: document.querySelector('.categories-toggle'),
};

function categoryTemplate(name) {
  return `
  <li class="categories-item">
    <button class="categories-btn" type="button">${name}</button>
  </li>`;
}

export function renderCategories(names) {
  refs.categoriesList.innerHTML = names.map(categoryTemplate).join('');
  setActiveCategory(refs.categoriesList.querySelector('.categories-btn'));
}

export function setActiveCategory(button) {
  const activeButton = refs.categoriesList.querySelector('.is-active');
  if (activeButton) {
    activeButton.classList.remove('is-active');
    activeButton.removeAttribute('aria-current');
  }
  button.classList.add('is-active');
  button.setAttribute('aria-current', 'true');
}

function bookCardContent({ title, author, price, book_image, _id }) {
  return `
      <img
      class="books-item-img"
      src="${book_image}"
      alt="${title} by ${author}"
      width="343"
      height="488"
      loading="lazy"
      ${_id ? `data-id="${_id}"` : ''}
    />
    <div class="books-item-info">
      <div class="books-item-text">
        <h4 class="books-item-title">${title.toLowerCase()}</h4>
        <p class="books-item-author">${author}</p>
      </div>
      <p class="books-item-price">$${Math.round(price)}</p>
    </div>`;
}

function bookTemplate(book) {
  return `
  <li class="books-item" data-id="${book._id}">
    ${bookCardContent(book)}
    <button class="books-item-btn" type="button" data-id="${book._id}">Learn More</button>
 </li>`;
}

export function shoppingItemTemplate(book) {
  return `
  <li class="books-item">
    ${bookCardContent(book)}
    <p class="shopping-item-qty">Quantity: ${book.quantity}</p>
    <button class="books-item-btn" type="button" data-remove-id="${book._id}">Remove</button>
  </li>`;
}

function booksTemplate(books) {
  return books.map(bookTemplate).join('');
}

export function renderBooks(books) {
  refs.booksList.innerHTML = booksTemplate(books);
}

export function loadMoreBooks(books) {
  refs.booksList.insertAdjacentHTML('beforeend', booksTemplate(books));
}

export function toggleLoadMore(isVisible) {
  refs.booksLoadMore.classList.toggle('is-hidden', !isVisible);
}

export function updateCounter(shown, total) {
  refs.booksShown.textContent = shown;
  refs.booksTotal.textContent = total;
}