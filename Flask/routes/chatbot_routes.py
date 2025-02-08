from flask import Blueprint, request, jsonify
from services.chat_service import get_gemini_response

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.route("/chat", methods=["POST"])
def chat_endpoint():
    data = request.get_json()
    message = data.get("message") if data else None
    if message:
        response = get_gemini_response(message)
        return jsonify({"bot": response})
    else:
        return jsonify({"bot": "Please send a valid message."}) 