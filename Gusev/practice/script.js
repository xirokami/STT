document.getElementById('addNoteBtn').addEventListener('click', function() {
    const noteInput = document.getElementById('noteInput');
    const noteText = noteInput.value.trim();

    if (noteText) {
        const li = document.createElement('li');
        li.textContent = noteText;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', function() {
            li.remove();
        });

        li.appendChild(deleteBtn);
        document.getElementById('notesList').appendChild(li);

        noteInput.value = '';
    } else {
        alert('Пожалуйста, введите заметку.');
    }
});
