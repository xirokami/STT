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

  // Вспомогательные функции валидации
  function validateLogin(value) {
    // латиница (a-z, A-Z) и цифры, минимум 6 символов
    const regex = /^[A-Za-z0-9]{6,}$/;
    return regex.test(value);
  }

  function validatePassword(value) {
    // минимум 8 символов (любых, но не пустых)
    return value.length >= 8;
  }

  function validateFullname(value) {
    // кириллица + пробелы (буквы Ёё тоже учитываем)
    // разрешаем дефис? по условию только кириллица и пробелы, дефис не нужен, но иногда в ФИО есть дефис - добавим, чтобы было гибко, но по условию строго: символы кириллицы и пробелы.
    // для строгости: только буквы кириллицы (включая Ё) и пробелы. Без цифр, латиницы, дефисов.
    const cyrillicAndSpaces = /^[А-Яа-яЁё\s]+$/;
    if (!cyrillicAndSpaces.test(value)) return false;
    // также проверим, что не пусто и не состоит из одних пробелов
    return value.trim().length >= 2; // минимальная разумная длина ФИО хотя бы 2 символа
  }

  function validatePhone(value) {
    // формат: 8(XXX)XXX-XX-XX  (пример: 8(912)345-67-89)
    // регулярное выражение: 8\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}
    const phoneRegex = /^8\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}$/;
    return phoneRegex.test(value);
  }

  function validateEmail(value) {
    // стандартный email-формат (RFC 5322 упрощённо, но надёжно)
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(value) && value.length <= 254;
  }

  // Утилита для отображения ошибок / валидных сообщений
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
      // нейтральное состояние (пустое поле, без валидации) - скрываем оба
      errorElement.style.display = 'none';
      validElement.style.display = 'none';
    }
  }

  // Функция получения специфических сообщений
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
    const phoneRegex = /^8\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}$/;
    if (!phoneRegex.test(value)) return "Формат телефона: 8(XXX)XXX-XX-XX (например, 8(912)345-67-89)";
    return "";
  }

  function getEmailMessage(value) {
    if (!value) return "Email обязателен";
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(value)) return "Введите корректный email (пример: name@domain.ru)";
    return "";
  }

  // Функция полной проверки всех полей с обновлением UI
  function runLiveValidation() {
    // Логин
    const loginVal = loginInput.value;
    const isLoginValid = validateLogin(loginVal);
    if (loginVal === "") {
      setFieldStatus('login', null);
    } else if (isLoginValid) {
      setFieldStatus('login', true);
    } else {
      setFieldStatus('login', false, getLoginMessage(loginVal));
    }

    // Пароль
    const passVal = passwordInput.value;
    const isPassValid = validatePassword(passVal);
    if (passVal === "") {
      setFieldStatus('password', null);
    } else if (isPassValid) {
      setFieldStatus('password', true);
    } else {
      setFieldStatus('password', false, getPasswordMessage(passVal));
    }

    // ФИО
    const fioVal = fullnameInput.value;
    const isFioValid = validateFullname(fioVal);
    if (fioVal === "") {
      setFieldStatus('fullname', null);
    } else if (isFioValid) {
      setFieldStatus('fullname', true);
    } else {
      setFieldStatus('fullname', false, getFullnameMessage(fioVal));
    }

    // Телефон
    const phoneVal = phoneInput.value;
    const isPhoneValid = validatePhone(phoneVal);
    if (phoneVal === "") {
      setFieldStatus('phone', null);
    } else if (isPhoneValid) {
      setFieldStatus('phone', true);
    } else {
      setFieldStatus('phone', false, getPhoneMessage(phoneVal));
    }

    // Email
    const emailVal = emailInput.value;
    const isEmailValid = validateEmail(emailVal);
    if (emailVal === "") {
      setFieldStatus('email', null);
    } else if (isEmailValid) {
      setFieldStatus('email', true);
    } else {
      setFieldStatus('email', false, getEmailMessage(emailVal));
    }
  }

  // Проверка, что все поля валидны (для отправки формы)
  function isFormValid() {
    const loginVal = loginInput.value;
    const passVal = passwordInput.value;
    const fioVal = fullnameInput.value;
    const phoneVal = phoneInput.value;
    const emailVal = emailInput.value;

    const loginOk = validateLogin(loginVal);
    const passOk = validatePassword(passVal);
    const fioOk = validateFullname(fioVal);
    const phoneOk = validatePhone(phoneVal);
    const emailOk = validateEmail(emailVal);

    return loginOk && passOk && fioOk && phoneOk && emailOk;
  }

  // Функция для полной проверки и отображения итогового сообщения
  function attemptRegistration(event) {
    event.preventDefault();

    // сначала запускаем live валидацию, чтобы подсветить ошибки
    runLiveValidation();

    if (!isFormValid()) {
      // показываем сообщение об ошибке в глобальном блоке
      globalMsgDiv.style.display = 'block';
      globalMsgDiv.innerHTML = '❌ Пожалуйста, исправьте ошибки в форме. Все поля обязательны и должны соответствовать форматам.';
      globalMsgDiv.classList.remove('success-banner');
      globalMsgDiv.classList.add('global-msg');
      // Прокрутка к началу формы (к первому полю)
      loginInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Если все данные валидны — отображаем "регистрация успешна"
    // Имитация отправки, т.к. бэкенда нет, просто показываем успех с уникальностью логина
    // Проверка уникальности логина (в памяти локального хранилища, симуляция уникальности)
    const desiredLogin = loginInput.value.trim();
    const storageKey = 'demoRegisteredUsers';
    let existingUsers = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        existingUsers = JSON.parse(stored);
      }
    } catch (e) { existingUsers = []; }

    // Поиск существующего логина (регистронезависимо)
    const loginExists = existingUsers.some(user => user.login.toLowerCase() === desiredLogin.toLowerCase());
    if (loginExists) {
      globalMsgDiv.style.display = 'block';
      globalMsgDiv.innerHTML = `⚠️ Логин "${desiredLogin}" уже занят. Пожалуйста, выберите другой уникальный логин.`;
      globalMsgDiv.classList.remove('success-banner');
      // подсветим ошибку логина дополнительно
      setFieldStatus('login', false, 'Этот логин уже используется. Придумайте другой');
      loginInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Если логин уникален — сохраняем в "базу" (localStorage) и показываем успех
    const newUser = {
      login: desiredLogin,
      password: '(захеширован)', // для демонстрации пароль не храним открыто
      fullname: fullnameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      registeredAt: new Date().toISOString()
    };
    existingUsers.push(newUser);
    localStorage.setItem(storageKey, JSON.stringify(existingUsers));

    // успешная регистрация
    globalMsgDiv.style.display = 'block';
    globalMsgDiv.innerHTML = `🎉 Добро пожаловать, ${newUser.fullname}!<br>Регистрация прошла успешно. Логин «${newUser.login}» теперь ваш.`;
    globalMsgDiv.classList.add('success-banner');
    // Не очищаем поля для наглядности, но можно сбросить статусы "валидности" на нейтральные? но ок
    // Дополнительно показываем успешные зеленые отметки везде (они уже зелёные)
    // Сбросим глобальное сообщение через 5 секунд? но лучше оставить как радостное событие.
    // Отключаем возможность повторной отправки формы ненадолго (необязательно)
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    setTimeout(() => { submitBtn.disabled = false; }, 2000);
    // Также можно дополнительно очистить глобальный класс ошибки
  }

  // Добавляем обработчики событий на ввод для динамической валидации
  function bindEvents() {
    loginInput.addEventListener('input', runLiveValidation);
    passwordInput.addEventListener('input', runLiveValidation);
    fullnameInput.addEventListener('input', runLiveValidation);
    phoneInput.addEventListener('input', runLiveValidation);
    emailInput.addEventListener('input', runLiveValidation);

    // Маска для телефона не навязываем принудительно, но для удобства можно добавить небольшую "помощь" форматирования
    phoneInput.addEventListener('input', function(e) );

    // небольшая проверка для email при потере фокуса
    emailInput.addEventListener('blur', runLiveValidation);
    loginInput.addEventListener('blur', runLiveValidation);
    fullnameInput.addEventListener('blur', runLiveValidation);
    passwordInput.addEventListener('blur', runLiveValidation);
    phoneInput.addEventListener('blur', function() {
      // дополнительное авто-форматирование при потере фокуса: если частично введено — не трогаем
      // но проверим валидацию
      runLiveValidation();
    });
  }

  // Инициализация
  const form = document.getElementById('registerForm');
  form.addEventListener('submit', attemptRegistration);
  bindEvents();
  // первичная инициализация (скрыть все сообщения)
  runLiveValidation();

  // Дополнительный сброс глобального сообщения при начале ввода в любом поле, чтобы убрать ошибку формы
  const clearGlobalMsg = () => {
    if (globalMsgDiv.style.display === 'block') {
      globalMsgDiv.style.display = 'none';
      globalMsgDiv.innerHTML = '';
      globalMsgDiv.classList.remove('success-banner');
    }
  };
  [loginInput, passwordInput, fullnameInput, phoneInput, emailInput].forEach(inp => {
    inp.addEventListener('focus', clearGlobalMsg);
    inp.addEventListener('input', clearGlobalMsg);
  });

  // При загрузке страницы проверим хранилище — демонстрация уникальности если нужно
  if (!localStorage.getItem('demoRegisteredUsers')) {
    // создаем демо-пользователя для демонстрации уникальности (тестовый)
    const demo = [{ login: "alex2024", password: "hash", fullname: "Тестов Тест Тестович", phone: "8(999)111-22-33", email: "test@demo.ru", registeredAt: new Date().toISOString() }];
    localStorage.setItem('demoRegisteredUsers', JSON.stringify(demo));
  }
})();
