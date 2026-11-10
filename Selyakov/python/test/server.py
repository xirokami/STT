from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from datetime import datetime
import re
import uuid
import os

from dotenv import load_dotenv
load_dotenv()


import pymysql
from pymysql.cursors import DictCursor

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = "korochki-secret-key-2026"
CORS(app, supports_credentials=True)

# === ПОДКЛЮЧЕНИЕ К MARIADB ===
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", "3306")),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "database": os.environ.get("DB_NAME", "korochki"),
    "charset": "utf8mb4",
    "autocommit": True,
}


def get_db():
    return pymysql.connect(cursorclass=DictCursor, **DB_CONFIG)


def init_db():
    """Создание таблиц и начальных данных."""
    conn = pymysql.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        charset="utf8mb4",
        autocommit=True,
    )
    with conn.cursor() as cur:
        cur.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_CONFIG['database']}` CHARACTER SET utf8mb4")
        cur.execute(f"USE `{DB_CONFIG['database']}`")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                login VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                email VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                user_login VARCHAR(50) NOT NULL,
                user_name VARCHAR(255) NOT NULL,
                course VARCHAR(255) NOT NULL,
                start_date VARCHAR(10) NOT NULL,
                payment_method VARCHAR(100) NOT NULL,
                status ENUM('Новая', 'Идет обучение', 'Обучение завершено') NOT NULL DEFAULT 'Новая',
                created_at DATETIME NOT NULL,
                admin_comment TEXT,
                INDEX idx_user (user_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id VARCHAR(50) PRIMARY KEY,
                application_id VARCHAR(50) NOT NULL,
                user_id VARCHAR(50) NOT NULL,
                user_name VARCHAR(255) NOT NULL,
                course VARCHAR(255) NOT NULL,
                rating TINYINT NOT NULL,
                text TEXT NOT NULL,
                created_at DATETIME NOT NULL,
                INDEX idx_app (application_id),
                INDEX idx_user (user_id),
                FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        # Администратор по умолчанию
        cur.execute("SELECT id FROM users WHERE login = 'Admin'")
        if not cur.fetchone():
            cur.execute(
                "INSERT INTO users (id, login, password, full_name, phone, email, role) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                ("admin-001", "Admin", "KorokNET", "Администратор",
                 "8(999)999-99-99", "admin@korochki.ru", "admin"),
            )

        # Тестовый пользователь
        cur.execute("SELECT id FROM users WHERE login = 'student1'")
        if not cur.fetchone():
            cur.execute(
                "INSERT INTO users (id, login, password, full_name, phone, email, role) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                ("user-001", "student1", "password123", "Иванов Иван Иванович",
                 "8(900)123-45-67", "ivanov@mail.ru", "user"),
            )

        # Тестовая заявка
        cur.execute("SELECT id FROM applications WHERE id = 'app-001'")
        if not cur.fetchone():
            cur.execute(
                "INSERT INTO applications (id, user_id, user_login, user_name, course, "
                "start_date, payment_method, status, created_at, admin_comment) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                ("app-001", "user-001", "student1", "Иванов Иван Иванович",
                 "Основы алгоритмизации и программирования", "15.09.2026",
                 "Перевод по номеру телефона", "Обучение завершено",
                 datetime(2026, 6, 1, 10, 0, 0), ""),
            )
    conn.close()


init_db()

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

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE login = %s", (login,))
            if cur.fetchone():
                return jsonify(
                    {
                        "success": False,
                        "errors": {"login": "Пользователь с таким логином уже существует"},
                    }
                ), 400

            user_id = f"user-{uuid.uuid4().hex[:8]}"
            cur.execute(
                "INSERT INTO users (id, login, password, full_name, phone, email, role) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (user_id, login, password, full_name, phone, email, "user"),
            )
    finally:
        db.close()

    return jsonify({"success": True, "message": "Регистрация успешна"})


# Авторизация
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    login = data.get("login", "").strip()
    password = data.get("password", "")

    if not login or not password:
        return jsonify({"success": False, "error": "Введите логин и пароль"}), 400

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT id, login, password, full_name, role FROM users WHERE login = %s",
                (login,),
            )
            user = cur.fetchone()
    finally:
        db.close()

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
        db = get_db()
        try:
            with db.cursor() as cur:
                cur.execute(
                    "SELECT id, login, full_name, role FROM users WHERE login = %s",
                    (session["login"],),
                )
                user = cur.fetchone()
        finally:
            db.close()

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
    created_at = datetime.now()

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT id, login, full_name FROM users WHERE login = %s",
                (session["login"],),
            )
            user = cur.fetchone()

            cur.execute(
                "INSERT INTO applications (id, user_id, user_login, user_name, course, "
                "start_date, payment_method, status, created_at, admin_comment) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (app_id, user["id"], user["login"], user["full_name"], course,
                 start_date, payment_method, "Новая", created_at, ""),
            )

            application = {
                "id": app_id,
                "user_id": user["id"],
                "user_login": user["login"],
                "user_name": user["full_name"],
                "course": course,
                "start_date": start_date,
                "payment_method": payment_method,
                "status": "Новая",
                "created_at": created_at.isoformat(),
                "admin_comment": "",
            }
    finally:
        db.close()

    return jsonify({"success": True, "application": application})


# Получение заявок
@app.route("/api/applications")
def get_applications():
    if "user_id" not in session:
        return jsonify({"success": False, "error": "Требуется авторизация"}), 401

    db = get_db()
    try:
        with db.cursor() as cur:
            if session.get("role") == "admin":
                cur.execute(
                    "SELECT id, user_id, user_login, user_name, course, start_date, "
                    "payment_method, status, created_at, admin_comment "
                    "FROM applications ORDER BY created_at DESC"
                )
            else:
                cur.execute(
                    "SELECT id, user_id, user_login, user_name, course, start_date, "
                    "payment_method, status, created_at, admin_comment "
                    "FROM applications WHERE user_id = %s ORDER BY created_at DESC",
                    (session["user_id"],),
                )
            apps = cur.fetchall()
    finally:
        db.close()

    for a in apps:
        a["created_at"] = a["created_at"].isoformat()

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

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT id FROM applications WHERE id = %s", (app_id,)
            )
            if not cur.fetchone():
                return jsonify({"success": False, "error": "Заявка не найдена"}), 404

            cur.execute(
                "UPDATE applications SET status = %s WHERE id = %s",
                (new_status, app_id),
            )

            cur.execute(
                "SELECT id, user_id, user_login, user_name, course, start_date, "
                "payment_method, status, created_at, admin_comment "
                "FROM applications WHERE id = %s",
                (app_id,),
            )
            application = cur.fetchone()
    finally:
        db.close()

    application["created_at"] = application["created_at"].isoformat()

    return jsonify({"success": True, "application": application})


# Добавление отзыва
@app.route("/api/reviews", methods=["POST"])
def add_review():
    if "user_id" not in session:
        return jsonify({"success": False, "error": "Требуется авторизация"}), 401

    data = request.get_json()
    app_id = data.get("application_id")
    rating = data.get("rating")
    text = data.get("text", "").strip()

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "SELECT id, user_id, course, status FROM applications WHERE id = %s",
                (app_id,),
            )
            app = cur.fetchone()

            if not app:
                return jsonify({"success": False, "error": "Заявка не найдена"}), 404

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

            cur.execute(
                "SELECT full_name FROM users WHERE login = %s",
                (session["login"],),
            )
            user_row = cur.fetchone()
            user_name = user_row["full_name"] if user_row else ""

            review_id = f"rev-{uuid.uuid4().hex[:8]}"
            created_at = datetime.now()

            cur.execute(
                "INSERT INTO reviews (id, application_id, user_id, user_name, course, "
                "rating, text, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (review_id, app_id, session["user_id"],
                 user_name, app["course"],
                 rating, text, created_at),
            )

            review = {
                "id": review_id,
                "application_id": app_id,
                "user_id": session["user_id"],
                "user_name": user_name,
                "course": app["course"],
                "rating": rating,
                "text": text,
                "created_at": created_at.isoformat(),
            }
    finally:
        db.close()

    return jsonify({"success": True, "review": review})


# Получение отзывов
@app.route("/api/reviews")
def get_reviews():
    if "user_id" not in session:
        return jsonify({"success": False, "error": "Требуется авторизация"}), 401

    db = get_db()
    try:
        with db.cursor() as cur:
            if session.get("role") == "admin":
                cur.execute(
                    "SELECT id, application_id, user_id, user_name, course, rating, "
                    "text, created_at FROM reviews ORDER BY created_at DESC"
                )
            else:
                cur.execute(
                    "SELECT id, application_id, user_id, user_name, course, rating, "
                    "text, created_at FROM reviews WHERE user_id = %s "
                    "ORDER BY created_at DESC",
                    (session["user_id"],),
                )
            revs = cur.fetchall()
    finally:
        db.close()

    for r in revs:
        r["created_at"] = r["created_at"].isoformat()

    return jsonify({"success": True, "reviews": revs})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
