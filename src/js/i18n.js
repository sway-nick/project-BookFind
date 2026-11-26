import { translations } from './translations.js';

export const SUPPORTED_LANGS = ['en', 'uk'];
export const DEFAULT_LANG = 'en';

let currentLang = DEFAULT_LANG;

export function detectLanguage() {
  const saved = localStorage.getItem('booksy_lang');
  if (saved && SUPPORTED_LANGS.includes(saved)) {
    return saved;
  }

  const navLangs = navigator.languages || [navigator.language || ''];
  for (const lang of navLangs) {
    const code = lang.toLowerCase().slice(0, 2);
    if (code === 'uk') return 'uk';
    if (code === 'en') return 'en';
  }

  return DEFAULT_LANG;
}

export function getCurrentLanguage() {
  return currentLang;
}

export function t(key, params = {}) {
  const dict = translations[currentLang] || translations[DEFAULT_LANG];
  let text = dict[key] || translations[DEFAULT_LANG][key] || key;

  for (const [paramKey, paramVal] of Object.entries(params)) {
    text = text.replaceAll(`{${paramKey}}`, String(paramVal));
  }

  return text;
}

export function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;

  currentLang = lang;
  localStorage.setItem('booksy_lang', lang);
  document.documentElement.lang = lang;

  // Update static text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) {
      el.textContent = t(key);
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (key) {
      el.placeholder = t(key);
    }
  });

  // Update aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    if (key) {
      el.setAttribute('aria-label', t(key));
    }
  });

  // Update titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (key) {
      el.setAttribute('title', t(key));
    }
  });

  // Update language switchers buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const btnLang = btn.dataset.lang;
    const isActive = btnLang === lang;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  // Dispatch custom event for dynamic components (books catalog, shopping list, etc.)
  window.dispatchEvent(
    new CustomEvent('booksy:lang-changed', {
      detail: { lang, t },
    })
  );
}

export function initI18n() {
  const initialLang = detectLanguage();
  setLanguage(initialLang);

  // Delegate clicks on any language switcher buttons in header or mobile menu
  document.addEventListener('click', event => {
    const btn = event.target.closest('.lang-btn[data-lang]');
    if (btn) {
      const selectedLang = btn.dataset.lang;
      if (selectedLang && selectedLang !== currentLang) {
        setLanguage(selectedLang);
      }
    }
  });
}
