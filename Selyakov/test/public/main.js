// ============ Валидация и авторизация (регистрация + логин) ============

const RE_LOGIN = /^[a-zA-Z0-9]{6,}$/;
const RE_NAME = /^[А-Яа-яЁё\s]+$/;
const RE_PHONE = /^8\d{10}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldState(inputId, errorId, validId, ok, errorText) {
    const err = document.getElementById(errorId);
    const val = document.getElementById(validId);
    if (ok) {
        if (err) err.style.display = 'none';
        if (val) val.style.display = 'block';
    } else {
        if (err) { err.textContent = errorText; err.style.display = 'block'; }
        if (val) val.style.display = 'none';
    }
    return ok;
}

function showGlobalMessage(text, isError = true) {
    const msg = document.getElementById('globalMessage');
    msg.textContent = text;
    msg.className = isError ? 'global-msg error' : 'global-msg success';
    msg.style.display = 'block';
}

async function apiPost(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Ошибка сервера');
    return data;
}

// ---------------- РЕГИСТРАЦИЯ ----------------
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    const v = (id) => document.getElementById(id).value.trim();

    function validateLogin() {
        return setFieldState('login', 'loginError', 'loginValid',
            RE_LOGIN.test(v('login')), 'Логин: только латиница и цифры, минимум 6 символов');
    }
    function validatePassword() {
        return setFieldState('password', 'passwordError', 'passwordValid',
            v('password').length >= 8, 'Пароль: минимум 8 символов');
    }
    function validateFullname() {
        return setFieldState('fullname', 'fullnameError', 'fullnameValid',
            RE_NAME.test(v('fullname')), 'ФИО: только русские буквы и пробелы');
    }
    function validatePhone() {
        return setFieldState('phone', 'phoneError', 'phoneValid',
            RE_PHONE.test(v('phone')), 'Телефон: формат 8XXXXXXXXXX (11 цифр)');
    }
    function validateEmail() {
        return setFieldState('email', 'emailError', 'emailValid',
            RE_EMAIL.test(v('email')), 'Некорректный email');
    }

    ['login', 'password', 'fullname', 'phone', 'email'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            document.getElementById('globalMessage').style.display = 'none';
            ({ login: validateLogin, password: validatePassword, fullname: validateFullname,
               phone: validatePhone, email: validateEmail })[id]();
        });
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const allOk = [validateLogin(), validatePassword(), validateFullname(), validatePhone(), validateEmail()]
            .every(Boolean);
        if (!allOk) return;

        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        try {
            await apiPost('/api/register', {
                login: v('login'),
                password: v('password'),
                fullname: v('fullname'),
                phone: v('phone'),
                email: v('email')
            });
            location.href = '/zaya';
        } catch (err) {
            showGlobalMessage(err.message);
            btn.disabled = false;
        }
    });
}

// ---------------- ЛОГИН ----------------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const login = document.getElementById('login').value.trim();
        const password = document.getElementById('password').value;
        if (!login || !password) {
            showGlobalMessage('Введите логин и пароль');
            return;
        }
        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        try {
            await apiPost('/api/login', { login, password });
            location.href = '/zaya';
        } catch (err) {
            showGlobalMessage(err.message);
            btn.disabled = false;
        }
    });
}
