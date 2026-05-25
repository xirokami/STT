class SimpleSPA {
  constructor() {
    this.routes = {
      '/': 'pages/home.html',
      '/about': 'pages/about.html',
      '/services': 'pages/services.html',
      '/contacts': 'pages/contacts.html'
    };

    this.app = document.getElementById('app');
    this.init();
  }

  init() {
    // Обработка кликов по ссылкам с data-link
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        this.navigate(e.target.href || e.target.getAttribute('href'));
      }
    });

    // Обработка кнопок "Назад"/"Вперёд"
    window.addEventListener('popstate', () => {
      this.loadContent(window.location.pathname);
    });

    // Загрузка начальной страницы
    this.loadContent(window.location.pathname);
  }

  async loadContent(path) {
    const route = this.routes[path] || this.routes['/'];

    try {
      const response = await fetch(route);
      if (!response.ok) throw new Error('Страница не найдена');

      const html = await response.text();
      this.app.innerHTML = html;

      // Прокрутка вверх при смене страницы
      window.scrollTo(0, 0);

      // Обновляем активную ссылку (опционально)
      this.updateActiveLink(path);
    } catch (error) {
      this.app.innerHTML = `<h2>Ошибка 404</h2><p>Страница не найдена.</p>`;
      console.error(error);
    }
  }

  navigate(url) {
    const path = new URL(url).pathname;
    window.history.pushState({}, '', path);
    this.loadContent(path);
  }

  updateActiveLink(path) {
    document.querySelectorAll('[data-link]').forEach(link => {
      const linkPath = new URL(link.href).pathname;
      link.classList.toggle('active', linkPath === path);
    });
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new SimpleSPA();
});
