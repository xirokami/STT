const API_BASE = '';

let currentUser = null;
let currentPage = 'home';
let applications = [];
let reviews = [];
let courses = [];
let sliderInterval = null;
let currentSlide = 0;
let reviewRating = 0;

const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const navAuth = document.getElementById('navAuth');
const navUser = document.getElementById('navUser');
const userName = document.getElementById('userName');
const navApplications = document.getElementById('navApplications');
const navAdmin = document.getElementById('navAdmin');
const logoutBtn = document.getElementById('logoutBtn');
const toastContainer = document.getElementById('toastContainer');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinksContainer = document.getElementById('navLinks');

// инит
document.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
    await loadCourses();
    initSlider();
    initNavigation();
    initForms();
    initReviewModal();
    
    document.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            navigateTo(page);
        });
    });
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinksContainer.classList.toggle('show');
    });
});

// навигация
function navigateTo(page) {
    currentPage = page;
    pages.forEach(p => p.classList.add('hidden'));
    
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        window.scrollTo(0, 0);
    }
    
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
    
    navLinksContainer.classList.remove('show');
    if (page === 'applications') loadApplications();
    if (page === 'admin') loadAdminData();
    if (page === 'apply') populateCourseSelect();
}

function initNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(e.target.dataset.page);
        });
    });
}

// проверка сесси
async function checkSession() {
    try {
        const res = await fetch(`${API_BASE}/api/session`, { credentials: 'include' });
        const data = await res.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            updateUIForUser();
        } else {
            currentUser = null;
            updateUIForGuest();
        }
    } catch (err) {
        console.error('Session check failed:', err);
        updateUIForGuest();
    }
}

function updateUIForUser() {
    navAuth.style.display = 'none';
    navUser.style.display = 'flex';
    userName.textContent = currentUser.full_name;
    navApplications.style.display = 'block';
    
    if (currentUser.role === 'admin') {
        navAdmin.style.display = 'block';
    } else {
        navAdmin.style.display = 'none';
    }
}

function updateUIForGuest() {
    navAuth.style.display = 'flex';
    navUser.style.display = 'none';
    navApplications.style.display = 'none';
    navAdmin.style.display = 'none';
}

// регистрация
function initForms() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors('register');
            
            const data = {
                login: document.getElementById('regLogin').value.trim(),
                password: document.getElementById('regPassword').value,
                full_name: document.getElementById('regFullName').value.trim(),
                phone: document.getElementById('regPhone').value.trim(),
                email: document.getElementById('regEmail').value.trim()
            };
            
            try {
                const res = await fetch(`${API_BASE}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await res.json();
                
                if (result.success) {
                    showToast('Регистрация успешна! Теперь войдите в систему.', 'success');
                    registerForm.reset();
                    navigateTo('login');
                } else {
                    displayErrors(result.errors, 'reg');
                    showToast('Исправьте ошибки в форме', 'error');
                }
            } catch (err) {
                showToast('Ошибка соединения с сервером', 'error');
            }
        });
    }
    
    // Авторизация
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors('login');
            
            const data = {
                login: document.getElementById('loginLogin').value.trim(),
                password: document.getElementById('loginPassword').value
            };
            
            try {
                const res = await fetch(`${API_BASE}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(data)
                });
                
                const result = await res.json();
                
                if (result.success) {
                    currentUser = result.user;
                    updateUIForUser();
                    showToast(`Добро пожаловать, ${currentUser.full_name}!`, 'success');
                    loginForm.reset();
                    navigateTo('home');
                } else {
                    document.getElementById('error-loginLogin').textContent = result.error || 'Неверный логин или пароль';
                    document.getElementById('loginLogin').classList.add('error');
                    document.getElementById('loginPassword').classList.add('error');
                    showToast(result.error || 'Ошибка авторизации', 'error');
                }
            } catch (err) {
                showToast('Ошибка соединения с сервером', 'error');
            }
        });
    }
    
    // Выход
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch(`${API_BASE}/api/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            currentUser = null;
            updateUIForGuest();
            showToast('Вы вышли из системы', 'info');
            navigateTo('home');
        } catch (err) {
            showToast('Ошибка при выходе', 'error');
        }
    });
    
    // Форма заявки
    const applyForm = document.getElementById('applyForm');
    if (applyForm) {
        applyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors('apply');
            
            const paymentEl = document.querySelector('input[name="payment"]:checked');
            const data = {
                course: document.getElementById('applyCourse').value,
                start_date: document.getElementById('applyDate').value.trim(),
                payment_method: paymentEl ? paymentEl.value : ''
            };
            
            try {
                const res = await fetch(`${API_BASE}/api/applications`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(data)
                });
                
                const result = await res.json();
                
                if (result.success) {
                    showToast('Заявка успешно отправлена!', 'success');
                    applyForm.reset();
                    navigateTo('applications');
                } else {
                    displayErrors(result.errors, 'apply');
                    showToast('Исправьте ошибки в форме', 'error');
                }
            } catch (err) {
                showToast('Ошибка соединения с сервером', 'error');
            }
        });
    }
    
    // Форма отзыва
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors('review');
            
            const data = {
                application_id: document.getElementById('reviewAppId').value,
                rating: reviewRating,
                text: document.getElementById('reviewText').value.trim()
            };
            
            try {
                const res = await fetch(`${API_BASE}/api/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(data)
                });
                
                const result = await res.json();
                
                if (result.success) {
                    showToast('Отзыв успешно отправлен!', 'success');
                    closeReviewModal();
                    loadApplications();
                } else {
                    if (result.error) {
                        showToast(result.error, 'error');
                    } else {
                        displayErrors(result.errors, 'review');
                    }
                }
            } catch (err) {
                showToast('Ошибка соединения с сервером', 'error');
            }
        });
    }
}

