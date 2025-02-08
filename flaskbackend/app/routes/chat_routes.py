from flask import Blueprint, request, jsonify
from app.services.chat_service import get_chat_response

chat_bp = Blueprint('chat', __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat_endpoint():
    message = request.json.get("message")
    if message:
        response = get_chat_response(message)
        return jsonify({"bot": response})
    return jsonify({"bot": "Please send a valid message."}) 