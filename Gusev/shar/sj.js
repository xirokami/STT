const container = document.getElementById('container');
let count = 0; // счётчик кликов

container.addEventListener('click', function() {
    if (count < 100) {
        const circle = document.createElement('div');
        circle.className = 'circle';

        const row = Math.floor(count / 10); 
        const col = count % 10;          

        circle.style.left = (col * 55 + 10) + 'px'; 
        circle.style.top = (row * 55 + 10) + 'px';  

        container.appendChild(circle);
        count++;
    } else {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const square = document.createElement('div');
        square.className = 'square';
        container.appendChild(square);
    }
});