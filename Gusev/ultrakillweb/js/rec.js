(function() {
  // Выбираем элементы, которые должны анимироваться при прокрутке
  const animatedElements = document.querySelectorAll('.box, .box_1');

  // Настройки наблюдателя IntersectionObserver
  const observerOptions = {
    threshold: 0.1,        // Анимация сработает, когда 10 % элемента станут видны
    rootMargin: '0px 0px -50px 0px' // Смещение: анимация запускается чуть раньше, чем элемент полностью попадёт в зону видимости
  };

  // Создаём наблюдатель для отслеживания видимости элементов
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Добавляем класс для запуска анимации
        entry.target.classList.add('revealed');

        // Оптимизация: прекращаем наблюдение за элементом после срабатывания
        // Это предотвращает лишние проверки и экономит ресурсы
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Начинаем отслеживать все выбранные элементы
  animatedElements.forEach(el => {
    observer.observe(el);
  });

  // Дополнительная проверка: если элементы уже видны при загрузке страницы,
  // запускаем анимацию сразу
  setTimeout(() => {
    animatedElements.forEach(el => {
      if (isElementInViewport(el)) {
        el.classList.add('revealed');
        observer.unobserve(el);
      }
    });
  }, 100);

  // Вспомогательная функция: проверяет, виден ли элемент на экране
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
})();
