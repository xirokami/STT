function setRating(event) {
    const stars = event.currentTarget.querySelectorAll('.star');
    const value = event.target.dataset.value;
    if (!value) return;

    stars.forEach(star => {
        if (star.dataset.value <= value) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}