// валидация
function clearErrors(prefix) {
    document.querySelectorAll(`[id^="error-${prefix}"]`).forEach(el => {
        el.textContent = '';
    });
    document.querySelectorAll(`#${prefix}Form input, #${prefix}Form select, #${prefix}Form textarea`).forEach(el => {
        el.classList.remove('error');
    });
}

function displayErrors(errors, prefix) {
    for (const [field, msg] of Object.entries(errors)) {
        const errorEl = document.getElementById(`error-${prefix}${capitalize(field)}`);
        const inputEl = document.getElementById(`${prefix}${capitalize(field)}`);
        
        if (errorEl) errorEl.textContent = msg;
        if (inputEl) inputEl.classList.add('error');
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// курсы
async function loadCourses() {
    try {
        const res = await fetch(`${API_BASE}/api/courses`);
        const data = await res.json();
        courses = data;
    } catch (err) {
        console.error('Failed to load courses:', err);
    }
}

function populateCourseSelect() {
    const select = document.getElementById('applyCourse');
    select.innerHTML = '<option value="">Выберите курс</option>';
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        select.appendChild(option);
    });
}

// заявки
async function loadApplications() {
    if (!currentUser) {
        navigateTo('login');
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/api/applications`, { credentials: 'include' });
        const data = await res.json();
        
        if (data.success) {
            applications = data.applications;
            renderApplications();
        }
    } catch (err) {
        showToast('Ошибка загрузки заявок', 'error');
    }
}

function renderApplications() {
    const container = document.getElementById('applicationsList');
    
    if (applications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>У вас пока нет заявок</p>
                <button class="btn btn-primary" data-page="apply">Подать заявку</button>
            </div>
        `;
        container.querySelector('[data-page]').addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('apply');
        });
        return;
    }
    
    container.innerHTML = applications.map(app => `
        <div class="application-card">
            <div class="app-header">
                <span class="app-course">${escapeHtml(app.course)}</span>
                <span class="app-status status-${getStatusClass(app.status)}">${app.status}</span>
            </div>
            <div class="app-details">
                <span>📅 Дата начала: ${app.start_date}</span>
                <span>💳 Оплата: ${app.payment_method}</span>
                <span>🕐 Подано: ${formatDate(app.created_at)}</span>
            </div>
            ${app.status === 'Обучение завершено' ? `
                <div class="app-actions">
                    <button class="btn btn-primary btn-sm" onclick="openReviewModal('${app.id}')">💬 Оставить отзыв</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function getStatusClass(status) {
    switch(status) {
        case 'Новая': return 'new';
        case 'Идет обучение': return 'active';
        case 'Обучение завершено': return 'completed';
        default: return 'new';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// админ
let adminApps = [];
let adminPage = 1;
const ITEMS_PER_PAGE = 5;

async function loadAdminData() {
    if (!currentUser || currentUser.role !== 'admin') {
        navigateTo('home');
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/api/applications`, { credentials: 'include' });
        const data = await res.json();
        
        if (data.success) {
            adminApps = data.applications;
            updateAdminStats();
            renderAdminTable();
        }
    } catch (err) {
        showToast('Ошибка загрузки данных', 'error');
    }
}

function updateAdminStats() {
    document.getElementById('statTotal').textContent = adminApps.length;
    document.getElementById('statNew').textContent = adminApps.filter(a => a.status === 'Новая').length;
    document.getElementById('statActive').textContent = adminApps.filter(a => a.status === 'Идет обучение').length;
    document.getElementById('statCompleted').textContent = adminApps.filter(a => a.status === 'Обучение завершено').length;
}

function renderAdminTable() {
    const search = document.getElementById('adminSearch').value.toLowerCase();
    const statusFilter = document.getElementById('adminFilterStatus').value;
    
    let filtered = adminApps.filter(app => {
        const matchSearch = !search || 
            app.user_name.toLowerCase().includes(search) ||
            app.course.toLowerCase().includes(search) ||
            app.user_login.toLowerCase().includes(search);
        const matchStatus = !statusFilter || app.status === statusFilter;
        return matchSearch && matchStatus;
    });
    
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const start = (adminPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
    
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = paginated.map((app, idx) => `
        <tr>
            <td>${start + idx + 1}</td>
            <td>
                <strong>${escapeHtml(app.user_name)}</strong><br>
                <small style="color: var(--gray-400)">${escapeHtml(app.user_login)}</small>
            </td>
            <td>${escapeHtml(app.course)}</td>
            <td>${app.start_date}</td>
            <td>${app.payment_method}</td>
            <td>
                <select class="status-select" onchange="updateAppStatus('${app.id}', this.value)">
                    <option value="Новая" ${app.status === 'Новая' ? 'selected' : ''}>Новая</option>
                    <option value="Идет обучение" ${app.status === 'Идет обучение' ? 'selected' : ''}>Идет обучение</option>
                    <option value="Обучение завершено" ${app.status === 'Обучение завершено' ? 'selected' : ''}>Обучение завершено</option>
                </select>
            </td>
            <td>
                <button class="btn btn-sm btn-success" onclick="updateAppStatus('${app.id}', 'Идет обучение')">▶</button>
                <button class="btn btn-sm btn-info" onclick="updateAppStatus('${app.id}', 'Обучение завершено')">✓</button>
            </td>
        </tr>
    `).join('');
    
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === adminPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    container.innerHTML = html;
}

function goToPage(page) {
    adminPage = page;
    renderAdminTable();
}

async function updateAppStatus(appId, status) {
    try {
        const res = await fetch(`${API_BASE}/api/applications/${appId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status })
        });
        
        const result = await res.json();
        
        if (result.success) {
            showToast('Статус обновлен', 'success');
            // Обновить локальные данные
            const app = adminApps.find(a => a.id === appId);
            if (app) app.status = status;
            updateAdminStats();
            renderAdminTable();
        } else {
            showToast(result.error || 'Ошибка обновления', 'error');
        }
    } catch (err) {
        showToast('Ошибка соединения', 'error');
    }
}

