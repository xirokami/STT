const slider = document.getElementById("page-slider");

if (slider) {
  slider.addEventListener("input", () => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    window.scrollTo(0, maxScroll * (Number(slider.value) / 100));
  });

  window.addEventListener("scroll", () => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    slider.value =
      maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  });
}

document.querySelectorAll('.navigation a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);

    if (!target) {
      console.log("Не найден заголовок с id:", id);
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const toggleButton = document.getElementById("toggle-mechanics");

if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    const sections = document.querySelectorAll("details.mechanics");
    const shouldOpen = [...sections].some((section) => !section.open);

    sections.forEach((section) => {
      section.open = shouldOpen;
    });

    toggleButton.textContent = shouldOpen
      ? "Свернуть все механики"
      : "Раскрыть все механики";
  });
}
// public/ultra1.js

(function () {
  'use strict';

  const STORAGE_KEY = 'ultrawiki-lang';
  const DEFAULT_LANG = 'en';
  const LANGS = ['en', 'ru'];

  /**
   * Применяет язык к <body>: снимает все lang-* классы и ставит нужный.
   * @param {'en'|'ru'} lang
   */
  function applyLang(lang) {
    if (!LANGS.includes(lang)) lang = DEFAULT_LANG;

    LANGS.forEach(function (l) {
      document.body.classList.remove('lang-' + l);
    });
    document.body.classList.add('lang-' + lang);

    // lang-атрибут у <html> — для доступности и корректной типографики
    document.documentElement.setAttribute('lang', lang);

    // Обновляем состояние кнопки-переключателя, если она есть
    const btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = lang === 'en' ? 'RU' : 'EN';
      btn.setAttribute(
        'aria-label',
        lang === 'en' ? 'Переключить на русский' : 'Switch to English'
      );
      btn.setAttribute('title', lang === 'en' ? 'Русский' : 'English');
    }
  }

  /**
   * Возвращает сохранённый язык или дефолтный.
   * @returns {'en'|'ru'}
   */
  function getSavedLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return LANGS.includes(saved) ? saved : DEFAULT_LANG;
    } catch (e) {
      // localStorage может быть недоступен (приватный режим, file://)
      return DEFAULT_LANG;
    }
  }

  /**
   * Сохраняет выбранный язык.
   * @param {'en'|'ru'} lang
   */
  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* игнорируем */
    }
  }

  /**
   * Переключает текущий язык.
   */
  function toggleLang() {
    const current = document.body.classList.contains('lang-ru') ? 'ru' : 'en';
    const next = current === 'en' ? 'ru' : 'en';
    applyLang(next);
    saveLang(next);
  }

  /**
   * Создаёт кнопку переключения языка и вставляет её в навигацию.
   */
  function createToggleButton() {
    if (document.getElementById('lang-toggle')) return; // уже есть

    const btn = document.createElement('button');
    btn.id = 'lang-toggle';
    btn.type = 'button';
    btn.className = 'lang-toggle';
    btn.addEventListener('click', toggleLang);

    // Вставляем в конец навигации, чтобы не мешать пунктам меню
    const nav = document.querySelector('.navigation');
    if (nav) {
      nav.appendChild(btn);
    } else {
      // fallback — фиксированная кнопка в углу, если навигации нет
      btn.style.position = 'fixed';
      btn.style.top = '10px';
      btn.style.right = '10px';
      btn.style.zIndex = '9999';
      document.body.appendChild(btn);
    }
  }

  // === Инициализация ===

  // 1. Сразу применяем сохранённый язык (до DOMContentLoaded тело уже есть,
  //    т.к. скрипт подключён в конце <body>)
  applyLang(getSavedLang());

  // 2. После построения DOM создаём кнопку и обновляем её состояние
  function init() {
    createToggleButton();
    // повторно применяем, чтобы кнопка получила правильный текст
    const current = document.body.classList.contains('lang-ru') ? 'ru' : 'en';
    applyLang(current);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
