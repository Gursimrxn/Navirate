from flask import jsonify
from app import mongo
from app.utils.validators import validate_email, validate_password

def register_user(data):
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    username = data.get("username")  # Changed from "id" to "username"
    password = data.get("password")
    role = data.get("role")

    if not all([username, password, role]):
        return jsonify({"error": "Missing username, password, or role"}), 400

    if not validate_email(username):
        return jsonify({"error": "Invalid email format"}), 400

    if not validate_password(password):
        return jsonify({
            "error": "Password must be at least 8 characters long, "
                     "contain uppercase and lowercase letters, a number, "
                     "and a special character"
        }), 400

    collection = mongo.db.customers if role.lower() == "customer" else mongo.db.sellers

    # Check if the user already exists in the database
    if collection.find_one({"username": username}):  # Changed "id" to "username"
        return jsonify({"error": f"Username already exists in {role} collection"}), 400

    # Insert the user into the appropriate collection
    collection.insert_one({"username": username, "password": password, "role": role})
    return jsonify({"message": f"User added successfully to {role} collection"}), 200

def login_user(data):
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    username = data.get("username")  # Changed from "id" to "username"
    password = data.get("password")
    role = data.get("role")

    if not all([username, password, role]):
        return jsonify({"error": "Missing username, password, or role"}), 400

    collection = mongo.db.customers if role.lower() == "customer" else mongo.db.sellers

    # Check if the user exists in the database with the correct credentials
    user = collection.find_one({"username": username, "password": password})  # Changed "id" to "username"
    if user:
        return jsonify({"message": f"Login successful as {role}"}), 200
    return jsonify({"error": "Invalid username, password, or role"}), 400
