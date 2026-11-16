from flask import Flask, render_template, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
import mariadb

app = Flask(__name__, template_folder="template")

products = {
    "0": {
        "img": "bald.png",
        "title": "roblox",
        "price": "15$"
    },
    "1": {
        "img": "img.png",
        "title": "ibsatl",
        "price": "15$"
    }
}


def get_connection():
    return mariadb.connect(
        host="localhost",
        port=3306,
        user="app_user",
        password="strong_password",
        database="school_app"
    )


def create_tables():
    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                login VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection.commit()
        print("Таблица users готова")

    except mariadb.Error as error:
        print(f"Ошибка создания таблицы: {error}")

    finally:
        if connection:
            connection.close()


@app.route("/")
def index():

    return render_template("index.html")


@app.route("/login")
def login_page():
    return render_template("login.html")


@app.route("/get", methods=["GET"])
def get_products():
    return jsonify(products)


@app.route("/edit/<product_id>", methods=["PUT"])
def edit_product(product_id):
    if product_id not in products:
        return jsonify({
            "success": False,
            "message": "Товар не найден"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Нет данных"
        }), 400

    products[product_id] = data

    return jsonify({
        "success": True,
        "product": products[product_id]
    })


# Регистрация пользователя
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    login = data.get("login", "").strip()
    password = data.get("password", "")

    if len(login) < 3:
        return jsonify({
            "success": False,
            "message": "Логин должен содержать минимум 3 символа"
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Пароль должен содержать минимум 6 символов"
        }), 400

    password_hash = generate_password_hash(password)

    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO users (login, password_hash)
            VALUES (?, ?)
            """,
            (login, password_hash)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Пользователь зарегистрирован"
        }), 201

    except mariadb.IntegrityError:
        return jsonify({
            "success": False,
            "message": "Такой логин уже существует"
        }), 409

    except mariadb.Error as error:
        print(f"Ошибка регистрации: {error}")

        return jsonify({
            "success": False,
            "message": "Ошибка базы данных"
        }), 500

    finally:
        if connection:
            connection.close()


# Вход пользователя
@app.route("/api/login", methods=["POST"])
def login_user():
    data = request.get_json()

    login = data.get("login", "").strip()
    password = data.get("password", "")

    connection = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT id, login, password_hash
            FROM users
            WHERE login = ?
            """,
            (login,)
        )

        user = cursor.fetchone()

        if user is None:
            return jsonify({
                "success": False,
                "message": "Неверный логин или пароль"
            }), 401

        user_id, user_login, password_hash = user

        if not check_password_hash(password_hash, password):
            return jsonify({
                "success": False,
                "message": "Неверный логин или пароль"
            }), 401

        return jsonify({
            "success": True,
            "message": "Вход выполнен",
            "user": {
                "id": user_id,
                "login": user_login
            }
        })

    except mariadb.Error as error:
        print(f"Ошибка входа: {error}")

        return jsonify({
            "success": False,
            "message": "Ошибка базы данных"
        }), 500

    finally:
        if connection:
            connection.close()


if __name__ == "__main__":
    create_tables()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
