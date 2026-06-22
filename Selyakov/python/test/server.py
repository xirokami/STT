from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from datetime import datetime
import re
import uuid

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = "korochki-secret-key-2026"
CORS(app, supports_credentials=True)

# === БАЗА ДАННЫХ В ПАМЯТИ ===
users_db = {}
applications_db = {}
reviews_db = {}

# Администратор по умолчанию
users_db["Admin"] = {
    "id": "admin-001",
    "login": "Admin",
    "password": "KorokNET",
    "full_name": "Администратор",
    "phone": "8(999)999-99-99",
    "email": "admin@korochki.ru",
    "role": "admin",
}

# Тестовый пользователь
users_db["student1"] = {
    "id": "user-001",
    "login": "student1",
    "password": "password123",
    "full_name": "Иванов Иван Иванович",
    "phone": "8(900)123-45-67",
    "email": "ivanov@mail.ru",
    "role": "user",
}

# Тестовая заявка
applications_db["app-001"] = {
    "id": "app-001",
    "user_id": "user-001",
    "user_login": "student1",
    "user_name": "Иванов Иван Иванович",
    "course": "Основы алгоритмизации и программирования",
    "start_date": "15.09.2026",
    "payment_method": "Перевод по номеру телефона",
    "status": "Обучение завершено",
    "created_at": "2026-06-01T10:00:00",
    "admin_comment": "",
}

COURSES = [
    "Основы алгоритмизации и программирования",
    "Основы веб-дизайна",
    "Основы проектирования баз данных",
]


# === ВАЛИДАТОРЫ ===
def validate_login(login):
    if not login or len(login) < 6:
        return "Логин должен содержать не менее 6 символов"
    if not re.match(r"^[a-zA-Z0-9]+$", login):
        return "Логин может содержать только латиницу и цифры"
    return None


def validate_password(password):
    if not password or len(password) < 8:
        return "Пароль должен содержать не менее 8 символов"
    return None


def validate_full_name(name):
    if not name or not re.match(r"^[А-Яа-яЁё\s]+$", name.strip()):
        return "ФИО может содержать только кириллицу и пробелы"
    return None


def validate_phone(phone):
    if not phone:
        return "Введите номер телефона"
    digits = re.sub(r"\D", "", phone)
    if len(digits) != 11:
        return "Неккоректный номер телефона"
    return None


def validate_email(email):
    if not email or not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return "Некорректный формат email"
    return None


def validate_date(date_str):
    if not date_str or not re.match(r"^\d{2}\.\d{2}\.\d{4}$", date_str):
        return "Дата должна быть в формате ДД.ММ.ГГГГ"
    try:
        datetime.strptime(date_str, "%d.%m.%Y")
    except ValueError:
        return "Некорректная дата"
    return None


# === ROUTES ===


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/courses")
def get_courses():
    return jsonify(COURSES)


# Регистрация
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    errors = {}

    login = data.get("login", "").strip()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()
    phone = data.get("phone", "").strip()
    email = data.get("email", "").strip()

    err = validate_login(login)
    if err:
        errors["login"] = err

    err = validate_password(password)
    if err:
        errors["password"] = err

    err = validate_full_name(full_name)
    if err:
        errors["full_name"] = err

    err = validate_phone(phone)
    if err:
        errors["phone"] = err

    err = validate_email(email)
    if err:
        errors["email"] = err

    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    if login in users_db:
        return jsonify(
            {
                "success": False,
                "errors": {"login": "Пользователь с таким логином уже существует"},
            }
        ), 400

    user_id = f"user-{uuid.uuid4().hex[:8]}"
    users_db[login] = {
        "id": user_id,
        "login": login,
        "password": password,
        "full_name": full_name,
        "phone": phone,
        "email": email,
        "role": "user",
    }

    return jsonify({"success": True, "message": "Регистрация успешна"})


# Авторизация
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    login = data.get("login", "").strip()
    password = data.get("password", "")

    if not login or not password:
        return jsonify({"success": False, "error": "Введите логин и пароль"}), 400

    user = users_db.get(login)
    if not user or user["password"] != password:
        return jsonify({"success": False, "error": "Неверный логин или пароль"}), 401

    session["user_id"] = user["id"]
    session["login"] = user["login"]
    session["role"] = user["role"]

    return jsonify(
        {
            "success": True,
            "user": {
                "id": user["id"],
                "login": user["login"],
                "full_name": user["full_name"],
                "role": user["role"],
            },
        }
    )


