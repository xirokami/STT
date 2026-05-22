document.addEventListener('DOMContentLoaded', function() {
    const blocks = document.querySelectorAll('.block.hidden');
    
    // Функция для проверки видимости элементов
    function checkVisibility() {
        const triggerPoint = window.innerHeight * 0.8; // 80% высоты окна
        
        blocks.forEach((block, index) => {
            const blockPosition = block.getBoundingClientRect().top;
            
            // Добавляем задержку для последовательного появления
            const delay = index % 3 * 150; // Задержка для каждого блока в ряду
            
            if (blockPosition < triggerPoint) {
                setTimeout(() => {
                    block.classList.add('visible');
                }, delay);
            }
        });
    }
    
    // Проверяем видимость при загрузке страницы
    checkVisibility();
    
    // Проверяем видимость при скролле
    window.addEventListener('scroll', checkVisibility);
    
    // Дополнительно проверяем при изменении размера окна
    window.addEventListener('resize', checkVisibility);
});
