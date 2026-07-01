function showSuccess(event) {
    event.preventDefault();
    document.getElementById('successBanner').style.display = 'block';
    document.getElementById('requestForm').reset();
    return false;
}