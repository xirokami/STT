// ============ Панель администратора ============

const PAYMENT_NAMES = { cash: 'Наличными', transfer: 'Перевод по телефону' };

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    location.href = '/log';
}

function statusClass(s) {
    if (s === 'Одобрено') return 'status status-approved';
    if (s === 'Отклонено') return 'status status-rejected';
    return 'status status-pending';
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function setStatus(id, status) {
    const res = await fetch(`/api/admin/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    if (res.status === 403) { location.href = '/zaya'; return; }
    loadRequests();
}

async function loadRequests() {
    const res = await fetch('/api/admin/requests');
    if (res.status === 401) { location.href = '/log'; return; }
    if (res.status === 403) { location.href = '/zaya'; return; }
    const data = await res.json();

    const tbody = document.getElementById('requestsTable');
    const empty = document.getElementById('emptyState');
    const badge = document.getElementById('countBadge');

    const n = data.requests.length;
    badge.textContent = `${n} ${plural(n)}`;
    tbody.innerHTML = '';
    empty.style.display = n ? 'none' : 'block';

    data.requests.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.id}</td>
            <td>${escapeHtml(r.fullname)}</td>
            <td>${escapeHtml(r.course)}</td>
            <td>${r.start_date}</td>
            <td>${PAYMENT_NAMES[r.payment] || r.payment}</td>
            <td>${r.created_at}</td>
            <td><span class="${statusClass(r.status)}">${r.status}</span></td>
            <td class="actions">
                ${r.status !== 'Одобрено'
                    ? `<button class="btn btn-success" onclick="setStatus(${r.id}, 'Одобрено')">Одобрить</button>` : ''}
                ${r.status !== 'Отклонено'
                    ? `<button class="btn btn-danger" onclick="setStatus(${r.id}, 'Отклонено')">Отклонить</button>` : ''}
            </td>`;
        tbody.appendChild(tr);
    });
}

function plural(n) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'заявка';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'заявки';
    return 'заявок';
}

loadRequests();