// Фильтры админки
document.getElementById('adminSearch')?.addEventListener('input', () => {
    adminPage = 1;
    renderAdminTable();
});

document.getElementById('adminFilterStatus')?.addEventListener('change', () => {
    adminPage = 1;
    renderAdminTable();
});

// отзывы
function initReviewModal() {
    const modal = document.getElementById('reviewModal');
    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = document.getElementById('reviewModalClose');
    const stars = document.querySelectorAll('.star-rating .star');
    
    overlay.addEventListener('click', closeReviewModal);
    closeBtn.addEventListener('click', closeReviewModal);
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            reviewRating = parseInt(star.dataset.value);
            updateStars();
        });
        
        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.dataset.value);
            stars.forEach((s, i) => {
                s.classList.toggle('active', i < val);
            });
        });
    });
    
    document.querySelector('.star-rating').addEventListener('mouseleave', updateStars);
}

function updateStars() {
    const stars = document.querySelectorAll('.star-rating .star');
    stars.forEach((s, i) => {
        s.classList.toggle('active', i < reviewRating);
    });
}

function openReviewModal(appId) {
    document.getElementById('reviewAppId').value = appId;
    reviewRating = 0;
    updateStars();
    document.getElementById('reviewText').value = '';
    document.getElementById('reviewModal').classList.remove('hidden');
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.add('hidden');
}

// слайдер
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('sliderDots');
    
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
    
    document.getElementById('sliderPrev').addEventListener('click', () => {
        const newIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
        goToSlide(newIndex);
    });
    
    document.getElementById('sliderNext').addEventListener('click', () => {
        const newIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
        goToSlide(newIndex);
    });
    
    startSliderAuto();
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
    
    // Сбросить таймер
    stopSliderAuto();
    startSliderAuto();
}

function startSliderAuto() {
    sliderInterval = setInterval(() => {
        const slides = document.querySelectorAll('.slide');
        const newIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
        goToSlide(newIndex);
    }, 3000);
}

function stopSliderAuto() {
    clearInterval(sliderInterval);
}

// toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    toast.innerHTML = `${icons[type] || 'ℹ'} ${message}`;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.navigateTo = navigateTo;
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.updateAppStatus = updateAppStatus;
window.goToPage = goToPage;
