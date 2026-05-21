(function() {
  const animatedElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left');

  // Настройки наблюдателя
  // threshold: 0.2 означает, что анимация сработает, когда 20% элемента станут видны
  // rootMargin: "0px 0px -50px 0px" - можно отрегулировать, чтобы срабатывало чуть раньше/позже
  const observerOptions = {
    threshold: 1,        // Порог видимости: 0 = при любом касании, 0.5 = когда половина элемента в кадре, 1 = полностью
    rootMargin: "0px 0px -30px 0px" // Небольшое смещение (снизу -30px) — чуть раньше добавление класса
  };

  // Создаём наблюдатель
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Оптимизация
        observer.unobserve(entry.target);
      }
      // Если нужна анимация каждый раз при появлении/исчезновении — не вызывайте unobserve,
      // но для большинства случаев "появление один раз" подходит идеально.
    });
  }, observerOptions);

  // Начинаем следить за каждым анимируемым элементом
  animatedElements.forEach(el => {
    observer.observe(el);
  });

  // Дополнительно: если некоторые элементы уже видны при загрузке до запуска наблюдения,
  // они все равно сработают после небольшой паузы, потому что observer проверит их состояние.
  // Также можно инициировать принудительную проверку через setTimeout, но обычно не требуется.
})();
