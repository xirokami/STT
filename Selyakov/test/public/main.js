(function() {
  // DOM элементы
  const loginInput = document.getElementById('login');
  const passwordInput = document.getElementById('password');
  const fullnameInput = document.getElementById('fullname');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');

  const loginError = document.getElementById('loginError');
  const loginValid = document.getElementById('loginValid');
  const passwordError = document.getElementById('passwordError');
  const passwordValid = document.getElementById('passwordValid');
  const fullnameError = document.getElementById('fullnameError');
  const fullnameValid = document.getElementById('fullnameValid');
  const phoneError = document.getElementById('phoneError');
  const phoneValid = document.getElementById('phoneValid');
  const emailError = document.getElementById('emailError');
  const emailValid = document.getElementById('emailValid');
  const globalMsgDiv = document.getElementById('globalMessage');

  // ========== ФУНКЦИИ ВАЛИДАЦИИ ==========

  function validateLogin(value) {
    const regex = /^[A-Za-z0-9]{6,}$/;
    return regex.test(value);
  }

  function validatePassword(value) {
    return value.length >= 8;
  }

  function validateFullname(value) {
    const cyrillicAndSpaces = /^[А-Яа-яЁё\s]+$/;
    if (!cyrillicAndSpaces.test(value)) return false;
    return value.trim().length >= 2;
  }

  function validatePhone(value) {
    const phoneRegex = /^8[0-9]{10}$/;
    return phoneRegex.test(value);
  }

  function validateEmail(value) {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(value) && value.length <= 254;
  }

  // ========== ОТОБРАЖЕНИЕ СТАТУСА ==========

  function setFieldStatus(fieldType, isValid, errorMsg) {
    const errorElement = document.getElementById(`${fieldType}Error`);
    const validElement = document.getElementById(`${fieldType}Valid`);
    if (!errorElement || !validElement) return;

    if (isValid === true) {
      errorElement.style.display = 'none';
      validElement.style.display = 'flex';
    } else if (isValid === false) {
      errorElement.style.display = 'flex';
      errorElement.innerText = errorMsg || 'Некорректное значение';
      validElement.style.display = 'none';
    } else {
      errorElement.style.display = 'none';
      validElement.style.display = 'none';
    }
  }

  // ========== СООБЩЕНИЯ ОБ ОШИБКАХ ==========

  function getLoginMessage(value) {
    if (!value) return "Логин обязателен";
    if (value.length < 6) return "Логин должен содержать не менее 6 символов";
    if (!/^[A-Za-z0-9]+$/.test(value)) return "Только латиница и цифры (A-Z, a-z, 0-9)";
    return "";
  }

  function getPasswordMessage(value) {
    if (!value) return "Пароль обязателен";
    if (value.length < 8) return "Пароль должен быть не менее 8 символов";
    return "";
  }

  function getFullnameMessage(value) {
    if (!value.trim()) return "ФИО обязательно";
    const cyrillicSpaceRegex = /^[А-Яа-яЁё\s]+$/;
    if (!cyrillicSpaceRegex.test(value)) return "Только буквы кириллицы и пробелы";
    if (value.trim().length < 2) return "Введите корректные ФИО (минимум 2 символа)";
    return "";
  }

  function getPhoneMessage(value) {
    if (!value) return "Телефон обязателен";
    const phoneRegex = /^8[0-9]{10}$/;
    if (!phoneRegex.test(value)) return "Формат телефона: 8XXXXXXXXX";
    return "";
  }

  function getEmailMessage(value) {
    if (!value) return "Email обязателен";
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(value)) return "Введите корректный email (пример: name@domain.ru)";
    return "";
  }

  // ========== LIVE-ВАЛИДАЦИЯ ==========

  function runLiveValidation() {
    // Логин
    const loginVal = loginInput.value;
    if (loginVal === "") {
      setFieldStatus('login', null);
    } else if (validateLogin(loginVal)) {
      setFieldStatus('login', true);
    } else {
      setFieldStatus('login', false, getLoginMessage(loginVal));
    }

    // Пароль
    const passVal = passwordInput.value;
    if (passVal === "") {
      setFieldStatus('password', null);
    } else if (validatePassword(passVal)) {
      setFieldStatus('password', true);
    } else {
      setFieldStatus('password', false, getPasswordMessage(passVal));
    }

    // ФИО
    const fioVal = fullnameInput.value;
    if (fioVal === "") {
      setFieldStatus('fullname', null);
    } else if (validateFullname(fioVal)) {
      setFieldStatus('fullname', true);
    } else {
      setFieldStatus('fullname', false, getFullnameMessage(fioVal));
    }

    // Телефон
    const phoneVal = phoneInput.value;
    if (phoneVal === "") {
      setFieldStatus('phone', null);
    } else if (validatePhone(phoneVal)) {
      setFieldStatus('phone', true);
    } else {
      setFieldStatus('phone', false, getPhoneMessage(phoneVal));
    }

    // Email
    const emailVal = emailInput.value;
    if (emailVal === "") {
      setFieldStatus('email', null);
    } else if (validateEmail(emailVal)) {
      setFieldStatus('email', true);
    } else {
      setFieldStatus('email', false, getEmailMessage(emailVal));
    }
  }

  // ========== ПРОВЕРКА ВСЕХ ПОЛЕЙ ==========

  function isFormValid() {
    return validateLogin(loginInput.value) &&
      validatePassword(passwordInput.value) &&
      validateFullname(fullnameInput.value) &&
      validatePhone(phoneInput.value) &&
      validateEmail(emailInput.value);
  }

  // ========== ОТПРАВКА ФОРМЫ ==========

  function attemptRegistration(event) {
    event.preventDefault();
    runLiveValidation();

    if (!isFormValid()) {
      globalMsgDiv.style.display = 'block';
      globalMsgDiv.innerHTML = '❌ Пожалуйста, исправьте ошибки в форме.';
      globalMsgDiv.classList.remove('success-banner');
      loginInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Успешная регистрация
    const fullname = fullnameInput.value.trim();
    const login = loginInput.value.trim();

    globalMsgDiv.style.display = 'block';
    globalMsgDiv.innerHTML = `🎉 Добро пожаловать, ${fullname}!<br>Регистрация прошла успешно. Логин «${login}» принят.`;
    globalMsgDiv.classList.add('success-banner');
  }

  // ========== СБРОС ГЛОБАЛЬНОГО СООБЩЕНИЯ ==========

  function clearGlobalMsg() {
    if (globalMsgDiv.style.display === 'block') {
      globalMsgDiv.style.display = 'none';
      globalMsgDiv.innerHTML = '';
      globalMsgDiv.classList.remove('success-banner');
    }
  }

  // ========== ИНИЦИАЛИЗАЦИЯ ==========

  function init() {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', attemptRegistration);

    // События ввода
    loginInput.addEventListener('input', runLiveValidation);
    passwordInput.addEventListener('input', runLiveValidation);
    fullnameInput.addEventListener('input', runLiveValidation);
    phoneInput.addEventListener('input', runLiveValidation);
    emailInput.addEventListener('input', runLiveValidation);

    // События потери фокуса
    emailInput.addEventListener('blur', runLiveValidation);
    loginInput.addEventListener('blur', runLiveValidation);
    fullnameInput.addEventListener('blur', runLiveValidation);
    passwordInput.addEventListener('blur', runLiveValidation);
    phoneInput.addEventListener('blur', runLiveValidation);

    // Сброс глобального сообщения
    [loginInput, passwordInput, fullnameInput, phoneInput, emailInput].forEach(inp => {
      inp.addEventListener('focus', clearGlobalMsg);
      inp.addEventListener('input', clearGlobalMsg);
    });

    // Первичная валидация
    runLiveValidation();
  }

  // Запуск
  init();
})();