# Проверка сессии
@app.route("/api/session")
def check_session():
    if "user_id" in session:
        user = users_db.get(session["login"])
        if user:
            return jsonify(
                {
                    "authenticated": True,
                    "user": {
                        "id": user["id"],
                        "login": user["login"],
                        "full_name": user["full_name"],
                        "role": user["role"],
                    },
                }
            )
    return jsonify({"authenticated": False})


# Выход
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})


# Создание заявки
@app.route("/api/applications", methods=["POST"])
def create_application():
    if "user_id" not in session:
        return jsonify({"success": False, "error": "Требуется авторизация"}), 401

    data = request.get_json()
    errors = {}

    course = data.get("course", "")
    start_date = data.get("start_date", "").strip()
    payment_method = data.get("payment_method", "")

    if not course or course not in COURSES:
        errors["course"] = "Выберите курс из списка"

    err = validate_date(start_date)
    if err:
        errors["start_date"] = err

    if not payment_method or payment_method not in [
        "Наличными",
        "Перевод по номеру телефона",
    ]:
        errors["payment_method"] = "Выберите способ оплаты"

    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    app_id = f"app-{uuid.uuid4().hex[:8]}"
    user = users_db[session["login"]]

    applications_db[app_id] = {
        "id": app_id,
        "user_id": user["id"],
        "user_login": user["login"],
        "user_name": user["full_name"],
        "course": course,
        "start_date": start_date,
        "payment_method": payment_method,
        "status": "Новая",
        "created_at": datetime.now().isoformat(),
        "admin_comment": "",
    }

    return jsonify({"success": True, "application": applications_db[app_id]})


# Получение заявок
@app.route("/api/applications")
def get_applications():
    if "user_id" not in session:
        return jsonify({"success": False, "error": "Требуется авторизация"}), 401

    if session.get("role") == "admin":
        apps = list(applications_db.values())
    else:
        apps = [
            a for a in applications_db.values() if a["user_id"] == session["user_id"]
        ]

    apps = sorted(apps, key=lambda x: x["created_at"], reverse=True)

    return jsonify({"success": True, "applications": apps})


# Обновление статуса заявки (админ)
@app.route("/api/applications/<app_id>/status", methods=["PUT"])
def update_status(app_id):
    if "user_id" not in session or session.get("role") != "admin":
        return jsonify({"success": False, "error": "Доступ запрещен"}), 403

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["Новая", "Идет обучение", "Обучение завершено"]:
        return jsonify({"success": False, "error": "Некорректный статус"}), 400

    if app_id not in applications_db:
        return jsonify({"success": False, "error": "Заявка не найдена"}), 404

    applications_db[app_id]["status"] = new_status
    return jsonify({"success": True, "application": applications_db[app_id]})


# Добавление отзыва
@app.route("/api/reviews", methods=["POST"])
def add_review():
    if "user_id" not in session:
        return jsonify({"success": False, "error": "Требуется авторизация"}), 401

    data = request.get_json()
    app_id = data.get("application_id")
    rating = data.get("rating")
    text = data.get("text", "").strip()

    if not app_id or app_id not in applications_db:
        return jsonify({"success": False, "error": "Заявка не найдена"}), 404

    app = applications_db[app_id]
    if app["user_id"] != session["user_id"]:
        return jsonify({"success": False, "error": "Доступ запрещен"}), 403

    if app["status"] != "Обучение завершено":
        return jsonify(
            {
                "success": False,
                "error": "Отзыв доступен только после завершения обучения",
            }
        ), 400

    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({"success": False, "error": "Укажите рейтинг от 1 до 5"}), 400

    if not text or len(text) < 10:
        return jsonify(
            {"success": False, "error": "Отзыв должен содержать минимум 10 символов"}
        ), 400

    review_id = f"rev-{uuid.uuid4().hex[:8]}"
    reviews_db[review_id] = {
        "id": review_id,
        "application_id": app_id,
        "user_id": session["user_id"],
        "user_name": users_db[session["login"]]["full_name"],
        "course": app["course"],
        "rating": rating,
        "text": text,
        "created_at": datetime.now().isoformat(),
    }

    return jsonify({"success": True, "review": reviews_db[review_id]})


# Получение отзывов
@app.route("/api/reviews")
def get_reviews():
    if "user_id" not in session:
        return jsonify({"success": False, "error": "Требуется авторизация"}), 401

    if session.get("role") == "admin":
        revs = list(reviews_db.values())
    else:
        revs = [r for r in reviews_db.values() if r["user_id"] == session["user_id"]]

    return jsonify({"success": True, "reviews": revs})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
