import hashlib
import hmac
import re
import secrets
import sqlite3
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

DB_PATH = "app.db"

# УЧЁТКА АДМИНИСТРАТОРА (создаётся автоматически при запуске)
ADMIN_LOGIN = "admin"
ADMIN_PASSWORD = "admin123"
app = FastAPI()

app.mount("/public", StaticFiles(directory="public"), name="public")


# ---------------- БАЗА ДАННЫХ ----------------
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        fullname TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course TEXT NOT NULL,
        start_date TEXT NOT NULL,
        payment TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'В обработке',
        created_at TEXT NOT NULL,
        review_rating INTEGER,
        review_text TEXT,
        review_date TEXT
    );
    """)
    # Создаём администратора, если его ещё нет
    if not conn.execute("SELECT id FROM users WHERE login = ?", (ADMIN_LOGIN,)).fetchone():
        conn.execute(
            "INSERT INTO users (login, password_hash, fullname, phone, email, is_admin, created_at)"
            " VALUES (?, ?, ?, ?, ?, 1, ?)",
            (ADMIN_LOGIN, hash_password(ADMIN_PASSWORD), "Администратор",
             "80000000000", "admin@local", now()))
        print(f"Создан администратор: логин '{ADMIN_LOGIN}'")
    conn.commit()
    conn.close()


init_db()


def now():
    return datetime.now().strftime("%d.%m.%Y %H:%M")


# ---------------- ПАРОЛИ И СЕССИИ ----------------
def hash_password(pw: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 100_000).hex()
    return f"{salt}${h}"


def check_password(pw: str, stored: str) -> bool:
    salt, h = stored.split("$")
    cand = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 100_000).hex()
    return hmac.compare_digest(cand, h)


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    conn = db()
    conn.execute("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
                 (token, user_id, now()))
    conn.commit()
    conn.close()
    return token


def destroy_session(token: str):
    conn = db()
    conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()


def get_user_by_token(token: str):
    conn = db()
    user = conn.execute(
        "SELECT * FROM users WHERE id = (SELECT user_id FROM sessions WHERE token = ?)",
        (token,)).fetchone()
    conn.close()
    return user


def current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        return None
    return get_user_by_token(token)


# ---------------- ВАЛИДАЦИЯ ----------------
RE_LOGIN = re.compile(r"^[a-zA-Z0-9]{6,}$")
RE_NAME = re.compile(r"^[А-Яа-яЁё\s]+$")
RE_PHONE = re.compile(r"^8\d{10}$")
RE_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


# ---------------- МОДЕЛИ ----------------
class RegisterData(BaseModel):
    login: str
    password: str
    fullname: str
    phone: str
    email: str


class LoginData(BaseModel):
    login: str
    password: str


class RequestData(BaseModel):
    courseName: str
    startDate: str
    payment: str


class ReviewData(BaseModel):
    rating: int
    text: str


class StatusData(BaseModel):
    status: str


# ---------------- СТРАНИЦЫ (с защитой) ----------------
@app.get("/")
def root():
    return FileResponse("index.html")


@app.get("/log")
def log_page():
    return FileResponse("log.html")


@app.get("/zaya")
def zaya_page(request: Request):
    if not current_user(request):
        return RedirectResponse("/log", status_code=302)
    return FileResponse("zaya.html")


@app.get("/fzaya")
def fzaya_page(request: Request):
    if not current_user(request):
        return RedirectResponse("/log", status_code=302)
    return FileResponse("fzaya.html")


@app.get("/ada")
def ada_page(request: Request):
    user = current_user(request)
    if not user:
        return RedirectResponse("/log", status_code=302)
    if not user["is_admin"]:
        return RedirectResponse("/zaya", status_code=302)
    return FileResponse("ada.html")


# ---------------- API: АВТОРИЗАЦИЯ ----------------
@app.post("/api/register")
def register(data: RegisterData, response: Response):
    if not RE_LOGIN.match(data.login):
        raise HTTPException(400, "Логин: только латиница и цифры, минимум 6 символов")
    if len(data.password) < 8:
        raise HTTPException(400, "Пароль: минимум 8 символов")
    if not RE_NAME.match(data.fullname.strip()):
        raise HTTPException(400, "ФИО: только русские буквы и пробелы")
    if not RE_PHONE.match(data.phone):
        raise HTTPException(400, "Телефон: формат 8XXXXXXXXXX")
    if not RE_EMAIL.match(data.email):
        raise HTTPException(400, "Некорректный email")

    conn = db()
    if conn.execute("SELECT id FROM users WHERE login = ?", (data.login,)).fetchone():
        conn.close()
        raise HTTPException(400, "Такой логин уже занят")

    # регистрация через форму всегда создаёт ОБЫЧНОГО пользователя
    cur = conn.execute(
        "INSERT INTO users (login, password_hash, fullname, phone, email, is_admin, created_at)"
        " VALUES (?, ?, ?, ?, ?, 0, ?)",
        (data.login, hash_password(data.password), data.fullname.strip(),
         data.phone, data.email, now()))
    conn.commit()
    user_id = cur.lastrowid
    conn.close()

    token = create_session(user_id)
    response.set_cookie("session_token", token, httponly=True, samesite="lax")
    return {"ok": True, "is_admin": False}


@app.post("/api/login")
def login(data: LoginData, response: Response):
    conn = db()
    user = conn.execute("SELECT * FROM users WHERE login = ?", (data.login,)).fetchone()
    conn.close()
    if not user or not check_password(data.password, user["password_hash"]):
        raise HTTPException(401, "Неверный логин или пароль")

    token = create_session(user["id"])
    response.set_cookie("session_token", token, httponly=True, samesite="lax")
    return {"ok": True, "is_admin": bool(user["is_admin"])}


@app.post("/api/logout")
def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        destroy_session(token)
    response.delete_cookie("session_token")
    return {"ok": True}


@app.get("/api/me")
def me(request: Request):
    user = current_user(request)
    if not user:
        raise HTTPException(401, "Не авторизован")
    return {"login": user["login"], "fullname": user["fullname"],
            "is_admin": bool(user["is_admin"])}


# ---------------- API: ЗАЯВКИ ПОЛЬЗОВАТЕЛЯ ----------------
@app.post("/api/requests")
def create_request(data: RequestData, request: Request):
    user = current_user(request)
    if not user:
        raise HTTPException(401, "Необходимо авторизоваться")
    if not data.courseName.strip():
        raise HTTPException(400, "Укажите название курса")
    if not data.startDate:
        raise HTTPException(400, "Укажите дату начала")
    if data.payment not in ("cash", "transfer"):
        raise HTTPException(400, "Выберите способ оплаты")

    conn = db()
    conn.execute(
        "INSERT INTO requests (user_id, course, start_date, payment, status, created_at)"
        " VALUES (?, ?, ?, ?, 'В обработке', ?)",
        (user["id"], data.courseName.strip(), data.startDate, data.payment, now()))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/api/requests")
def my_requests(request: Request):
    user = current_user(request)
    if not user:
        raise HTTPException(401, "Необходимо авторизоваться")
    conn = db()
    rows = conn.execute(
        "SELECT id, course, start_date, payment, status, created_at,"
        " review_rating, review_text, review_date"
        " FROM requests WHERE user_id = ? ORDER BY id DESC", (user["id"],)).fetchall()
    conn.close()
    return {"requests": [dict(r) for r in rows]}


@app.post("/api/requests/{req_id}/review")
def add_review(req_id: int, data: ReviewData, request: Request):
    user = current_user(request)
    if not user:
        raise HTTPException(401, "Необходимо авторизоваться")
    if not (1 <= data.rating <= 5):
        raise HTTPException(400, "Оценка от 1 до 5")
    if not data.text.strip():
        raise HTTPException(400, "Напишите текст отзыва")

    conn = db()
    req = conn.execute("SELECT * FROM requests WHERE id = ? AND user_id = ?",
                       (req_id, user["id"])).fetchone()
    if not req:
        conn.close()
        raise HTTPException(404, "Заявка не найдена")
    if req["status"] != "Одобрено":
        conn.close()
        raise HTTPException(400, "Отзыв можно оставить только к одобренной заявке")
    conn.execute("UPDATE requests SET review_rating = ?, review_text = ?, review_date = ?"
                 " WHERE id = ?", (data.rating, data.text.strip(), now(), req_id))
    conn.commit()
    conn.close()
    return {"ok": True}


# ---------------- API: АДМИНКА ----------------
def require_admin(request: Request):
    user = current_user(request)
    if not user:
        raise HTTPException(401, "Необходимо авторизоваться")
    if not user["is_admin"]:
        raise HTTPException(403, "Доступ запрещён")
    return user


@app.get("/api/admin/requests")
def admin_requests(request: Request):
    require_admin(request)
    conn = db()
    rows = conn.execute(
        "SELECT r.id, r.course, r.start_date, r.payment, r.status, r.created_at,"
        " u.fullname AS fullname, u.email AS email"
        " FROM requests r JOIN users u ON u.id = r.user_id"
        " ORDER BY r.id DESC").fetchall()
    conn.close()
    return {"requests": [dict(r) for r in rows]}


@app.patch("/api/admin/requests/{req_id}/status")
def admin_set_status(req_id: int, data: StatusData, request: Request):
    require_admin(request)
    if data.status not in ("В обработке", "Одобрено", "Отклонено"):
        raise HTTPException(400, "Недопустимый статус")
    conn = db()
    if not conn.execute("SELECT id FROM requests WHERE id = ?", (req_id,)).fetchone():
        conn.close()
        raise HTTPException(404, "Заявка не найдена")
    conn.execute("UPDATE requests SET status = ? WHERE id = ?", (data.status, req_id))
    conn.commit()
    conn.close()
    return {"ok": True}
