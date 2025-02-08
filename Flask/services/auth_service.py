import re
from flask import jsonify
from services.database import mongo

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
PASSWORD_REGEX = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$'

def register_user(data):
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    username = data.get("id")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    if not re.match(EMAIL_REGEX, username):
        return jsonify({"error": "Invalid email format"}), 400

    if not re.match(PASSWORD_REGEX, password):
        return jsonify({
            "error": "Password must be at least 8 characters long, "
                     "contain uppercase and lowercase letters, a number, "
                     "and a special character"
        }), 400

    collection = mongo.db.get_collection("users")
    if collection.find_one({"id": username}):
        return jsonify({"error": "Username already exists. Try with another username."}), 400

    collection.insert_one({"id": username, "password": password})

    response = jsonify({"message": "User registered successfully"})
    response.status_code = 200
    return response

def login_user(data):
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    username = data.get("id")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    collection = mongo.db.get_collection("users")
    user = collection.find_one({"id": username, "password": password})
    if user:
        response = jsonify({"message": "Login successful"})
        response.status_code = 200
        return response
    else:
        return jsonify({"error": "Invalid username or password"}), 400 