const translationCache = new Map();

// Load cache from sessionStorage
try {
  const saved = sessionStorage.getItem('booksy_translations');
  if (saved) {
    const parsed = JSON.parse(saved);
    for (const [k, v] of Object.entries(parsed)) {
      translationCache.set(k, v);
    }
  }
} catch {
  // Ignore storage errors
}

function saveCache() {
  try {
    const obj = Object.fromEntries(translationCache);
    sessionStorage.setItem('booksy_translations', JSON.stringify(obj));
  } catch {
    // Ignore storage errors
  }
}

export function getCachedTranslation(lang, text) {
  if (!text || lang === 'en') return text;
  const key = `${lang}:${text.trim()}`;
  return translationCache.get(key) || null;
}

export async function translateToUkrainian(text) {
  if (!text) return '';
  const trimmed = text.trim();
  const key = `uk:${trimmed}`;
  if (translationCache.has(key)) {
    return translationCache.get(key);
  }

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|uk`
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        translationCache.set(key, translated);
        saveCache();
        return translated;
      }
    }
  } catch (err) {
    console.warn('Translation error:', err);
  }

  return trimmed;
}
