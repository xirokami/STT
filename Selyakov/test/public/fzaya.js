// ============ Формирование заявки ============

const form = document.getElementById('requestForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const courseName = document.getElementById('courseName').value.trim();
    const startDate = document.getElementById('startDate').value;
    const payment = form.querySelector('input[name="payment"]:checked');

    const banner = document.getElementById('successBanner');
    banner.style.display = 'none';

    if (!courseName || !startDate || !payment) {
        banner.textContent = '⚠️ Заполните все обязательные поля';
        banner.style.color = '#c0392b';
        banner.style.display = 'block';
        return;
    }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseName, startDate, payment: payment.value })
    });

    if (res.ok) {
        banner.textContent = '✅ Заявка успешно отправлена на рассмотрение администратору!';
        banner.style.color = '';
        banner.style.display = 'block';
        form.reset();
    } else {
        const data = await res.json().catch(() => ({}));
        banner.textContent = '⚠️ ' + (data.detail || 'Ошибка отправки');
        banner.style.color = '#c0392b';
        banner.style.display = 'block';
    }
    btn.disabled = false;
});
