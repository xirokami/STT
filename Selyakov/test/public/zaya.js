// ============ Мои заявки (личный кабинет пользователя) ============

const PAYMENT_NAMES = { cash: 'Наличными', transfer: 'Перевод по номеру телефона' };

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    location.href = '/log';
}

function statusClass(s) {
    if (s === 'Одобрено') return 'status status-approved';
    if (s === 'Отклонено') return 'status status-rejected';
    return 'status status-pending';
}

function starsHtml(n) {
    return '★'.repeat(n) + '<span class="stars-dim">' + '★'.repeat(5 - n) + '</span>';
}

function renderReviewSection(req) {
    if (req.status !== 'Одобрено') return '';
    if (req.review_rating) {
        return `
            <hr>
            <div class="existing-review">
                <div class="review-header">
                    <span class="review-rating">${starsHtml(req.review_rating)}</span>
                    <span class="review-date">${req.review_date || ''}</span>
                </div>
                <div class="review-text">${escapeHtml(req.review_text || '')}</div>
            </div>`;
    }
    return `
        <hr>
        <div class="review-section">
            <h3>Оставить отзыв</h3>
            <div class="stars">
                <span class="star" data-value="1">★</span>
                <span class="star" data-value="2">★</span>
                <span class="star" data-value="3">★</span>
                <span class="star" data-value="4">★</span>
                <span class="star" data-value="5">★</span>
            </div>
            <textarea placeholder="Расскажите о вашем опыте обучения..."></textarea>
            <button class="btn review-submit" data-id="${req.id}">Отправить отзыв</button>
            <div class="review-error" style="display:none"></div>
        </div>`;
}

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderRequests(requests) {
    const list = document.getElementById('requestsList');
    const empty = document.getElementById('emptyState');
    list.innerHTML = '';
    empty.style.display = requests.length ? 'none' : 'block';

    requests.forEach(req => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
            <div class="card-header">
                <h2>${escapeHtml(req.course)}</h2>
                <span class="${statusClass(req.status)}">${req.status}</span>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <div class="info-item">
                        <span class="info-label">Дата подачи</span>
                        <span class="info-value">${req.created_at}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Начало обучения</span>
                        <span class="info-value">${req.start_date}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Оплата</span>
                        <span class="info-value">${PAYMENT_NAMES[req.payment] || req.payment}</span>
                    </div>
                </div>
                ${renderReviewSection(req)}
            </div>`;
        list.appendChild(card);
    });
}

// выбор звёзд + отправка отзыва (делегирование)
document.getElementById('requestsList').addEventListener('click', async (e) => {
    const star = e.target.closest('.star');
    if (star) {
        const wrap = star.closest('.review-section');
        wrap.dataset.rating = star.dataset.value;
        wrap.querySelectorAll('.star').forEach(s =>
            s.classList.toggle('active', +s.dataset.value <= +star.dataset.value));
        return;
    }

    const btn = e.target.closest('.review-submit');
    if (btn) {
        const section = btn.closest('.review-section');
        const rating = +(section.dataset.rating || 0);
        const text = section.querySelector('textarea').value.trim();
        const errBox = section.querySelector('.review-error');
        if (!rating) { errBox.textContent = 'Выберите оценку'; errBox.style.display = 'block'; return; }
        if (!text) { errBox.textContent = 'Напишите текст отзыва'; errBox.style.display = 'block'; return; }
        btn.disabled = true;
        const res = await fetch(`/api/requests/${btn.dataset.id}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, text })
        });
        if (res.ok) loadRequests();
        else {
            const data = await res.json().catch(() => ({}));
            errBox.textContent = data.detail || 'Ошибка отправки';
            errBox.style.display = 'block';
            btn.disabled = false;
        }
    }
});

async function loadRequests() {
    const meRes = await fetch('/api/me');
    if (meRes.status === 401) { location.href = '/log'; return; }
    const me = await meRes.json();
    document.getElementById('userGreeting').textContent = `Вы вошли как ${me.fullname} (${me.login})`;
    if (me.is_admin) document.getElementById('adminBtn').style.display = 'inline-block';

    const res = await fetch('/api/requests');
    if (res.status === 401) { location.href = '/log'; return; }
    const data = await res.json();
    renderRequests(data.requests);
}

loadRequests();
