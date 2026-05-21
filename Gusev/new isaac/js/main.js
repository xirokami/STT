// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    
    // Получаем все элементы с классом 'content-block'
    const blocks = document.querySelectorAll('.content-block');
    
    // Функция проверки видимости элемента
    function checkVisibility() {
        blocks.forEach(block => {
            // Получаем позицию элемента относительно окна браузера
            const rect = block.getBoundingClientRect();
            
            // Проверяем, виден ли элемент (находится в области просмотра)
            const isVisible = (
                rect.top <= window.innerHeight - 100 && // Верх элемента не ниже нижней границы окна с отступом
                rect.bottom >= 100                       // Низ элемента не выше верхней границы окна с отступом
            );
            
            // Добавляем или убираем класс в зависимости от видимости
            if (isVisible) {
                block.classList.add('visible');
            } else {
                // Опционально: можно убирать класс, когда элемент выходит из зоны видимости
                // block.classList.remove('visible');
            }
        });
    }
    
    // Проверяем при загрузке страницы
    checkVisibility();
    
    // Проверяем при скролле
    window.addEventListener('scroll', checkVisibility);
    
    // Проверяем при изменении размера окна (на случай респонсив-дизайна)
    window.addEventListener('resize', checkVisibility);
});